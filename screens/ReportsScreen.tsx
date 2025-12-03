import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert, ActivityIndicator, Modal, TextInput, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { format, parseISO, isValid, startOfMonth, endOfMonth } from "date-fns";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { StatCard } from "@/components/StatCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ReportData, DateRange } from "@/types";
import { exportCSV } from "@/utils/reports";

export default function ReportsScreen() {
  const { theme } = useTheme();
  const { settings, generateReport, getDateRangeForPreset } = useStore();

  const [selectedRange, setSelectedRange] = useState<DateRange>("thisMonth");
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [customEndDate, setCustomEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  const loadReport = async (range: DateRange, customStart?: string, customEnd?: string) => {
    setIsLoading(true);
    try {
      let start: string;
      let end: string;

      if (range === "custom" && customStart && customEnd) {
        start = customStart;
        end = customEnd;
      } else {
        const dates = getDateRangeForPreset(range);
        start = dates.start;
        end = dates.end;
      }

      const reportData = await generateReport(start, end);
      setReport(reportData);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (selectedRange === "custom") {
        loadReport(selectedRange, customStartDate, customEndDate);
      } else {
        loadReport(selectedRange);
      }
    }, [selectedRange, customStartDate, customEndDate])
  );

  const handleRangeChange = (range: DateRange) => {
    if (range === "custom") {
      setDatePickerVisible(true);
    } else {
      setSelectedRange(range);
    }
  };

  const handleCustomDateApply = () => {
    const start = parseISO(customStartDate);
    const end = parseISO(customEndDate);

    if (!isValid(start) || !isValid(end)) {
      Alert.alert("Invalid Date", "Please enter valid dates in YYYY-MM-DD format.");
      return;
    }

    if (start > end) {
      Alert.alert("Invalid Range", "Start date must be before end date.");
      return;
    }

    setSelectedRange("custom");
    setDatePickerVisible(false);
    loadReport("custom", customStartDate, customEndDate);
  };

  const handleExport = async () => {
    if (!report) return;

    setIsExporting(true);
    try {
      const success = await exportCSV(report, settings);
      if (!success) {
        Alert.alert("Export Failed", "Unable to export the report. Please try again.");
      }
    } catch (error) {
      Alert.alert("Export Error", "An error occurred while exporting the report.");
    } finally {
      setIsExporting(false);
    }
  };

  const getCurrencySymbol = (code: string) => {
    const symbols: Record<string, string> = {
      INR: "\u20B9",
      USD: "$",
      EUR: "\u20AC",
      GBP: "\u00A3",
      JPY: "\u00A5",
      AUD: "A$",
      CAD: "C$",
    };
    return symbols[code] || code;
  };

  const currencySymbol = getCurrencySymbol(settings.currency);

  return (
    <ScreenScrollView>
      <ThemedText type="h3" style={styles.title}>
        Reports
      </ThemedText>

      <View style={styles.rangeSelector}>
        <Pressable
          onPress={() => handleRangeChange("thisMonth")}
          style={({ pressed }) => [
            styles.rangeButton,
            {
              backgroundColor:
                selectedRange === "thisMonth"
                  ? theme.accent
                  : theme.backgroundDefault,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <ThemedText
            type="small"
            style={{
              color: selectedRange === "thisMonth" ? "#FFFFFF" : theme.text,
              fontWeight: selectedRange === "thisMonth" ? "600" : "400",
            }}
          >
            This Month
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => handleRangeChange("lastMonth")}
          style={({ pressed }) => [
            styles.rangeButton,
            {
              backgroundColor:
                selectedRange === "lastMonth"
                  ? theme.accent
                  : theme.backgroundDefault,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <ThemedText
            type="small"
            style={{
              color: selectedRange === "lastMonth" ? "#FFFFFF" : theme.text,
              fontWeight: selectedRange === "lastMonth" ? "600" : "400",
            }}
          >
            Last Month
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => handleRangeChange("custom")}
          style={({ pressed }) => [
            styles.rangeButton,
            {
              backgroundColor:
                selectedRange === "custom"
                  ? theme.accent
                  : theme.backgroundDefault,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <ThemedText
            type="small"
            style={{
              color: selectedRange === "custom" ? "#FFFFFF" : theme.text,
              fontWeight: selectedRange === "custom" ? "600" : "400",
            }}
          >
            Custom
          </ThemedText>
        </Pressable>
      </View>

      {report && (
        <Pressable
          onPress={() => selectedRange === "custom" && setDatePickerVisible(true)}
          style={({ pressed }) => [
            styles.periodContainer,
            selectedRange === "custom" && { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {format(parseISO(report.startDate), "MMM d")} -{" "}
            {format(parseISO(report.endDate), "MMM d, yyyy")}
          </ThemedText>
          {selectedRange === "custom" && (
            <Feather name="edit-2" size={14} color={theme.textSecondary} style={{ marginLeft: 8 }} />
          )}
        </Pressable>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : report ? (
        <>
          <View style={styles.statsContainer}>
            <StatCard
              title="Lunch"
              noneCount={report.lunchCounts.none}
              halfCount={report.lunchCounts.half}
              fullCount={report.lunchCounts.full}
              totalAmount={report.totalLunchAmount}
              currency={settings.currency}
            />
            <StatCard
              title="Dinner"
              noneCount={report.dinnerCounts.none}
              halfCount={report.dinnerCounts.half}
              fullCount={report.dinnerCounts.full}
              totalAmount={report.totalDinnerAmount}
              currency={settings.currency}
            />
          </View>

          <View
            style={[styles.grandTotalCard, { backgroundColor: theme.backgroundDefault }]}
          >
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Grand Total
            </ThemedText>
            <ThemedText type="h1" style={{ color: theme.accent }}>
              {currencySymbol}{report.grandTotal}
            </ThemedText>
          </View>

          <View style={styles.entriesInfo}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {report.entries.length} day{report.entries.length !== 1 ? "s" : ""} recorded
            </ThemedText>
          </View>

          <Button onPress={handleExport} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export as CSV"}
          </Button>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            No data available for this period.
          </ThemedText>
        </View>
      )}

      <Modal
        visible={datePickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable
                onPress={() => setDatePickerVisible(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <ThemedText type="body" style={{ color: theme.link }}>
                  Cancel
                </ThemedText>
              </Pressable>
              <ThemedText type="h4">Custom Range</ThemedText>
              <Pressable
                onPress={handleCustomDateApply}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <ThemedText type="body" style={{ color: theme.link, fontWeight: "600" }}>
                  Apply
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.dateInputGroup}>
                <ThemedText type="body" style={styles.dateLabel}>
                  Start Date
                </ThemedText>
                <TextInput
                  style={[
                    styles.dateInput,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textSecondary}
                  value={customStartDate}
                  onChangeText={setCustomStartDate}
                  keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
                  maxLength={10}
                />
              </View>

              <View style={styles.dateInputGroup}>
                <ThemedText type="body" style={styles.dateLabel}>
                  End Date
                </ThemedText>
                <TextInput
                  style={[
                    styles.dateInput,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textSecondary}
                  value={customEndDate}
                  onChangeText={setCustomEndDate}
                  keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
                  maxLength={10}
                />
              </View>

              <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
                Enter dates in YYYY-MM-DD format (e.g., 2024-01-15)
              </ThemedText>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.lg,
  },
  rangeSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  periodContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    paddingVertical: Spacing["4xl"],
    alignItems: "center",
  },
  statsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  grandTotalCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  entriesInfo: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyContainer: {
    paddingVertical: Spacing["4xl"],
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  modalBody: {
    padding: Spacing.xl,
  },
  dateInputGroup: {
    marginBottom: Spacing.lg,
  },
  dateLabel: {
    marginBottom: Spacing.sm,
  },
  dateInput: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
});
