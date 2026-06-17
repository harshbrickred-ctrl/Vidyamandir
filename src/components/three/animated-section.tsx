"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useInView } from "framer-motion";
import type { SceneVariant } from "./floating-shapes";

const SectionScene = dynamic(() => import("./section-scene"), { ssr: false });

export default function AnimatedSection({
  id,
  children,
  className = "",
  variant,
  sceneOpacity,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  variant: SceneVariant;
  sceneOpacity?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "150px", once: false });

  return (
    <section id={id} ref={ref} className={`relative overflow-hidden ${className}`}>
      {inView && <SectionScene variant={variant} opacity={sceneOpacity} />}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
