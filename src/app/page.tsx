import HeroCarousel from "@/components/HeroCarousel";
import HomeReferenceSections, { InstagramFollowStrip } from "@/components/HomeReferenceSections";
import StorefrontHome from "@/components/StorefrontHome";

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <HomeReferenceSections />
      <div className="storefront-after-carousel">
        <StorefrontHome />
      </div>
      <InstagramFollowStrip />
      <style>{`
        .storefront-after-carousel > div > section:first-child {
          display: none;
        }
      `}</style>
    </>
  );
}
