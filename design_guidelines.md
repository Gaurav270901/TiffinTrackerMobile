# TiffinTracker Design Guidelines

## Architecture Decisions

### Authentication
**No Authentication Required**
- This is a single-user, offline-first utility app with local-only data storage
- Include a **Settings screen** with:
  - Display name field (optional, defaults to "User")
  - Currency preference (default: INR)
  - Half/Full price configuration
  - Demo data toggle and clear all data options
  - App version info

### Navigation
**Tab Navigation (4 tabs + Floating Action Button)**

Root navigation uses a tab bar with 4 tabs:
1. **Today** (Home icon) - Quick entry for current date
2. **Calendar** (Calendar icon) - Monthly view
3. **Reports** (Bar Chart icon) - Analytics and export
4. **Settings** (Settings icon) - Preferences

**Floating Action Button**: Positioned above the tab bar, center-aligned, for "Quick Add" to jump to today's entry from any screen.

### Screen Specifications

#### 1. Today Screen (Quick Entry)
- **Purpose**: Fast input for today's lunch and dinner
- **Layout**:
  - Header: Transparent, shows today's date in large format ("Friday, Jan 17")
  - Main content: ScrollView with top inset of headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Components**:
  - Two card sections (Lunch, Dinner), each containing:
    - Meal label with small current price indicator
    - Segmented control with 3 large buttons: None, Half, Full
    - Optional notes icon (right-aligned) that expands inline text input
  - Auto-saves on selection change (with subtle success feedback)
  - Visual confirmation: selected button has accent color fill, unselected have outline only
- **Safe Area**: Top inset = headerHeight + Spacing.xl, Bottom = tabBarHeight + Spacing.xl

#### 2. Calendar Screen
- **Purpose**: View monthly history with visual indicators
- **Layout**:
  - Header: Month/year title with left/right arrows to navigate months
  - Main content: Calendar grid (7x5 or 7x6 depending on month)
  - Bottom inset: tabBarHeight + Spacing.xl
- **Components**:
  - Date cells show:
    - Day number (top)
    - Two small horizontal bars or dots stacked vertically (lunch above dinner)
    - Color coding: Grey = None, Yellow = Half, Green = Full
  - Tap cell to navigate to Day Detail screen (modal)
  - Current date has subtle border highlight
  - Future dates appear dimmed/disabled
- **Safe Area**: Top inset = Spacing.xl, Bottom = tabBarHeight + Spacing.xl

#### 3. Day Detail Screen (Modal)
- **Purpose**: Edit/view specific day's entries and notes
- **Layout**:
  - Header: Standard navigation with date as title, "Cancel" left, "Save" right
  - Main content: Scrollable form
  - Bottom inset: insets.bottom + Spacing.xl (no tab bar visible in modal)
- **Components**:
  - Date display (non-editable, prominent)
  - Lunch section: segmented control + manual price override field (optional) + notes field
  - Dinner section: segmented control + manual price override field (optional) + notes field
  - Delete button at bottom (destructive style, requires confirmation alert)
- **Safe Area**: Top inset = Spacing.xl, Bottom = insets.bottom + Spacing.xl

#### 4. Reports Screen
- **Purpose**: View analytics and export data
- **Layout**:
  - Header: "Reports" title, "Export" button on right
  - Main content: ScrollView with top inset of headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Components**:
  - Date range picker (preset buttons: This Month, Last Month, Custom)
  - Stats cards showing:
    - Lunch counts (None/Half/Full with colored icons)
    - Dinner counts (None/Half/Full with colored icons)
    - Total amounts (Lunch, Dinner, Grand Total) in large numbers
  - Export CSV button triggers native share dialog
- **Safe Area**: Top inset = headerHeight + Spacing.xl, Bottom = tabBarHeight + Spacing.xl

#### 5. Settings Screen
- **Purpose**: Configure app preferences
- **Layout**:
  - Header: Standard with "Settings" title
  - Main content: Grouped list/form
  - Bottom inset: tabBarHeight + Spacing.xl
- **Components**:
  - Display name input
  - Currency selector
  - Half price input (number)
  - Full price input (number)
  - Demo data section: "Load Demo Data" and "Clear All Data" buttons
  - App version (footer text)
- **Safe Area**: Top inset = Spacing.xl, Bottom = tabBarHeight + Spacing.xl

## Design System

### Color Palette
**Primary Colors**:
- Accent: #2ECC71 (Green - represents "Full", positive actions)
- Secondary: #F39C12 (Yellow/Orange - represents "Half")
- Neutral: #95A5A6 (Grey - represents "None")

**Semantic Colors**:
- Background: #FFFFFF (light mode), #1C1C1E (dark mode)
- Surface: #F8F9FA (light mode), #2C2C2E (dark mode)
- Text Primary: #2C3E50 (light mode), #FFFFFF (dark mode)
- Text Secondary: #7F8C8D (light mode), #98989D (dark mode)
- Border: #E8E8E8 (light mode), #38383A (dark mode)
- Destructive: #E74C3C

### Typography
- **Large Title**: 34pt, Bold - for date displays on Today screen
- **Title**: 28pt, Semibold - for screen headers
- **Headline**: 20pt, Semibold - for card/section headers
- **Body**: 17pt, Regular - for default text
- **Callout**: 16pt, Regular - for secondary info
- **Caption**: 13pt, Regular - for labels and hints
- **Currency amounts**: Tabular numbers for proper alignment

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- xxl: 32px

### Component Specifications

**Segmented Control (None/Half/Full)**:
- Height: 56px (highly tappable)
- Each button: equal width, rounded corners (12px)
- Unselected: outline with 2px border in theme color
- Selected: filled background with theme color, white text
- Font: 18pt Semibold
- Include subtle haptic feedback on selection

**Cards**:
- Background: Surface color
- Border radius: 16px
- Padding: lg (16px)
- Shadow: ONLY for floating action button
- Margin between cards: md (12px)

**Calendar Date Cells**:
- Size: 48x56px minimum
- Indicators: 16x4px rounded rectangles, 2px spacing between lunch/dinner bars
- Day number: 17pt Regular
- Current date: 2px border in accent color

**Floating Action Button**:
- Size: 56x56px circle
- Background: Accent color (#2ECC71)
- Icon: Plus or TodayIcon in white
- Position: bottom center, 16px above tab bar
- Shadow specifications:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2

**Input Fields**:
- Height: 44px
- Border radius: 8px
- Border: 1px solid Border color
- Padding: sm horizontal
- Focus state: accent color border

### Visual Design
- Use Feather icons from @expo/vector-icons for all UI elements
- No emojis in the application
- All buttons have press state with 0.7 opacity
- Success feedback: brief green checkmark overlay or subtle bottom toast
- Error states: red border on inputs, alert dialogs for destructive actions
- Loading states: native iOS/Android activity indicators

### Interaction Design
- **Pull-to-refresh**: On Calendar screen to refresh month data
- **Swipe gestures**: None (avoid conflicts with navigation)
- **Haptic feedback**: On segmented button selections and delete confirmations
- **Auto-save**: Quick entry saves immediately on selection (no explicit save button needed)
- **Confirmation dialogs**: Required for "Delete Day Entry" and "Clear All Data"

### Accessibility
- All touchable elements minimum 44x44pt
- Color is not the only indicator (use text labels with colored bars)
- Support VoiceOver/TalkBack with descriptive labels:
  - "Lunch: Half portion, 50 rupees"
  - "January 15th: Full lunch, Half dinner"
- Dynamic type support for text scaling
- Sufficient color contrast (WCAG AA minimum)
- Tab bar labels always visible (not icon-only)

### Assets Required
None. This app uses system icons exclusively (Feather icon set) for a clean, minimal look.