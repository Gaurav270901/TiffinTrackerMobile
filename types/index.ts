export type MealType = "None" | "Half" | "Full";

export interface DayEntry {
  id: string;
  date: string;
  lunchType: MealType;
  dinnerType: MealType;
  lunchPrice: number | null;
  dinnerPrice: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  halfPrice: number;
  fullPrice: number;
  currency: string;
  displayName: string;
  hasDemoData: boolean;
}

export interface ReportData {
  startDate: string;
  endDate: string;
  lunchCounts: {
    none: number;
    half: number;
    full: number;
  };
  dinnerCounts: {
    none: number;
    half: number;
    full: number;
  };
  totalLunchAmount: number;
  totalDinnerAmount: number;
  grandTotal: number;
  entries: DayEntry[];
}

export type DateRange = "thisMonth" | "lastMonth" | "custom";
