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
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import {
  BRAND_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  jsonLd,
  organizationJsonLd,
  personJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "Brinquedos para Autismo e TDAH | BrinqueTEAndo",
    template: "%s | BrinqueTEAndo",
  },
  description:
    "Brinquedos sensoriais e pedagógicos para crianças autistas, com TDAH e outras neurodivergências. Curadoria de Margareth Almeida, Neuropsicopedagoga, com entregas no Litoral e Grande São Paulo e para todo o Brasil.",
  category: "shopping",
  creator: "Margareth Almeida",
  publisher: "BrinqueTEAndo",
  openGraph: {
    title: "BrinqueTEAndo | Brinquedos para Autismo, TDAH e Neurodivergências",
    description: BRAND_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "BrinqueTEAndo | Brinquedos para Autismo e TDAH",
    description: BRAND_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": "BR-SP",
    "content-language": "pt-BR",
  },
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
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd()) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personJsonLd()) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd()) }} />
          <CartProvider>
            <AnalyticsTracker />
            <CartRecoveryTracker />
            <CartRecoveryRestorer />
            <Header />
            <main className="flex-1">{children}</main>
            <InstagramStrip />
            <Footer />
            <CookieBar />
            <NewsletterOfferPopup />
            <WhatsAppFloatingButton />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
