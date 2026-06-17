"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { GraduationCap, Users, Trophy } from "lucide-react";
import { ABOUT_CARDS, STATS } from "@/lib/content";
import AnimatedSection from "@/components/three/animated-section";
import { Reveal, SectionLabel, SectionTitle } from "@/components/motion/reveal";

const ICONS = [GraduationCap, Users, Trophy];

export default function AboutSection() {
  return (
    <AnimatedSection id="about" variant="about" className="py-20 sm:py-28" sceneOpacity={0.35}>
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-16 max-w-2xl">
          <SectionLabel>About S.R.T.</SectionLabel>
          <SectionTitle className="mt-3">Nurturing Minds, Building Character</SectionTitle>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            The Founder of &apos;Satyanarayan Ramnath Thakur Education Society&apos;
            paved a new path in the development of education in Virar. We believe in
            growing and branching like a banyan tree.
          </p>
        </Reveal>

        <div className="mb-16 grid grid-cols-1 gap-8 rounded-3xl border border-emerald-900/10 bg-emerald-950/90 p-8 backdrop-blur-sm sm:grid-cols-3 sm:p-10">
          {STATS.map((stat, i) => (
            <StatCounter key={stat.label} stat={stat} icon={ICONS[i]} index={i} />
          ))}
        </div>

        <div className="grid auto-rows-[240px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ABOUT_CARDS.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`group relative overflow-hidden rounded-3xl ${
                card.large ? "md:col-span-2 md:row-span-2 md:min-h-[500px]" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                  {card.title}
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                  {card.description}
                </p>
              </div>
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 transition-all group-hover:ring-amber-400/30" />
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function StatCounter({
  stat,
  icon: Icon,
  index,
}: {
  stat: (typeof STATS)[number];
  icon: typeof GraduationCap;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = stat.value;
    const duration = 2000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15 }}
      className="text-center"
    >
      <Icon className="mx-auto mb-4 text-amber-400" size={36} strokeWidth={1.5} />
      <p className="font-display text-5xl font-bold text-white sm:text-6xl">
        {count}
        {stat.suffix}
      </p>
      <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-white/50">
        {stat.label}
      </p>
    </motion.div>
  );
}
