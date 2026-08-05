import HeroCarousel from "@/components/HeroCarousel";
import StorefrontHome from "@/components/StorefrontHome";

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <div className="storefront-after-carousel">
        <StorefrontHome />
      </div>
      <style>{`
        .storefront-after-carousel > div > section:first-child {
          display: none;
        }
      `}</style>
    </>
  );
}
