"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import api, { galleryImageUrl } from "@/lib/api";
import AnimatedSection from "@/components/three/animated-section";
import { Reveal, SectionTitle } from "@/components/motion/reveal";

type GalleryItem = {
  id: string;
  title: string;
  category: string;
  description?: string;
};

export default function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  useEffect(() => {
    api.get<GalleryItem[]>("/gallery").then((r) => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <AnimatedSection id="gallery" variant="gallery" className="bg-emerald-950 py-20 sm:py-28" sceneOpacity={0.4}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
            <span className="h-px w-8 bg-gradient-to-r from-amber-400 to-transparent" />
            Gallery
          </span>
          <SectionTitle className="mt-3 text-white">Moments at S.R.T.</SectionTitle>
        </Reveal>

        {items.length === 0 ? (
          <Reveal>
            <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-16 text-center text-white/60 backdrop-blur-sm">
              No gallery images found. Please upload gallery images in the admin dashboard.
            </div>
          </Reveal>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {items.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(item)}
                className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={galleryImageUrl(item.id)}
                  alt={item.title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex w-full items-center justify-between p-4">
                    <p className="text-left text-sm font-semibold text-white">{item.title}</p>
                    <ZoomIn size={18} className="text-white/80" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <button
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryImageUrl(selected.id)}
                alt={selected.title}
                className="max-h-[80vh] w-full object-contain"
              />
              <div className="bg-emerald-950 p-4 text-white">
                <p className="font-display font-bold">{selected.title}</p>
                {selected.description && (
                  <p className="mt-1 text-sm text-white/70">{selected.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedSection>
  );
}
