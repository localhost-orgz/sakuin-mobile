import { apiRequest } from "@/utils/api";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { ChevronLeft, HelpCircle, CheckCircle2, AlertCircle, XCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  const [transcript, setTranscript] = useState("");
  const [amplitude, setAmplitude] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const btnScale = useRef(new Animated.Value(1)).current;
  const recognitionRef = useRef<any>(null);

  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  // Initialize SpeechRecognition for Web
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
          const text = event.results[0][0].transcript;
          console.log("Web Speech transcript:", text);
          if (text) {
            setTranscript(text.trim());
            setIsDone(true);
            setCustomAlert({
              visible: true,
              type: "success",
              title: "Transkripsi Berhasil",
              message: `Hasil suara: "${text}"`,
            });
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
    }
  }, []);

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recording]);

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

  const transcribeAudio = async (localUri: string): Promise<string | null> => {
    try {
      setIsTranscribing(true);

      // 1. Siapkan FormData pembungkus file audio
      const formData = new FormData();
      
      // Menggunakan type audio/mpeg (mp3) agar kompatibel secara global dengan middleware backend
      formData.append("voice", {
        uri: localUri,
        type: "audio/m4a", 
        name: "sakuvoice_recording.m4a",
      } as any);

      console.log("Mengirim file audio ke /ai/sakuvoice menggunakan apiRequest (isFormData: true)...");
      console.log(formData);

      // 2. Panggil apiRequest dengan menyertakan flag isFormData: true
      const response = await apiRequest("/ai/sakuvoice", {
        method: "POST",
        body: formData,
        isFormData: true, // <--- INI KUNCI UTAMANYA AGAR FILE BERHASIL TERKIRIM!
      });

      // 3. Sesuaikan dengan struktur response sukses dari backend controller Anda
      if (response && response.status === "success") {
        console.log("Respon backend sukses:", response.message);
        
        if (response.data) {
          // Simpan objek data utuh dari AI ke state
          setExtractedData(response.data); 
          
          // Ambil deskripsi teks untuk ditampilkan di chip jika ada, 
          // atau gunakan deskripsi bawaan dari AI
          const textResult = response.data.description || "Transaksi terdeteksi";
          return textResult;
        }
        return "Data suara berhasil diproses";
      }

    } catch (error) {
      console.error("Gagal memproses audio via apiRequest:", error);
      setCustomAlert({
        visible: true,
        type: "error",
        title: "SakuVoice Gagal",
        message: (error as Error).message || "Terjadi kendala saat mengirim atau memproses suara di server.",
      });
    } finally {
      setIsTranscribing(false);
    }
    return null;
  };

  const startRecording = async () => {
    pressBtn();
    setTranscript("");
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
        setCustomAlert({
          visible: true,
          type: "error",
          title: "Error",
          message: "Speech recognition tidak didukung di browser ini.",
        });
      }
      return;
    }

    try {
      // Request permission
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        setCustomAlert({
          visible: true,
          type: "warning",
          title: "Izin Mikrofon Diperlukan",
          message: "Sakuin memerlukan akses mic untuk fitur voice-to-text transaksi kamu.",
        });
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          keepConnectionAlive: true,
        } as any,
        (status) => {
          if (status.metering !== undefined) {
            // Normalisasi metering (-160 s/d 0 dB) ke rentang 0..1
            const db = status.metering;
            const normalized = Math.min(Math.max((db + 60) / 60, 0), 1);
            setAmplitude(normalized);
          }
        },
        100,
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error("Gagal memulai perekaman suara: ", error);
      setCustomAlert({
        visible: true,
        type: "error",
        title: "Error",
        message: "Gagal mengakses mikrofon atau memulai perekaman.",
      });
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
      if (recording) {
        setIsTranscribing(true);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log("Audio recorded to:", uri);

        setRecording(null);
        setIsRecording(false);

        if (uri) {
          const text = await transcribeAudio(uri);
          if (text) {
            setTranscript(text.trim());
            setIsDone(true);
            setCustomAlert({
              visible: true,
              type: "success",
              title: "Transkripsi Berhasil",
              message: `Hasil suara: "${text}"`,
            });
          } else {
            setIsDone(true);
            setCustomAlert({
              visible: true,
              type: "error",
              title: "Transkripsi Gagal",
              message: "Gagal mengubah suara secara otomatis. Silakan gunakan input manual di bawah.",
            });
          }
        }
      }
    } catch (error) {
      console.error("Gagal menghentikan perekaman suara: ", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const reset = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }
      setIsRecording(false);
      setIsDone(false);
      setTranscript("");
      setAmplitude(0);
    } catch (error) {
      console.error("Gagal mereset perekaman: ", error);
    }
  };

  const confirm = () => {
    if (extractedData) {
      router.push({
        pathname: "/(others)/(transaction)/addForm",
        params: {
          autofill: JSON.stringify(extractedData)
        }
      });
    } else {
      router.back();
    }
  };

  // Render alert icon based on type
  const renderAlertIcon = () => {
    const iconSize = 28;
    switch (customAlert.type) {
      case "success":
        return <CheckCircle2 size={iconSize} color="#10b981" />;
      case "error":
        return <XCircle size={iconSize} color="#ef4444" />;
      case "warning":
        return <AlertCircle size={iconSize} color="#f59e0b" />;
      default:
        return <MicIcon size={iconSize} color={GREEN} />;
    }
  };

  // Get icon background color based on type
  const getIconBgColor = () => {
    switch (customAlert.type) {
      case "success":
        return "#ecfdf5";
      case "error":
        return "#fef2f2";
      case "warning":
        return "#fffbeb";
      default:
        return `${GREEN}15`;
    }
  };

  // Get button color based on type
  const getBtnColor = () => {
    switch (customAlert.type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      default:
        return GREEN;
    }
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

      {/* ── Transcript Text Area ── */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 4,
          alignItems: "center",
          width: "100%",
        }}
      >
        {!isRecording && !isTranscribing ? (
          <View style={{ width: "100%", alignItems: "center" }}>
            <TextInput
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              value={transcript}
              onChangeText={setTranscript}
              placeholder='Coba ucapkan: "Makan siang 50 ribu" atau ketik manual...'
              placeholderTextColor="#9ca3af"
              style={styles.textArea}
            />
          </View>
        ) : (
          <View style={{ width: "100%", alignItems: "center", padding: 16 }}>
            <Text style={styles.liveTranscriptText}>
              {transcript ? transcript : (isTranscribing ? "Memproses suara..." : "Mendengarkan suara...")}
            </Text>
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
          zIndex: 5,
        }}
      >
        {/* Main mic button */}
        <View style={{ alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          <PulseRings active={isRecording} />

          <Animated.View style={{ transform: [{ scale: btnScale }], zIndex: 1 }}>
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
          <View style={{ flexDirection: "row", gap: 12, zIndex: 999, elevation: 15 }}>
            <TouchableOpacity 
              onPress={reset} 
              style={styles.secondaryBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>Ulangi</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={confirm} 
              style={styles.primaryBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Simpan ✓</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cancel while recording */}
        {isRecording && (
          <TouchableOpacity onPress={reset} activeOpacity={0.7}>
            <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: "600" }}>
              Selesai
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Custom Alert Modal */}
      <Modal
        visible={customAlert.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCustomAlert({ ...customAlert, visible: false })}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalIconContainer, { backgroundColor: getIconBgColor() }]}>
              {renderAlertIcon()}
            </View>
            <Text style={styles.modalTitle}>{customAlert.title}</Text>
            <Text style={styles.modalMessage}>{customAlert.message}</Text>
            <TouchableOpacity
              onPress={() => setCustomAlert({ ...customAlert, visible: false })}
              style={[styles.modalBtn, { backgroundColor: getBtnColor() }]}
              activeOpacity={0.85}
            >
              <Text style={styles.modalBtnText}>Oke</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    elevation: 5,
    zIndex: 1,
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
    elevation: 15,
    zIndex: 10,
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
    elevation: 15,
    zIndex: 10,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  textArea: {
    width: "100%",
    minHeight: 120,
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    fontSize: 15,
    color: "#1f2937",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    lineHeight: 22,
  },
  liveTranscriptText: {
    fontSize: 16,
    fontWeight: "600",
    color: GREEN_DARK,
    textAlign: "center",
    lineHeight: 24,
    fontStyle: "italic",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1f36",
    textAlign: "center",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalBtn: {
    backgroundColor: GREEN,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
});