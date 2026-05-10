/**
 * app/(others)/(profilePage)/aboutUs.tsx
 *
 * About Us — warm, brand-forward layout with mission, values, and team story.
 */

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronLeft, ExternalLink, Heart } from "lucide-react-native";
import React from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Content ──────────────────────────────────────────────────────────────────
const APP_VERSION = "1.0.0";
const BUILD = "2025.03.01";

const VALUES = [
  {
    icon: "🎯",
    title: "Sederhana",
    desc: "Antarmuka yang bersih dan intuitif. Pencatatan dalam hitungan detik, bukan menit.",
  },
  {
    icon: "🔐",
    title: "Aman",
    desc: "Enkripsi end-to-end dan tidak ada iklan. Data Anda tidak pernah diperjualbelikan.",
  },
  {
    icon: "💡",
    title: "Cerdas",
    desc: "Dari foto struk hingga perintah suara — teknologi AI bekerja untuk Anda.",
  },
  {
    icon: "🌱",
    title: "Berkembang",
    desc: "Fitur baru hadir setiap bulan, didorong langsung oleh masukan pengguna kami.",
  },
];

const FEATURES = [
  { icon: "✍️", label: "Catat Manual" },
  { icon: "📸", label: "SakuSnap" },
  { icon: "🎙️", label: "SakuVoice" },
  { icon: "📊", label: "Analitik" },
  { icon: "🎯", label: "Goals" },
  { icon: "💸", label: "Transfer" },
];

const TEAM = [
  {
    initials: "RA",
    name: "Rizky A.",
    role: "Founder & iOS Dev",
    color: "#00bf71",
  },
  {
    initials: "DS",
    name: "Dian S.",
    role: "Backend Engineer",
    color: "#3b82f6",
  },
  { initials: "NF", name: "Nisa F.", role: "UI/UX Designer", color: "#8b5cf6" },
  { initials: "MH", name: "Mulia H.", role: "AI Engineer", color: "#f59e0b" },
];

const LINKS = [
  { label: "Website Resmi", url: "https://sakuin.id", icon: "🌐" },
  {
    label: "Instagram @sakuin.id",
    url: "https://instagram.com/sakuin.id",
    icon: "📸",
  },
  { label: "Kirim Masukan", url: "mailto:hello@sakuin.id", icon: "✉️" },
];

// ─── Value Card ───────────────────────────────────────────────────────────────
const ValueCard = ({ item }: { item: (typeof VALUES)[0] }) => (
  <View
    style={{
      flex: 1,
      backgroundColor: "white",
      borderRadius: 16,
      padding: 14,
      gap: 8,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    }}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#f0fdf8",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#d1fae5",
      }}
    >
      <Text style={{ fontSize: 18 }}>{item.icon}</Text>
    </View>
    <Text style={{ fontSize: 13, fontWeight: "800", color: "#1a1f36" }}>
      {item.title}
    </Text>
    <Text style={{ fontSize: 11, color: "#6b7280", lineHeight: 17 }}>
      {item.desc}
    </Text>
  </View>
);

// ─── Team Avatar ──────────────────────────────────────────────────────────────
const TeamAvatar = ({ member }: { member: (typeof TEAM)[0] }) => (
  <View style={{ alignItems: "center", gap: 6, flex: 1 }}>
    <View
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: member.color,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: member.color,
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "800", color: "white" }}>
        {member.initials}
      </Text>
    </View>
    <Text
      style={{
        fontSize: 12,
        fontWeight: "700",
        color: "#1a1f36",
        textAlign: "center",
      }}
    >
      {member.name}
    </Text>
    <Text
      style={{
        fontSize: 10,
        color: "#9ca3af",
        textAlign: "center",
        lineHeight: 14,
      }}
    >
      {member.role}
    </Text>
  </View>
);

// ─── Section Label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ text }: { text: string }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
    }}
  >
    <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
    <Text
      style={{
        fontSize: 10,
        fontWeight: "800",
        color: "#9ca3af",
        letterSpacing: 1.2,
        textTransform: "uppercase",
      }}
    >
      {text}
    </Text>
    <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
  </View>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function AboutUsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
        {/* ── Pinned Header ── */}
        <LinearGradient
          colors={["#00bf71", "#009e5f"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: 14,
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={20} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "white" }}>
              Tentang Sakuin
            </Text>
            <View style={{ width: 36 }} />
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          {/* ── Brand Hero ── */}
          <LinearGradient
            colors={["#009e5f", "#007a4a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 20,
              paddingTop: 28,
              paddingBottom: 56,
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {/* decorative circles */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: "rgba(255,255,255,0.05)",
                top: -80,
                right: -60,
              }}
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "rgba(255,255,255,0.04)",
                bottom: -30,
                left: -20,
              }}
            />

            {/* App icon */}
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 24,
                backgroundColor: "rgba(255,255,255,0.18)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.25)",
              }}
            >
              <Text style={{ fontSize: 40 }}>💰</Text>
            </View>

            <Text
              style={{
                fontSize: 32,
                fontWeight: "900",
                color: "white",
                letterSpacing: -1,
                marginBottom: 6,
              }}
            >
              Sakuin
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
                lineHeight: 22,
                maxWidth: 260,
              }}
            >
              Catat, analisis, dan kendalikan keuangan harianmu — dari mana
              saja.
            </Text>

            {/* Version pill */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 18,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: "700",
                  }}
                >
                  v{APP_VERSION}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: "700",
                  }}
                >
                  Build {BUILD}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* ── Mission card (floating) ── */}
          <View
            style={{
              marginHorizontal: 20,
              marginTop: -28,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 20,
              shadowColor: "#000",
              shadowOpacity: 0.09,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 5 },
              elevation: 7,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: "#f0fdf8",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Heart size={14} color="#00bf71" strokeWidth={2.5} />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: "#00bf71",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Misi Kami
              </Text>
            </View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#1a1f36",
                lineHeight: 24,
                letterSpacing: -0.2,
              }}
            >
              "Membantu setiap orang Indonesia memahami dan mengelola keuangan
              harian mereka dengan cara yang menyenangkan, cepat, dan tanpa
              ribet."
            </Text>
            <View
              style={{
                height: 1,
                backgroundColor: "#f3f4f6",
                marginVertical: 14,
              }}
            />
            <Text style={{ fontSize: 13, color: "#6b7280", lineHeight: 21 }}>
              Kami percaya bahwa kesehatan finansial bukan hak eksklusif. Dengan
              teknologi yang tepat, siapa pun bisa mencatat dan memahami ke mana
              uangnya pergi — dalam hitungan detik.
            </Text>
          </View>

          {/* ── Values ── */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <SectionLabel text="Nilai Kami" />
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              <ValueCard item={VALUES[0]} />
              <ValueCard item={VALUES[1]} />
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <ValueCard item={VALUES[2]} />
              <ValueCard item={VALUES[3]} />
            </View>
          </View>

          {/* ── Features grid ── */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <SectionLabel text="Fitur Unggulan" />
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {FEATURES.map((f) => (
                <View
                  key={f.label}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 7,
                    backgroundColor: "white",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    shadowColor: "#000",
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    elevation: 1,
                  }}
                >
                  <Text style={{ fontSize: 15 }}>{f.icon}</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#1a1f36",
                    }}
                  >
                    {f.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Team ── */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <SectionLabel text="Tim di Balik Sakuin" />
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                padding: 20,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {TEAM.map((member) => (
                  <TeamAvatar key={member.initials} member={member} />
                ))}
              </View>
              <View
                style={{
                  marginTop: 18,
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    textAlign: "center",
                    lineHeight: 19,
                  }}
                >
                  Dibangun dengan ❤️ di Bandung, Indonesia.{"\n"}Tim kecil
                  dengan visi besar.
                </Text>
              </View>
            </View>
          </View>

          {/* ── Links ── */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <SectionLabel text="Terhubung dengan Kami" />
            <View style={{ gap: 10 }}>
              {LINKS.map((link) => (
                <Pressable
                  key={link.label}
                  onPress={() => Linking.openURL(link.url)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    backgroundColor: pressed ? "#f9fafb" : "white",
                    borderRadius: 14,
                    padding: 14,
                    shadowColor: "#000",
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 2,
                  })}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: "#f0fdf8",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#d1fae5",
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{link.icon}</Text>
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#1a1f36",
                    }}
                  >
                    {link.label}
                  </Text>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#f3f4f6",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ExternalLink size={12} color="#9ca3af" strokeWidth={2.5} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Legal footer ── */}
          <View
            style={{
              marginHorizontal: 20,
              backgroundColor: "#1a1f36",
              borderRadius: 18,
              padding: 20,
              gap: 6,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <Text style={{ fontSize: 18 }}>💰</Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  color: "white",
                  letterSpacing: -0.3,
                }}
              >
                Sakuin
              </Text>
            </View>
            <Text
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 17,
              }}
            >
              © 2025 Sakuin. Seluruh hak cipta dilindungi.{"\n"}
              Versi {APP_VERSION} · Build {BUILD}
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              {[
                "Syarat Layanan",
                "Kebijakan Privasi",
                "Lisensi Open Source",
              ].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() =>
                    t === "Kebijakan Privasi" &&
                    router.push("/(others)/(profilePage)/privacy" as any)
                  }
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#00bf71",
                      fontWeight: "600",
                    }}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
