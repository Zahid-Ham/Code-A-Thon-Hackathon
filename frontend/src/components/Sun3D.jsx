import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

const Sun3D = () => {
  const materialRef = useRef();

  useFrame(({ clock }) => {
    if (materialRef.current) {
      // Animate distortion speed for turbulence
      materialRef.current.distort = 0.4 + Math.sin(clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
      
      {/* Core Sun */}
      <Sphere args={[2, 32, 32]} scale={1.2}>
        <MeshDistortMaterial
          ref={materialRef}
          color="#FDB813"
          emissive="#FF4500"
          emissiveIntensity={0.6}
          roughness={0.2}
          distort={0.4}
          speed={2}
        />
      </Sphere>

      {/* Corona Glow (Simulated with a slightly larger, transparent mesh or just emissive bloom in post-proc - keeping simple for now) */}
      <Sphere args={[2.1, 32, 32]}>
         <meshBasicMaterial color="#FF4500" transparent opacity={0.1} side={2} />
      </Sphere>
    </group>
  );
};

export default Sun3D;
