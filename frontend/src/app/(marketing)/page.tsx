import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PlatformSection } from "@/components/marketing/PlatformSection";
import { DemoSection } from "@/components/marketing/DemoSection";
import { CTASection } from "@/components/marketing/CTASection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PlatformSection />
        <DemoSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
