import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getResendTrackingStatus } from "@/lib/email-intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return NextResponse.json({ ok: false, error: "RESEND_API_KEY ausente" }, { status: 503 });

  const status = await getResendTrackingStatus();
  if (!status.domainId) {
    const statusError = "error" in status ? status.error || "" : "";
    return NextResponse.json({ ok: false, error: statusError || "Domínio não localizado" }, { status: 404 });
  }

  const resend = new Resend(key);
  const verify = await resend.domains.verify(status.domainId);
  if (verify.error) {
    return NextResponse.json({ ok: false, error: verify.error.message }, { status: 500 });
  }

  await new Promise((resolve) => setTimeout(resolve, 2500));
  const detail = await resend.domains.get(status.domainId);
  if (detail.error) {
    return NextResponse.json({ ok: false, error: detail.error.message }, { status: 500 });
  }

  const data = detail.data as any;
  const tracking = Array.isArray(data?.records)
    ? data.records.filter((record: any) => String(record.record || "").toLowerCase() === "tracking" || String(record.type || "").toUpperCase() === "CAA")
    : [];

  return NextResponse.json({
    ok: true,
    domainStatus: data?.status || "",
    openTracking: Boolean(data?.open_tracking ?? data?.openTracking),
    clickTracking: Boolean(data?.click_tracking ?? data?.clickTracking),
    trackingSubdomain: data?.tracking_subdomain || data?.trackingSubdomain || "",
    records: tracking.map((record: any) => ({
      record: record.record || "",
      name: record.name || "",
      type: record.type || "",
      value: record.value || "",
      status: record.status || "",
    })),
  });
}
