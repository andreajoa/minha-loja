import { randomUUID } from "node:crypto";

import { isStoreManagerManagedProductId } from "@/lib/store-manager-managed";

type NormalizedCartLine = {
  product: { id: string };
  variantId?: string;
  quantity: number;
};

type ReservationResponse = {
  ok?: boolean;
  reservation?: {
    externalReservationId?: string;
    checkoutExpiresAt?: string;
    holdExpiresAt?: string;
  };
  error?: string;
  code?: string;
};

function config() {
  const url = process.env.STORE_MANAGER_RESERVATION_URL?.trim() || "";
  const token = process.env.STORE_MANAGER_WEBHOOK_TOKEN?.trim() || "";
  return url && token ? { url, token } : null;
}

export async function reserveManagedCheckout(lines: NormalizedCartLine[]) {
  const managed = lines.filter((line) => isStoreManagerManagedProductId(line.product.id));
  if (managed.length === 0) {
    return { reserved: false, reservationId: null, checkoutExpiresAt: null } as const;
  }

  const configured = config();
  if (!configured) {
    throw new Error("O estoque em tempo real do Store Manager ainda não está configurado.");
  }

  const items = managed.map((line) => {
    if (!line.variantId) {
      throw new Error(`Produto gerenciado ${line.product.id} sem variante selecionada.`);
    }
    return {
      externalProductId: line.product.id,
      externalVariantId: line.variantId,
      quantity: line.quantity,
    };
  });

  const reservationId = randomUUID();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(configured.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${configured.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ reservationId, ttlMinutes: 35, items }),
      signal: controller.signal,
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({})) as ReservationResponse;
    if (!response.ok || !data.ok || !data.reservation?.checkoutExpiresAt) {
      throw new Error(
        data.error ||
          (data.code === "SUPPLIER_SELECTION_BLOCKED"
            ? "Este item ficou indisponível no fornecedor. Atualize o carrinho."
            : `Não foi possível confirmar o estoque (HTTP ${response.status}).`),
      );
    }
    const checkoutExpiresAt = new Date(data.reservation.checkoutExpiresAt);
    if (!Number.isFinite(checkoutExpiresAt.getTime())) {
      throw new Error("O Store Manager retornou um prazo de reserva inválido.");
    }
    return { reserved: true, reservationId, checkoutExpiresAt } as const;
  } finally {
    clearTimeout(timeout);
  }
}

export async function releaseManagedCheckoutReservation(reservationId: string | null) {
  if (!reservationId) return;
  const configured = config();
  if (!configured) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    await fetch(configured.url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${configured.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ reservationId }),
      signal: controller.signal,
      cache: "no-store",
    }).catch(() => undefined);
  } finally {
    clearTimeout(timeout);
  }
}
