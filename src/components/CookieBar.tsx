"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) setShow(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "true");
    window.dispatchEvent(new Event("bt:cookie-consent"));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-secondary/20 bg-white/97 pb-[env(safe-area-inset-bottom)] shadow-[0_-18px_55px_rgba(9,38,71,0.12)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-3 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="min-w-0 leading-6 text-text-light">
          Usamos cookies e analytics próprios para melhorar sua experiência e entender a jornada na loja. Consulte nossa{" "}
          <Link href="/politicas/cookies" className="font-semibold text-secondary underline underline-offset-2">
            Política de Cookies
          </Link>.
        </p>
        <button
          type="button"
          onClick={accept}
          className="min-h-11 shrink-0 rounded-full bg-secondary px-7 py-2.5 font-semibold text-white transition hover:bg-primary"
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
