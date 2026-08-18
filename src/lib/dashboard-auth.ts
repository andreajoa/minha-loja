import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

const FALLBACK_DASHBOARD_ADMIN_EMAIL = "andremuseu@gmail.com";

function getAllowedDashboardUserIds() {
  return (process.env.ADMIN_CLERK_USER_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getAllowedDashboardEmails() {
  return (process.env.DASHBOARD_ADMIN_EMAILS || FALLBACK_DASHBOARD_ADMIN_EMAIL)
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireDashboardAdmin() {
  const state = await auth();
  if (!state.isAuthenticated || !state.userId) {
    return state.redirectToSignIn();
  }

  const user = await currentUser();
  const allowedUserIds = getAllowedDashboardUserIds();
  const authorizedByUserId = allowedUserIds.includes(state.userId);

  const allowedEmails = getAllowedDashboardEmails();
  const authorizedEmail = user?.emailAddresses.find(
    (item) =>
      allowedEmails.includes(item.emailAddress.toLowerCase()) &&
      item.verification?.status === "verified",
  );

  if (!authorizedByUserId && !authorizedEmail) notFound();

  const primaryEmail =
    authorizedEmail?.emailAddress.toLowerCase() ||
    user?.primaryEmailAddress?.emailAddress.toLowerCase() ||
    "";

  return {
    userId: state.userId,
    email: primaryEmail,
    name: user?.fullName || user?.firstName || "Admin",
  };
}
