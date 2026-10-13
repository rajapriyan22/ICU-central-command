# ICU Central Command - Design System & UI Rules

## 1. Design Philosophy
The UI represents a **Premium Modern Hospital Command-Center SaaS**.
- Clean, restrained, information-dense layouts.
- White card surfaces with very light healthcare background (`#F8FAFC`).
- Restrained Medical Blue (`#2563EB`) as primary brand color.
- Consistent visual semantics for ICU Bed and Patient status across every page.
- Accessible typography with high contrast for critical healthcare metrics.

---

## 2. Color Palette & Visual Semantics

### Neutral Backgrounds & Surfaces
- **Page Background**: `#F8FAFC` (`bg-slate-50`)
- **Card Surface**: `#FFFFFF` (`bg-white`)
- **Borders**: `#E2E8F0` (`border-slate-200`)
- **Primary Text**: `#0F172A` (`text-slate-900`)
- **Muted Text**: `#64748B` (`text-slate-500`)

### Brand & Interactive Colors
- **Primary Brand**: `#2563EB` (`bg-blue-600` / `text-blue-600`)
- **Primary Hover**: `#1D4ED8` (`bg-blue-700`)
- **Primary Light**: `#EFF6FF` (`bg-blue-50`)

### Bed-State Awareness (Strict Visual Semantics)
- **`AVAILABLE`**: Emerald Green
  - Badge: `bg-emerald-100 text-emerald-700 border-emerald-200`
  - Indicator: `bg-emerald-500`
- **`OCCUPIED`**: Medical Blue
  - Badge: `bg-blue-100 text-blue-700 border-blue-200`
  - Indicator: `bg-blue-500`
- **`CLEANING`**: Operational Amber
  - Badge: `bg-amber-100 text-amber-700 border-amber-200`
  - Indicator: `bg-amber-500`
- **`MAINTENANCE`**: Warning Red
  - Badge: `bg-rose-100 text-rose-700 border-rose-200`
  - Indicator: `bg-rose-500`

### Patient Condition Semantics
- **`CRITICAL`**: Rose (`bg-rose-100 text-rose-700 border-rose-200`)
- **`STABLE`**: Emerald (`bg-emerald-100 text-emerald-700 border-emerald-200`)
- **`GUARDED`**: Amber (`bg-amber-100 text-amber-700 border-amber-200`)

---

## 3. Typography & Spacing
- **Font Family**: Inter, system-ui, sans-serif
- **Page Titles**: `text-2xl font-bold text-slate-900 tracking-tight`
- **Section Headers**: `text-sm font-bold text-slate-900`
- **Body / Metadata**: `text-xs text-slate-600 font-medium`
- **Badges**: `text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full`

---

## 4. Component Design Guidelines

### Cards
- White background (`bg-white`), rounded borders (`rounded-2xl`), subtle border (`border border-slate-200/80`), subtle shadow (`shadow-xs`), hover elevation (`hover:shadow-md`).

### Buttons
- **Primary Action**: `bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs px-4 py-2 shadow-xs transition-all active:scale-95`
- **Secondary Action**: `bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs px-3.5 py-2`

### Modals
- Semi-transparent backdrop (`bg-slate-900/40 backdrop-blur-xs`), white dialog box (`bg-white rounded-2xl border border-slate-200 shadow-2xl`), clean header divider, explicit validation messages.

---

## 5. Architectural Honesty
- **Telemetry Data**: Always display the prominent `"DEMO / SIMULATION DATA"` badge on `/vitals`. Never claim real medical device or AI clinical integration.
