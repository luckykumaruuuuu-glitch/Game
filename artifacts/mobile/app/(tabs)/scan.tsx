import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

let CameraView: any = null;
let useCameraPermissions: any = null;
if (Platform.OS !== "web") {
  const cameraModule = require("expo-camera");
  CameraView = cameraModule.CameraView;
  useCameraPermissions = cameraModule.useCameraPermissions;
}

function WebFallback() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 67 + 20 }]}>
      <Feather name="smartphone" size={48} color={colors.mutedForeground} />
      <Text style={[styles.webTitle, { color: colors.foreground }]}>Scan on your phone</Text>
      <Text style={[styles.webSub, { color: colors.mutedForeground }]}>
        Open the app in Expo Go on your mobile device to use the QR scanner.
      </Text>
    </View>
  );
}

function NativeScanner() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cooldown = useRef(false);

  const handleScan = useCallback(({ data }: { data: string }) => {
    if (cooldown.current) return;
    cooldown.current = true;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push(`/user/${data}`);
    setTimeout(() => {
      cooldown.current = false;
      setScanned(false);
    }, 3000);
  }, []);

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.webSub, { color: colors.mutedForeground }]}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Feather name="camera-off" size={48} color={colors.mutedForeground} />
        <Text style={[styles.webTitle, { color: colors.foreground }]}>Camera Access Needed</Text>
        <Text style={[styles.webSub, { color: colors.mutedForeground }]}>
          Allow camera access to scan QR codes
        </Text>
        <TouchableOpacity
          style={[styles.permBtn, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.permBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.scanContainer, { backgroundColor: "#000" }]}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleScan}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      <View style={[styles.overlay, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.scanTitle}>Scan QR Code</Text>
        <Text style={styles.scanSub}>Point at someone's profile QR code</Text>
      </View>

      <View style={styles.viewfinderWrap}>
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
      </View>

      {scanned && (
        <View style={[styles.successBanner, { backgroundColor: colors.primary }]}>
          <Feather name="check-circle" size={18} color="#fff" />
          <Text style={styles.successText}>Profile found! Opening...</Text>
        </View>
      )}

      <View style={[styles.bottomHint, { paddingBottom: insets.bottom + 24 }]}>
        <Feather name="zap" size={14} color="rgba(255,255,255,0.6)" />
        <Text style={styles.hintText}>QR codes are detected automatically</Text>
      </View>
    </View>
  );
}

export default function ScanScreen() {
  if (Platform.OS === "web") return <WebFallback />;
  return <NativeScanner />;
}

const CORNER = 24;
const CORNER_WIDTH = 3;
const FRAME = 240;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  webTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  webSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  permBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 8,
  },
  permBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  scanContainer: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
  },
  scanTitle: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  scanSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" },
  viewfinderWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  viewfinder: {
    width: FRAME,
    height: FRAME,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: "#A855F7",
    borderWidth: CORNER_WIDTH,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  successBanner: {
    position: "absolute",
    bottom: 120,
    left: 32,
    right: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    justifyContent: "center",
  },
  successText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  bottomHint: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
  },
  hintText: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "Inter_400Regular" },
});
