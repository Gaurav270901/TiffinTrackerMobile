import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MealType } from "@/types";

interface MealCardProps {
  title: string;
  value: MealType;
  onChange: (value: MealType) => void;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  halfPrice: number;
  fullPrice: number;
  currency?: string;
  showNotes?: boolean;
}

export function MealCard({
  title,
  value,
  onChange,
  notes = "",
  onNotesChange,
  halfPrice,
  fullPrice,
  currency = "INR",
  showNotes = true,
}: MealCardProps) {
  const { theme } = useTheme();
  const [notesExpanded, setNotesExpanded] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.header}>
        <ThemedText type="headline" style={styles.title}>
          {title}
        </ThemedText>
        {showNotes && onNotesChange && (
          <Pressable
            onPress={() => setNotesExpanded(!notesExpanded)}
            style={({ pressed }) => [
              styles.notesButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather
              name="edit-3"
              size={20}
              color={notes ? theme.link : theme.textSecondary}
            />
          </Pressable>
        )}
      </View>

      <SegmentedControl
        value={value}
        onChange={onChange}
        halfPrice={halfPrice}
        fullPrice={fullPrice}
        currency={currency}
      />

      {showNotes && notesExpanded && onNotesChange && (
        <TextInput
          style={[
            styles.notesInput,
            {
              backgroundColor: theme.backgroundSecondary,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Add a note..."
          placeholderTextColor={theme.textSecondary}
          value={notes}
          onChangeText={onNotesChange}
          multiline
          numberOfLines={2}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {},
  notesButton: {
    padding: Spacing.xs,
  },
  notesInput: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: "top",
  },
});
