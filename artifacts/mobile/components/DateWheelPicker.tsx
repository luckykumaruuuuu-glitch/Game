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

const ITEM_H = 46;
const VISIBLE = 5;
const PICKER_H = ITEM_H * VISIBLE;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

interface WheelProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}

function Wheel({ items, selectedIndex, onSelect, colors }: WheelProps) {
  const scrollRef = useRef<ScrollView>(null);
  const currentIndex = useRef(selectedIndex);
  const isScrolling = useRef(false);

  useEffect(() => {
    const offset = selectedIndex * ITEM_H;
    scrollRef.current?.scrollTo({ y: offset, animated: false });
    currentIndex.current = selectedIndex;
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    scrollRef.current?.scrollTo({ y: clamped * ITEM_H, animated: true });
    currentIndex.current = clamped;
    onSelect(clamped);
  }, [items.length, onSelect]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    const index = Math.round(offset / ITEM_H);
    scrollToIndex(index);
    isScrolling.current = false;
  };

  return (
    <View style={styles.wheelContainer}>
      {/* Selection highlight */}
      <View
        style={[
          styles.selectionBar,
          { borderColor: colors.border, top: ITEM_H * 2 },
        ]}
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
              key={item}
              style={[styles.wheelItem, { height: ITEM_H }]}
              onPress={() => scrollToIndex(i)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.wheelText,
                  {
                    color: isSelected ? colors.foreground : colors.mutedForeground,
                    fontSize: isSelected ? 17 : 15,
                    fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Top/bottom fade */}
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
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [mounted, setMounted] = useState(visible);

  const initial = parseDate(value ?? "");
  const [selDay, setSelDay] = useState(initial.d - 1);
  const [selMonth, setSelMonth] = useState(initial.m - 1);
  const [selYear, setSelYear] = useState(0);

  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({ length: currentYear - 1923 }, (_, i) =>
    String(currentYear - i)
  );

  useEffect(() => {
    const initYear = initial.y;
    const idx = YEARS.indexOf(String(initYear));
    setSelYear(idx >= 0 ? idx : 20);
  }, []);

  useEffect(() => {
    if (visible) {
      const init = parseDate(value ?? "");
      setSelDay(init.d - 1);
      setSelMonth(init.m - 1);
      const idx = YEARS.indexOf(String(init.y));
      setSelYear(idx >= 0 ? idx : 20);
      overlayAnim.setValue(0);
      slideAnim.setValue(300);
      setMounted(true);
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, damping: 22, stiffness: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 0, duration: 190, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 300, duration: 180, useNativeDriver: true }),
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
    const yr = YEARS[selYear];
    onConfirm(`${day}/${month}/${yr}`);
    onClose();
  }

  if (!mounted) return null;

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayAnim }]} pointerEvents="none">
        {Platform.OS !== "web" && (
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.45)" }]} />
      </Animated.View>

      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Pressable onPress={() => {}}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Title row */}
          <View style={[styles.titleRow, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.titleBtn}>
              <Text style={[styles.titleBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.foreground }]}>Date of Birth</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.titleBtn}>
              <Text style={[styles.titleBtnText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {/* Column labels */}
          <View style={styles.labelsRow}>
            <Text style={[styles.columnLabel, { color: colors.mutedForeground }]}>Day</Text>
            <Text style={[styles.columnLabel, { color: colors.mutedForeground, flex: 2 }]}>Month</Text>
            <Text style={[styles.columnLabel, { color: colors.mutedForeground }]}>Year</Text>
          </View>

          {/* Wheels */}
          <View style={[styles.wheelsRow, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Wheel
                key={`day-${selMonth}-${selYear}`}
                items={dayItems}
                selectedIndex={Math.min(selDay, dayItems.length - 1)}
                onSelect={setSelDay}
                colors={colors}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Wheel
                items={MONTHS}
                selectedIndex={selMonth}
                onSelect={setSelMonth}
                colors={colors}
              />
            </View>
            <View style={{ flex: 1.2 }}>
              <Wheel
                items={YEARS}
                selectedIndex={selYear}
                onSelect={setSelYear}
                colors={colors}
              />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 24,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: "center", marginTop: 12, marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleBtn: { padding: 4, minWidth: 60 },
  titleBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  title: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  labelsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
  },
  columnLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  wheelsRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  wheelContainer: {
    position: "relative",
    overflow: "hidden",
  },
  selectionBar: {
    position: "absolute",
    left: 4, right: 4,
    height: ITEM_H,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 1,
  },
  wheelItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  wheelText: {
    textAlign: "center",
  },
  fadeTop: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: ITEM_H * 2,
    opacity: 0.75,
    zIndex: 2,
  },
  fadeBottom: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: ITEM_H * 2,
    opacity: 0.75,
    zIndex: 2,
  },
});
