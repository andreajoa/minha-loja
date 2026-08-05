import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBar from "@/components/CookieBar";

export const metadata: Metadata = {
  title: "BrinqueTEAndo — Brinquedos para criancas atipicas",
  description: "Loja de brinquedos sensoriais e pedagogicos para criancas com TDAH e autismo. Curadoria de Margareth Almeida, Neuropsicopedagoga.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBar />
      </body>
    </html>
  );
}
