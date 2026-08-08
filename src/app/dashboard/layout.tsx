import Link from "next/link";
import { requireDashboardAdmin } from "@/lib/dashboard-auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardAdmin();
  return (
    <>
      {children}
      <nav className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[1300] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-[#09274B]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl">
        <Link href="/dashboard" className="rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] hover:bg-white/10 sm:px-4 sm:text-xs">Loja</Link>
        <Link href="/dashboard/email" className="rounded-full bg-[#B0522D] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] sm:px-4 sm:text-xs">E-mail</Link>
      </nav>
    </>
  );
}
