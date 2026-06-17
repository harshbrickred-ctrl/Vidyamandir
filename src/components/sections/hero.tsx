"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGES, SCHOOL } from "@/lib/content";

const HeroScene = dynamic(() => import("@/components/three/hero-scene"), {
  ssr: false,
});

export default function HeroSection() {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-emerald-950"
    >
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMAGES.hero}
          alt="Campus aerial view"
          className="h-full w-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-emerald-900/80 to-emerald-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(232,168,56,0.15),transparent_40%)]" />
      </div>

      <HeroScene />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 py-32 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-40">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-300 backdrop-blur-sm">
            <Sparkles size={14} />
            Established Since {SCHOOL.established}
          </div>

          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Defining
            <span className="block bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent">
              Education.
            </span>
            Shaping Futures.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
            {SCHOOL.name} {SCHOOL.tagline} aims to bring each student to their
            individual maximum academic potential.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/admissions">
              <Button variant="accent" size="lg">
                Apply Now
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => scrollTo("#about")}>
              Explore More
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-400/20 to-emerald-400/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: "Students", value: "1000+" },
                  { label: "Staff", value: "50+" },
                  { label: "Result", value: "95%" },
                  { label: "Since", value: "2000" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="rounded-2xl bg-white/5 p-6 text-center backdrop-blur-sm"
                  >
                    <p className="font-display text-3xl font-bold text-amber-300">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-white/50">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1"
        >
          <div className="h-2 w-1 rounded-full bg-white/60" />
        </motion.div>
      </div>
    </section>
  );
}
