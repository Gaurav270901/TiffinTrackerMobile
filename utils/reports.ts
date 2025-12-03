import { DayEntry, Settings, ReportData } from "@/types";
import { format, parseISO } from "date-fns";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export function calculateReportFromEntries(
  entries: DayEntry[],
  settings: Settings,
  startDate: string,
  endDate: string
): ReportData {
  const lunchCounts = { none: 0, half: 0, full: 0 };
  const dinnerCounts = { none: 0, half: 0, full: 0 };
  let totalLunchAmount = 0;
  let totalDinnerAmount = 0;

  entries.forEach((entry) => {
    switch (entry.lunchType) {
      case "None":
        lunchCounts.none++;
        break;
      case "Half":
        lunchCounts.half++;
        totalLunchAmount += entry.lunchPrice ?? settings.halfPrice;
        break;
      case "Full":
        lunchCounts.full++;
        totalLunchAmount += entry.lunchPrice ?? settings.fullPrice;
        break;
    }

    switch (entry.dinnerType) {
      case "None":
        dinnerCounts.none++;
        break;
      case "Half":
        dinnerCounts.half++;
        totalDinnerAmount += entry.dinnerPrice ?? settings.halfPrice;
        break;
      case "Full":
        dinnerCounts.full++;
        totalDinnerAmount += entry.dinnerPrice ?? settings.fullPrice;
        break;
    }
  });

  return {
    startDate,
    endDate,
    lunchCounts,
    dinnerCounts,
    totalLunchAmount,
    totalDinnerAmount,
    grandTotal: totalLunchAmount + totalDinnerAmount,
    entries,
  };
}

export function generateCSV(report: ReportData, settings: Settings): string {
  const currencySymbol = settings.currency === "INR" ? "Rs." : settings.currency;

  let csv = "TiffinTracker Report\n";
  csv += `Period: ${formatDate(report.startDate)} to ${formatDate(report.endDate)}\n\n`;

  csv += "Summary\n";
  csv += "Category,None,Half,Full,Total Amount\n";
  csv += `Lunch,${report.lunchCounts.none},${report.lunchCounts.half},${report.lunchCounts.full},${currencySymbol}${report.totalLunchAmount}\n`;
  csv += `Dinner,${report.dinnerCounts.none},${report.dinnerCounts.half},${report.dinnerCounts.full},${currencySymbol}${report.totalDinnerAmount}\n`;
  csv += `Grand Total,,,,${currencySymbol}${report.grandTotal}\n\n`;

  csv += "Daily Entries\n";
  csv += "Date,Lunch Type,Lunch Price,Dinner Type,Dinner Price,Notes\n";

  report.entries.forEach((entry) => {
    const lunchPrice = getLunchPrice(entry, settings);
    const dinnerPrice = getDinnerPrice(entry, settings);
    csv += `${formatDate(entry.date)},${entry.lunchType},${lunchPrice},${entry.dinnerType},${dinnerPrice},"${entry.notes.replace(/"/g, '""')}"\n`;
  });

  return csv;
}

function getLunchPrice(entry: DayEntry, settings: Settings): number {
  if (entry.lunchType === "None") return 0;
  if (entry.lunchPrice !== null) return entry.lunchPrice;
  return entry.lunchType === "Half" ? settings.halfPrice : settings.fullPrice;
}

function getDinnerPrice(entry: DayEntry, settings: Settings): number {
  if (entry.dinnerType === "None") return 0;
  if (entry.dinnerPrice !== null) return entry.dinnerPrice;
  return entry.dinnerType === "Half" ? settings.halfPrice : settings.fullPrice;
}

function formatDate(dateString: string): string {
  return format(parseISO(dateString), "dd MMM yyyy");
}

export async function exportCSV(
  report: ReportData,
  settings: Settings
): Promise<boolean> {
  const csv = generateCSV(report, settings);
  const filename = `TiffinTracker_${report.startDate}_to_${report.endDate}.csv`;

  if (Platform.OS === "web") {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }

  try {
    // On Android, try using the Storage Access Framework so the user can choose
    // a folder (e.g. Downloads) and the file is actually saved to visible storage.
    if (Platform.OS === "android") {
      const SAF = (FileSystem as any).StorageAccessFramework;
      if (SAF) {
        const permissions = await SAF.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const baseUri = permissions.directoryUri;
          const fileUri = await SAF.createFileAsync(baseUri, filename, "text/csv");
          await FileSystem.writeAsStringAsync(fileUri, csv, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          return true;
        }
        // If the user cancels the folder picker, fall through to the sharing flow.
      }
    }

    // Fallback: save into the app's documents directory and open the share sheet
    const fileUri = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export Tiffin Report",
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return false;
  }
}

export async function exportJSON(data: string): Promise<boolean> {
  const filename = `TiffinTracker_Backup_${format(new Date(), "yyyy-MM-dd")}.json`;

  if (Platform.OS === "web") {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }

  try {
    const fileUri = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, data, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Export TiffinTracker Backup",
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error exporting JSON:", error);
    return false;
  }
}
