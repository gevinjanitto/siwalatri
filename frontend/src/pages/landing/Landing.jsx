import { useLenis, Reveal } from "@/components/motion/Motion";
import { LandingNav } from "./LandingNav";
import { Hero } from "./Hero";
import { AnnouncementBar, ScheduleSection } from "./Schedule";
import { CtaBand, Destinations, DockMarquee, Footer } from "./Sections";

const Intro = () => (
  <section className="mx-auto max-w-[1400px] px-5 pt-24 sm:px-10" data-testid="intro-section">
    <Reveal>
      <h2 className="font-display text-5xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-[6.5rem]">
        Satu tempat untuk
        <span className="block pl-[8vw] text-slate-500">tiket & jadwal</span>
        <span className="block grad-text">kapal Klungkung.</span>
      </h2>
    </Reveal>
    <Reveal delay={0.1} className="mt-10 flex items-center gap-3 pl-[8vw]">
      <span className="h-3 w-3 rounded-full bg-[var(--sea)]" />
      <span className="h-px w-40 border-t-2 border-dashed border-[var(--sea)]/50" />
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--teal)]"><span className="h-3 w-3 rounded-full bg-[var(--teal)]" /></span>
    </Reveal>
  </section>
);

export default function Landing() {
  useLenis();
  return (
    <div className="bg-[var(--canvas)]" data-testid="landing-page">
      <LandingNav />
      <Hero />
      <AnnouncementBar />
      <Intro />
      <ScheduleSection />
      <DockMarquee />
      <Destinations />
      <CtaBand />
      <Footer />
    </div>
  );
}
