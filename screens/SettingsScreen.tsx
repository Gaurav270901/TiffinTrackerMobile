import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Alert, Pressable, Modal, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/store/useStore";
import { Spacing, BorderRadius } from "@/constants/theme";
import { exportJSON } from "@/utils/reports";

const CURRENCIES = [
  { code: "INR", symbol: "\u20B9", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "\u20AC", name: "Euro" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound" },
  { code: "JPY", symbol: "\u00A5", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { settings, saveSettings, loadDemoData, clearData, exportAllData } = useStore();

  const [displayName, setDisplayName] = useState(settings.displayName);
  const [halfPrice, setHalfPrice] = useState(settings.halfPrice.toString());
  const [fullPrice, setFullPrice] = useState(settings.fullPrice.toString());
  const [currency, setCurrency] = useState(settings.currency);
  const [isSaving, setIsSaving] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  useEffect(() => {
    setDisplayName(settings.displayName);
    setHalfPrice(settings.halfPrice.toString());
    setFullPrice(settings.fullPrice.toString());
    setCurrency(settings.currency);
  }, [settings]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveSettings({
        displayName: displayName || "User",
        halfPrice: parseFloat(halfPrice) || 50,
        fullPrice: parseFloat(fullPrice) || 60,
        currency: currency,
      });
      Alert.alert("Settings Saved", "Your settings have been updated.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDemoData = () => {
    Alert.alert(
      "Load Demo Data",
      "This will add sample entries for the current month. Existing entries will be replaced.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Load Demo",
          onPress: async () => {
            await loadDemoData();
            Alert.alert("Demo Data Loaded", "Sample entries have been added for this month.");
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your tiffin entries. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearData();
            Alert.alert("Data Cleared", "All entries have been deleted.");
          },
        },
      ]
    );
  };

  const handleExportBackup = async () => {
    try {
      const data = await exportAllData();
      const success = await exportJSON(data);
      if (!success) {
        Alert.alert("Export Failed", "Unable to export backup. Please try again.");
      }
    } catch (error) {
      Alert.alert("Export Error", "An error occurred while exporting the backup.");
    }
  };

  const handleCurrencySelect = (code: string) => {
    setCurrency(code);
    setCurrencyModalVisible(false);
  };

  const getCurrencySymbol = (code: string) => {
    const curr = CURRENCIES.find((c) => c.code === code);
    return curr?.symbol || code;
  };

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h3" style={styles.title}>
        Settings
      </ThemedText>

      <View style={styles.section}>
        <ThemedText type="headline" style={styles.sectionTitle}>
          Profile
        </ThemedText>
        <View style={[styles.inputGroup, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="body">Display Name</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="headline" style={styles.sectionTitle}>
          Currency
        </ThemedText>
        <Pressable
          onPress={() => setCurrencyModalVisible(true)}
          style={({ pressed }) => [
            styles.currencySelector,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.currencyInfo}>
            <ThemedText type="h3">{getCurrencySymbol(currency)}</ThemedText>
            <ThemedText type="body">
              {CURRENCIES.find((c) => c.code === currency)?.name || currency}
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText type="headline" style={styles.sectionTitle}>
          Pricing
        </ThemedText>
        <View style={[styles.inputGroup, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.priceRow}>
            <ThemedText type="body">Half Portion Price</ThemedText>
            <View style={styles.priceInputContainer}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {getCurrencySymbol(currency)}
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
                placeholder="50"
                placeholderTextColor={theme.textSecondary}
                value={halfPrice}
                onChangeText={setHalfPrice}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.priceRow}>
            <ThemedText type="body">Full Portion Price</ThemedText>
            <View style={styles.priceInputContainer}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {getCurrencySymbol(currency)}
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
                placeholder="60"
                placeholderTextColor={theme.textSecondary}
                value={fullPrice}
                onChangeText={setFullPrice}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
        <Button onPress={handleSaveSettings} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </View>

      <View style={styles.section}>
        <ThemedText type="headline" style={styles.sectionTitle}>
          Data Management
        </ThemedText>

        <Pressable
          onPress={handleLoadDemoData}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.actionButtonContent}>
            <Feather name="database" size={20} color={theme.text} />
            <ThemedText type="body">Load Demo Data</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={handleExportBackup}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.actionButtonContent}>
            <Feather name="download" size={20} color={theme.text} />
            <ThemedText type="body">Export Backup (JSON)</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={handleClearData}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.actionButtonContent}>
            <Feather name="trash-2" size={20} color={theme.destructive} />
            <ThemedText type="body" style={{ color: theme.destructive }}>
              Clear All Data
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
          TiffinTracker v{appVersion}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
          Your tiffin data is stored locally on your device.
        </ThemedText>
      </View>

      <Modal
        visible={currencyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">Select Currency</ThemedText>
              <Pressable
                onPress={() => setCurrencyModalVisible(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleCurrencySelect(item.code)}
                  style={({ pressed }) => [
                    styles.currencyOption,
                    {
                      backgroundColor:
                        currency === item.code
                          ? theme.backgroundSecondary
                          : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View style={styles.currencyOptionContent}>
                    <ThemedText type="h4">{item.symbol}</ThemedText>
                    <View>
                      <ThemedText type="body">{item.name}</ThemedText>
                      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                        {item.code}
                      </ThemedText>
                    </View>
                  </View>
                  {currency === item.code && (
                    <Feather name="check" size={20} color={theme.accent} />
                  )}
                </Pressable>
              )}
            />
          </ThemedView>
        </View>
      </Modal>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  inputGroup: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    fontSize: 16,
  },
  currencySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  currencyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
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
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  footer: {
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  currencyOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.1)",
  },
  currencyOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
});
