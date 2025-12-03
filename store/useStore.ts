import { create } from "zustand";
import { DayEntry, Settings, MealType, ReportData, DateRange } from "@/types";
import {
  getEntryByDate,
  upsertEntry,
  deleteEntry,
  getEntriesInRange,
  getSettings,
  updateSettings,
  clearAllData,
  seedDemoData,
  getAllEntries,
} from "@/db/database";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";

interface AppState {
  todayEntry: DayEntry | null;
  selectedDate: string;
  selectedEntry: DayEntry | null;
  settings: Settings;
  isLoading: boolean;
  calendarEntries: Map<string, DayEntry>;
  currentMonth: Date;

  initialize: () => Promise<void>;
  loadTodayEntry: () => Promise<void>;
  updateTodayLunch: (type: MealType) => Promise<void>;
  updateTodayDinner: (type: MealType) => Promise<void>;
  updateTodayNotes: (notes: string) => Promise<void>;

  loadEntry: (date: string) => Promise<void>;
  updateEntry: (entry: Partial<DayEntry> & { date: string }) => Promise<void>;
  removeEntry: (date: string) => Promise<void>;

  loadCalendarEntries: (month: Date) => Promise<void>;
  setCurrentMonth: (month: Date) => void;

  generateReport: (startDate: string, endDate: string) => Promise<ReportData>;
  getDateRangeForPreset: (preset: DateRange) => { start: string; end: string };

  loadSettings: () => Promise<void>;
  saveSettings: (settings: Partial<Settings>) => Promise<void>;
  loadDemoData: () => Promise<void>;
  clearData: () => Promise<void>;

  exportAllData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  todayEntry: null,
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  selectedEntry: null,
  settings: {
    halfPrice: 50,
    fullPrice: 60,
    currency: "INR",
    displayName: "User",
    hasDemoData: false,
  },
  isLoading: true,
  calendarEntries: new Map(),
  currentMonth: new Date(),

  initialize: async () => {
    set({ isLoading: true });
    try {
      await get().loadSettings();
      await get().loadTodayEntry();
      await get().loadCalendarEntries(new Date());
    } finally {
      set({ isLoading: false });
    }
  },

  loadTodayEntry: async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const entry = await getEntryByDate(today);
    set({ todayEntry: entry, selectedDate: today });
  },

  updateTodayLunch: async (type: MealType) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const entry = await upsertEntry({
      date: today,
      lunchType: type,
    });
    set({ todayEntry: entry });
    const entries = new Map(get().calendarEntries);
    entries.set(today, entry);
    set({ calendarEntries: entries });
  },

  updateTodayDinner: async (type: MealType) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const entry = await upsertEntry({
      date: today,
      dinnerType: type,
    });
    set({ todayEntry: entry });
    const entries = new Map(get().calendarEntries);
    entries.set(today, entry);
    set({ calendarEntries: entries });
  },

  updateTodayNotes: async (notes: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const entry = await upsertEntry({
      date: today,
      notes,
    });
    set({ todayEntry: entry });
    const entries = new Map(get().calendarEntries);
    entries.set(today, entry);
    set({ calendarEntries: entries });
  },

  loadEntry: async (date: string) => {
    const entry = await getEntryByDate(date);
    set({ selectedDate: date, selectedEntry: entry });
  },

  updateEntry: async (entryData) => {
    const entry = await upsertEntry(entryData);
    set({ selectedEntry: entry });

    const today = format(new Date(), "yyyy-MM-dd");
    if (entryData.date === today) {
      set({ todayEntry: entry });
    }

    const entries = new Map(get().calendarEntries);
    entries.set(entry.date, entry);
    set({ calendarEntries: entries });
  },

  removeEntry: async (date: string) => {
    await deleteEntry(date);
    const today = format(new Date(), "yyyy-MM-dd");
    if (date === today) {
      set({ todayEntry: null });
    }
    set({ selectedEntry: null });

    const entries = new Map(get().calendarEntries);
    entries.delete(date);
    set({ calendarEntries: entries });
  },

  loadCalendarEntries: async (month: Date) => {
    const start = format(startOfMonth(month), "yyyy-MM-dd");
    const end = format(endOfMonth(month), "yyyy-MM-dd");
    const entries = await getEntriesInRange(start, end);

    const entriesMap = new Map<string, DayEntry>();
    entries.forEach((entry) => {
      entriesMap.set(entry.date, entry);
    });
    set({ calendarEntries: entriesMap });
  },

  setCurrentMonth: (month: Date) => {
    set({ currentMonth: month });
    get().loadCalendarEntries(month);
  },

  generateReport: async (startDate: string, endDate: string): Promise<ReportData> => {
    const entries = await getEntriesInRange(startDate, endDate);
    const settings = get().settings;

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
  },

  getDateRangeForPreset: (preset: DateRange) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (preset) {
      case "thisMonth":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "lastMonth":
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return {
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    };
  },

  loadSettings: async () => {
    const settings = await getSettings();
    set({ settings });
  },

  saveSettings: async (newSettings: Partial<Settings>) => {
    const settings = await updateSettings(newSettings);
    set({ settings });
  },

  loadDemoData: async () => {
    set({ isLoading: true });
    try {
      await seedDemoData();
      await get().loadSettings();
      await get().loadTodayEntry();
      await get().loadCalendarEntries(get().currentMonth);
    } finally {
      set({ isLoading: false });
    }
  },

  clearData: async () => {
    set({ isLoading: true });
    try {
      await clearAllData();
      set({
        todayEntry: null,
        selectedEntry: null,
        calendarEntries: new Map(),
      });
      await get().loadSettings();
    } finally {
      set({ isLoading: false });
    }
  },

  exportAllData: async (): Promise<string> => {
    const entries = await getAllEntries();
    const settings = get().settings;
    return JSON.stringify({ entries, settings }, null, 2);
  },

  importData: async (jsonData: string) => {
    set({ isLoading: true });
    try {
      const data = JSON.parse(jsonData);
      if (data.settings) {
        await updateSettings(data.settings);
      }
      if (data.entries && Array.isArray(data.entries)) {
        for (const entry of data.entries) {
          await upsertEntry(entry);
        }
      }
      await get().loadSettings();
      await get().loadTodayEntry();
      await get().loadCalendarEntries(get().currentMonth);
    } finally {
      set({ isLoading: false });
    }
  },
}));
