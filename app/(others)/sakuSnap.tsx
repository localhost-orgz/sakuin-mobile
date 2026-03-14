import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import {
  Check,
  ChevronLeft,
  Flashlight,
  FlipHorizontal2,
  Images,
  Lightbulb,
  ScanLine,
  X,
  Zap,
  ZapOff,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW, height: SH } = Dimensions.get("window");

// ─── Flash modes cycle ────────────────────────────────────────────────────────
type FlashState = "off" | "on" | "auto";
const FLASH_CYCLE: FlashState[] = ["off", "on", "auto"];

const flashIcon = (state: FlashState) => {
  if (state === "on") return Zap;
  if (state === "auto") return Flashlight;
  return ZapOff;
};

const flashLabel = (state: FlashState) => {
  if (state === "on") return "On";
  if (state === "auto") return "Auto";
  return "Off";
};

const flashColor = (state: FlashState) => {
  if (state === "on") return "#f59e0b";
  if (state === "auto") return "#3b82f6";
  return "rgba(255,255,255,0.55)";
};

// ─── Timer options ────────────────────────────────────────────────────────────
const TIMER_OPTIONS = [0, 3, 10];

// ─── Shutter Button ───────────────────────────────────────────────────────────
const ShutterButton = ({
  onPress,
  isCapturing,
}: {
  onPress: () => void;
  isCapturing: boolean;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // Ring pulse
    ringScale.setValue(1);
    ringOpacity.setValue(0.9);
    Animated.parallel([
      Animated.timing(ringScale, {
        toValue: 1.6,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ringOpacity, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Button compress
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
    ]).start();

    onPress();
  };

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 88,
        height: 88,
      }}
    >
      {/* Ripple ring */}
      <Animated.View
        style={{
          position: "absolute",
          width: 88,
          height: 88,
          borderRadius: 44,
          borderWidth: 3,
          borderColor: "white",
          transform: [{ scale: ringScale }],
          opacity: ringOpacity,
        }}
      />
      {/* Outer ring */}
      <View
        style={{
          width: 84,
          height: 84,
          borderRadius: 42,
          borderWidth: 3,
          borderColor: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Inner button */}
        <Pressable onPress={handlePress}>
          <Animated.View
            style={{
              width: 66,
              height: 66,
              borderRadius: 33,
              backgroundColor: isCapturing ? "#00bf71" : "white",
              transform: [{ scale }],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isCapturing && (
              <ScanLine size={24} color="white" strokeWidth={2} />
            )}
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
};

// ─── Icon Circle Button ───────────────────────────────────────────────────────
const IconBtn = ({
  icon: Icon,
  onPress,
  color = "white",
  bg = "rgba(0,0,0,0.35)",
  size = 20,
  label,
  labelColor,
}: {
  icon: any;
  onPress: () => void;
  color?: string;
  bg?: string;
  size?: number;
  label?: string;
  labelColor?: string;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.82,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 220,
        friction: 8,
      }),
    ]).start();
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={{ alignItems: "center", gap: 5 }}>
      <Animated.View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale }],
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.15)",
        }}
      >
        <Icon size={size} color={color} strokeWidth={2} />
      </Animated.View>
      {label !== undefined && (
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            color: labelColor ?? "rgba(255,255,255,0.75)",
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

// ─── Preview Overlay ──────────────────────────────────────────────────────────
const PreviewOverlay = ({
  uri,
  onRetake,
  onSave,
}: {
  uri: string;
  onRetake: () => void;
  onSave: () => void;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
        opacity,
        zIndex: 50,
      }}
    >
      <Image source={{ uri }} style={{ flex: 1, resizeMode: "contain" }} />

      {/* Action bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: 50,
          paddingHorizontal: 40,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.6)",
          paddingTop: 24,
        }}
      >
        <Pressable
          onPress={onRetake}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(255,255,255,0.12)",
            paddingHorizontal: 22,
            paddingVertical: 12,
            borderRadius: 30,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          <X size={18} color="white" strokeWidth={2.5} />
          <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
            Retake
          </Text>
        </Pressable>

        <Pressable
          onPress={onSave}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#00bf71",
            paddingHorizontal: 22,
            paddingVertical: 12,
            borderRadius: 30,
            shadowColor: "#00bf71",
            shadowOpacity: 0.5,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}
        >
          <Check size={18} color="white" strokeWidth={2.5} />
          <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
            Save
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

// ─── Countdown Overlay ────────────────────────────────────────────────────────
const CountdownOverlay = ({ count }: { count: number }) => {
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scale.setValue(0.4);
    opacity.setValue(1);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1.1,
        useNativeDriver: true,
        tension: 120,
        friction: 6,
      }),
      Animated.timing(opacity, {
        toValue: 0.85,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [count]);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
      }}
      pointerEvents="none"
    >
      <Animated.Text
        style={{
          fontSize: 140,
          fontWeight: "900",
          color: "white",
          textShadowColor: "rgba(0,0,0,0.4)",
          textShadowOffset: { width: 0, height: 4 },
          textShadowRadius: 20,
          transform: [{ scale }],
          opacity,
        }}
      >
        {count}
      </Animated.Text>
    </View>
  );
};

// ─── Focus Reticle ────────────────────────────────────────────────────────────
const FocusReticle = ({ x, y }: { x: number; y: number }) => {
  const scale = useRef(new Animated.Value(1.6)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scale.setValue(1.6);
    opacity.setValue(1);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 160,
        friction: 8,
      }),
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [x, y]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: x - 36,
        top: y - 36,
        width: 72,
        height: 72,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#00bf71",
        transform: [{ scale }],
        opacity,
        zIndex: 20,
      }}
    >
      {/* Corner accents */}
      {[
        { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3 },
        { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3 },
        { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3 },
        { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3 },
      ].map((style, i) => (
        <View
          key={i}
          style={[
            {
              position: "absolute",
              width: 14,
              height: 14,
              borderColor: "#00bf71",
            },
            style,
          ]}
        />
      ))}
    </Animated.View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function SakuSnap() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Permissions
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();
  const [mediaPerm, requestMediaPerm] = MediaLibrary.usePermissions();

  // Camera state
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flashState, setFlashState] = useState<FlashState>("off");
  const [zoom, setZoom] = useState(0);
  const [timerIdx, setTimerIdx] = useState(0);
  const timerSeconds = TIMER_OPTIONS[timerIdx];

  // UI state
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [focusKey, setFocusKey] = useState(0);

  // Flip animation
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Request all permissions on mount
  useEffect(() => {
    (async () => {
      if (!camPerm?.granted) await requestCamPerm();
      if (!micPerm?.granted) await requestMicPerm();
      if (!mediaPerm?.granted) await requestMediaPerm();
    })();
  }, []);

  // ── Tap to focus ────────────────────────────────────────────────────────────
  const handleTap = useCallback((evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    setFocusPoint({ x: locationX, y: locationY });
    setFocusKey((k) => k + 1);
  }, []);

  // ── Flash cycle ─────────────────────────────────────────────────────────────
  const cycleFlash = () => {
    setFlashState((prev) => {
      const idx = FLASH_CYCLE.indexOf(prev);
      return FLASH_CYCLE[(idx + 1) % FLASH_CYCLE.length];
    });
  };

  // ── Flip camera ─────────────────────────────────────────────────────────────
  const flipCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setFacing((f) => (f === "back" ? "front" : "back"));
  };

  // ── Zoom ────────────────────────────────────────────────────────────────────
  const adjustZoom = (delta: number) => {
    setZoom((z) => Math.max(0, Math.min(1, z + delta)));
  };

  // ── Capture ─────────────────────────────────────────────────────────────────
  const capture = useCallback(async () => {
    if (isCapturing || !cameraRef.current) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (timerSeconds > 0) {
      // Countdown
      setCountdown(timerSeconds);
      for (let i = timerSeconds - 1; i >= 0; i--) {
        await new Promise((r) => setTimeout(r, 1000));
        setCountdown(i === 0 ? null : i);
      }
    }

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.92,
        skipProcessing: false,
      });
      if (photo?.uri) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhotoUri(photo.uri);
      }
    } catch (e) {
      console.error("Capture error", e);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, timerSeconds]);

  // ── Save to gallery ─────────────────────────────────────────────────────────
  const savePhoto = async () => {
    if (!photoUri) return;
    try {
      if (!mediaPerm?.granted) await requestMediaPerm();
      await MediaLibrary.saveToLibraryAsync(photoUri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved!", "Photo saved to your gallery.", [{ text: "OK" }]);
      setPhotoUri(null);
    } catch (e) {
      Alert.alert("Error", "Could not save photo.");
    }
  };

  // ── Open gallery picker ─────────────────────────────────────────────────────
  const openGallery = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // ── Permission gates ────────────────────────────────────────────────────────
  if (!camPerm) {
    return <View style={{ flex: 1, backgroundColor: "black" }} />;
  }

  if (!camPerm.granted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0a0a",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
      >
        <StatusBar barStyle="light-content" />
        <ScanLine size={60} color="#00bf71" strokeWidth={1.5} />
        <Text
          style={{
            color: "white",
            fontSize: 22,
            fontWeight: "800",
            marginTop: 20,
            textAlign: "center",
          }}
        >
          Camera Access Needed
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 14,
            marginTop: 10,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          SakuSnap needs camera access to scan receipts and documents.
        </Text>
        <Pressable
          onPress={requestCamPerm}
          style={{
            marginTop: 32,
            backgroundColor: "#00bf71",
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
            Allow Camera
          </Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const FlashIcon = flashIcon(flashState);
  const flipStyle = {
    transform: [
      {
        scaleX: flipAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0, 1],
        }),
      },
    ],
  };

  const expoFlashMode: FlashMode =
    flashState === "on" ? "on" : flashState === "auto" ? "auto" : "off";

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <StatusBar barStyle="light-content" />

      {/* ── Camera Viewfinder ─────────────────────────────────────────────── */}
      <Pressable style={{ flex: 1 }} onPress={handleTap}>
        <Animated.View style={[{ flex: 1 }, flipStyle]}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={facing}
            flash={expoFlashMode}
            zoom={zoom}
          />
        </Animated.View>

        {/* Tap-to-focus reticle */}
        {focusPoint && (
          <FocusReticle key={focusKey} x={focusPoint.x} y={focusPoint.y} />
        )}

        {/* Countdown overlay */}
        {countdown !== null && <CountdownOverlay count={countdown} />}

        {/* Grid overlay (rule of thirds) */}
        <View
          pointerEvents="none"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Vertical lines */}
          {[1, 2].map((i) => (
            <View
              key={`v${i}`}
              style={{
                position: "absolute",
                left: `${(i / 3) * 100}%`,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
            />
          ))}
          {/* Horizontal lines */}
          {[1, 2].map((i) => (
            <View
              key={`h${i}`}
              style={{
                position: "absolute",
                top: `${(i / 3) * 100}%`,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </View>
      </Pressable>

      {/* ── Top Controls ──────────────────────────────────────────────────── */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "transparent",
        }}
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(0,0,0,0.45)",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        >
          <ChevronLeft size={22} color="white" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* SakuSnap label */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <ScanLine size={16} color="#00bf71" strokeWidth={2} />
          <Text
            style={{
              color: "white",
              fontWeight: "800",
              fontSize: 16,
              letterSpacing: 0.5,
            }}
          >
            SakuSnap
          </Text>
        </View>

        {/* Flip camera */}
        <TouchableOpacity
          onPress={flipCamera}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(0,0,0,0.45)",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        >
          <FlipHorizontal2 size={18} color="white" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ── Bottom Controls ───────────────────────────────────────────────── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
          paddingTop: 20,
          backgroundColor: "rgba(0,0,0,0.55)",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Gallery picker */}
          <IconBtn
            icon={Images}
            onPress={openGallery}
            color="rgba(255,255,255,0.85)"
            bg="rgba(0,0,0,0.35)"
            label="Gallery"
          />

          {/* Shutter */}
          <ShutterButton onPress={capture} isCapturing={isCapturing} />

          {/* Flash cycle */}
          <Pressable
            onPress={cycleFlash}
            style={{ alignItems: "center", gap: 5 }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor:
                  flashState !== "off"
                    ? `${flashColor(flashState)}28`
                    : "rgba(0,0,0,0.35)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor:
                  flashState !== "off"
                    ? flashColor(flashState)
                    : "rgba(255,255,255,0.15)",
              }}
            >
              <FlashIcon
                size={20}
                color={flashColor(flashState)}
                strokeWidth={2}
              />
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color:
                  flashState !== "off"
                    ? flashColor(flashState)
                    : "rgba(255,255,255,0.55)",
                letterSpacing: 0.3,
              }}
            >
              {flashLabel(flashState)}
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          {/* View si kotak putih */}
          <View
            style={{
              position: "absolute",
              top: -250,
            }}
            className="bg-/5 justify-center items-center"
          >
            <View
              style={{ zIndex: 11 }}
              className="flex flex-row p-1 px-2 bg-[#00bf71] items-center rounded-lg border border-white z-1000000"
            >
              <Lightbulb size={15} strokeWidth={3} />
              <Text className="text-base font-semibold">Tips!</Text>
            </View>
            <View
              style={{ zIndex: 10 }}
              className="bg-gray-800 mx-5 px-2 py-3 rounded-lg border -mt-2 border-white"
            >
              <Text className="text-white text-center text-sm">
                Pastikan struknya terbaca dan difoto dalam kondisi terang agar
                hasilnya optimal.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Photo Preview ─────────────────────────────────────────────────── */}
      {photoUri && (
        <PreviewOverlay
          uri={photoUri}
          onRetake={() => setPhotoUri(null)}
          onSave={savePhoto}
        />
      )}
    </View>
  );
}
