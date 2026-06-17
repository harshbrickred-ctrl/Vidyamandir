"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { FloatingShapes, SceneLights, type SceneVariant } from "./floating-shapes";

function Scene({ variant }: { variant: SceneVariant }) {
  return (
    <>
      <SceneLights />
      <FloatingShapes variant={variant} />
    </>
  );
}

export default function SectionScene({
  variant,
  opacity = 0.55,
}: {
  variant: SceneVariant;
  opacity?: number;
}) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity }}
    >
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 1.25]}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <Scene variant={variant} />
        </Canvas>
      </Suspense>
    </div>
  );
}
