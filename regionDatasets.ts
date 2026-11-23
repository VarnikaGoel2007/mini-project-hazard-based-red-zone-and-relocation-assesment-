export interface RegionDataset {
  id: string;
  name: string;
  description: string;
  center: [number, number];
  files: {
    rainfall: string;
    population: string;
    historical: string;
    shelters: string;
    infrastructure: string;
  };
  geojson: {
    study_area: object;
    roads: object;
    rivers: object;
  };
}

export const REGION_DATASETS: RegionDataset[] = [
  {
    id: 'coastal-odisha',
    name: 'Coastal Odisha — Cyclone & Flood Zone',
    description: 'Coastal district prone to cyclones, storm surges, and river flooding. Synthetic data around Cuttack–Bhubaneswar.',
    center: [20.46, 85.88],
    files: {
      rainfall: `station_id,latitude,longitude,annual_rainfall_mm,monsoon_rainfall_mm,date_recorded
OD-ST001,20.52,85.82,1650,1250,2024-08-15
OD-ST002,20.48,85.88,1520,1180,2024-08-15
OD-ST003,20.42,85.92,1380,1020,2024-08-15
OD-ST004,20.38,85.85,1450,1100,2024-08-15
OD-ST005,20.45,85.78,1720,1300,2024-08-15
OD-ST006,20.50,85.95,1400,1050,2024-08-15
OD-ST007,20.35,85.95,1280,950,2024-08-15
OD-ST008,20.55,85.75,1850,1400,2024-08-15`,

      population: `zone_id,zone_name,latitude,longitude,population,area_km2,density_per_km2,vulnerability_index
OD-RZ01,Coastal Mahanadi Belt,20.52,85.82,18500,5.2,3558,0.82
OD-RZ02,Riverside Cuttack,20.48,85.88,22000,4.8,4583,0.78
OD-RZ03,Lowland Delta Sector,20.42,85.92,14200,6.0,2367,0.75
OD-RZ04,Inland Bhubaneswar,20.38,85.85,35000,8.5,4118,0.55
OD-RZ05,West Farmlands,20.45,85.78,7800,5.5,1418,0.62
OD-RZ06,East Coastal Strip,20.50,85.95,9200,3.2,2875,0.85
OD-RZ07,South Mangrove Buffer,20.35,85.95,3200,7.0,457,0.45
OD-RZ08,North Upland Fringe,20.55,85.75,5600,4.0,1400,0.38`,

      historical: `event_id,event_type,latitude,longitude,date,severity,affected_population,damage_description
OD-EV01,Cyclone,20.52,85.82,2019-05-03,severe,45000,Phailin cyclone storm surge
OD-EV02,Flood,20.48,85.88,2020-08-12,severe,30000,Mahanadi overflow into city
OD-EV03,Flood,20.42,85.92,2021-07-28,moderate,18000,Delta flooding
OD-EV04,Cyclone,20.50,85.95,2018-10-11,severe,25000,Titli cyclone coastal damage
OD-EV05,Flood,20.45,85.78,2022-09-05,moderate,8000,Riverside farmland flooding
OD-EV06,Heat,20.38,85.85,2023-06-19,moderate,20000,Urban heat wave
OD-EV07,Flood,20.35,85.95,2020-08-15,minor,3000,Minor tidal flooding`,

      shelters: `shelter_id,name,latitude,longitude,type,total_capacity,current_occupancy,water,sanitation,healthcare,road_accessible,verification
OD-SH01,Cuttack Municipal Hall,20.46,85.90,community_center,1200,150,yes,yes,yes,yes,verified
OD-SH02,Bhubaneswar High School,20.40,85.82,school,900,80,yes,yes,no,yes,verified
OD-SH03,Delta Community Center,20.40,85.95,community_center,600,,yes,no,no,yes,estimated
OD-SH04,Coastal Relief Camp,20.52,85.96,other,400,200,no,no,no,no,estimated
OD-SH05,West Government School,20.46,85.78,school,700,50,yes,yes,no,yes,verified
OD-SH06,Upland Sports Complex,20.54,85.78,stadium,1500,100,yes,yes,yes,yes,verified
OD-SH07,South Shelter Tent Site,20.37,85.94,other,300,,,,unknown,unverified
OD-SH08,Central Polytechnic,20.44,85.87,school,500,30,yes,no,no,yes,estimated`,

      infrastructure: `facility_id,name,latitude,longitude,facility_type,road_accessible,water,sanitation
OD-INF01,SCB Medical College,20.46,85.90,hospital,yes,yes,yes
OD-INF02,Bhubaneswar AIIMS,20.40,85.82,hospital,yes,yes,yes
OD-INF03,Delta Primary Health Center,20.42,85.94,clinic,yes,yes,no
OD-INF04,Coastal Fire Station,20.51,85.95,fire_station,no,yes,no
OD-INF05,West Police Station,20.46,85.79,police,yes,yes,yes
OD-INF06,Central Relief Office,20.44,85.87,other,yes,yes,yes`,
    },
    geojson: {
      study_area: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Coastal Odisha Study Area', type: 'boundary' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[85.72, 20.58], [86.0, 20.58], [86.0, 20.32], [85.72, 20.32], [85.72, 20.58]]],
            },
          },
        ],
      },
      roads: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'NH-16 Bhubaneswar-Cuttack', type: 'highway', verified: true },
            geometry: { type: 'LineString', coordinates: [[85.78, 20.55], [85.82, 20.46], [85.88, 20.48], [85.95, 20.50]] },
          },
          {
            type: 'Feature',
            properties: { name: 'Cuttack Delta Road', type: 'main', verified: true },
            geometry: { type: 'LineString', coordinates: [[85.88, 20.48], [85.92, 20.42], [85.95, 20.38]] },
          },
          {
            type: 'Feature',
            properties: { name: 'Coastal Link Road', type: 'secondary', verified: false },
            geometry: { type: 'LineString', coordinates: [[85.82, 20.52], [85.88, 20.50], [85.95, 20.52]] },
          },
        ],
      },
      rivers: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Mahanadi River' },
            geometry: { type: 'LineString', coordinates: [[85.75, 20.55], [85.82, 20.50], [85.88, 20.46], [85.92, 20.42], [85.98, 20.38]] },
          },
          {
            type: 'Feature',
            properties: { name: 'Kathjodi Tributary' },
            geometry: { type: 'LineString', coordinates: [[85.85, 20.52], [85.90, 20.48], [85.94, 20.44]] },
          },
        ],
      },
    },
  },
  {
    id: 'himalayan-uttarakhand',
    name: 'Himalayan Uttarakhand — Landslide & Flash Flood Zone',
    description: 'Mountainous terrain prone to landslides, flash floods, and cloudburst events. Synthetic data around Rudraprayag–Tehri.',
    center: [30.28, 78.92],
    files: {
      rainfall: `station_id,latitude,longitude,annual_rainfall_mm,monsoon_rainfall_mm,date_recorded
UK-ST01,30.32,78.85,2100,1600,2024-08-15
UK-ST02,30.28,78.92,1850,1400,2024-08-15
UK-ST03,30.24,78.98,1700,1300,2024-08-15
UK-ST04,30.35,78.80,2400,1850,2024-08-15
UK-ST05,30.22,78.85,1550,1150,2024-08-15
UK-ST06,30.38,78.95,1950,1450,2024-08-15
UK-ST07,30.30,79.02,1400,1000,2024-08-15
UK-ST08,30.26,78.78,2200,1700,2024-08-15`,

      population: `zone_id,zone_name,latitude,longitude,population,area_km2,density_per_km2,vulnerability_index
UK-RZ01,Upper Alaknanda Valley,30.32,78.85,6800,8.5,800,0.78
UK-RZ02,Rudraprayag Town,30.28,78.92,12500,3.2,3906,0.82
UK-RZ03,Lower Valley Sector,30.24,78.98,8200,6.0,1367,0.70
UK-RZ04,High Ridge Settlement,30.35,78.80,3400,5.5,618,0.75
UK-RZ05,South Slope Village,30.22,78.85,4500,4.2,1071,0.68
UK-RZ06,Tehri Lakeside,30.38,78.95,9500,4.0,2375,0.60
UK-RZ07,East Ridge Hamlet,30.30,79.02,1800,3.8,474,0.72
UK-RZ08,West Gorge Belt,30.26,78.78,5200,5.0,1040,0.85`,

      historical: `event_id,event_type,latitude,longitude,date,severity,affected_population,damage_description
UK-EV01,Landslide,30.32,78.85,2021-07-18,severe,2000,Major slope collapse on valley road
UK-EV02,Flash Flood,30.28,78.92,2013-06-16,severe,8000,Kedarnath cloudburst flood event
UK-EV03,Landslide,30.35,78.80,2022-08-03,moderate,800,Ridge slide blocking highway
UK-EV04,Landslide,30.26,78.78,2020-07-22,moderate,1200,Gorge landslide village
UK-EV05,Flash Flood,30.24,78.98,2021-08-10,moderate,3000,River overflow lower valley
UK-EV06,Landslide,30.30,79.02,2023-07-15,minor,200,Small slide on hamlet road
UK-EV07,Flood,30.38,78.95,2022-09-08,moderate,1500,Lakeside overflow`,

      shelters: `shelter_id,name,latitude,longitude,type,total_capacity,current_occupancy,water,sanitation,healthcare,road_accessible,verification
UK-SH01,Rudraprayag Town Hall,30.29,78.93,community_center,800,100,yes,yes,no,yes,verified
UK-SH02,Valley Government School,30.26,78.90,school,500,60,yes,no,no,yes,verified
UK-SH03,Tehri Community Center,30.39,78.96,community_center,600,,yes,yes,no,yes,estimated
UK-SH04,High Ridge Camp,30.36,78.82,other,200,50,no,no,no,no,estimated
UK-SH05,South Village School,30.23,78.86,school,350,20,yes,yes,no,yes,verified
UK-SH06,East Hamlet Shelter,30.31,79.03,other,150,,,,unknown,unverified
UK-SH07,Lakeside Polytechnic,30.39,78.94,school,450,30,yes,no,no,yes,estimated
UK-SH08,Central Relief Building,30.28,78.88,other,300,40,yes,yes,no,yes,estimated`,

      infrastructure: `facility_id,name,latitude,longitude,facility_type,road_accessible,water,sanitation
UK-INF01,Rudraprayag District Hospital,30.28,78.92,hospital,yes,yes,yes
UK-INF02,Valley Primary Health Center,30.26,78.90,clinic,yes,yes,no
UK-INF03,Tehri Medical Center,30.38,78.96,clinic,yes,yes,yes
UK-INF04,High Ridge Fire Post,30.36,78.82,fire_station,no,yes,no
UK-INF05,South Police Station,30.23,78.86,police,yes,yes,no
UK-INF06,Valley Rescue Office,30.28,78.88,other,yes,yes,yes`,
    },
    geojson: {
      study_area: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Himalayan Uttarakhand Study Area', type: 'boundary' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[78.72, 30.42], [79.08, 30.42], [79.08, 30.18], [78.72, 30.18], [78.72, 30.42]]],
            },
          },
        ],
      },
      roads: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Rishikesh-Badrinath Highway', type: 'highway', verified: true },
            geometry: { type: 'LineString', coordinates: [[78.80, 30.38], [78.85, 30.32], [78.92, 30.28], [78.98, 30.24]] },
          },
          {
            type: 'Feature',
            properties: { name: 'Tehri Access Road', type: 'main', verified: true },
            geometry: { type: 'LineString', coordinates: [[78.88, 30.28], [78.92, 30.30], [78.95, 30.35], [78.96, 30.38]] },
          },
          {
            type: 'Feature',
            properties: { name: 'Valley Village Road', type: 'secondary', verified: false },
            geometry: { type: 'LineString', coordinates: [[78.85, 30.32], [78.88, 30.28], [78.90, 30.26]] },
          },
          {
            type: 'Feature',
            properties: { name: 'Gorge Trail Road', type: 'secondary', verified: false },
            geometry: { type: 'LineString', coordinates: [[78.78, 30.26], [78.82, 30.28], [78.85, 30.30]] },
          },
        ],
      },
      rivers: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Alaknanda River' },
            geometry: { type: 'LineString', coordinates: [[78.78, 30.38], [78.85, 30.32], [78.92, 30.28], [78.98, 30.24]] },
          },
          {
            type: 'Feature',
            properties: { name: 'Mandakini Tributary' },
            geometry: { type: 'LineString', coordinates: [[78.88, 30.35], [78.90, 30.30], [78.92, 30.28]] },
          },
          {
            type: 'Feature',
            properties: { name: 'Bhagirathi River' },
            geometry: { type: 'LineString', coordinates: [[78.85, 30.40], [78.90, 30.36], [78.95, 30.38]] },
          },
        ],
      },
    },
  },
  {
    id: 'urban-delhi',
    name: 'Urban Delhi — Heat & Urban Flood Zone',
    description: 'Dense metropolitan area prone to extreme heat waves and monsoon urban flooding. Synthetic data around central Delhi.',
    center: [28.62, 77.20],
    files: {
      rainfall: `station_id,latitude,longitude,annual_rainfall_mm,monsoon_rainfall_mm,date_recorded
DL-ST01,28.68,77.15,850,680,2024-08-15
DL-ST02,28.62,77.20,780,620,2024-08-15
DL-ST03,28.56,77.25,720,580,2024-08-15
DL-ST04,28.70,77.25,920,750,2024-08-15
DL-ST05,28.58,77.12,810,650,2024-08-15
DL-ST06,28.65,77.30,760,610,2024-08-15
DL-ST07,28.54,77.18,700,560,2024-08-15
DL-ST08,28.72,77.18,890,720,2024-08-15`,

      population: `zone_id,zone_name,latitude,longitude,population,area_km2,density_per_km2,vulnerability_index
DL-RZ01,Old Delhi Riverside,28.68,77.15,65000,2.5,26000,0.85
DL-RZ02,Connaught Place Central,28.62,77.20,42000,3.0,14000,0.62
DL-RZ03,South Delhi Sector,28.56,77.25,28000,5.5,5091,0.55
DL-RZ04,North East Trans-Yamuna,28.70,77.25,72000,4.0,18000,0.88
DL-RZ05,West Delhi Block,28.58,77.12,38000,6.0,6333,0.60
DL-RZ06,East Delhi Zone,28.65,77.30,45000,4.5,10000,0.72
DL-RZ07,South West Fringe,28.54,77.18,18000,7.0,2571,0.48
DL-RZ08,North West Sector,28.72,77.18,32000,5.2,6154,0.58`,

      historical: `event_id,event_type,latitude,longitude,date,severity,affected_population,damage_description
DL-EV01,Heat,28.62,77.20,2023-06-20,severe,500000,Extreme heat wave 47°C
DL-EV02,Flood,28.68,77.15,2023-07-11,severe,30000,Yamuna overflow Old Delhi
DL-EV03,Heat,28.68,77.15,2022-05-15,severe,400000,Heat wave urban core
DL-EV04,Flood,28.70,77.25,2021-08-01,moderate,25000,Trans-Yamuna drainage overflow
DL-EV05,Heat,28.56,77.25,2024-06-18,moderate,150000,South Delhi heat wave
DL-EV06,Flood,28.65,77.30,2022-09-08,moderate,18000,East Delhi waterlogging
DL-EV07,Heat,28.58,77.12,2023-07-02,minor,50000,West Delhi heat advisory`,

      shelters: `shelter_id,name,latitude,longitude,type,total_capacity,current_occupancy,water,sanitation,healthcare,road_accessible,verification
DL-SH01,Indoor Stadium Delhi,28.60,77.22,stadium,3000,200,yes,yes,yes,yes,verified
DL-SH02,North Community Center,28.66,77.16,community_center,1000,150,yes,yes,no,yes,verified
DL-SH03,Trans-Yamuna School,28.69,77.24,school,800,300,yes,no,no,yes,estimated
DL-SH04,South Delhi Hall,28.57,77.24,community_center,600,50,yes,yes,yes,yes,verified
DL-SH05,West Municipal Building,28.59,77.13,other,700,80,yes,yes,no,yes,verified
DL-SH06,East Shelter Block,28.64,77.29,community_center,500,,yes,no,no,yes,estimated
DL-SH07,SW Fringe Camp,28.55,77.19,other,300,,,,unknown,unverified
DL-SH08,NW School Complex,28.71,77.19,school,900,100,yes,yes,no,yes,estimated`,

      infrastructure: `facility_id,name,latitude,longitude,facility_type,road_accessible,water,sanitation
DL-INF01,AIIMS Delhi,28.56,77.21,hospital,yes,yes,yes
DL-INF02,Old Delhi Hospital,28.67,77.16,hospital,yes,yes,yes
DL-INF03,Trans-Yamuna Clinic,28.69,77.24,clinic,yes,yes,no
DL-INF04,West Fire Station,28.59,77.13,fire_station,yes,yes,yes
DL-INF05,Central Police HQ,28.63,77.21,police,yes,yes,yes
DL-INF06,East Relief Office,28.64,77.29,other,yes,yes,no
DL-INF07,NW Health Center,28.71,77.19,clinic,yes,yes,yes`,
    },
    geojson: {
      study_area: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Urban Delhi Study Area', type: 'boundary' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[77.08, 28.76], [77.34, 28.76], [77.34, 28.50], [77.08, 28.50], [77.08, 28.76]]],
            },
          },
        ],
      },
      roads: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Ring Road', type: 'highway', verified: true },
            geometry: { type: 'LineString', coordinates: [[77.15, 28.70], [77.22, 28.68], [77.28, 28.64], [77.30, 28.58], [77.25, 28.54], [77.18, 28.56], [77.12, 28.62], [77.15, 28.70]] },
          },
          {
            type: 'Feature',
            properties: { name: 'Outer Ring Road', type: 'highway', verified: true },
            geometry: { type: 'LineString', coordinates: [[77.12, 28.72], [77.20, 28.72], [77.30, 28.68], [77.32, 28.58], [77.28, 28.52], [77.15, 28.52], [77.10, 28.60], [77.12, 28.72]] },
          },
          {
            type: 'Feature',
            properties: { name: 'Janpath Connecting Road', type: 'main', verified: true },
            geometry: { type: 'LineString', coordinates: [[77.18, 28.62], [77.22, 28.62], [77.25, 28.62]] },
          },
          {
            type: 'Feature',
            properties: { name: 'Trans-Yamuna Link', type: 'secondary', verified: false },
            geometry: { type: 'LineString', coordinates: [[77.22, 28.68], [77.25, 28.70], [77.28, 28.70]] },
          },
        ],
      },
      rivers: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Yamuna River' },
            geometry: { type: 'LineString', coordinates: [[77.20, 28.76], [77.22, 28.70], [77.23, 28.64], [77.24, 28.58], [77.25, 28.52], [77.26, 28.50]] },
          },
        ],
      },
    },
  },
];
