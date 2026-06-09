import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { Dimensions, Modal, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const SCREEN = Dimensions.get("window");
const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;
const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.5 };

interface ImageViewerModalProps {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}

export function ImageViewerModal({ visible, uri, onClose }: ImageViewerModalProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const resetTransform = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
    savedScale.value = 1;
    translateX.value = withSpring(0, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, []);

  const handleClose = useCallback(() => {
    resetTransform();
    onClose();
  }, [onClose, resetTransform]);

  function clampTranslation(tx: number, ty: number, currentScale: number) {
    "worklet";
    const maxX = Math.max(0, (SCREEN.width * (currentScale - 1)) / 2);
    const maxY = Math.max(0, (SCREEN.height * (currentScale - 1)) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, tx)),
      y: Math.min(maxY, Math.max(-maxY, ty)),
    };
  }

  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      originX.value = e.focalX - SCREEN.width / 2;
      originY.value = e.focalY - SCREEN.height / 2;
    })
    .onUpdate((e) => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.value * e.scale));
      scale.value = newScale;
      const clamped = clampTranslation(
        savedTranslateX.value + originX.value * (1 - e.scale),
        savedTranslateY.value + originY.value * (1 - e.scale),
        newScale,
      );
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      if (scale.value < 1.05) {
        scale.value = withSpring(1, SPRING_CONFIG);
        savedScale.value = 1;
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const panGesture = Gesture.Pan()
    .minDistance(1)
    .onUpdate((e) => {
      if (scale.value <= 1.05) {
        return;
      }
      const clamped = clampTranslation(
        savedTranslateX.value + e.translationX,
        savedTranslateY.value + e.translationY,
        scale.value,
      );
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(300)
    .onEnd((e) => {
      if (scale.value > 1.2) {
        scale.value = withSpring(1, SPRING_CONFIG);
        savedScale.value = 1;
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        const tapX = e.x - SCREEN.width / 2;
        const tapY = e.y - SCREEN.height / 2;
        const newScale = DOUBLE_TAP_SCALE;
        scale.value = withSpring(newScale, SPRING_CONFIG);
        savedScale.value = newScale;
        const rawTx = -tapX * (newScale - 1);
        const rawTy = -tapY * (newScale - 1);
        const clamped = clampTranslation(rawTx, rawTy, newScale);
        translateX.value = withSpring(clamped.x, SPRING_CONFIG);
        translateY.value = withSpring(clamped.y, SPRING_CONFIG);
        savedTranslateX.value = clamped.x;
        savedTranslateY.value = clamped.y;
      }
    });

  const singleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      if (scale.value <= 1.05) {
        runOnJS(handleClose)();
      }
    });

  const composed = Gesture.Simultaneous(
    Gesture.Race(doubleTapGesture, singleTapGesture),
    Gesture.Simultaneous(pinchGesture, panGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (!uri) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.backdrop} />

        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.imageContainer, animatedStyle]}>
            <Image
              source={{ uri }}
              style={styles.image}
              contentFit="contain"
              transition={0}
            />
          </Animated.View>
        </GestureDetector>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleClose}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <View style={styles.closeBtnInner}>
            <Feather name="x" size={22} color="#fff" />
          </View>
        </TouchableOpacity>

        {Platform.OS === "android" && <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />}
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  imageContainer: {
    width: SCREEN.width,
    height: SCREEN.height,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: SCREEN.width,
    height: SCREEN.height,
  },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    right: 20,
    zIndex: 10,
  },
  closeBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});
