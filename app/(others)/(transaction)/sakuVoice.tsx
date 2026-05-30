import { useRouter } from "expo-router";
import { ChevronLeft, HelpCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

// Import library Speech Recognition Native
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from "@react-native-voice/voice";

const { width: SW, height: SH } = Dimensions.get("window");

const GREEN = "#00bf71";
const GREEN_DARK = "#00995a";
const BG = "#f7fdf9";

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

// ─── Gradient Circle Blob Component ───────────────────────────────────────────
interface BlobProps {
  isActive: boolean;
  amplitude: number; // 0..1
  baseRadius: number;
}

const GradientCircleBlob = ({ isActive, amplitude, baseRadius }: BlobProps) => {
  const [currentRadius, setCurrentRadius] = useState(baseRadius);
  const targetRadiusRef = useRef(baseRadius);
  const currentRadiusRef = useRef(baseRadius);
  const frameRef = useRef<number | null>(null);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  useEffect(() => {
    let lastUpdate = 0;
    const updateInterval = 100; // Lebih cepat merespon suara asli

    const animate = (ts: number) => {
      if (ts - lastUpdate > updateInterval) {
        // Variasi ukuran lingkaran berdasarkan amplitudo suara asli
        const variance = baseRadius * (0.05 + amplitude * 0.45);
        targetRadiusRef.current =
          baseRadius + (Math.random() * 1.5 - 0.75) * variance;
        lastUpdate = ts;
      }

      const speed = isActive ? 0.15 : 0.05; // Lebih responsif saat merekam
      currentRadiusRef.current = lerp(
        currentRadiusRef.current,
        targetRadiusRef.current,
        speed,
      );
      setCurrentRadius(currentRadiusRef.current);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isActive, amplitude, baseRadius]);

  return (
    <Svg
      width={SW}
      height={SW}
      viewBox={`0 0 ${SW} ${SW}`}
      style={StyleSheet.absoluteFillObject}
    >
      <Defs>
        <RadialGradient
          id="glowGrad"
          cx="50%"
          cy="50%"
          rx="50%"
          ry="50%"
          fx="50%"
          fy="50%"
        >
          <Stop offset="0%" stopColor={GREEN} stopOpacity="0.6" />
          <Stop offset="45%" stopColor={GREEN} stopOpacity="0.25" />
          <Stop offset="100%" stopColor={GREEN} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx={SW / 2} cy={SW / 2} r={currentRadius} fill="url(#glowGrad)" />
    </Svg>
  );
};

// ─── Pulse rings around the mic button ───────────────────────────────────────
const PulseRings = ({ active }: { active: boolean }) => {
  const rings = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (active) {
      rings.forEach((r) => r.setValue(0));
      loopRef.current = Animated.loop(
        Animated.stagger(
          400,
          rings.map((r) =>
            Animated.sequence([
              Animated.timing(r, {
                toValue: 1,
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(r, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ),
        ),
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      rings.forEach((r) => {
        Animated.timing(r, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [active]);

  return (
    <>
      {rings.map((anim, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 2,
            borderColor: GREEN,
            opacity: anim.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [0, 0.6, 0],
            }),
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2.6],
                }),
              },
            ],
          }}
        />
      ))}
    </>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function SakuVoice() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isRecording, setIsRecording] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [amplitude, setAmplitude] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition listeners
  useEffect(() => {
    if (Platform.OS === "web") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "id-ID";

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log("Web Speech transcript:", transcript);
          if (transcript) {
            setWords(transcript.trim().split(" "));
            setIsDone(true);
            Alert.alert(
              "Speech to Text Result",
              `Hasil suara: "${transcript}"`,
            );
          }
        };

        rec.onerror = (event: any) => {
          console.error("Web Speech Recognition error:", event.error);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    } else {
      // Bind native listeners untuk Android/iOS
      Voice.onSpeechStart = () => {
        setIsRecording(true);
        setIsTranscribing(false);
      };
      Voice.onSpeechEnd = () => {
        setIsRecording(false);
        setIsTranscribing(true);
      };
      Voice.onSpeechResults = (e: SpeechResultsEvent) => {
        if (e.value && e.value[0]) {
          const transcript = e.value[0];
          console.log("Native Speech transcript:", transcript);
          setWords(transcript.trim().split(" "));
          setIsDone(true);
        }
        setIsTranscribing(false);
      };
      Voice.onSpeechError = (e: SpeechErrorEvent) => {
        console.error("Native Speech error:", e.error);
        setIsRecording(false);
        setIsTranscribing(false);
        if (e.error?.message !== "7" && e.error?.message !== "No match") {
          Alert.alert("Error", "Gagal mengenali suara atau mikrofon tidak diizinkan.");
        }
      };
      Voice.onSpeechVolumeChanged = (e: any) => {
        if (e.value !== undefined) {
          // Normalisasi volume native (0-10 atau desibel) ke range 0..1 untuk animasi blob
          const normalized = Math.min(Math.max(e.value / 10, 0), 1);
          setAmplitude(normalized);
        }
      };
    }

    return () => {
      if (Platform.OS !== "web") {
        Voice.destroy().then(Voice.removeAllListeners);
      }
    };
  }, []);

  const pressBtn = () => {
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(btnScale, {
        toValue: 1,
        tension: 180,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startRecording = async () => {
    pressBtn();
    setWords([]);
    setAmplitude(0);
    setIsDone(false);

    if (Platform.OS === "web") {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (err) {
          console.error("Failed to start web recognition:", err);
        }
      } else {
        Alert.alert(
          "Error",
          "Speech recognition tidak didukung di browser ini.",
        );
      }
      return;
    }

    try {
      // Memulai speech recognition native dengan bahasa Indonesia
      await Voice.start("id-ID");
    } catch (error) {
      console.error("Gagal memulai perekaman suara native: ", error);
      Alert.alert("Error", "Gagal mengakses mikrofon atau memulai pengenalan suara.");
    }
  };

  const stopRecording = async () => {
    pressBtn();

    if (Platform.OS === "web") {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    try {
      setIsTranscribing(true);
      await Voice.stop();
    } catch (error) {
      console.error("Gagal menghentikan perekaman suara native: ", error);
      setIsTranscribing(false);
    }
  };

  const reset = async () => {
    pressBtn();
    try {
      if (Platform.OS !== "web") {
        await Voice.cancel();
      } else if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      setIsTranscribing(false);
      setIsDone(false);
      setWords([]);
      setAmplitude(0);
    } catch (error) {
      console.error("Gagal mereset perekaman: ", error);
    }
  };

  const confirm = () => {
    pressBtn();
    router.back();
  };

  const BASE_RADIUS = SW * 0.35;
  const blobRadius = isRecording
    ? BASE_RADIUS * (1 + amplitude * 0.25)
    : isDone
      ? BASE_RADIUS * 0.85
      : BASE_RADIUS * 0.75;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="dark-content" />

      {/* ── Top bar ── */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={20} color="#1a1f36" strokeWidth={2.5} />
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <View style={[styles.iconBadge, { backgroundColor: `${GREEN}18` }]}>
            <MicIcon size={13} color={GREEN} />
          </View>
          <Text style={styles.title}>SakuVoice</Text>
        </View>

        <Pressable style={styles.iconBtn}>
          <HelpCircle size={18} color="#9ca3af" strokeWidth={2} />
        </Pressable>
      </View>

      {/* ── Blob area ── */}
      <View
        style={{
          width: SW,
          height: SW,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <GradientCircleBlob
          isActive={isRecording}
          amplitude={amplitude}
          baseRadius={blobRadius}
        />

        {/* Status label inside blob */}
        <View style={{ alignItems: "center", gap: 6, zIndex: 5 }}>
          {isTranscribing && (
            <>
              <ActivityIndicator
                size="large"
                color={GREEN}
                style={{ marginBottom: 8 }}
              />
              <Text
                style={[
                  styles.statusLabel,
                  { color: GREEN_DARK, fontWeight: "700" },
                ]}
              >
                Memproses suara...
              </Text>
            </>
          )}

          {!isRecording && !isDone && !isTranscribing && (
            <>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: `${GREEN}18`, width: 44, height: 44 },
                ]}
              >
                <MicIcon size={20} color={GREEN} />
              </View>
              <Text style={styles.statusLabel}>Ketuk untuk mulai</Text>
            </>
          )}

          {isRecording && !isTranscribing && (
            <>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: `${GREEN}25`, width: 44, height: 44 },
                ]}
              >
                <MicIcon size={20} color={GREEN} />
              </View>
              <Text
                style={[
                  styles.statusLabel,
                  { color: GREEN_DARK, fontWeight: "700" },
                ]}
              >
                Mendengarkan...
              </Text>
            </>
          )}

          {isDone && !isRecording && !isTranscribing && (
            <Text style={[styles.statusLabel, { color: "#374151" }]}>
              Selesai 🎉
            </Text>
          )}
        </View>
      </View>

      {/* ── Transcript chips ── */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 4,
          alignItems: "center",
          width: "100%",
        }}
      >
        {words.length > 0 ? (
          <View style={{ width: "100%", alignItems: "center" }}>
            <View style={styles.chipsRow}>
              {words.map((w, i) => (
                <View
                  key={i}
                  style={[
                    styles.chip,
                    i === words.length - 1 && isRecording && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      i === words.length - 1 &&
                        isRecording && { color: GREEN_DARK },
                    ]}
                  >
                    {w}
                  </Text>
                </View>
              ))}
            </View>

            {/* TextInput to edit/review manual transcription */}
            {!isRecording && !isTranscribing && (
              <TextInput
                value={words.join(" ")}
                onChangeText={(txt) => setWords(txt.split(" "))}
                placeholder="Edit hasil transkripsi..."
                placeholderTextColor="#9ca3af"
                style={{
                  width: "90%",
                  backgroundColor: "white",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  fontSize: 15,
                  color: "#1f2937",
                  textAlign: "center",
                  marginTop: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              />
            )}
          </View>
        ) : (
          <View style={{ width: "100%", alignItems: "center" }}>
            <Text style={styles.hint}>
              {isRecording ? "" : 'Coba ucapkan: "Makan siang 50 ribu"'}
            </Text>

            {/* Fallback input field if they want to type manually from start */}
            {!isRecording && !isTranscribing && (
              <TextInput
                onChangeText={(txt) => setWords(txt.split(" "))}
                placeholder="Atau ketik manual di sini..."
                placeholderTextColor="#9ca3af"
                style={{
                  width: "90%",
                  backgroundColor: "white",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  fontSize: 15,
                  color: "#1f2937",
                  textAlign: "center",
                  marginTop: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              />
            )}
          </View>
        )}
      </View>

      {/* ── Bottom controls ── */}
      <View
        style={{
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 40,
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Main mic button */}
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <PulseRings active={isRecording} />

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <Pressable
              onPress={isRecording ? stopRecording : startRecording}
              style={[
                styles.micBtn,
                isRecording && { backgroundColor: "#ef4444" },
              ]}
            >
              {isRecording ? (
                <View style={styles.stopSquare} />
              ) : (
                <MicIcon size={30} color="white" />
              )}
            </Pressable>
          </Animated.View>
        </View>

        {/* Confirm / Reset row */}
        {isDone && (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable onPress={reset} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Ulangi</Text>
            </Pressable>
            <Pressable onPress={confirm} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Simpan ✓</Text>
            </Pressable>
          </View>
        )}

        {/* Cancel while recording */}
        {isRecording && (
          <Pressable onPress={reset}>
            <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: "600" }}>
              Selesai
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1f36",
    letterSpacing: -0.3,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: -0.2,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  chip: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  chipActive: {
    borderColor: GREEN,
    backgroundColor: `${GREEN}10`,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1f36",
  },
  hint: {
    fontSize: 13,
    color: "#b0b8c4",
    textAlign: "center",
    fontStyle: "italic",
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GREEN,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  stopSquare: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: "white",
  },
  primaryBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 24,
    shadowColor: GREEN,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
    letterSpacing: -0.2,
  },
  secondaryBtn: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 24,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
});