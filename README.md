# Intelligent Hazard-Based Red-Zone Identification, Carrying Capacity Assessment and Safe Relocation

A GIS-based disaster-risk decision-support prototype that identifies potentially high-risk areas, analyses population exposure, evaluates candidate safe locations, estimates shelter capacity, and suggests possible relocation routes.

> **Disclaimer:** This is a prototype using synthetic demo data. It supports human decision-making and must not be used to predict disasters, issue evacuation orders, or as the sole basis for any operational decision.

## Features

- **Overview Dashboard** — Summary stats, risk zone distribution, population exposure charts, data quality indicators, and active alerts.
- **Interactive Risk Map** — Leaflet-based map with risk zones, shelters, roads, rivers, layer toggles, and a legend. Click zones for factor breakdowns.
- **Data Upload & Validation** — Upload CSV and GeoJSON files with automatic validation (file types, required columns, missing values, coordinate ranges, duplicate IDs). Download sample templates.
- **Hazard Assessment** — Transparent rule-based risk scoring with configurable factor weights. Radar charts for factor contributions. Optional Random Forest ML model toggle.
- **Shelter Capacity Assessment** — Detailed shelter table with capacity, amenities, verification status, and capacity gap analysis.
- **Safe Location & Route Suggestions** — Ranked candidate shelters with suggested relocation routes (all marked unverified).
- **Reports & Methodology** — Export CSV summaries (risk zones, population exposure, shelter rankings, capacity gaps) and review the scoring methodology and limitations.

## Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Mapping:** Leaflet + react-leaflet (OpenStreetMap tiles)
- **Charts:** Recharts
- **Data parsing:** PapaParse

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

### Type checking

```bash
npm run typecheck
```

## Sample Data

The application comes with pre-loaded synthetic demo data for a fictional "Brahmaputra Valley" study area, including:

- 10 risk zones across flood, heat, and landslide hazards
- 7 candidate shelters with varying verification status
- 5 road segments and 2 river segments
- Generated alerts for high-risk zones, capacity gaps, and unverified shelters

### Replacing Demo Data with Real Data

1. Go to **Data Upload & Validation** page.
2. Download the CSV/GeoJSON templates to see the expected format.
3. Replace the template content with your real data maintaining the same column structure.
4. Upload your files — they will be validated automatically.

### Data Sources for Real Datasets

- **Rainfall/Temperature:** India Meteorological Department (IMD), NOAA
- **Population:** Census of India, WorldPop
- **Historical disasters:** National Disaster Management Authority (NDMA), DesInventar
- **Elevation:** USGS SRTM, CartoDEM
- **Roads/Rivers:** OpenStreetMap, Survey of India
- **Shelters:** District administration records

## Risk Scoring Method

### Rule-Based Scoring (default)

Each factor contributes proportionally to its weight:

```
Risk Score = Σ(factor_normalized_value × weight) × 100
```

Factor weights are hazard-specific and user-adjustable on the Hazard Assessment page.

**Classification thresholds:**
- Score ≥ 65: Potential High Risk
- Score 40–64: Medium Risk
- Score < 40: Lower Relative Risk

These are **screening categories**, not official hazard classifications.

### Random Forest (optional)

When sufficient labelled training data is available, a Random Forest classifier can be trained. In this prototype, you can toggle the ML model on the Hazard Assessment page to simulate this mode.

## Limitations

1. Risk scores depend on data quality and completeness.
2. No historical disaster record does not mean no risk.
3. The system supports human decision-making — it does not issue evacuation orders.
4. All routes are unverified until road conditions are confirmed.
5. Not every school, hospital, or public building is an approved evacuation shelter.
6. Capacity calculations require reliable total capacity and occupancy data.
7. Insufficient data is shown as such, not assumed safe.

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx          # Sidebar navigation + main layout
│   ├── MapView.tsx         # Leaflet map component
│   └── shared.tsx          # Reusable UI components (cards, badges, alerts)
├── context/
│   └── AppContext.tsx      # Global state management
├── data/
│   └── demoData.ts         # Synthetic demo data
├── pages/
│   ├── OverviewDashboard.tsx
│   ├── RiskMapPage.tsx
│   ├── DataUploadPage.tsx
│   ├── HazardAssessmentPage.tsx
│   ├── ShelterCapacityPage.tsx
│   ├── SafeLocationPage.tsx
│   └── ReportsPage.tsx
├── types/
│   └── index.ts            # TypeScript type definitions
├── utils/
│   ├── dataUtils.ts        # CSV validation, file download, templates
│   └── riskUtils.ts        # Risk scoring, shelter ranking, capacity calc
├── App.tsx
├── main.tsx
└── index.css
```

## Testing

1. **Navigation:** Click through all 7 pages in the sidebar.
2. **Hazard switching:** Change hazard type (Flood/Heat/Landslide/Other) and verify the dashboard updates.
3. **Map interaction:** Click risk zones and shelters on the map to see popups and detail panels.
4. **Layer toggles:** Toggle risk zones, shelters, roads, rivers, and boundary on the Risk Map page.
5. **Data upload:** Download templates, re-upload them, and verify validation messages.
6. **Risk scoring:** Adjust factor weights and observe score changes. Toggle the ML model.
7. **Shelter ranking:** Select a high-risk zone and view ranked shelters with route suggestions.
8. **Reports:** Export CSV files and verify content.
9. **Responsive:** Resize the browser to test mobile layout.

## License

This is an educational prototype for a B.Tech mini project.
