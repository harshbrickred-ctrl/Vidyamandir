import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/sections/hero";
import MarqueeRibbon from "@/components/sections/marquee-ribbon";
import AboutSection from "@/components/sections/about";
import AcademicsSection from "@/components/sections/academics";
import EventsSection from "@/components/sections/events";
import GallerySection from "@/components/sections/gallery";
import BirthdaysSection from "@/components/sections/birthdays";
import ContactSection from "@/components/sections/contact";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#faf7f2]">
        <HeroSection />
        <MarqueeRibbon />
        <AboutSection />
        <AcademicsSection />
        <EventsSection />
        <GallerySection />
        <BirthdaysSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
