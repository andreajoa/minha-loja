import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "./commerce.css";
import "./production-fixes.css";
import "./responsive.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBar from "@/components/CookieBar";
import CartProvider from "@/components/CartProvider";
import CartRecoveryTracker from "@/components/CartRecoveryTracker";
import CartRecoveryRestorer from "@/components/CartRecoveryRestorer";
import InstagramStrip from "@/components/InstagramStrip";
import NewsletterOfferPopup from "@/components/NewsletterOfferPopup";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.brinqueteando.online"),
  title: {
    default: "BrinqueTEAndo | Brinquedos sensoriais e pedagógicos",
    template: "%s | BrinqueTEAndo",
  },
  description:
    "Brinquedos sensoriais e pedagógicos para crianças com autismo e TDAH, com curadoria de Margareth Almeida, Neuropsicopedagoga.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "BrinqueTEAndo",
    description:
      "Recursos escolhidos para apoiar o brincar, a comunicação e o desenvolvimento infantil.",
    url: "/",
    siteName: "BrinqueTEAndo",
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#092647",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className="flex min-h-screen flex-col antialiased">
          <CartProvider>
            <CartRecoveryTracker />
            <CartRecoveryRestorer />
            <Header />
            <main className="flex-1">{children}</main>
            <InstagramStrip />
            <Footer />
            <CookieBar />
            <NewsletterOfferPopup />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
