"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/dashboard")) return;

    const data = {
      type: "pageview",
      path: pathname,
      referrer: document.referrer || "",
    };

    navigator.sendBeacon("/api/track", JSON.stringify(data));
  }, [pathname]);

  return null;
}
