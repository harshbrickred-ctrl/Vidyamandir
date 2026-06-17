"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { MARQUEE_ITEMS } from "@/lib/content";

type Announcement = { id: string; title: string };

export default function MarqueeRibbon() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    api.get<Announcement[]>("/announcements").then((r) => setAnnouncements(r.data)).catch(() => {});
  }, []);

  const items = [
    ...MARQUEE_ITEMS,
    ...announcements.map((a) => a.title),
  ];

  return (
    <div className="relative overflow-hidden border-y border-emerald-900/10 bg-gradient-to-r from-amber-50 via-[#faf7f2] to-emerald-50 py-3">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={`${item}-${i}`} className="mx-8 inline-flex items-center gap-3 text-sm font-semibold text-emerald-900">
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
              className="h-1.5 w-1.5 rounded-full bg-amber-500"
            />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
