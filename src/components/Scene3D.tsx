"use client";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float } from '@react-three/drei';
import { Suspense } from 'react';

function RecyclingSymbol() {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh scale={[1.7, 1.7, 1.7]}>
        <torusGeometry args={[1, 0.2, 16, 100]} />
        <meshStandardMaterial color="#22c55e" metalness={0.5} roughness={0.2} emissive="#a7f3d0" emissiveIntensity={0.25} />
      </mesh>
    </Float>
  );
}

export default function Scene3D() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }} gl={{ alpha: true }} style={{ background: 'transparent' }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.3} />
          <RecyclingSymbol />
          {/* No OrbitControls for a more background feel */}
        </Suspense>
      </Canvas>
    </div>
  );
} 