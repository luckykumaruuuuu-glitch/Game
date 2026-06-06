import { BlurView } from "expo-blur";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const ITEM_H = 48;
const VISIBLE = 5;
const PICKER_H = ITEM_H * VISIBLE;

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function parseDate(str: string): { d: number; m: number; y: number } {
  if (str && /^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split("/").map(Number);
    return { d: dd, m: mm, y: yyyy };
  }
  const now = new Date();
  return { d: now.getDate(), m: now.getMonth() + 1, y: now.getFullYear() - 20 };
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1923 }, (_, i) =>
  String(CURRENT_YEAR - i)
);

interface WheelProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  flex?: number;
}

function Wheel({ items, selectedIndex, onSelect, flex = 1 }: WheelProps) {
  const colors = useColors();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_H, animated: false });
  }, []);

  useEffect(() => {
    const clamped = Math.min(selectedIndex, items.length - 1);
    scrollRef.current?.scrollTo({ y: clamped * ITEM_H, animated: true });
  }, [items.length]);

  const snapToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      scrollRef.current?.scrollTo({ y: clamped * ITEM_H, animated: true });
      onSelect(clamped);
    },
    [items.length, onSelect]
  );

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    snapToIndex(Math.round(offset / ITEM_H));
  };

  return (
    <View style={[styles.wheelOuter, { flex }]}>
      <View
        style={[styles.selectionBar, { borderColor: colors.primary + "55" }]}
        pointerEvents="none"
      />
      <ScrollView
        ref={scrollRef}
        style={{ height: PICKER_H }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        scrollEventThrottle={16}
      >
        {items.map((item, i) => {
          const isSelected = i === selectedIndex;
          return (
            <TouchableOpacity
              key={`${item}-${i}`}
              style={[styles.wheelItem, { height: ITEM_H }]}
              onPress={() => snapToIndex(i)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.wheelText,
                  {
                    color: isSelected ? colors.foreground : colors.mutedForeground,
                    fontSize: isSelected ? 17 : 14,
                    fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                    opacity: isSelected ? 1 : 0.5,
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={[styles.fadeTop, { backgroundColor: colors.card }]} pointerEvents="none" />
      <View style={[styles.fadeBottom, { backgroundColor: colors.card }]} pointerEvents="none" />
    </View>
  );
}

interface DateWheelPickerProps {
  visible: boolean;
  value?: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
}

export function DateWheelPicker({ visible, value, onConfirm, onClose }: DateWheelPickerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(400)).current;
  const [mounted, setMounted] = useState(false);

  const initial = parseDate(value ?? "");
  const [selDay, setSelDay] = useState(initial.d - 1);
  const [selMonth, setSelMonth] = useState(initial.m - 1);
  const [selYear, setSelYear] = useState(() => {
    const idx = YEARS.indexOf(String(initial.y));
    return idx >= 0 ? idx : 20;
  });

  useEffect(() => {
    if (visible) {
      const init = parseDate(value ?? "");
      setSelDay(init.d - 1);
      setSelMonth(init.m - 1);
      const idx = YEARS.indexOf(String(init.y));
      setSelYear(idx >= 0 ? idx : 20);
      overlayAnim.setValue(0);
      slideAnim.setValue(400);
      setMounted(true);
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 1, duration: 230, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, damping: 22, stiffness: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 400, duration: 190, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible]);

  const year = Number(YEARS[selYear]);
  const maxDay = daysInMonth(selMonth + 1, year);
  const dayItems = Array.from({ length: maxDay }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  useEffect(() => {
    if (selDay >= maxDay) setSelDay(maxDay - 1);
  }, [selMonth, selYear]);

  function handleConfirm() {
    const day = String(selDay + 1).padStart(2, "0");
    const month = String(selMonth + 1).padStart(2, "0");
    onConfirm(`${day}/${month}/${YEARS[selYear]}`);
    onClose();
  }

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* ── Dark overlay (solid always; blur bonus on iOS) ──────────── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: overlayAnim }]}
        pointerEvents="none"
      >
        <View style={[StyleSheet.absoluteFill, styles.solidOverlay]} />
        {Platform.OS !== "android" && (
          <BlurView intensity={90} tint="dark" style={[StyleSheet.absoluteFill, { opacity: 0.9 }]} />
        )}
      </Animated.View>

      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            paddingBottom: insets.bottom + 20,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Pressable onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={[styles.titleRow, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.titleBtn}>
              <Text style={[styles.titleBtnText, { color: colors.mutedForeground }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.foreground }]}>Date of Birth</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.titleBtn}>
              <Text style={[styles.titleBtnText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.labelsRow}>
            <Text style={[styles.colLabel, { color: colors.mutedForeground, flex: 1 }]}>Day</Text>
            <Text style={[styles.colLabel, { color: colors.mutedForeground, flex: 2 }]}>Month</Text>
            <Text style={[styles.colLabel, { color: colors.mutedForeground, flex: 1.3 }]}>Year</Text>
          </View>

          <View style={styles.wheelsRow}>
            <Wheel
              key={`day-${selMonth}-${selYear}`}
              items={dayItems}
              selectedIndex={Math.min(selDay, dayItems.length - 1)}
              onSelect={setSelDay}
              flex={1}
            />
            <Wheel items={MONTHS} selectedIndex={selMonth} onSelect={setSelMonth} flex={2} />
            <Wheel items={YEARS} selectedIndex={selYear} onSelect={setSelYear} flex={1.3} />
          </View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  solidOverlay: { backgroundColor: "rgba(0,0,0,0.84)" },
  sheet: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 30,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: "center", marginTop: 12, marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleBtn: { padding: 4, minWidth: 64 },
  titleBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  title: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  labelsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 2,
  },
  colLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  wheelsRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  wheelOuter: {
    position: "relative",
    overflow: "hidden",
  },
  selectionBar: {
    position: "absolute",
    left: 6, right: 6,
    height: ITEM_H,
    top: ITEM_H * 2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 2,
  },
  wheelItem: { alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  wheelText: { textAlign: "center" },
  fadeTop: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: ITEM_H * 2,
    opacity: 0.78,
    zIndex: 3,
  },
  fadeBottom: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: ITEM_H * 2,
    opacity: 0.78,
    zIndex: 3,
  },
});
