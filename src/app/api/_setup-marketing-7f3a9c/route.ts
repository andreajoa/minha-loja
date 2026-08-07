import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import {
  allMarketingTemplates,
  cartRecoveryTemplates,
  checkoutRecoveryTemplates,
  marketingReplyTo,
  marketingSender,
  newsletterTemplates,
  type MarketingTemplate,
} from "@/lib/marketing-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function api(resend: Resend) {
  return resend as unknown as {
    templates: {
      get: (id: string) => Promise<any>;
      create: (payload: any) => Promise<any>;
      update: (id: string, payload: any) => Promise<any>;
      publish: (id: string) => Promise<any>;
    };
    events: {
      create: (payload: any) => Promise<any>;
    };
    automations: {
      list: () => Promise<any>;
      create: (payload: any) => Promise<any>;
      update: (id: string, payload: any) => Promise<any>;
    };
  };
}

async function ensureTemplate(resend: Resend, template: MarketingTemplate) {
  const r = api(resend);
  let existing: any = null;
  try {
    const found = await r.templates.get(template.alias);
    if (!found?.error && found?.data) existing = found.data;
  } catch {}

  const payload = {
    alias: template.alias,
    name: template.name,
    from: marketingSender,
    subject: template.subject,
    html: template.html,
    variables: template.variables,
  };

  let id = existing?.id || template.alias;
  if (existing) {
    const updated = await r.templates.update(template.alias, payload);
    if (updated?.error) throw new Error(`${template.alias}: ${updated.error.message || "update failed"}`);
  } else {
    const created = await r.templates.create(payload);
    if (created?.error || !created?.data?.id) {
      throw new Error(`${template.alias}: ${created?.error?.message || "create failed"}`);
    }
    id = created.data.id;
  }

  const published = await r.templates.publish(id);
  if (published?.error) throw new Error(`${template.alias}: ${published.error.message || "publish failed"}`);
  return id;
}

async function ensureEvents(resend: Resend) {
  const definitions = [
    {
      name: "newsletter.subscribed",
      schema: { source: "string", couponCode: "string", whatsapp: "string" },
    },
    {
      name: "cart.recovery_started",
      schema: {
        productName: "string",
        productImage: "string",
        productUrl: "string",
        recoveryUrl: "string",
        cartTotal: "string",
      },
    },
    { name: "cart.recovery_stop", schema: { reason: "string" } },
    {
      name: "checkout.recovery_started",
      schema: {
        productName: "string",
        productImage: "string",
        productUrl: "string",
        recoveryUrl: "string",
        cartTotal: "string",
      },
    },
    { name: "checkout.recovery_stop", schema: { reason: "string" } },
    { name: "order.completed", schema: { orderId: "string" } },
  ];

  const results: string[] = [];
  for (const definition of definitions) {
    try {
      const created = await api(resend).events.create(definition);
      if (created?.error) {
        const message = String(created.error.message || "");
        if (!/already|exist|duplicate/i.test(message)) throw new Error(message);
        results.push(`${definition.name}: existente`);
      } else {
        results.push(`${definition.name}: criada`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/already|exist|duplicate/i.test(message)) results.push(`${definition.name}: existente`);
      else throw error;
    }
  }
  return results;
}

function newsletterAutomation(templateIds: string[]) {
  const steps: any[] = [
    { key: "start", type: "trigger", config: { eventName: "newsletter.subscribed" } },
  ];
  const connections: any[] = [];
  let previous = "start";
  for (let i = 0; i < templateIds.length; i++) {
    const delay = `delay_${i + 1}`;
    const send = `email_${i + 1}`;
    steps.push({ key: delay, type: "delay", config: { duration: "3 days" } });
    steps.push({
      key: send,
      type: "send_email",
      config: {
        template: { id: templateIds[i] },
        from: marketingSender,
        replyTo: marketingReplyTo,
      },
    });
    connections.push({ from: previous, to: delay, type: "default" });
    connections.push({ from: delay, to: send, type: "default" });
    previous = send;
  }
  return { name: "BrinqueTEAndo - Newsletter 15 emails", status: "enabled", steps, connections };
}

function recoveryAutomation(
  name: string,
  triggerEvent: string,
  stopEvent: string,
  templateIds: string[],
  waits: string[],
) {
  const steps: any[] = [
    { key: "start", type: "trigger", config: { eventName: triggerEvent } },
  ];
  const connections: any[] = [];
  let previous = "start";

  for (let i = 0; i < templateIds.length; i++) {
    const wait = `wait_${i + 1}`;
    const send = `email_${i + 1}`;
    steps.push({
      key: wait,
      type: "wait_for_event",
      config: { eventName: stopEvent, timeout: waits[i] },
    });
    steps.push({
      key: send,
      type: "send_email",
      config: {
        template: {
          id: templateIds[i],
          variables: {
            PRODUCT_NAME: { var: "event.productName" },
            PRODUCT_IMAGE: { var: "event.productImage" },
            RECOVERY_URL: { var: "event.recoveryUrl" },
            CART_TOTAL: { var: "event.cartTotal" },
          },
        },
        from: marketingSender,
        replyTo: marketingReplyTo,
      },
    });
    connections.push({ from: previous, to: wait, type: "default" });
    connections.push({ from: wait, to: send, type: "timeout" });
    previous = send;
  }

  return { name, status: "enabled", steps, connections };
}

async function ensureAutomation(resend: Resend, definition: any) {
  const r = api(resend);
  let existing: any = null;
  try {
    const listed = await r.automations.list();
    const items = listed?.data?.data || listed?.data || [];
    existing = Array.isArray(items) ? items.find((item: any) => item.name === definition.name) : null;
  } catch {}

  if (existing?.id) {
    const updated = await r.automations.update(existing.id, { status: "enabled" });
    if (updated?.error) throw new Error(updated.error.message || `Falha ao ativar ${definition.name}`);
    return { name: definition.name, id: existing.id, status: "existing-enabled" };
  }

  const created = await r.automations.create(definition);
  if (created?.error || !created?.data?.id) {
    throw new Error(created?.error?.message || `Falha ao criar ${definition.name}`);
  }
  return { name: definition.name, id: created.data.id, status: "created" };
}

export async function GET(req: Request) {
  try {
    const resendKey = process.env.RESEND_API_KEY?.trim();
    if (!resendKey) return NextResponse.json({ ok: false, error: "RESEND_API_KEY ausente" }, { status: 500 });
    const resend = new Resend(resendKey);
    const phase = new URL(req.url).searchParams.get("phase") || "status";

    if (phase.startsWith("templates")) {
      const number = Number(phase.replace("templates", ""));
      const chunkSize = 7;
      const start = Math.max(0, (number - 1) * chunkSize);
      const chunk = allMarketingTemplates.slice(start, start + chunkSize);
      if (!chunk.length) return NextResponse.json({ ok: false, error: "fase de templates invalida" }, { status: 400 });
      const completed: string[] = [];
      for (const template of chunk) {
        await ensureTemplate(resend, template);
        completed.push(template.alias);
      }
      return NextResponse.json({ ok: true, phase, completed });
    }

    if (phase === "automations") {
      const events = await ensureEvents(resend);
      const getIds = async (templates: MarketingTemplate[]) => {
        const ids: string[] = [];
        for (const template of templates) {
          const found = await api(resend).templates.get(template.alias);
          if (found?.error || !found?.data?.id) throw new Error(`Template ausente: ${template.alias}`);
          ids.push(found.data.id);
        }
        return ids;
      };
      const newsletterIds = await getIds(newsletterTemplates);
      const cartIds = await getIds(cartRecoveryTemplates);
      const checkoutIds = await getIds(checkoutRecoveryTemplates);
      const automations = [
        await ensureAutomation(resend, newsletterAutomation(newsletterIds)),
        await ensureAutomation(
          resend,
          recoveryAutomation(
            "BrinqueTEAndo - Carrinho abandonado 5 emails",
            "cart.recovery_started",
            "cart.recovery_stop",
            cartIds,
            ["1 hour", "7 hours", "16 hours", "1 day", "1 day"],
          ),
        ),
        await ensureAutomation(
          resend,
          recoveryAutomation(
            "BrinqueTEAndo - Checkout abandonado 5 emails",
            "checkout.recovery_started",
            "checkout.recovery_stop",
            checkoutIds,
            ["45 minutes", "3 hours", "8 hours", "1 day", "2 days"],
          ),
        ),
      ];
      return NextResponse.json({ ok: true, phase, events, automations });
    }

    if (phase === "stripe") {
      const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
      if (!stripeKey) throw new Error("STRIPE_SECRET_KEY ausente");
      const stripe = new Stripe(stripeKey);
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin).replace(/\/$/, "");
      const target = `${appUrl}/api/marketing/stripe-event`;
      const listed = await stripe.webhookEndpoints.list({ limit: 100 });
      const existing = listed.data.find((endpoint) => endpoint.url === target);
      if (existing) return NextResponse.json({ ok: true, phase, webhook: "existing", id: existing.id, url: target });
      const created = await stripe.webhookEndpoints.create({
        url: target,
        enabled_events: ["checkout.session.completed"],
        description: "BrinqueTEAndo - interrompe recuperacao de carrinho e checkout apos pagamento",
      });
      return NextResponse.json({ ok: true, phase, webhook: "created", id: created.id, url: target });
    }

    return NextResponse.json({
      ok: true,
      phases: ["templates1", "templates2", "templates3", "templates4", "automations", "stripe"],
      totalTemplates: allMarketingTemplates.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Marketing setup:", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
