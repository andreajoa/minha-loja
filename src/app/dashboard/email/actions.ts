"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDashboardAdmin } from "@/lib/dashboard-auth";
import { enableResendOpenClickTracking, updateMarketingTemplate } from "@/lib/email-intelligence";

export async function enableEmailTrackingAction() {
  await requireDashboardAdmin();
  await enableResendOpenClickTracking();
  revalidatePath("/dashboard/email");
}

export async function updateEmailTemplateAction(formData: FormData) {
  const admin = await requireDashboardAdmin();
  const alias = String(formData.get("alias") || "");
  const subject = String(formData.get("subject") || "");
  const html = String(formData.get("html") || "");
  const reason = String(formData.get("reason") || "");

  await updateMarketingTemplate({
    alias,
    subject,
    html,
    reason,
    changedBy: admin.email,
  });

  revalidatePath("/dashboard/email");
  revalidatePath(`/dashboard/email/${alias}`);
  redirect(`/dashboard/email/${alias}?saved=1`);
}
