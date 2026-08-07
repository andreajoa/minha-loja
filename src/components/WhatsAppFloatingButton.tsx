"use client";

import { usePathname } from "next/navigation";

const WHATSAPP_URL = "https://wa.link/clxfhl";

export default function WhatsAppFloatingButton() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/sucesso") ||
    pathname.startsWith("/dashboard")
  ) {
    return null;
  }

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Tirar uma dúvida pelo WhatsApp"
      title="Tire sua dúvida pelo WhatsApp"
      data-analytics-action="whatsapp"
      className="group fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-[max(1rem,env(safe-area-inset-right))] z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-[#20BD5A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/30 max-[360px]:h-12 max-[360px]:w-12 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:min-h-14 sm:gap-3 sm:px-5 sm:py-3"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-7 w-7 shrink-0 fill-current max-[360px]:h-6 max-[360px]:w-6"
      >
        <path d="M16.02 3C8.84 3 3 8.79 3 15.91c0 2.28.6 4.51 1.74 6.48L3 29l6.82-1.79a13.1 13.1 0 0 0 6.19 1.57h.01C23.19 28.78 29 23 29 15.88 29 8.78 23.19 3 16.02 3Zm0 23.6h-.01a10.9 10.9 0 0 1-5.55-1.52l-.4-.24-4.05 1.06 1.08-3.92-.26-.4a10.69 10.69 0 0 1-1.66-5.67c0-5.91 4.87-10.72 10.86-10.72 5.98 0 10.84 4.8 10.84 10.7 0 5.9-4.87 10.71-10.85 10.71Zm5.95-8.02c-.33-.16-1.92-.94-2.22-1.05-.3-.11-.52-.16-.74.16-.22.33-.85 1.05-1.04 1.27-.19.22-.38.25-.71.08-.33-.16-1.38-.5-2.63-1.6-.97-.86-1.62-1.92-1.81-2.25-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.55.11-.22.05-.41-.03-.57-.08-.16-.74-1.76-1.01-2.41-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.33-1.14 1.1-1.14 2.69 0 1.58 1.17 3.11 1.33 3.33.16.22 2.3 3.47 5.57 4.87.78.33 1.38.53 1.85.68.78.24 1.49.21 2.05.13.63-.09 1.92-.78 2.19-1.52.27-.75.27-1.38.19-1.52-.08-.14-.3-.22-.63-.38Z" />
      </svg>

      <span className="hidden whitespace-nowrap text-sm font-black uppercase tracking-[0.08em] sm:inline">
        Tire sua dúvida
      </span>

      <span className="pointer-events-none absolute -left-1 top-1 h-3 w-3 rounded-full bg-white/45 opacity-0 transition group-hover:opacity-100 sm:hidden" />
    </a>
  );
}
