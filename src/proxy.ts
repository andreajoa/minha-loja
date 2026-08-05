import { clerkMiddleware } from "@clerk/nextjs/server";

// A vitrine é totalmente pública. A Clerk só participa do endpoint
// administrativo que realmente precisa identificar um usuário autorizado.
export default clerkMiddleware();

export const config = {
  matcher: ["/api/admin/upload(.*)"],
};
