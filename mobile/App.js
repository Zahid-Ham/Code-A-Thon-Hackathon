import React, { useState, useEffect, Suspense, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Platform, SafeAreaView, Dimensions } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { DeviceMotion } from 'expo-sensors';
import { AR_MODELS } from './src/data/models';
import * as THREE from 'three';
import { Asset } from 'expo-asset';

// --- AR Launcher ---
const launchNativeAR = async () => {
    // We use the HTTPS Deep Link which is more robust than raw Intent schemes.
    // Android System intercepts "arvr.google.com" and hands it to the Google App (Scene Viewer).
    // If that fails, it opens in Chrome, which also supports Scene Viewer.
    // This avoids the "Activity not found" crashes.
    const modelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb'; 
    const sceneViewerUrl = `https://arvr.google.com/scene-viewer/1.0?file=${modelUrl}&mode=ar_prefer`;
    
    // iOS Quick Look
    if (Platform.OS === 'ios') {
        Linking.openURL('https://developer.apple.com/augmented-reality/quick-look/');
        return;
    }

    // Android
    try {
        await Linking.openURL(sceneViewerUrl);
    } catch (e) {
        // Fallback: If even the HTTPS link fails (rare), show alert
        alert("Could not launch AR Viewer. Please ensure Google Chrome is installed.");
    }
};

// --- Compass Camera (Spherical Orbit) ---
const CompassCamera = ({ isLocked, setDebugHint, distance }) => {
  const { camera } = useThree();
  const anchorRef = useRef({ alpha: 0, beta: 0 }); 

  useEffect(() => {
    DeviceMotion.setUpdateInterval(16);
    const sub = DeviceMotion.addListener((data) => {
        const rotation = data.rotation;
        if (!rotation) return;
        
        const alpha = rotation.alpha || 0; 
        const beta = rotation.beta || 0;   
        
        if (!isLocked) {
             // Preview: Camera static at 0,0, distance
             camera.position.set(0, 0, distance);
             camera.rotation.set(0, 0, 0);
             camera.lookAt(0,0,0);
             anchorRef.current = { alpha, beta }; 
             return;
        }
        
        let deltaAlpha = alpha - anchorRef.current.alpha;
        if (deltaAlpha > Math.PI) deltaAlpha -= 2 * Math.PI;
        if (deltaAlpha < -Math.PI) deltaAlpha += 2 * Math.PI;

        let deltaBeta = beta - anchorRef.current.beta;
        
        // Spherical Orbit
        const radius = distance; 
        const theta = deltaAlpha; 
        const phi = deltaBeta * 2.0; // Sensitivity

        // Convert to Cartesian
        // We want to orbit around (0,0,0)
        camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
        camera.position.y = radius * Math.sin(phi);
        camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
        
        camera.lookAt(0, 0, 0);

        if (Math.abs(deltaAlpha) > 0.8) setDebugHint(deltaAlpha > 0 ? "Turn Left ⬅️" : "Turn Right ➡️");
        else setDebugHint("");
    });
    return () => sub.remove();
  }, [isLocked, distance]);
  return null;
};

// --- Shadow ---
const GroundShadow = () => (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <ringGeometry args={[0.1, 1.5, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.4} />
    </mesh>
);

const VariableModel = ({ asset, scale }) => {
    const { scene } = useGLTF(asset);
    return (
        <group>
            <primitive object={scene} position={[0, 0, 0]} scale={[scale, scale, scale]} />
            <GroundShadow />
        </group>
    );
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [activeModel, setActiveModel] = useState(AR_MODELS.Planets[0]); 
  
  const [isLocked, setIsLocked] = useState(false);
  const [hint, setHint] = useState("");
  const [userScale, setUserScale] = useState(1.0); // Size
  const [distance, setDistance] = useState(4.0);   // Camera Distance

  if (!permission?.granted) {
      return (<View style={styles.center}><TouchableOpacity onPress={requestPermission} style={styles.btn}><Text>Enable Camera</Text></TouchableOpacity></View>);
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />
      
      {/* 3D Scene */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Canvas>
              <ambientLight intensity={1.5} />
              <directionalLight position={[0,10,5]} />
              <CompassCamera isLocked={isLocked} setDebugHint={setHint} distance={distance} />
              <Suspense fallback={null}>
                  <VariableModel 
                      asset={activeModel.asset} 
                      scale={activeModel.scale * 1.5 * userScale} // Reduced Base Scale
                  />
              </Suspense>
          </Canvas>
      </View>

      {/* Radar Hint */}
      {hint !== "" && <View style={styles.radar}><Text style={styles.radarText}>{hint}</Text></View>}

      {/* --- TOP UI (SafeArea) --- */}
      <SafeAreaView style={styles.topContainer}>
          <View style={styles.topRow}>
              {/* Size Controls */}
              {!isLocked ? (
                <View style={styles.controlGroup}>
                    <Text style={styles.label}>SIZE</Text>
                    <View style={styles.pill}>
                        <TouchableOpacity onPress={() => setUserScale(s => Math.max(0.5, s - 0.2))} style={styles.circleBtn}><Text style={styles.btnIcon}>-</Text></TouchableOpacity>
                        <Text style={styles.valueStr}>{userScale.toFixed(1)}x</Text>
                        <TouchableOpacity onPress={() => setUserScale(s => Math.min(3, s + 0.2))} style={styles.circleBtn}><Text style={styles.btnIcon}>+</Text></TouchableOpacity>
                    </View>
                </View>
              ) : (
                <View style={styles.lockedBadge}>
                    <Text style={styles.lockedText}>LOCKED 🔒</Text>
                </View>
              )}

              {/* Native AR Button */}
              <TouchableOpacity onPress={launchNativeAR} style={styles.arButton}>
                  <Text style={styles.arText}>GOOGLE AR 🚀</Text>
              </TouchableOpacity>
          </View>
      </SafeAreaView>

      {/* --- BOTTOM UI --- */}
      <View style={styles.bottomContainer}>
          
          <Text style={styles.modelName}>{activeModel.name}</Text>

          <TouchableOpacity 
             onPress={() => setIsLocked(!isLocked)} 
             style={[styles.bigBtn, isLocked ? styles.lockedBtn : styles.unlockedBtn]}
          >
             <Text style={styles.bigBtnText}>{isLocked ? "🔓 UNLOCK" : "📍 LOCK HERE"}</Text>
          </TouchableOpacity>

          <View style={styles.selector}>
             {AR_MODELS.Planets.map(m => (
                 <TouchableOpacity key={m.id} onPress={() => setActiveModel(m)} style={[styles.tab, activeModel.id === m.id && styles.activeTab]}>
                     <Text style={[styles.tabText, activeModel.id === m.id && styles.activeTabText]}>{m.name}</Text>
                 </TouchableOpacity>
             ))}
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  
  // Top UI
  topContainer: { position: 'absolute', top: 0, width: '100%', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  
  controlGroup: { alignItems: 'flex-start' },
  label: { color: 'cyan', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  pill: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 30, padding: 5, alignItems: 'center' },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  btnIcon: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  valueStr: { color: 'white', fontWeight: 'bold', marginHorizontal: 10, minWidth: 40, textAlign: 'center' },

  lockedBadge: { backgroundColor:'red', paddingVertical:5, paddingHorizontal:15, borderRadius:20 },
  lockedText: { color:'white', fontWeight:'bold' },

  arButton: { backgroundColor: 'white', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25 },
  arText: { color: 'black', fontWeight: 'bold', fontSize: 14 },

  // Bottom UI
  bottomContainer: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  modelName: { color: 'white', fontSize: 42, fontWeight: 'bold', marginBottom: 20 },
  
  bigBtn: { paddingVertical: 20, paddingHorizontal: 60, borderRadius: 40, marginBottom: 25 },
  unlockedBtn: { backgroundColor: '#00ffff' },
  lockedBtn: { backgroundColor: '#ff0055' },
  bigBtnText: { fontWeight: '900', fontSize: 18, color: 'black' },
  
  radar: { position:'absolute', top:'45%', alignSelf:'center', padding:20, backgroundColor:'rgba(0,0,0,0.7)', borderRadius:20 },
  radarText: { color:'yellow', fontSize: 24, fontWeight:'bold' },

  selector: { flexDirection: 'row', gap: 10 },
  tab: { padding: 8, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeTab: { backgroundColor: 'cyan' },
  tabText: { color: '#ccc', fontWeight: 'bold' },
  activeTabText: { color: 'black' }
});
