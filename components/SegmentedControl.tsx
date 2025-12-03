import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { MealColors, Spacing, BorderRadius } from "@/constants/theme";
import { MealType } from "@/types";

interface SegmentedControlProps {
  value: MealType;
  onChange: (value: MealType) => void;
  halfPrice: number;
  fullPrice: number;
  currency?: string;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SegmentButtonProps {
  type: MealType;
  label: string;
  price?: number;
  currency?: string;
  isSelected: boolean;
  onPress: () => void;
  color: string;
}

function SegmentButton({
  type,
  label,
  price,
  currency,
  isSelected,
  onPress,
  color,
}: SegmentButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const currencySymbol = currency === "INR" ? "\u20B9" : currency || "";

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.segment,
        {
          backgroundColor: isSelected ? color : "transparent",
          borderColor: color,
          borderWidth: 2,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="body"
        style={[
          styles.segmentLabel,
          {
            color: isSelected ? "#FFFFFF" : theme.text,
            fontWeight: isSelected ? "600" : "400",
          },
        ]}
      >
        {label}
      </ThemedText>
      {price !== undefined && (
        <ThemedText
          type="caption"
          style={[
            styles.segmentPrice,
            { color: isSelected ? "rgba(255,255,255,0.8)" : theme.textSecondary },
          ]}
        >
          {currencySymbol}{price}
        </ThemedText>
      )}
    </AnimatedPressable>
  );
}

export function SegmentedControl({
  value,
  onChange,
  halfPrice,
  fullPrice,
  currency = "INR",
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      <SegmentButton
        type="None"
        label="None"
        isSelected={value === "None"}
        onPress={() => onChange("None")}
        color={MealColors.none}
      />
      <SegmentButton
        type="Half"
        label="Half"
        price={halfPrice}
        currency={currency}
        isSelected={value === "Half"}
        onPress={() => onChange("Half")}
        color={MealColors.half}
      />
      <SegmentButton
        type="Full"
        label="Full"
        price={fullPrice}
        currency={currency}
        isSelected={value === "Full"}
        onPress={() => onChange("Full")}
        color={MealColors.full}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  segment: {
    flex: 1,
    height: Spacing.segmentHeight,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  segmentLabel: {
    fontSize: 18,
  },
  segmentPrice: {
    marginTop: 2,
  },
});
