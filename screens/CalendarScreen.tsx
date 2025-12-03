import React, { useState, useCallback } from "react";
import { View, StyleSheet, Modal, Pressable, TextInput, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { format, parseISO, addMonths, subMonths } from "date-fns";
import { Feather } from "@expo/vector-icons";

import { CalendarGrid } from "@/components/CalendarGrid";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MealType } from "@/types";

export default function CalendarScreen() {
  const { theme } = useTheme();
  const { paddingTop, paddingBottom } = useScreenInsets();

  const {
    currentMonth,
    calendarEntries,
    selectedEntry,
    settings,
    setCurrentMonth,
    loadCalendarEntries,
    loadEntry,
    updateEntry,
    removeEntry,
  } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [lunchType, setLunchType] = useState<MealType>("None");
  const [dinnerType, setDinnerType] = useState<MealType>("None");
  const [notes, setNotes] = useState("");
  const [lunchPriceOverride, setLunchPriceOverride] = useState("");
  const [dinnerPriceOverride, setDinnerPriceOverride] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadCalendarEntries(currentMonth);
    }, [currentMonth])
  );

  const handleDatePress = async (date: string) => {
    setSelectedDate(date);
    await loadEntry(date);
    const entry = calendarEntries.get(date);
    if (entry) {
      setLunchType(entry.lunchType);
      setDinnerType(entry.dinnerType);
      setNotes(entry.notes);
      setLunchPriceOverride(entry.lunchPrice?.toString() ?? "");
      setDinnerPriceOverride(entry.dinnerPrice?.toString() ?? "");
    } else {
      setLunchType("None");
      setDinnerType("None");
      setNotes("");
      setLunchPriceOverride("");
      setDinnerPriceOverride("");
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    await updateEntry({
      date: selectedDate,
      lunchType,
      dinnerType,
      notes,
      lunchPrice: lunchPriceOverride ? parseFloat(lunchPriceOverride) : null,
      dinnerPrice: dinnerPriceOverride ? parseFloat(dinnerPriceOverride) : null,
    });
    setModalVisible(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await removeEntry(selectedDate);
            setModalVisible(false);
          },
        },
      ]
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop, paddingBottom }]}>
      <CalendarGrid
        currentMonth={currentMonth}
        entries={calendarEntries}
        onDatePress={handleDatePress}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <ThemedText type="body" style={{ color: theme.link }}>
                  Cancel
                </ThemedText>
              </Pressable>
              <ThemedText type="h4">
                {selectedDate && format(parseISO(selectedDate), "MMMM d, yyyy")}
              </ThemedText>
              <Pressable
                onPress={handleSave}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <ThemedText type="body" style={{ color: theme.link, fontWeight: "600" }}>
                  Save
                </ThemedText>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <ThemedText type="headline" style={styles.sectionTitle}>
                  Lunch
                </ThemedText>
                <SegmentedControl
                  value={lunchType}
                  onChange={setLunchType}
                  halfPrice={settings.halfPrice}
                  fullPrice={settings.fullPrice}
                  currency={settings.currency}
                />
                <View style={styles.overrideRow}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Price override (optional)
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.priceInput,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    placeholder="--"
                    placeholderTextColor={theme.textSecondary}
                    value={lunchPriceOverride}
                    onChangeText={setLunchPriceOverride}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText type="headline" style={styles.sectionTitle}>
                  Dinner
                </ThemedText>
                <SegmentedControl
                  value={dinnerType}
                  onChange={setDinnerType}
                  halfPrice={settings.halfPrice}
                  fullPrice={settings.fullPrice}
                  currency={settings.currency}
                />
                <View style={styles.overrideRow}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Price override (optional)
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.priceInput,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    placeholder="--"
                    placeholderTextColor={theme.textSecondary}
                    value={dinnerPriceOverride}
                    onChangeText={setDinnerPriceOverride}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText type="headline" style={styles.sectionTitle}>
                  Notes
                </ThemedText>
                <TextInput
                  style={[
                    styles.notesInput,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="Add a note for this day..."
                  placeholderTextColor={theme.textSecondary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {calendarEntries.has(selectedDate) && (
                <Pressable
                  onPress={handleDelete}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Feather name="trash-2" size={18} color={theme.destructive} />
                  <ThemedText type="body" style={{ color: theme.destructive }}>
                    Delete Entry
                  </ThemedText>
                </Pressable>
              )}
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "90%",
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
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  overrideRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  priceInput: {
    width: 80,
    height: 40,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    textAlign: "center",
    fontSize: 16,
  },
  notesInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
});
