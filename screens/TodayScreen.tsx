import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { format } from "date-fns";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { MealCard } from "@/components/MealCard";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function TodayScreen() {
  const { theme } = useTheme();
  const [saved, setSaved] = useState(false);

  const {
    todayEntry,
    settings,
    isLoading,
    initialize,
    updateTodayLunch,
    updateTodayDinner,
    updateTodayNotes,
  } = useStore();

  useEffect(() => {
    initialize();
  }, []);

  const handleLunchChange = async (type: any) => {
    await updateTodayLunch(type);
    showSavedFeedback();
  };

  const handleDinnerChange = async (type: any) => {
    await updateTodayDinner(type);
    showSavedFeedback();
  };

  const handleNotesChange = async (notes: string) => {
    await updateTodayNotes(notes);
  };

  const showSavedFeedback = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const today = new Date();
  const dateDisplay = format(today, "EEEE, MMM d");

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <ScreenScrollView>
      {Platform.OS === "web" && (
        <View style={[styles.webBanner, { backgroundColor: theme.secondary }]}>
          <Feather name="smartphone" size={16} color="#FFFFFF" />
          <ThemedText type="small" style={styles.webBannerText}>
            For persistent data storage, scan the QR code to use Expo Go on your phone
          </ThemedText>
        </View>
      )}

      <View style={styles.dateContainer}>
        <ThemedText type="largeTitle" style={styles.dateText}>
          {dateDisplay}
        </ThemedText>
        {saved && (
          <View style={[styles.savedBadge, { backgroundColor: theme.accent }]}>
            <Feather name="check" size={16} color="#FFFFFF" />
            <ThemedText type="caption" style={styles.savedText}>
              Saved
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.cardsContainer}>
        <MealCard
          title="Lunch"
          value={todayEntry?.lunchType ?? "None"}
          onChange={handleLunchChange}
          notes={todayEntry?.notes}
          onNotesChange={handleNotesChange}
          halfPrice={settings.halfPrice}
          fullPrice={settings.fullPrice}
          currency={settings.currency}
        />

        <MealCard
          title="Dinner"
          value={todayEntry?.dinnerType ?? "None"}
          onChange={handleDinnerChange}
          halfPrice={settings.halfPrice}
          fullPrice={settings.fullPrice}
          currency={settings.currency}
          showNotes={false}
        />
      </View>

      {!settings.hasDemoData && !todayEntry && (
        <View style={[styles.tipCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="info" size={20} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, flex: 1 }}>
            Tap on the meal buttons above to record your tiffin for today. Your selections are saved automatically.
          </ThemedText>
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  webBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  webBannerText: {
    color: "#FFFFFF",
    flex: 1,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  dateText: {},
  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    gap: Spacing.xs,
  },
  savedText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cardsContainer: {
    gap: Spacing.md,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: 12,
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
});
