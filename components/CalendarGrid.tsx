import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isAfter,
} from "date-fns";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { MealColors, Spacing, BorderRadius } from "@/constants/theme";
import { DayEntry, MealType } from "@/types";

interface CalendarGridProps {
  currentMonth: Date;
  entries: Map<string, DayEntry>;
  onDatePress: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMealColor(type: MealType): string {
  switch (type) {
    case "None":
      return MealColors.none;
    case "Half":
      return MealColors.half;
    case "Full":
      return MealColors.full;
    default:
      return MealColors.none;
  }
}

export function CalendarGrid({
  currentMonth,
  entries,
  onDatePress,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const { theme } = useTheme();
  const today = new Date();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const weeks: Date[][] = [];
  let currentDate = calendarStart;

  while (currentDate <= calendarEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }
    weeks.push(week);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={onPrevMonth}
          style={({ pressed }) => [
            styles.navButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="chevron-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4" style={styles.monthTitle}>
          {format(currentMonth, "MMMM yyyy")}
        </ThemedText>
        <Pressable
          onPress={onNextMonth}
          style={({ pressed }) => [
            styles.navButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="chevron-right" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <ThemedText
              type="caption"
              style={[styles.weekdayText, { color: theme.textSecondary }]}
            >
              {day}
            </ThemedText>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((date, dayIndex) => {
            const dateString = format(date, "yyyy-MM-dd");
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isToday = isSameDay(date, today);
            const isFuture = isAfter(date, today);
            const entry = entries.get(dateString);

            return (
              <Pressable
                key={dayIndex}
                onPress={() => !isFuture && isCurrentMonth && onDatePress(dateString)}
                disabled={isFuture || !isCurrentMonth}
                style={({ pressed }) => [
                  styles.dayCell,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: isToday ? theme.accent : "transparent",
                    borderWidth: isToday ? 2 : 0,
                    opacity: !isCurrentMonth ? 0.3 : isFuture ? 0.5 : pressed ? 0.7 : 1,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={[
                    styles.dayNumber,
                    { color: isToday ? theme.accent : theme.text },
                  ]}
                >
                  {format(date, "d")}
                </ThemedText>
                <View style={styles.indicators}>
                  <View
                    style={[
                      styles.indicator,
                      {
                        backgroundColor: entry
                          ? getMealColor(entry.lunchType)
                          : theme.backgroundSecondary,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.indicator,
                      {
                        backgroundColor: entry
                          ? getMealColor(entry.dinnerType)
                          : theme.backgroundSecondary,
                      },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MealColors.none }]} />
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            None
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MealColors.half }]} />
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Half
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MealColors.full }]} />
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Full
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  navButton: {
    padding: Spacing.sm,
  },
  monthTitle: {
    textAlign: "center",
  },
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  weekdayText: {
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: BorderRadius.xs,
    padding: Spacing.xs,
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayNumber: {
    fontWeight: "500",
  },
  indicators: {
    flexDirection: "column",
    gap: 2,
    width: "100%",
    paddingHorizontal: 4,
  },
  indicator: {
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
