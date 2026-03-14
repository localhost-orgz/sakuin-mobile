/**
 * app/(others)/sakuVoice.tsx
 *
 * Install dependencies:
 *   npx expo install expo-av expo-speech @react-native-voice/voice
 *   npx expo install react-native-svg expo-linear-gradient
 *
 * Android: add to AndroidManifest.xml inside <manifest>:
 *   <uses-permission android:name="android.permission.RECORD_AUDIO"/>
 *
 * iOS: add to Info.plist:
 *   <key>NSSpeechRecognitionUsageDescription</key>
 *   <string>SakuVoice needs speech recognition to record your transactions.</string>
 *   <key>NSMicrophoneUsageDescription</key>
 *   <string>SakuVoice needs the microphone to listen to your voice.</string>
 */

import { useRouter } from "expo-router";
import { ChevronLeft, HelpCircle, RotateCcw } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";

// ─── Try to import Voice; gracefully degrade if not installed ─────────────────
let Voice: any = null;
try {
  Voice = require("@react-native-voice/voice").default;
} catch (_) {}

const { width: SW, height: SH } = Dimensions.get("window");

// ─── Theme ────────────────────────────────────────────────────────────────────
const GREEN = "#00bf71";
const GREEN_DARK = "#009e5f";
const GREEN_LIGHT = "#e6faf2";
const BG = "#f7fdf9";

// ─── Screen states ────────────────────────────────────────────────────────────
type ScreenState = "idle" | "recording" | "result";

// ─── Animated Wave ────────────────────────────────────────────────────────────
const WAVE_COUNT = 3;

const AnimatedWave = ({
  active,
  amplitude,
}: {
  active: boolean;
  amplitude: Animated.Value;
}) => {
  const waveAnims = useRef(
    Array.from({ length: WAVE_COUNT }, (_, i) => ({
      offset: new Animated.Value(0),
      phase: (i * Math.PI * 2) / WAVE_COUNT,
    })),
  ).current;

  const loopRefs = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    loopRefs.current.forEach((l) => l?.stop());
    loopRefs.current = [];

    if (active) {
      waveAnims.forEach(({ offset }, i) => {
        const loop = Animated.loop(
          Animated.timing(offset, {
            toValue: 1,
            duration: 2200 + i * 400,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        );
        loopRefs.current.push(loop);
        loop.start();
      });
    } else {
      waveAnims.forEach(({ offset }) => {
        Animated.timing(offset, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      });
    }

    return () => loopRefs.current.forEach((l) => l?.stop());
  }, [active]);

  // Build wave SVG path from animated values
  const WAVE_H = SH * 0.52;
  const WAVE_W = SW;

  const wavePaths = waveAnims.map(({ offset, phase }, waveIdx) => {
    // We'll use a JS-driven approach with useAnimatedValue listener
    return { offset, phase, waveIdx };
  });

  return (
    <WaveSvg
      wavePaths={wavePaths}
      amplitude={amplitude}
      width={WAVE_W}
      height={WAVE_H}
      active={active}
    />
  );
};

// JS-driven wave renderer
const WaveSvg = ({ wavePaths, amplitude, width, height, active }: any) => {
  const [offsets, setOffsets] = useState(wavePaths.map(() => 0));
  const [amp, setAmp] = useState(0);
  const frameRef = useRef<number>();
  const startRef = useRef(Date.now());

  useEffect(() => {
    const ampId = amplitude.addListener(({ value }: any) => setAmp(value));
    return () => amplitude.removeListener(ampId);
  }, []);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(frameRef.current!);
      return;
    }
    const animate = () => {
      const t = (Date.now() - startRef.current) / 1000;
      setOffsets(wavePaths.map((_: any, i: number) => t * (0.4 + i * 0.15)));
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current!);
  }, [active]);

  const buildPath = (offsetVal: number, waveIdx: number): string => {
    const baseY = height * (0.3 + waveIdx * 0.06);
    const waveAmp = (12 + amp * 28 + waveIdx * 6) * (active ? 1 : 0.15);
    const freq = 0.012 - waveIdx * 0.002;
    const points: string[] = [];

    for (let x = 0; x <= width + 10; x += 6) {
      const y =
        baseY +
        Math.sin(x * freq + offsetVal * Math.PI * 2 + waveIdx) * waveAmp +
        Math.sin(x * freq * 1.7 + offsetVal * 3 + waveIdx * 2) *
          (waveAmp * 0.4);
      points.push(x === 0 ? `M 0 ${y}` : `L ${x} ${y}`);
    }
    points.push(`L ${width} ${height} L 0 ${height} Z`);
    return points.join(" ");
  };

  const waveColors = [
    ["#00bf7155", "#00bf7133"],
    ["#00bf7188", "#00bf7155"],
    ["#00bf71cc", "#00bf7199"],
  ];

  return (
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {wavePaths.map((_: any, i: number) => (
          <Path
            key={i}
            d={buildPath(offsets[i] ?? 0, i)}
            fill={active ? waveColors[i][0] : "#00bf7118"}
            opacity={0.9 - i * 0.1}
          />
        ))}
      </Svg>
    </View>
  );
};

// ─── Mic Icon SVG ─────────────────────────────────────────────────────────────
const MicIcon = ({
  size = 32,
  color = "white",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
      fill={color}
    />
    <Path
      d="M19 10v2a7 7 0 0 1-14 0v-2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M12 19v4M8 23h8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// ─── Waveform lines (idle state decoration) ───────────────────────────────────
const IdleWaveform = ({ color = GREEN }: { color?: string }) => {
  const bars = [0.3, 0.5, 0.8, 0.6, 0.4, 0.7, 0.9, 0.5, 0.3];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        marginTop: 6,
      }}
    >
      {bars.map((h, i) => (
        <View
          key={i}
          style={{
            width: 3,
            height: 12 * h + 4,
            borderRadius: 2,
            backgroundColor: color,
            opacity: 0.5 + h * 0.5,
          }}
        />
      ))}
    </View>
  );
};

// ─── Pulse Ring ───────────────────────────────────────────────────────────────
const PulseRing = ({ active }: { active: boolean }) => {
  const scale1 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(0)).current;
  const loop = useRef<Animated.CompositeAnimation>();

  useEffect(() => {
    loop.current?.stop();
    if (active) {
      loop.current = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.parallel([
              Animated.timing(scale1, {
                toValue: 1.8,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(opacity1, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(scale1, {
                toValue: 1,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(opacity1, {
                toValue: 0.5,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.sequence([
            Animated.delay(400),
            Animated.parallel([
              Animated.timing(scale2, {
                toValue: 1.8,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(opacity2, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(scale2, {
                toValue: 1,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(opacity2, {
                toValue: 0.5,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
      );
      scale1.setValue(1);
      opacity1.setValue(0.5);
      scale2.setValue(1);
      opacity2.setValue(0.5);
      loop.current.start();
    } else {
      Animated.parallel([
        Animated.timing(opacity1, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity2, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [active]);

  return (
    <View
      style={{
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: GREEN,
          opacity: opacity1,
          transform: [{ scale: scale1 }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: GREEN,
          opacity: opacity2,
          transform: [{ scale: scale2 }],
        }}
      />
    </View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function SakuVoice() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [screen, setScreen] = useState<ScreenState>("idle");
  const [partialText, setPartialText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [transcript, setTranscript] = useState<string[]>([]);
  const [hasVoice, setHasVoice] = useState(false);

  // Animations
  const micY = useRef(new Animated.Value(0)).current;
  const micScale = useRef(new Animated.Value(1)).current;
  const waveAmplitude = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const listeningOpacity = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  // Check Voice availability
  useEffect(() => {
    setHasVoice(Voice !== null);
  }, []);

  // ── Voice event handlers ───────────────────────────────────────────────────
  useEffect(() => {
    if (!Voice) return;

    Voice.onSpeechStart = () => {};
    Voice.onSpeechEnd = () => {};
    Voice.onSpeechError = (e: any) => {
      console.log("Speech error:", e);
    };
    Voice.onSpeechPartialResults = (e: any) => {
      const partial = e.value?.[0] ?? "";
      setPartialText(partial);
      // Simulate amplitude boost when speaking
      Animated.timing(waveAmplitude, {
        toValue: 0.6 + Math.random() * 0.4,
        duration: 150,
        useNativeDriver: false,
      }).start();
    };
    Voice.onSpeechResults = (e: any) => {
      const result = e.value?.[0] ?? "";
      if (result) {
        setTranscript((prev) => [...prev, result]);
        setFinalText((prev) => (prev ? prev + " " + result : result));
      }
      setPartialText("");
      // Gentle amplitude drop
      Animated.timing(waveAmplitude, {
        toValue: 0.1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // ── Start Recording ────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setScreen("recording");
    setTranscript([]);
    setFinalText("");
    setPartialText("");

    // Animate mic upward + wave in
    Animated.parallel([
      Animated.timing(micY, {
        toValue: -SH * 0.18,
        duration: 500,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(micScale, {
        toValue: 0.75,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(listeningOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(waveAmplitude, {
        toValue: 0.2,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();

    // Start voice recognition
    if (Voice) {
      try {
        await Voice.start("id-ID"); // Indonesian locale — change to "en-US" if needed
      } catch (e) {
        console.log("Voice start error:", e);
      }
    } else {
      // Demo mode: simulate speech recognition
      simulateSpeech();
    }
  }, []);

  // Demo simulation when Voice isn't installed
  const simulateSpeech = () => {
    const phrases = [
      "Ayam Sangar satu",
      "25 ribu rupiah",
      "25 februari",
      "BCA",
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < phrases.length) {
        setPartialText(phrases[i]);
        Animated.timing(waveAmplitude, {
          toValue: 0.4 + Math.random() * 0.5,
          duration: 200,
          useNativeDriver: false,
        }).start();
        setTimeout(() => {
          setTranscript((prev) => [...prev, phrases[i]]);
          setFinalText((prev) => (prev ? prev + " " + phrases[i] : phrases[i]));
          setPartialText("");
          Animated.timing(waveAmplitude, {
            toValue: 0.1,
            duration: 300,
            useNativeDriver: false,
          }).start();
          i++;
        }, 900);
      } else {
        clearInterval(interval);
      }
    }, 1800);
  };

  // ── Stop Recording ─────────────────────────────────────────────────────────
  const stopRecording = useCallback(async () => {
    if (Voice) {
      try {
        await Voice.stop();
      } catch (e) {}
    }

    // Animate wave down + transition to result
    Animated.parallel([
      Animated.timing(waveAmplitude, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(listeningOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setScreen("result");
      Animated.parallel([
        Animated.timing(micY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(micScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(resultOpacity, {
          toValue: 1,
          duration: 400,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  // ── Cancel Recording ───────────────────────────────────────────────────────
  const cancelRecording = useCallback(async () => {
    if (Voice) {
      try {
        await Voice.cancel();
      } catch (e) {}
    }
    resetToIdle();
  }, []);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetToIdle = useCallback(() => {
    setScreen("idle");
    setTranscript([]);
    setFinalText("");
    setPartialText("");

    Animated.parallel([
      Animated.timing(micY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
      Animated.timing(micScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(listeningOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(resultOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(waveAmplitude, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  // ── Confirm result ─────────────────────────────────────────────────────────
  const confirmResult = () => {
    Alert.alert("Transaction Saved!", `"${finalText}" has been recorded.`, [
      { text: "OK", onPress: () => resetToIdle() },
    ]);
  };

  const isRecording = screen === "recording";
  const isResult = screen === "result";
  const displayText =
    finalText + (partialText ? (finalText ? " " : "") + partialText : "");

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="dark-content" />

      {/* ── Background wave (always rendered, amplitude-driven) ─────────── */}
      <AnimatedWave active={isRecording} amplitude={waveAmplitude} />

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <Pressable
          onPress={() => (isRecording ? cancelRecording() : router.back())}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "rgba(0,0,0,0.06)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft size={20} color="#1a1f36" strokeWidth={2.5} />
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: GREEN_LIGHT,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MicIcon size={14} color={GREEN} />
          </View>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: "#1a1f36",
              letterSpacing: -0.3,
            }}
          >
            SakuVoice
          </Text>
        </View>

        <Pressable
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "rgba(0,0,0,0.06)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HelpCircle size={18} color="#6b7280" strokeWidth={2} />
        </Pressable>
      </View>

      {/* ── CENTER CONTENT ────────────────────────────────────────────────── */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: insets.top + 60,
        }}
      >
        {/* Idle text */}
        <Animated.View
          style={{
            opacity: contentOpacity,
            alignItems: "center",
            position: "absolute",
            top: "18%",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#374151",
              textAlign: "center",
              letterSpacing: -0.2,
            }}
          >
            Record Your Transaction Quickly!
          </Text>
          <IdleWaveform />
        </Animated.View>

        {/* Listening label + real-time text */}
        <Animated.View
          style={{
            opacity: listeningOpacity,
            alignItems: "center",
            position: "absolute",
            top: "8%",
            left: 24,
            right: 24,
          }}
        >
          {/* Listening indicator */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "rgba(0,191,113,0.12)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MicIcon size={16} color={GREEN} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#374151" }}>
              Listening...
            </Text>
          </View>

          {/* Real-time transcript words */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 6,
              paddingHorizontal: 8,
            }}
          >
            {transcript.map((chunk, i) => (
              <Text
                key={i}
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: "#1a1f36",
                  textAlign: "center",
                  letterSpacing: -0.3,
                }}
              >
                {chunk}
              </Text>
            ))}
            {partialText ? (
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "400",
                  color: "#6b7280",
                  textAlign: "center",
                  letterSpacing: -0.3,
                  fontStyle: "italic",
                }}
              >
                {partialText}
              </Text>
            ) : null}
          </View>
        </Animated.View>

        {/* Result screen text */}
        <Animated.View
          style={{
            opacity: resultOpacity,
            position: "absolute",
            top: "5%",
            left: 24,
            right: 24,
          }}
          pointerEvents={isResult ? "auto" : "none"}
        >
          {/* Listening label stays */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "rgba(0,191,113,0.12)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MicIcon size={16} color={GREEN} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#374151" }}>
              Listening...
            </Text>
          </View>

          {/* Final transcript chunks */}
          <View style={{ gap: 4 }}>
            {transcript.map((chunk, i) => (
              <Text
                key={i}
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: "#1a1f36",
                  letterSpacing: -0.5,
                  lineHeight: 30,
                }}
              >
                {chunk}
              </Text>
            ))}
          </View>

          {/* Full result card */}
          {finalText ? (
            <View
              style={{
                marginTop: 28,
                backgroundColor: "white",
                borderRadius: 20,
                padding: 20,
                shadowColor: "#000",
                shadowOpacity: 0.07,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
                borderWidth: 1.5,
                borderColor: "#e5e7eb",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 10,
                }}
              >
                Recognized Speech
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#1a1f36",
                  lineHeight: 24,
                }}
              >
                {finalText}
              </Text>
              <View
                style={{
                  height: 1,
                  backgroundColor: "#f3f4f6",
                  marginVertical: 14,
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                Detected Words
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {transcript.map((chunk, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: GREEN_LIGHT,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "#bbf7d0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: GREEN_DARK,
                      }}
                    >
                      {chunk}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </Animated.View>

        {/* ── Mic button (animates up during recording) ─────────────────── */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: insets.bottom + 100,
            transform: [{ translateY: micY }, { scale: micScale }],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PulseRing active={isRecording} />

          <Pressable
            onPress={isRecording ? undefined : startRecording}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: GREEN,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: GREEN,
              shadowOpacity: isRecording ? 0.5 : 0.3,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
          >
            <MicIcon size={30} color="white" />
          </Pressable>
        </Animated.View>
      </View>

      {/* ── Bottom Controls (recording state) ────────────────────────────── */}
      {isRecording && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: insets.bottom + 30,
            left: 0,
            right: 0,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            opacity: listeningOpacity,
          }}
        >
          {/* Cancel */}
          <Pressable
            onPress={cancelRecording}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "rgba(0,0,0,0.12)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18, color: "#6b7280" }}>✕</Text>
          </Pressable>

          {/* Stop (red square) */}
          <Pressable
            onPress={stopRecording}
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: "#ef4444",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#ef4444",
              shadowOpacity: 0.4,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 3,
                backgroundColor: "white",
              }}
            />
          </Pressable>

          {/* Pause (placeholder) */}
          <Pressable
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "rgba(0,0,0,0.12)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18, color: "#6b7280" }}>⏸</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* ── Bottom Controls (result state) ───────────────────────────────── */}
      {isResult && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: insets.bottom + 30,
            left: 0,
            right: 0,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            opacity: resultOpacity,
          }}
        >
          {/* Discard */}
          <Pressable
            onPress={resetToIdle}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "rgba(0,0,0,0.10)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18, color: "#6b7280" }}>✕</Text>
          </Pressable>

          {/* Confirm (green check) */}
          <Pressable
            onPress={confirmResult}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: GREEN,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: GREEN,
              shadowOpacity: 0.4,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 22, color: "white" }}>✓</Text>
          </Pressable>

          {/* Redo */}
          <Pressable
            onPress={resetToIdle}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "rgba(0,0,0,0.10)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RotateCcw size={18} color="#6b7280" strokeWidth={2.5} />
          </Pressable>
        </Animated.View>
      )}

      {/* Demo badge */}
      {!hasVoice && (
        <View
          style={{
            position: "absolute",
            top: insets.top + 60,
            alignSelf: "center",
            backgroundColor: "#fef3c7",
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#fde68a",
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#92400e" }}>
            DEMO MODE — install @react-native-voice/voice for real STT
          </Text>
        </View>
      )}
    </View>
  );
}
