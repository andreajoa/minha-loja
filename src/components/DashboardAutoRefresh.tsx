"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardAutoRefresh() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          router.refresh();
          return 30;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [router]);

  return (
    <button
      type="button"
      onClick={() => {
        setSeconds(30);
        router.refresh();
      }}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 text-xs font-bold text-white transition hover:bg-white/14"
      title="Atualizar dados agora"
    >
      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.9)]" />
      Ao vivo · {seconds}s
    </button>
  );
}
