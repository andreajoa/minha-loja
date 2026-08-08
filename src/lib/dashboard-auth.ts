import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

const DASHBOARD_ADMIN_EMAIL = "andremuseu@gmail.com";

export async function requireDashboardAdmin() {
  const state = await auth();
  if (!state.isAuthenticated) {
    return state.redirectToSignIn();
  }

  const user = await currentUser();
  if (!user) notFound();

  const authorized = user.emailAddresses.find(
    (item) =>
      item.emailAddress.toLowerCase() === DASHBOARD_ADMIN_EMAIL &&
      item.verification?.status === "verified",
  );

  if (!authorized) notFound();

  return {
    userId: user.id,
    email: authorized.emailAddress.toLowerCase(),
    name: user.fullName || user.firstName || "Andre",
  };
}
