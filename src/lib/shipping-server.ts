import { getPackageMetrics, type CartLine } from "@/lib/commerce";

export type ShippingOption = {
  id: string;
  label: string;
  description: string;
  amount: number;
  minimumDays: number;
  maximumDays: number;
  source: "local" | "correios" | "fallback";
  serviceCode?: string;
};

export type ShippingQuote = {
  cep: string;
  city: string;
  state: string;
  addressLabel: string;
  localFreeDelivery: boolean;
  correiosConfigured: boolean;
  options: ShippingOption[];
};

type ViaCepResponse = {
  cep?: string;
  localidade?: string;
  uf?: string;
  bairro?: string;
  logradouro?: string;
  erro?: boolean;
};

type CorreiosTokenResponse = {
  token?: string;
  expiraEm?: string;
  msgs?: string[];
};

const LOCAL_FREE_CITIES = new Set([
  "santos",
  "sao vicente",
  "praia grande",
]);

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function normalizeCep(value: string) {
  const cep = String(value || "").replace(/\D/g, "");
  if (!/^\d{8}$/.test(cep)) throw new Error("Informe um CEP válido com 8 números.");
  return cep;
}

function parseMoney(value: unknown) {
  if (typeof value === "number") return Math.round(value * 100);
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function parseDays(value: unknown, fallback: number) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function asArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter(Boolean) as Record<string, unknown>[];
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    for (const key of ["itens", "precos", "prazos", "parametrosProduto", "resultado"]) {
      if (Array.isArray(object[key])) return object[key] as Record<string, unknown>[];
    }
    return [object];
  }
  return [];
}

async function lookupCep(cep: string) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error("Não foi possível consultar esse CEP agora.");
  const data = (await response.json()) as ViaCepResponse;
  if (data.erro || !data.localidade || !data.uf) throw new Error("CEP não encontrado.");
  return data;
}

function hasCorreiosConfiguration() {
  return Boolean(
    process.env.CORREIOS_USERNAME &&
      process.env.CORREIOS_API_CODE &&
      process.env.CORREIOS_POSTING_CARD &&
      process.env.CORREIOS_ORIGIN_CEP,
  );
}

async function getCorreiosToken() {
  const username = process.env.CORREIOS_USERNAME!;
  const apiCode = process.env.CORREIOS_API_CODE!;
  const postingCard = process.env.CORREIOS_POSTING_CARD!;
  const contract = process.env.CORREIOS_CONTRACT;
  const dr = process.env.CORREIOS_DR;
  const basic = Buffer.from(`${username}:${apiCode}`).toString("base64");

  const body: Record<string, string | number> = { numero: postingCard };
  if (contract) body.contrato = contract;
  if (dr && Number.isFinite(Number(dr))) body.dr = Number(dr);

  const response = await fetch(
    "https://api.correios.com.br/token/v1/autentica/cartaopostagem",
    {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Basic ${basic}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = (await response.json().catch(() => ({}))) as CorreiosTokenResponse;
  if (!response.ok || !data.token) {
    throw new Error(data.msgs?.join(" ") || "Não foi possível autenticar nos Correios.");
  }
  return data.token;
}

function serviceName(code: string) {
  const names: Record<string, string> = {
    "03220": "SEDEX",
    "03298": "PAC",
    "04162": "SEDEX",
    "04669": "PAC",
  };
  return names[code] || `Correios ${code}`;
}

async function quoteCorreios(cep: string, cart: CartLine[]): Promise<ShippingOption[]> {
  if (!hasCorreiosConfiguration()) return [];

  const token = await getCorreiosToken();
  const originCep = normalizeCep(process.env.CORREIOS_ORIGIN_CEP!);
  const contract = process.env.CORREIOS_CONTRACT;
  const dr = process.env.CORREIOS_DR;
  const serviceCodes = (process.env.CORREIOS_SERVICE_CODES || "03298,03220")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
  const metrics = getPackageMetrics(cart);

  const baseFields = {
    cepOrigem: originCep,
    cepDestino: cep,
  };

  const pricePayload = {
    idLote: `BT-${Date.now()}`,
    parametrosProduto: serviceCodes.map((code, index) => ({
      coProduto: code,
      nuRequisicao: String(index + 1).padStart(4, "0"),
      ...(contract ? { nuContrato: contract } : {}),
      ...(dr && Number.isFinite(Number(dr)) ? { nuDR: Number(dr) } : {}),
      ...baseFields,
      psObjeto: String(metrics.weightGrams),
      tpObjeto: "2",
      comprimento: String(metrics.lengthCm),
      largura: String(metrics.widthCm),
      altura: String(metrics.heightCm),
    })),
  };

  const deadlinePayload = {
    idLote: `BT-${Date.now()}`,
    parametrosPrazo: serviceCodes.map((code, index) => ({
      coProduto: code,
      nuRequisicao: String(index + 1).padStart(4, "0"),
      ...baseFields,
    })),
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const [priceResponse, deadlineResponse] = await Promise.all([
    fetch("https://api.correios.com.br/preco/v1/nacional", {
      method: "POST",
      cache: "no-store",
      headers,
      body: JSON.stringify(pricePayload),
    }),
    fetch("https://api.correios.com.br/prazo/v1/nacional", {
      method: "POST",
      cache: "no-store",
      headers,
      body: JSON.stringify(deadlinePayload),
    }),
  ]);

  if (!priceResponse.ok) {
    const message = await priceResponse.text().catch(() => "");
    throw new Error(message || "Os Correios não retornaram uma cotação de preço.");
  }

  const priceData = asArray(await priceResponse.json());
  const deadlineData = deadlineResponse.ok
    ? asArray(await deadlineResponse.json())
    : [];

  return serviceCodes
    .map((code) => {
      const price = priceData.find(
        (item) => String(item.coProduto || item.codigoProduto || "") === code,
      );
      if (!price) return null;
      const amount = parseMoney(price.pcFinal ?? price.precoFinal ?? price.valor);
      if (amount <= 0) return null;

      const deadline = deadlineData.find(
        (item) => String(item.coProduto || item.codigoProduto || "") === code,
      );
      const days = parseDays(
        deadline?.prazoEntrega ?? deadline?.prazo ?? deadline?.dias,
        code === "03220" || code === "04162" ? 5 : 10,
      );

      return {
        id: `correios-${code}`,
        label: serviceName(code),
        description: `Entrega estimada em até ${days} dias úteis`,
        amount,
        minimumDays: Math.max(1, days - 2),
        maximumDays: days,
        source: "correios" as const,
        serviceCode: code,
      };
    })
    .filter((option): option is ShippingOption => Boolean(option))
    .sort((a, b) => a.amount - b.amount);
}

export async function quoteShipping(cepValue: string, cart: CartLine[]): Promise<ShippingQuote> {
  const cep = normalizeCep(cepValue);
  getPackageMetrics(cart);
  const address = await lookupCep(cep);
  const city = address.localidade || "";
  const state = address.uf || "";
  const localFreeDelivery =
    state.toUpperCase() === "SP" && LOCAL_FREE_CITIES.has(normalizeText(city));
  const correiosConfigured = hasCorreiosConfiguration();

  let correiosOptions: ShippingOption[] = [];
  if (correiosConfigured) {
    try {
      correiosOptions = await quoteCorreios(cep, cart);
    } catch (error) {
      console.error("Correios quote failed:", error);
    }
  }

  const options: ShippingOption[] = [];

  if (localFreeDelivery) {
    options.push({
      id: "entrega-local-gratis",
      label: "Entrega local grátis",
      description: "Santos, São Vicente e Praia Grande",
      amount: 0,
      minimumDays: 1,
      maximumDays: 3,
      source: "local",
    });
  }

  options.push(...correiosOptions);

  if (options.length === 0) {
    const fallbackAmount = Math.max(
      0,
      Number.parseInt(process.env.SHIPPING_FEE_CENTS || "1990", 10) || 0,
    );
    options.push({
      id: "entrega-nacional-estimada",
      label: fallbackAmount === 0 ? "Entrega nacional grátis" : "Entrega nacional",
      description: "Valor provisório até a ativação da cotação contratual dos Correios",
      amount: fallbackAmount,
      minimumDays: 5,
      maximumDays: 15,
      source: "fallback",
    });
  }

  const parts = [address.logradouro, address.bairro, city, state].filter(Boolean);

  return {
    cep,
    city,
    state,
    addressLabel: parts.join(" · "),
    localFreeDelivery,
    correiosConfigured,
    options,
  };
}
