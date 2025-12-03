import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { MealColors, Spacing, BorderRadius } from "@/constants/theme";

interface StatCardProps {
  title: string;
  noneCount: number;
  halfCount: number;
  fullCount: number;
  totalAmount: number;
  currency?: string;
}

export function StatCard({
  title,
  noneCount,
  halfCount,
  fullCount,
  totalAmount,
  currency = "INR",
}: StatCardProps) {
  const { theme } = useTheme();
  const currencySymbol = currency === "INR" ? "\u20B9" : currency;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      <ThemedText type="headline" style={styles.title}>
        {title}
      </ThemedText>

      <View style={styles.countsRow}>
        <View style={styles.countItem}>
          <View style={[styles.countDot, { backgroundColor: MealColors.none }]} />
          <ThemedText type="body" style={styles.countLabel}>
            None
          </ThemedText>
          <ThemedText type="h4" style={styles.countValue}>
            {noneCount}
          </ThemedText>
        </View>
        <View style={styles.countItem}>
          <View style={[styles.countDot, { backgroundColor: MealColors.half }]} />
          <ThemedText type="body" style={styles.countLabel}>
            Half
          </ThemedText>
          <ThemedText type="h4" style={styles.countValue}>
            {halfCount}
          </ThemedText>
        </View>
        <View style={styles.countItem}>
          <View style={[styles.countDot, { backgroundColor: MealColors.full }]} />
          <ThemedText type="body" style={styles.countLabel}>
            Full
          </ThemedText>
          <ThemedText type="h4" style={styles.countValue}>
            {fullCount}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Total
        </ThemedText>
        <ThemedText type="h3" style={{ color: theme.accent }}>
          {currencySymbol}{totalAmount}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  title: {
    marginBottom: Spacing.md,
  },
  countsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  countItem: {
    flex: 1,
    alignItems: "center",
  },
  countDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: Spacing.xs,
  },
  countLabel: {
    marginBottom: Spacing.xs,
  },
  countValue: {},
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
});
