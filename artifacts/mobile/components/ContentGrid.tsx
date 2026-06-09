import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ContentItem } from "@/lib/firestore";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "./GlassCard";
import { ImageViewerModal } from "./ImageViewerModal";

const COLS = 2;
const GAP = 10;
const SCREEN_W = Dimensions.get("window").width;
const CELL = (SCREEN_W - 32 - GAP) / COLS;

interface ContentGridProps {
  items: ContentItem[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  editable?: boolean;
}

export function ContentGrid({ items, loading, onDelete, editable }: ContentGridProps) {
  const colors = useColors();
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Feather name="image" size={36} color={colors.mutedForeground} />
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No content yet</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.contentId} style={[styles.cell, { width: CELL }]}>
            {item.type === "image" ? (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setViewerUri(item.url)}
                style={styles.imageCell}
              >
                <Image
                  source={{ uri: item.url }}
                  style={[styles.image, { width: CELL, height: CELL }]}
                  contentFit="cover"
                  transition={200}
                />
                {editable && onDelete && (
                  <TouchableOpacity
                    style={[styles.deleteBtn, { backgroundColor: colors.destructive }]}
                    onPress={() => onDelete(item.contentId)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="x" size={12} color="#fff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ) : (
              <GlassCard style={[styles.textCell, { width: CELL, height: CELL }]} padding={12}>
                <Feather name="file-text" size={18} color={colors.primary} style={styles.textIcon} />
                <Text style={[styles.textContent, { color: colors.foreground }]} numberOfLines={6}>
                  {item.url}
                </Text>
                {editable && onDelete && (
                  <TouchableOpacity
                    style={[styles.deleteBtn, { backgroundColor: colors.destructive }]}
                    onPress={() => onDelete(item.contentId)}
                  >
                    <Feather name="x" size={12} color="#fff" />
                  </TouchableOpacity>
                )}
              </GlassCard>
            )}
            {item.caption ? (
              <Text style={[styles.caption, { color: colors.mutedForeground }]} numberOfLines={1}>
                {item.caption}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <ImageViewerModal
        visible={viewerUri !== null}
        uri={viewerUri}
        onClose={() => setViewerUri(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  cell: {},
  imageCell: {
    borderRadius: 14,
    overflow: "hidden",
  },
  image: {
    borderRadius: 14,
  },
  textCell: {
    borderRadius: 14,
    overflow: "hidden",
  },
  textIcon: {
    marginBottom: 6,
  },
  textContent: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },
  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  caption: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  center: {
    paddingVertical: 48,
    alignItems: "center",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
