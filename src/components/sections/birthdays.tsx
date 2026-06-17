"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Cake } from "lucide-react";
import api from "@/lib/api";
import AnimatedSection from "@/components/three/animated-section";
import { Reveal, SectionLabel, SectionTitle } from "@/components/motion/reveal";

type Birthday = {
  name: string;
  class_name?: string;
  date_of_birth?: string;
};

export default function BirthdaysSection() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);

  useEffect(() => {
    api
      .get<{ birthdays: Birthday[] }>("/birthdays/today")
      .then((r) => setBirthdays(r.data.birthdays || []))
      .catch(() => {});
  }, []);

  return (
    <AnimatedSection id="birthdays" variant="birthdays" className="bg-[#faf7f2]/80 py-20 sm:py-28" sceneOpacity={0.35}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12 text-center">
          <SectionLabel>Student Celebrations</SectionLabel>
          <SectionTitle className="mt-3">Today&apos;s Birthdays</SectionTitle>
          <p className="mx-auto mt-4 max-w-2xl text-stone-600">
            Celebrate the students who are turning another year older today. This
            list stays up to date from the student roster managed by the admin team.
          </p>
        </Reveal>

        {birthdays.length === 0 ? (
          <Reveal>
            <div className="mx-auto max-w-md rounded-3xl border border-dashed border-stone-300 bg-white/70 p-12 text-center backdrop-blur-sm">
              <Cake className="mx-auto mb-4 text-amber-500" size={40} />
              <p className="font-display text-lg font-semibold text-emerald-950">
                No birthdays today
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Check back tomorrow for new birthday celebrations.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {birthdays.map((b, i) => (
              <BirthdayCard key={`${b.name}-${i}`} birthday={b} index={i} />
            ))}
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}

function BirthdayCard({ birthday, index }: { birthday: Birthday; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, rotate: -2 }}
      animate={isInView ? { opacity: 1, y: 0, rotate: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/90 to-orange-50/90 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg"
    >
      <div className="absolute -right-4 -top-4 text-6xl opacity-10">🎂</div>
      <p className="font-display text-xl font-bold text-emerald-950">{birthday.name}</p>
      {birthday.class_name && (
        <p className="mt-1 text-sm text-stone-600">Class: {birthday.class_name}</p>
      )}
    </motion.div>
  );
}
