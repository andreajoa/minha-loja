import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // Debug can be enabled temporarily to diagnose handshake issues:
  // debug: true,
});

export const config = {
  matcher: [
    // Match all routes except static assets and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
