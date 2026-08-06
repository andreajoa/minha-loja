import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "./commerce.css";
import "./production-fixes.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBar from "@/components/CookieBar";
import CartProvider from "@/components/CartProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.adhdautism.online"),
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
  themeColor: "#092647",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className="flex min-h-screen flex-col antialiased">
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieBar />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
