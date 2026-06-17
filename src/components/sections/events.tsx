"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles } from "lucide-react";
import api from "@/lib/api";
import { IMAGES } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import AnimatedSection from "@/components/three/animated-section";
import { Reveal, SectionLabel, SectionTitle } from "@/components/motion/reveal";

type Event = {
  id: string;
  title: string;
  description: string;
  date?: string;
  category: string;
  image_url?: string;
};

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    api.get<Event[]>("/events").then((r) => setEvents(r.data)).catch(() => {});
  }, []);

  return (
    <AnimatedSection id="events" variant="events" className="py-20 sm:py-28" sceneOpacity={0.32}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.06),transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12">
          <SectionLabel>Activities & Events</SectionLabel>
          <SectionTitle className="mt-3">Do Not Miss</SectionTitle>
        </Reveal>

        {events.length === 0 ? (
          <Reveal>
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-16 text-center backdrop-blur-sm">
              <Sparkles className="mx-auto mb-4 text-amber-500" size={36} />
              <p className="text-stone-600">
                No events found. Please add events in the admin dashboard.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group overflow-hidden rounded-3xl border border-stone-200 bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.image_url || IMAGES.event}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent" />
                  <Badge className="absolute left-4 top-4 capitalize">
                    {event.category.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="p-6">
                  {event.date && (
                    <div className="mb-2 flex items-center gap-2 text-xs text-stone-500">
                      <Calendar size={14} />
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  )}
                  <h3 className="font-display text-lg font-bold text-emerald-950">
                    {event.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">
                    {event.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}
