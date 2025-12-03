# TiffinTracker Mobile App

## Overview
TiffinTracker is a single-user, offline-first mobile app to track daily tiffin for both lunch and dinner. Built with Expo (React Native) and TypeScript, using SQLite for local storage.

## Recent Changes
- December 2024: Initial implementation with full feature set
  - Quick entry for today's meals
  - Monthly calendar view with dual indicators
  - Reports with date range selection and CSV export
  - Settings for price configuration
  - Demo data seeding functionality

## Project Architecture

### Tech Stack
- **Framework**: Expo SDK 54 with React Native
- **Language**: TypeScript
- **Navigation**: React Navigation 7 (Bottom Tabs)
- **State Management**: Zustand
- **Database**: expo-sqlite (local SQLite)
- **Date Handling**: date-fns

### Directory Structure
```
/
├── App.tsx                 # Root component with providers
├── app.json               # Expo configuration
├── components/            # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── CalendarGrid.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   ├── HeaderTitle.tsx
│   ├── MealCard.tsx
│   ├── ScreenFlatList.tsx
│   ├── ScreenKeyboardAwareScrollView.tsx
│   ├── ScreenScrollView.tsx
│   ├── SegmentedControl.tsx
│   ├── Spacer.tsx
│   ├── StatCard.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── constants/
│   └── theme.ts           # Design tokens (colors, spacing, typography)
├── db/
│   └── database.ts        # SQLite database operations
├── hooks/
│   ├── useColorScheme.ts
│   ├── useScreenInsets.ts
│   └── useTheme.ts
├── navigation/
│   ├── MainTabNavigator.tsx  # Main 4-tab navigation
│   └── screenOptions.ts
├── screens/
│   ├── TodayScreen.tsx    # Quick entry for today
│   ├── CalendarScreen.tsx # Monthly view with day detail modal
│   ├── ReportsScreen.tsx  # Analytics and CSV export
│   └── SettingsScreen.tsx # Preferences and data management
├── store/
│   └── useStore.ts        # Zustand state management
├── types/
│   └── index.ts           # TypeScript type definitions
└── utils/
    └── reports.ts         # Report calculations and CSV generation
```

### Data Model
- **DayEntry**: Per-calendar-date entry with lunch/dinner types, optional price overrides, notes
- **Settings**: Half/full prices, currency, display name, demo data flag
- **MealType**: "None" | "Half" | "Full"

### Key Features
1. **Today Screen**: Quick entry with segmented buttons for lunch/dinner
2. **Calendar Screen**: Monthly grid with color-coded meal indicators
3. **Reports Screen**: Date range selection with counts and totals
4. **Settings Screen**: Price configuration and data management

### Color Coding
- Grey: None
- Yellow/Orange: Half
- Green: Full

## User Preferences
- Currency: INR (Indian Rupees) by default
- Default prices: Half = ₹50, Full = ₹60
- All data stored locally (offline-first)

## Running the App
```bash
npm install
npm run dev
```

Scan QR code with Expo Go to test on physical device.

## Notes
- Dates stored as YYYY-MM-DD strings to avoid timezone issues
- Auto-saves on selection change (no explicit save button on Today screen)
- CSV export uses native share dialog on mobile, download on web
