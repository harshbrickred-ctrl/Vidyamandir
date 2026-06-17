"use client";

import { BookOpen, Briefcase, FlaskConical, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACADEMIC_STREAMS } from "@/lib/content";
import AnimatedSection from "@/components/three/animated-section";
import { Reveal, SectionLabel, SectionTitle } from "@/components/motion/reveal";

const STREAM_CONFIG = [
  { key: "highschool", icon: BookOpen, color: "from-emerald-600 to-emerald-800" },
  { key: "arts", icon: Palette, color: "from-violet-500 to-purple-700" },
  { key: "commerce", icon: Briefcase, color: "from-amber-500 to-orange-600" },
  { key: "science", icon: FlaskConical, color: "from-cyan-500 to-blue-700" },
] as const;

export default function AcademicsSection() {
  return (
    <AnimatedSection id="academics" variant="academics" className="bg-[#faf7f2]/80 py-20 sm:py-28" sceneOpacity={0.3}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12 text-center">
          <SectionLabel>Academics</SectionLabel>
          <SectionTitle className="mt-3">Our Academic Programs</SectionTitle>
        </Reveal>

        <Reveal>
          <Tabs defaultValue="highschool" className="w-full">
            <TabsList className="mx-auto mb-8 flex w-full max-w-2xl justify-center">
              {STREAM_CONFIG.map(({ key, icon: Icon }) => (
                <TabsTrigger key={key} value={key} className="gap-2">
                  <Icon size={16} />
                  <span className="hidden sm:inline">
                    {ACADEMIC_STREAMS[key].title.split(" ")[0]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {STREAM_CONFIG.map(({ key, icon: Icon, color }) => {
              const stream = ACADEMIC_STREAMS[key];
              return (
                <TabsContent key={key} value={key}>
                  <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white/90 shadow-xl backdrop-blur-sm">
                    <div className={`bg-gradient-to-r ${color} p-8 sm:p-10`}>
                      <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                          <Icon className="text-white" size={28} />
                        </div>
                        <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                          {stream.title}
                        </h3>
                      </div>
                    </div>
                    <div className="p-8 sm:p-10">
                      <p className="text-lg leading-relaxed text-stone-600">
                        {stream.description}
                      </p>
                      <div className="mt-8 flex flex-wrap gap-3">
                        {stream.features.map((feature) => (
                          <span
                            key={feature}
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </Reveal>
      </div>
    </AnimatedSection>
  );
}
