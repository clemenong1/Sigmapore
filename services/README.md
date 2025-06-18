# Stats Module

This directory contains all health statistics services and data for the SigmaPulse health monitoring app.

## Structure

```
stats/
├── services/          # Health data processing services
│   ├── dengueService.ts   # Dengue cluster data processing
│   ├── psiService.js      # Air quality (PSI) data processing  
│   └── covidService.js    # COVID-19 hospital data processing
├── data/              # Raw health data files
│   ├── dengueData.ts      # Dengue cluster data wrapper
│   ├── DENGUECLUSTER.json # Official government dengue clusters
│   ├── PollutantStandardsIndexPSI.json # PSI air quality specifications

└── index.ts           # Module exports
```

## Services

### Dengue Service (`dengueService.ts`)
- Processes official Singapore government dengue cluster data
- Provides 23 real dengue clusters with case counts, locations, and risk levels
- Methods: `getDengueClusters()`, `getTotalCases()`, `getHighRiskClusters()`

### PSI Service (`psiService.js`)
- Fetches real-time air quality data from Singapore NEA API
- Covers 5 regions: North, South, East, West, Central
- Tracks 6 pollutants: CO, SO₂, NO₂, PM2.5, PM10, O₃
- Methods: `fetchLatestPSI()`, `fetchPSIByDate()`

### COVID Service (`covidService.js`)
- Processes COVID-19 hospital admission data
- Covers 8 hospitals with 77 total cases
- Methods: `getCovidCases()`, `getHospitalStats()`

## Data Sources

- **Dengue**: Official Singapore government GeoJSON data
- **PSI**: Live NEA API (api-open.data.gov.sg)
- **COVID-19**: KML file with historical hospital admission locations

## Usage

```typescript
import { dengueService, psiService, covidService } from '../services';

// Get dengue clusters
const clusters = await dengueService.getDengueClusters();

// Get air quality data
const psiData = await psiService.fetchLatestPSI();

// Get COVID-19 hospital data
const covidData = await covidService.getCovidCases();
``` 