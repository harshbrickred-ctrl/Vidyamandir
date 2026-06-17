"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { GraduationCap, Users, Trophy } from "lucide-react";
import { STATS } from "@/lib/content";

const ICONS = [GraduationCap, Users, Trophy];

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-emerald-950 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,168,56,0.08),transparent_60%)]" />
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-12 px-4 sm:grid-cols-3 sm:px-6">
        {STATS.map((stat, i) => (
          <StatCounter key={stat.label} stat={stat} icon={ICONS[i]} index={i} />
        ))}
      </div>
    </section>
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
