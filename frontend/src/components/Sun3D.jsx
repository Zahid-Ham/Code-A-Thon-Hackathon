import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useCosmicWeather } from '../contexts/CosmicWeatherContext';

// Plasma Wave Sub-component
const PlasmaWave = ({ color, speed, size, opacity }) => {
  const ref = useRef();
  
  useFrame(({ clock }) => {
    if (ref.current) {
        // Continuous organic rotation
        ref.current.rotation.z = clock.getElapsedTime() * speed * 0.2;
        ref.current.rotation.x = Math.sin(clock.getElapsedTime() * speed * 0.1) * 0.5;
        
        // Pulse scale slightly
        const pulse = 1 + Math.sin(clock.getElapsedTime() * speed) * 0.05;
        ref.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={opacity} 
        wireframe 
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const Sun3D = () => {
  const { globalSeverity } = useCosmicWeather();
  const materialRef = useRef();

  const config = useMemo(() => {
    switch (globalSeverity) {
      case 'EXTREME':
        return {
          color: '#ff1a1a', // Intense red
          emissive: '#ff0000',
          scale: 2.2,
          distortSpeed: 0.6,
          waves: [
            { color: '#ff0000', speed: 1, size: 2.6, opacity: 0.4 },
            { color: '#ffaa00', speed: 1.5, size: 2.8, opacity: 0.2 },
            { color: '#ffffff', speed: 2, size: 2.4, opacity: 0.1 }
          ]
        };
      case 'HIGH':
        return {
          color: '#ff4d00', // Orange-red
          emissive: '#ff2200',
          scale: 2.1,
          distortSpeed: 0.4,
          waves: [
            { color: '#ff4d00', speed: 0.8, size: 2.5, opacity: 0.3 },
            { color: '#ffaa00', speed: 1.2, size: 2.6, opacity: 0.1 }
          ]
        };
      case 'MODERATE':
        return {
          color: '#ff8c00', // Deep orange
          emissive: '#ff4d00',
          scale: 2.05,
          distortSpeed: 0.2,
          waves: [
            { color: '#ff8c00', speed: 0.5, size: 2.4, opacity: 0.2 }
          ]
        };
      case 'LOW':
      default:
        return {
          color: '#fbbf24', // Amber-400 (More vivid gold)
          emissive: '#f59e0b', // Amber-500
          scale: 2,
          distortSpeed: 0.15,
          waves: [
             { color: '#fcd34d', speed: 0.2, size: 2.2, opacity: 0.1 } // Subtle Corona
          ]
        };
    }
  }, [globalSeverity]);

  useFrame((state) => {
    if (materialRef.current) {
        materialRef.current.distort = THREE.MathUtils.lerp(
            materialRef.current.distort,
            globalSeverity === 'EXTREME' ? 0.6 :
            globalSeverity === 'HIGH' ? 0.5 :
            globalSeverity === 'MODERATE' ? 0.4 : 0.3,
            0.05
        );
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={config.color} />
      
      {/* Core Sun */}
      <Sphere args={[2, 32, 32]} scale={config.scale}>
        <MeshDistortMaterial
          ref={materialRef}
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={0.6}
          roughness={0.2}
          distort={0.4}
          speed={config.distortSpeed}
        />
      </Sphere>

      {/* Plasma Waves (Severity Based) */}
      {config.waves.map((wave, i) => (
        <PlasmaWave 
          key={i} 
          color={wave.color} 
          speed={wave.speed} 
          scale={wave.scale} 
          opacity={wave.opacity} 
        />
      ))}

      {/* Basic Corona Glow */}
      <Sphere args={[2.1, 32, 32]} scale={config.scale * 1.1}>
         <meshBasicMaterial color={config.emissive} transparent opacity={0.05} side={2} />
      </Sphere>
    </group>
  );
};

export default Sun3D;
