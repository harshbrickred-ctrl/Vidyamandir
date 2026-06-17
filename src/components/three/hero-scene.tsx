"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { FloatingShapes, SceneLights } from "./floating-shapes";

function Scene() {
  return (
    <>
      <SceneLights />
      <FloatingShapes variant="hero" />
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
