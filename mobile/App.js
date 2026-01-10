import React, { useState, useEffect, Suspense, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Platform, SafeAreaView, Dimensions, PanResponder, Modal } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { DeviceMotion } from 'expo-sensors';
import { AR_MODELS } from './src/data/models';
import * as THREE from 'three';
import { Asset } from 'expo-asset';
import VoiceChatbot from './src/components/VoiceChatbot';

// Reverting to direct link method as per user request
const launchNativeAR = async (activeModel) => {
    try {
        // 1. Resolve Asset URI (likely http://IP:PORT/... in dev)
        const asset = Asset.fromModule(activeModel.asset);
        await asset.downloadAsync();
        
        let finalUri = asset.uri;
        console.log("Resolved Model URI:", finalUri);

        // 2. Construct Intent (Standard Google Scene Viewer Link)
        // intent:// scheme often works better for redirection than https:// link on some Androids
        // But the user asked for "redirecting to the link"
        
        const isHubble = activeModel.name.includes('Hubble');
        const allowVertical = !isHubble; 
        const title = encodeURIComponent(activeModel.name);
        
        // We use the intent scheme to force the Android App to open
        // S.browser_fallback_url ensures if it fails, it tries to open in browser
        const scheme = `intent://arvr.google.com/scene-viewer/1.0?file=${finalUri}&mode=ar_prefer&resizable=true&enable_vertical_placement=${allowVertical}&title=${title}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;

        console.log("Launching AR Intent");
        await Linking.openURL(scheme);
        
    } catch (e) {
        console.error("AR Launch Error:", e);
        alert("Failed to launch AR. Ensure Google Play Services for AR is installed and permitted.");
    }
};

const NativeARModal = ({ visible, onClose, onLaunch, activeModelName }) => (
    <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>🚀 Launching {activeModelName}</Text>
                <Text style={styles.modalText}>
                    Native AR uses Google's Engine for surface detection.
                    {"\n\n"}1. <Text style={styles.bold}>Point at a textured floor</Text> (Rug/Wood).
                    {"\n"}2. Move phone <Text style={styles.bold}>side-to-side</Text>.
                    {"\n"}3. If it fails, try a brighter room.
                </Text>
                <View style={styles.modalActions}>
                    <TouchableOpacity onPress={onClose} style={styles.modalBtnSec}><Text style={styles.btnTextSec}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity onPress={onLaunch} style={styles.modalBtnPri}><Text style={styles.btnTextPri}>Launch AR</Text></TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);


// --- Compass Camera (Orbit) ---
const CompassCamera = ({ isLocked, setDebugHint, distance, setDistance, manualOrbit }) => {
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
             camera.position.set(0, 0, distance);
             camera.rotation.set(0, 0, 0);
             camera.lookAt(0,0,0);
             anchorRef.current = { alpha, beta }; 
             return;
        }
        
        // --- Hybrid Orbit: Sensors + Manual Drag ---
        // 1. Compass/Tilt (Sensor)
        let deltaAlpha = alpha - anchorRef.current.alpha;
        if (deltaAlpha > Math.PI) deltaAlpha -= 2 * Math.PI;
        if (deltaAlpha < -Math.PI) deltaAlpha += 2 * Math.PI;
        let deltaBeta = beta - anchorRef.current.beta;

        // 2. Manual Touch Drag (Refined Control)
        // Add gesture offset to sensor offset
        const finalAlpha = deltaAlpha + manualOrbit.current.x;
        const finalBeta = deltaBeta * 2.0 + manualOrbit.current.y * 2.0;

        // 3. Spherical Calc
        const radius = distance; 
        const theta = finalAlpha; 
        const phi = finalBeta;

        camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
        camera.position.y = radius * Math.sin(phi);
        camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
        
        camera.lookAt(0, 0, 0);

        if (Math.abs(theta) > 0.8) setDebugHint(theta > 0 ? "Turn Left ⬅️" : "Turn Right ➡️");
        else setDebugHint("");
    });
    return () => sub.remove();
  }, [isLocked, distance]);
  return null;
};

// --- Shadow ---
const GroundShadow = () => (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.0, 0]}>
        <ringGeometry args={[0.01, 1.2, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.5} />
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
  const [userScale, setUserScale] = useState(1.0);
  const [distance, setDistance] = useState(4.0);
  const [showNativeModal, setShowNativeModal] = useState(false);

  // --- Gestures (Pinch & Drag) ---
  const manualOrbit = useRef({ x: 0, y: 0 }); // Extra rotation from drag
  const lastTouch = useRef({ x: 0, y: 0 });
  const initialDist = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt, gestureState) => {
          if (evt.nativeEvent.touches.length === 2) {
              // Pinch Start
              const t1 = evt.nativeEvent.touches[0];
              const t2 = evt.nativeEvent.touches[1];
              initialDist.current = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
          } else {
              // Drag Start
              lastTouch.current = { x: gestureState.x0, y: gestureState.y0 };
          }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
            // Pinch Zoom (Scale)
            const t1 = evt.nativeEvent.touches[0];
            const t2 = evt.nativeEvent.touches[1];
            const dist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
            const scaleFactor = dist / initialDist.current;
            
            // Apply scale incrementally but gently
            if (Math.abs(1 - scaleFactor) > 0.05) {
                setUserScale(prev => Math.max(0.5, Math.min(3.0, prev * (scaleFactor > 1 ? 1.02 : 0.98))));
            }
        } else if (isLocked) {
            // Drag Rotation (Add to Orbit)
            // Only when LOCKED
            const dx = gestureState.dx;
            const dy = gestureState.dy;
            
            // Adjust sensitivity
            manualOrbit.current.x -= dx * 0.0005; // Left/Right drag rotates Camera orbit
            manualOrbit.current.y -= dy * 0.0005; // Up/Down drag rotates Camera height
        }
      }
    })
  ).current;

  if (!permission?.granted) {
      return (<View style={styles.center}><TouchableOpacity onPress={requestPermission} style={styles.btn}><Text>Enable Camera</Text></TouchableOpacity></View>);
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />
      
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Canvas>
              <ambientLight intensity={1.5} />
              <directionalLight position={[0,10,5]} />
              <CompassCamera 
                  isLocked={isLocked} 
                  setDebugHint={setHint} 
                  distance={distance} 
                  setDistance={setDistance}
                  manualOrbit={manualOrbit}
              />
              <Suspense fallback={null}>
                  <VariableModel 
                      asset={activeModel.asset} 
                      scale={activeModel.scale * 1.5 * userScale} 
                  />
              </Suspense>
          </Canvas>
      </View>

      {/* Radar Hint */}
      {hint !== "" && <View style={styles.radar}><Text style={styles.radarText}>{hint}</Text></View>}

      {/* Voice Chatbot Overlay */}
      <VoiceChatbot />

      <SafeAreaView style={styles.topContainer} pointerEvents="box-none">
          <View style={styles.topRow}>
              {/* Distance Controls */}
              {!isLocked ? (
                  <View style={styles.controlGroup}>
                      <Text style={styles.label}>DISTANCE</Text>
                      <View style={styles.pill}>
                          <TouchableOpacity onPress={() => setDistance(d => Math.min(8, d + 0.5))} style={styles.circleBtn}><Text style={styles.btnIcon}>⬆️</Text></TouchableOpacity>
                          <Text style={styles.valueStr}>{distance.toFixed(1)}m</Text>
                          <TouchableOpacity onPress={() => setDistance(d => Math.max(2, d - 0.5))} style={styles.circleBtn}><Text style={styles.btnIcon}>⬇️</Text></TouchableOpacity>
                      </View>
                  </View>
              ) : <View/>}

              {/* Native AR Button */}
              <TouchableOpacity onPress={() => setShowNativeModal(true)} style={styles.arButton}>
                  <Text style={styles.arText}>GOOGLE AR 🚀</Text>
              </TouchableOpacity>
          </View>
      </SafeAreaView>

      <NativeARModal 
          visible={showNativeModal} 
          onClose={() => setShowNativeModal(false)}
          onLaunch={() => { setShowNativeModal(false); launchNativeAR(activeModel); }}
          activeModelName={activeModel.name}
      />

      <View style={styles.bottomContainer} pointerEvents="box-none">
          <Text style={styles.modelName}>{activeModel.name}</Text>
          <Text style={styles.instruction}>{isLocked ? "Pinch to Zoom • Drag to Rotate" : "Adjust Distance • Then Tap Place"}</Text>

          <TouchableOpacity 
             onPress={() => setIsLocked(!isLocked)} 
             style={[styles.bigBtn, isLocked ? styles.lockedBtn : styles.unlockedBtn]}
          >
             <Text style={styles.bigBtnText}>{isLocked ? "🔓 UNLOCK" : "📍 TAP TO PLACE"}</Text>
          </TouchableOpacity>

          <View style={styles.selector}>
             {/* PLANETS */}
             {AR_MODELS.Planets.map(m => (
                 <TouchableOpacity key={m.id} onPress={() => setActiveModel(m)} style={[styles.tab, activeModel.id === m.id && styles.activeTab]}>
                     <Text style={[styles.tabText, activeModel.id === m.id && styles.activeTabText]}>{m.name}</Text>
                 </TouchableOpacity>
             ))}
             {/* SATELLITES */}
             {AR_MODELS.Satellites.map(m => (
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
  
  topContainer: { position: 'absolute', top: 0, width: '100%', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  
  controlGroup: { alignItems: 'flex-start' },
  label: { color: 'cyan', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  pill: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 30, padding: 5, alignItems: 'center' },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  btnIcon: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  valueStr: { color: 'white', fontWeight: 'bold', marginHorizontal: 10, minWidth: 40, textAlign: 'center' },
  
  arButton: { backgroundColor: 'white', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25 },
  arText: { color: 'black', fontWeight: 'bold', fontSize: 14 },

  bottomContainer: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  modelName: { color: 'white', fontSize: 42, fontWeight: 'bold', marginBottom: 5 },
  instruction: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 20, fontWeight:'bold' },
  
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
  activeTabText: { color: 'black' },

  // Modal
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.8)', justifyContent:'center', alignItems:'center' },
  modalContent: { width:'80%', backgroundColor:'#1a1a1a', padding:30, borderRadius:20, alignItems:'center' },
  modalTitle: { color:'white', fontSize:22, fontWeight:'bold', marginBottom:15 },
  modalText: { color:'#ccc', fontSize:14, lineHeight:22, marginBottom:25, textAlign:'left', width:'100%' },
  bold: { color:'cyan', fontWeight:'bold' },
  modalActions: { flexDirection:'row', width:'100%', justifyContent:'space-between' },
  modalBtnSec: { padding:15 },
  btnTextSec: { color:'#888', fontWeight:'bold' },
  modalBtnPri: { backgroundColor:'cyan', paddingVertical:15, paddingHorizontal:25, borderRadius:10 },
  btnTextPri: { color:'black', fontWeight:'bold' }
});
