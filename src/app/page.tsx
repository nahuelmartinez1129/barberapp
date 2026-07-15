import { OnboardingPanel } from "@/components/onboarding/OnboardingPanel";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-50">
      <Navbar />

      <Hero />

      <Features />

      <HowItWorks />

      <Pricing />

      <FAQ />

      <Footer />
    </main>
  );
}