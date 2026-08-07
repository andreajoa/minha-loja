import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

function allowedEmails() {
  return (process.env.ANALYTICS_ADMIN_EMAILS || "andremuseu@gmail.com,info@brinqueteando.online")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireDashboardAdmin() {
  const state = await auth();
  if (!state.isAuthenticated) {
    return state.redirectToSignIn();
  }

  const user = await currentUser();
  const emails = user?.emailAddresses.map((item) => item.emailAddress.toLowerCase()) || [];
  const allowed = allowedEmails();
  const email = emails.find((item) => allowed.includes(item));

  if (!user || !email) notFound();

  return {
    userId: user.id,
    email,
    name: user.fullName || user.firstName || email.split("@")[0],
  };
}
