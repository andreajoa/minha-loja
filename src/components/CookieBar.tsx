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
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-teal/20 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-4 text-sm sm:flex-row sm:justify-between">
        <p className="text-ardosia">
          Usamos cookies para melhorar sua experiencia. Ao continuar, voce concorda com nossa{" "}
          <Link href="/politicas/cookies" className="font-semibold text-teal-dark underline">
            Politica de Cookies
          </Link>.
        </p>
        <button
          onClick={accept}
          className="rounded-full bg-teal px-6 py-2 font-semibold text-white transition hover:bg-teal-dark"
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
