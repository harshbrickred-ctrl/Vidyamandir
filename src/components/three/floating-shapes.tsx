"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus, Icosahedron, Octahedron } from "@react-three/drei";
import * as THREE from "three";

export type SceneVariant =
  | "hero"
  | "about"
  | "academics"
  | "events"
  | "gallery"
  | "birthdays"
  | "contact";

const VARIANTS: Record<
  SceneVariant,
  { primary: string; secondary: string; accent: string; speed: number }
> = {
  hero: { primary: "#e8a838", secondary: "#34d399", accent: "#f97316", speed: 0.08 },
  about: { primary: "#34d399", secondary: "#e8a838", accent: "#6ee7b7", speed: 0.06 },
  academics: { primary: "#818cf8", secondary: "#e8a838", accent: "#34d399", speed: 0.07 },
  events: { primary: "#f97316", secondary: "#e8a838", accent: "#34d399", speed: 0.09 },
  gallery: { primary: "#e8a838", secondary: "#f472b6", accent: "#34d399", speed: 0.05 },
  birthdays: { primary: "#f472b6", secondary: "#e8a838", accent: "#f97316", speed: 0.1 },
  contact: { primary: "#34d399", secondary: "#e8a838", accent: "#60a5fa", speed: 0.06 },
};

export function FloatingShapes({ variant = "hero" }: { variant?: SceneVariant }) {
  const groupRef = useRef<THREE.Group>(null);
  const colors = VARIANTS[variant];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * colors.speed;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
        <Icosahedron args={[1.1, 0]} position={[-2.5, 0.5, 0]}>
          <meshStandardMaterial
            color={colors.primary}
            wireframe
            transparent
            opacity={0.75}
          />
        </Icosahedron>
      </Float>

      <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
        <Torus args={[0.9, 0.3, 16, 48]} position={[2.2, -0.3, -1]}>
          <meshStandardMaterial
            color={colors.secondary}
            metalness={0.6}
            roughness={0.2}
          />
        </Torus>
      </Float>

      <Float speed={2.5} rotationIntensity={0.3} floatIntensity={1.5}>
        <Sphere args={[0.65, 32, 32]} position={[0.5, 1.2, -0.5]}>
          <MeshDistortMaterial
            color={colors.accent}
            attach="material"
            distort={0.35}
            speed={2}
            roughness={0.1}
            metalness={0.3}
          />
        </Sphere>
      </Float>

      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1}>
        <Octahedron args={[0.45]} position={[-1, -1, 1]}>
          <meshStandardMaterial
            color="#ffffff"
            emissive={colors.primary}
            emissiveIntensity={0.35}
            wireframe
          />
        </Octahedron>
      </Float>
    </group>
  );
}

export function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#fff7ed" />
      <pointLight position={[-3, 2, 2]} intensity={0.8} color="#34d399" />
      <pointLight position={[3, -1, 1]} intensity={0.6} color="#f97316" />
    </>
  );
}
