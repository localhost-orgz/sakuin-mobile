/**
 * app/(others)/(profilePage)/privacy.tsx
 *
 * Privacy Policy — structured, document-grade layout.
 */

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ExternalLink,
  Lock,
  ShieldCheck,
} from "lucide-react-native";
import React, { useState } from "react";
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
const LAST_UPDATED = "1 Maret 2025";

type Section = {
  id: string;
  icon: string;
  title: string;
  content: string;
  highlight?: string;
};

const SECTIONS: Section[] = [
  {
    id: "s1",
    icon: "📋",
    title: "Data yang Kami Kumpulkan",
    highlight: "Hanya data yang Anda berikan secara langsung.",
    content:
      "Kami mengumpulkan informasi yang Anda berikan saat mendaftar, termasuk nama, alamat email, dan preferensi akun. Kami juga mencatat data transaksi yang Anda masukkan secara manual ke dalam aplikasi, seperti jumlah, kategori, dan catatan. Sakuin tidak mengakses rekening bank Anda secara langsung.",
  },
  {
    id: "s2",
    icon: "🔒",
    title: "Cara Kami Menggunakan Data",
    highlight: "Data Anda digunakan untuk meningkatkan pengalaman Anda.",
    content:
      "Data yang dikumpulkan digunakan untuk menyediakan fitur pencatatan keuangan, menghasilkan laporan analitik personal, dan meningkatkan performa aplikasi. Kami tidak menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran tanpa persetujuan eksplisit Anda.",
  },
  {
    id: "s3",
    icon: "🛡️",
    title: "Keamanan Data",
    highlight: "Enkripsi end-to-end untuk semua data sensitif.",
    content:
      "Seluruh data disimpan dengan enkripsi AES-256 dan ditransmisikan menggunakan protokol TLS 1.3. Server kami dihosting di infrastruktur bersertikat ISO 27001. Kami melakukan audit keamanan secara berkala dan menerapkan prinsip least privilege untuk akses internal.",
  },
  {
    id: "s4",
    icon: "☁️",
    title: "Penyimpanan & Retensi",
    highlight: "Data disimpan selama akun Anda aktif.",
    content:
      "Data transaksi disimpan di server kami selama akun Anda aktif, ditambah 30 hari setelah penghapusan akun sebagai masa pemulihan. Setelah itu, semua data dihapus secara permanen. Anda dapat mengekspor semua data Anda kapan saja melalui menu Pengaturan.",
  },
  {
    id: "s5",
    icon: "🔗",
    title: "Layanan Pihak Ketiga",
    highlight: "Hanya integrasi yang diperlukan untuk fungsi inti.",
    content:
      "Sakuin menggunakan Google Sign-In untuk autentikasi dan Firebase untuk infrastruktur backend. Kedua layanan ini tunduk pada kebijakan privasi masing-masing. Kami tidak mengintegrasikan SDK iklan atau tracker analitik pihak ketiga.",
  },
  {
    id: "s6",
    icon: "✅",
    title: "Hak Anda",
    highlight: "Anda memiliki kendali penuh atas data Anda.",
    content:
      "Anda berhak mengakses, mengoreksi, dan menghapus data pribadi Anda kapan saja. Anda juga dapat meminta ekspor data dalam format yang dapat dibaca mesin (JSON/CSV), mencabut izin akses, atau mengajukan keberatan atas pemrosesan data dengan menghubungi tim kami.",
  },
  {
    id: "s7",
    icon: "🍪",
    title: "Cookie & Penyimpanan Lokal",
    highlight: "Hanya digunakan untuk fungsionalitas inti.",
    content:
      "Aplikasi menyimpan token sesi dan preferensi tampilan di penyimpanan lokal perangkat Anda. Data ini tidak dikirim ke server kecuali diperlukan untuk autentikasi. Anda dapat menghapus data lokal kapan saja melalui pengaturan perangkat.",
  },
  {
    id: "s8",
    icon: "📬",
    title: "Hubungi Kami",
    highlight: "Kami merespons dalam 2 × 24 jam kerja.",
    content:
      "Untuk pertanyaan, permintaan, atau keluhan seputar privasi, silakan hubungi kami di privacy@sakuin.id atau melalui formulir di dalam aplikasi. Tim Privasi kami akan merespons dalam dua hari kerja.",
  },
];

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({
  section,
  index,
}: {
  section: Section;
  index: number;
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        marginBottom: 10,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          gap: 12,
        }}
      >
        {/* Number + icon */}
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: "#f0fdf8",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#d1fae5",
          }}
        >
          <Text style={{ fontSize: 18 }}>{section.icon}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "800",
                color: "#00bf71",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#1a1f36",
              marginTop: 1,
            }}
          >
            {section.title}
          </Text>
        </View>

        {/* Chevron */}
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: "#f3f4f6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              color: "#9ca3af",
              transform: [{ rotate: expanded ? "180deg" : "0deg" }],
            }}
          >
            ▾
          </Text>
        </View>
      </Pressable>

      {expanded && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderTopColor: "#f9fafb",
          }}
        >
          {/* Highlight pill */}
          {section.highlight && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#f0fdf8",
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 7,
                marginTop: 12,
                marginBottom: 10,
                borderLeftWidth: 3,
                borderLeftColor: "#00bf71",
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#059669" }}
              >
                {section.highlight}
              </Text>
            </View>
          )}
          <Text
            style={{
              fontSize: 13,
              color: "#4b5563",
              lineHeight: 21,
            }}
          >
            {section.content}
          </Text>
        </View>
      )}
    </View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function PrivacyScreen() {
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
              Kebijakan Privasi
            </Text>
            <View style={{ width: 36 }} />
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          {/* ── Hero banner ── */}
          <LinearGradient
            colors={["#009e5f", "#007a4a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 48,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={28} color="white" strokeWidth={1.8} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: "700",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Sakuin · Dokumen Resmi
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "white",
                    marginTop: 2,
                    letterSpacing: -0.3,
                  }}
                >
                  Privasi Anda,{"\n"}Tanggung Jawab Kami
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 16,
                backgroundColor: "rgba(255,255,255,0.12)",
                alignSelf: "flex-start",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.75)",
                  fontWeight: "600",
                }}
              >
                🗓️ Terakhir diperbarui: {LAST_UPDATED}
              </Text>
            </View>
          </LinearGradient>

          {/* ── Trust badges row ── */}
          <View
            style={{
              marginHorizontal: 20,
              marginTop: -24,
              backgroundColor: "white",
              borderRadius: 18,
              padding: 16,
              flexDirection: "row",
              justifyContent: "space-around",
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
              marginBottom: 20,
            }}
          >
            {[
              { icon: "🔐", label: "AES-256\nEncryption" },
              { icon: "🚫", label: "Tidak\nDijual" },
              { icon: "📱", label: "GDPR\nCompliant" },
            ].map((b) => (
              <View key={b.label} style={{ alignItems: "center", gap: 6 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: "#f0fdf8",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#d1fae5",
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{b.icon}</Text>
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: "#374151",
                    textAlign: "center",
                    lineHeight: 14,
                  }}
                >
                  {b.label}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Intro paragraph ── */}
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 13,
                color: "#6b7280",
                lineHeight: 21,
                backgroundColor: "white",
                borderRadius: 14,
                padding: 16,
                borderLeftWidth: 3,
                borderLeftColor: "#00bf71",
                shadowColor: "#000",
                shadowOpacity: 0.03,
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              Dokumen ini menjelaskan bagaimana{" "}
              <Text style={{ fontWeight: "700", color: "#1a1f36" }}>
                Sakuin
              </Text>{" "}
              mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
              Dengan menggunakan aplikasi kami, Anda menyetujui praktik yang
              dijelaskan di sini.
            </Text>
          </View>

          {/* ── Section index label ── */}
          <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: "#9ca3af",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {SECTIONS.length} Bagian · Ketuk untuk memperluas
            </Text>
          </View>

          {/* ── Section cards ── */}
          <View style={{ paddingHorizontal: 20 }}>
            {SECTIONS.map((section, index) => (
              <SectionCard key={section.id} section={section} index={index} />
            ))}
          </View>

          {/* ── Footer ── */}
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              backgroundColor: "#1a1f36",
              borderRadius: 18,
              padding: 20,
              gap: 12,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Lock size={16} color="#00bf71" strokeWidth={2} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "white" }}>
                Pertanyaan tentang privasi?
              </Text>
            </View>
            <Text
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 18,
              }}
            >
              Tim kami siap membantu. Kirim email ke{" "}
              <Text
                style={{ color: "#00bf71", fontWeight: "600" }}
                onPress={() => Linking.openURL("mailto:privacy@sakuin.id")}
              >
                privacy@sakuin.id
              </Text>
            </Text>
            <Pressable
              onPress={() => Linking.openURL("mailto:privacy@sakuin.id")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: "#00bf71",
                borderRadius: 12,
                paddingVertical: 12,
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: "white" }}>
                Hubungi Tim Privasi
              </Text>
              <ExternalLink size={13} color="white" strokeWidth={2.5} />
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
