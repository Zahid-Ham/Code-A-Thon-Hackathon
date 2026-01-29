import React, { useRef, useLayoutEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Material Downgrade Utility for Mobile Performance
export const optimizeMaterials = (scene) => {
    scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            if (child.material) {
                child.material.precision = 'mediump';
                child.material.flatShading = false;
                if (child.material.map) {
                    child.material.map.anisotropy = 1;
                    child.material.map.generateMipmaps = false; 
                    child.material.map.minFilter = THREE.LinearFilter;
                }
            }
        }
    });
};

export const InteractiveModel = ({ url, initialScale, position, rotation, scaleFactor, onSelect }) => {
  const { scene } = useGLTF(url);
  const ref = useRef();
  
  // Optimize scene ONCE when loaded
  useLayoutEffect(() => {
      optimizeMaterials(scene);
  }, [scene]);

  const finalScale = initialScale * scaleFactor;

  return (
    <primitive 
      ref={ref}
      object={scene} 
      position={position} 
      rotation={rotation}
      scale={[finalScale, finalScale, finalScale]}
      onClick={(e) => {
          if (onSelect) {
            e.stopPropagation();
            onSelect();
          }
      }}
    />
  );
};

export const LoadingHologram = ({ position, scale = 1 }) => {
    const ref = useRef();
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y += 0.05;
            ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
        }
    });

    return (
        <group position={position}>
             <mesh ref={ref}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.3} />
            </mesh>
             <mesh rotation-x={-Math.PI / 2}>
                <ringGeometry args={[0.15, 0.16, 32]} />
                <meshBasicMaterial color="cyan" transparent opacity={0.5} />
            </mesh>
        </group>
    );
};
