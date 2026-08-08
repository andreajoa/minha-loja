import { NextResponse } from "next/server";
import {
  enableResendOpenClickTracking,
  ensureResendEmailWebhook,
  getResendTrackingStatus,
} from "@/lib/email-intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const webhook = await ensureResendEmailWebhook();
  const before = await getResendTrackingStatus();

  let after = before;
  let activationError = "";
  if (!before.openTracking || !before.clickTracking) {
    try {
      after = await enableResendOpenClickTracking();
    } catch (error) {
      activationError = error instanceof Error ? error.message : String(error);
      after = await getResendTrackingStatus();
    }
  }

  const trackingError = "error" in after ? after.error || "" : "";

  return NextResponse.json({
    ok: webhook.enabled && !activationError,
    webhook: { enabled: webhook.enabled, id: webhook.id || "", error: webhook.error || "" },
    tracking: {
      domain: after.domain,
      openTracking: after.openTracking,
      clickTracking: after.clickTracking,
      trackingSubdomain: after.trackingSubdomain,
      trackingRecord: after.trackingRecord || null,
      error: trackingError || activationError || "",
    },
  });
}
