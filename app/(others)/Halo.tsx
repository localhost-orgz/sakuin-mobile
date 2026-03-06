// import React, { useEffect, useRef, useState } from "react";
// import {
//   Animated,
//   Dimensions,
//   Easing,
//   Pressable,
//   StatusBar,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";

// const { width } = Dimensions.get("window");

// const NUM_BARS = 40;
// const BAR_WIDTH = 4;
// const BAR_GAP = (width - 80 - NUM_BARS * BAR_WIDTH) / (NUM_BARS - 1);

// const BAR_CONFIGS = Array.from({ length: NUM_BARS }, (_, i) => ({
//   id: i,
//   speed: 600 + Math.random() * 800,
//   delay: Math.random() * 400,
//   minHeight: 4,
//   maxHeight: 28 + Math.random() * 52,
//   phase: Math.random() * Math.PI * 2,
// }));

// const WaveBar = ({
//   config,
//   isRecording,
// }: {
//   config: (typeof BAR_CONFIGS)[0];
//   isRecording: boolean;
// }) => {
//   const anim = useRef(new Animated.Value(0)).current;
//   const loopRef = useRef<Animated.CompositeAnimation | null>(null);

//   useEffect(() => {
//     if (isRecording) {
//       loopRef.current = Animated.loop(
//         Animated.sequence([
//           Animated.timing(anim, {
//             toValue: 1,
//             duration: config.speed,
//             delay: config.delay,
//             easing: Easing.inOut(Easing.sin),
//             useNativeDriver: false,
//           }),
//           Animated.timing(anim, {
//             toValue: 0,
//             duration: config.speed,
//             easing: Easing.inOut(Easing.sin),
//             useNativeDriver: false,
//           }),
//         ]),
//       );
//       loopRef.current.start();
//     } else {
//       loopRef.current?.stop();
//       Animated.timing(anim, {
//         toValue: 0,
//         duration: 400,
//         easing: Easing.out(Easing.cubic),
//         useNativeDriver: false,
//       }).start();
//     }

//     return () => loopRef.current?.stop();
//   }, [isRecording]);

//   const barHeight = anim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [config.minHeight, config.maxHeight],
//   });

//   const opacity = anim.interpolate({
//     inputRange: [0, 0.5, 1],
//     outputRange: [0.35, 1, 0.35],
//   });

//   return (
//     <Animated.View
//       style={[
//         styles.bar,
//         {
//           height: barHeight,
//           opacity,
//         },
//       ]}
//     />
//   );
// };

// const formatTime = (seconds: number) => {
//   const m = Math.floor(seconds / 60)
//     .toString()
//     .padStart(2, "0");
//   const s = (seconds % 60).toString().padStart(2, "0");
//   return `${m}:${s}`;
// };

// export default function RecordingScreen() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [elapsed, setElapsed] = useState(0);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

//   useEffect(() => {
//     if (isRecording) {
//       timerRef.current = setInterval(() => {
//         setElapsed((prev) => prev + 1);
//       }, 1000);

//       pulseLoop.current = Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1.15,
//             duration: 800,
//             easing: Easing.inOut(Easing.ease),
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 800,
//             easing: Easing.inOut(Easing.ease),
//             useNativeDriver: true,
//           }),
//         ]),
//       );
//       pulseLoop.current.start();
//     } else {
//       if (timerRef.current) clearInterval(timerRef.current);
//       pulseLoop.current?.stop();
//       Animated.timing(pulseAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     }

//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [isRecording]);

//   const handleToggle = () => {
//     if (isRecording) {
//       setIsRecording(false);
//       setElapsed(0);
//     } else {
//       setElapsed(0);
//       setIsRecording(true);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" />

//       {/* Background glow */}
//       {isRecording && (
//         <Animated.View
//           style={[styles.bgGlow, { transform: [{ scale: pulseAnim }] }]}
//         />
//       )}

//       {/* Title */}
//       <View style={styles.header}>
//         <Text style={styles.title}>Voice Memo</Text>
//         <Text style={styles.subtitle}>
//           {isRecording ? "Recording in progress..." : "Tap to start recording"}
//         </Text>
//       </View>

//       {/* Timer */}
//       <Text style={styles.timer}>{formatTime(elapsed)}</Text>

//       {/* Wave bars */}
//       <View style={styles.waveContainer}>
//         {BAR_CONFIGS.map((config) => (
//           <WaveBar key={config.id} config={config} isRecording={isRecording} />
//         ))}
//       </View>

//       {/* Record button */}
//       <Animated.View
//         style={[styles.btnOuter, { transform: [{ scale: pulseAnim }] }]}
//       >
//         <Pressable
//           onPress={handleToggle}
//           style={[styles.btn, isRecording && styles.btnActive]}
//         >
//           <View style={[styles.btnInner, isRecording && styles.btnInnerStop]} />
//         </Pressable>
//       </Animated.View>

//       <Text style={styles.hint}>
//         {isRecording ? "Tap to stop" : "Tap to record"}
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#0a0a0f",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 40,
//     gap: 32,
//   },
//   bgGlow: {
//     position: "absolute",
//     width: 360,
//     height: 360,
//     borderRadius: 180,
//     backgroundColor: "rgba(0, 191, 113, 0.07)",
//     alignSelf: "center",
//     top: "50%",
//     marginTop: -180,
//   },
//   header: {
//     alignItems: "center",
//     gap: 6,
//   },
//   title: {
//     color: "#ffffff",
//     fontSize: 28,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
//   subtitle: {
//     color: "#6b7280",
//     fontSize: 14,
//     letterSpacing: 0.3,
//   },
//   timer: {
//     color: "#00bf71",
//     fontSize: 48,
//     fontWeight: "200",
//     letterSpacing: 4,
//     fontVariant: ["tabular-nums"],
//   },
//   waveContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     height: 100,
//     gap: BAR_GAP,
//   },
//   bar: {
//     width: BAR_WIDTH,
//     borderRadius: 99,
//     backgroundColor: "#00bf71",
//   },
//   btnOuter: {
//     padding: 6,
//     borderRadius: 999,
//     borderWidth: 2,
//     borderColor: "rgba(0, 191, 113, 0.4)",
//   },
//   btn: {
//     width: 72,
//     height: 72,
//     borderRadius: 999,
//     backgroundColor: "#00bf71",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   btnActive: {
//     backgroundColor: "#ef4444",
//     borderColor: "rgba(239, 68, 68, 0.4)",
//   },
//   btnInner: {
//     width: 28,
//     height: 28,
//     borderRadius: 999,
//     backgroundColor: "#fff",
//   },
//   btnInnerStop: {
//     borderRadius: 6,
//     width: 22,
//     height: 22,
//   },
//   hint: {
//     color: "#4b5563",
//     fontSize: 13,
//     letterSpacing: 0.5,
//   },
// });

// yang baru

import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// ─── Blob config ────────────────────────────────────────────────
const BLOBS = [
  {
    color: "#a8c8f8",
    size: width * 1.1,
    baseX: width * 0.1,
    baseY: height * 0.72,
    speedX: 2200,
    speedY: 2800,
  },
  {
    color: "#c5d9f5",
    size: width * 0.85,
    baseX: width * 0.35,
    baseY: height * 0.78,
    speedX: 3100,
    speedY: 2500,
  },
  {
    color: "#dce9fc",
    size: width * 0.7,
    baseX: width * 0.55,
    baseY: height * 0.74,
    speedX: 2600,
    speedY: 3300,
  },
  {
    color: "#b8d4f9",
    size: width * 0.55,
    baseX: width * 0.2,
    baseY: height * 0.8,
    speedX: 3400,
    speedY: 2900,
  },
];

// ─── Single animated blob ────────────────────────────────────────
function Blob({
  config,
  volume,
}: {
  config: (typeof BLOBS)[0];
  volume: Animated.Value;
}) {
  const xAnim = useRef(new Animated.Value(0)).current;
  const yAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loopX = Animated.loop(
      Animated.sequence([
        Animated.timing(xAnim, {
          toValue: 1,
          duration: config.speedX,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(xAnim, {
          toValue: -1,
          duration: config.speedX,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(xAnim, {
          toValue: 0,
          duration: config.speedX,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const loopY = Animated.loop(
      Animated.sequence([
        Animated.timing(yAnim, {
          toValue: -1,
          duration: config.speedY,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(yAnim, {
          toValue: 1,
          duration: config.speedY,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(yAnim, {
          toValue: 0,
          duration: config.speedY,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loopX.start();
    loopY.start();
    return () => {
      loopX.stop();
      loopY.stop();
    };
  }, []);

  const translateX = xAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-40, 40],
  });
  const translateY = yAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-30, 30],
  });
  const scale = volume.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: config.baseX - config.size / 2,
        top: config.baseY - config.size / 2,
        width: config.size,
        height: config.size,
        borderRadius: config.size / 2,
        backgroundColor: config.color,
        opacity: 0.75,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    />
  );
}

// ─── Main screen ─────────────────────────────────────────────────
export default function LiveRecordingScreen() {
  const insets = useSafeAreaInsets();
  const [isLive, setIsLive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [statusText, setStatusText] = useState("Tap Live to start");

  const recordingRef = useRef<Audio.Recording | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeAnim = useRef(new Animated.Value(0)).current;
  const volumeTarget = useRef(0);

  // Smooth volume lerp
  useEffect(() => {
    const id = setInterval(() => {
      Animated.spring(volumeAnim, {
        toValue: volumeTarget.current,
        speed: 14,
        bounciness: 2,
        useNativeDriver: true,
      }).start();
    }, 80);
    return () => clearInterval(id);
  }, []);

  const requestPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setHasPermission(status === "granted");
    return status === "granted";
  };

  const startRecording = async () => {
    const granted = hasPermission || (await requestPermission());
    if (!granted) {
      setStatusText("Microphone permission denied");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();
    recordingRef.current = rec;

    // Poll metering
    pollingRef.current = setInterval(async () => {
      try {
        const status = await rec.getStatusAsync();
        if (status.isRecording && status.metering !== undefined) {
          // metering is in dBFS: -160 (silence) to 0 (max)
          const db = status.metering;
          const normalized = Math.max(0, Math.min(1, (db + 60) / 60)); // map -60..0 → 0..1
          volumeTarget.current = normalized;
        }
      } catch (_) {}
    }, 80);

    setIsLive(true);
    setStatusText("Listening...");
  };

  const stopRecording = async () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    volumeTarget.current = 0;

    try {
      await recordingRef.current?.stopAndUnloadAsync();
    } catch (_) {}
    recordingRef.current = null;

    setIsLive(false);
    setStatusText("Tap Live to start");
  };

  const handleToggle = () => (isLive ? stopRecording() : startRecording());

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Dark top area */}
      <View style={StyleSheet.absoluteFill} />

      {/* Blobs — clipped to bottom card */}
      <View style={styles.blobCanvas} pointerEvents="none">
        {BLOBS.map((cfg, i) => (
          <Blob key={i} config={cfg} volume={volumeAnim} />
        ))}
        {/* Blur overlay — pure RN (no BlurView dependency) */}
        <View style={styles.blurOverlay} />
      </View>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={handleToggle} style={styles.liveBtn}>
          <View style={[styles.liveDot, isLive && styles.liveDotActive]} />
          <Text style={styles.liveBtnText}>Live</Text>
        </Pressable>
        <Pressable style={styles.captionBtn}>
          <Text style={styles.captionIcon}>⊟</Text>
        </Pressable>
      </View>

      {/* Status text */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={styles.controlBtn}>
          <Text style={styles.controlIcon}>⬛</Text>
        </Pressable>
        <Pressable style={styles.controlBtn}>
          <Text style={styles.controlIcon}>⬆</Text>
        </Pressable>
        <Pressable style={styles.controlBtn}>
          <Text style={styles.controlIcon}>🎙</Text>
        </Pressable>
        <Pressable
          onPress={handleToggle}
          style={[styles.controlBtn, styles.closeBtn]}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const CARD_TOP = height * 0.55;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#08090d",
  },
  blobCanvas: {
    position: "absolute",
    left: 0,
    right: 0,
    top: CARD_TOP,
    bottom: 80,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    backgroundColor: "#0d1520",
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13, 21, 32, 0.22)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  liveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6b7280",
  },
  liveDotActive: {
    backgroundColor: "#f97316",
  },
  liveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  captionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  captionIcon: {
    color: "#fff",
    fontSize: 16,
  },
  statusContainer: {
    position: "absolute",
    top: CARD_TOP - 48,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  statusText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(30,34,42,0.95)",
    paddingTop: 16,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlIcon: {
    fontSize: 20,
  },
  closeBtn: {
    backgroundColor: "#ef4444",
  },
  closeBtnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});
