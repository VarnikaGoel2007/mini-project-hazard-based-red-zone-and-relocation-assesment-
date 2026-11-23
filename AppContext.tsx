import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type {
  RiskZone,
  Shelter,
  RoadSegment,
  RiverSegment,
  StudyArea,
  Alert,
  HazardType,
  UploadedFile,
  DataQuality,
} from '@/types';
import {
  DEMO_RISK_ZONES,
  DEMO_SHELTERS,
  DEMO_ROADS,
  DEMO_RIVERS,
  DEMO_STUDY_AREA,
  generateAlerts,
} from '@/data/demoData';

interface IngestedDataPayload {
  riskZones: RiskZone[];
  shelters: Shelter[];
  roads: RoadSegment[];
  rivers: RiverSegment[];
  studyArea: StudyArea | null;
  dataQuality: Partial<DataQuality>;
}

interface AppState {
  currentPage: string;
  setCurrentPage: (page: string) => void;

  hazard: HazardType;
  setHazard: (h: HazardType) => void;

  studyArea: StudyArea;
  riskZones: RiskZone[];
  shelters: Shelter[];
  roads: RoadSegment[];
  rivers: RiverSegment[];
  alerts: Alert[];

  uploadedFiles: UploadedFile[];
  addUploadedFiles: (files: UploadedFile[]) => void;
  clearUploadedFiles: () => void;

  dataQuality: DataQuality;
  setDataQuality: (dq: Partial<DataQuality>) => void;

  selectedZoneId: string | null;
  setSelectedZoneId: (id: string | null) => void;

  mlModelTrained: boolean;
  setMlModelTrained: (v: boolean) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  dataSource: 'demo' | 'uploaded';
  applyIngestedData: (payload: IngestedDataPayload) => void;
  resetToDemo: () => void;

  // Accumulated raw uploaded data for re-ingestion
  rawUploaded: {
    rainfall: any[];
    population: any[];
    historical: any[];
    shelters: any[];
    roads: any[];
    rivers: any[];
    studyArea: any | null;
  };
  setRawUploaded: (key: string, data: any[]) => void;
}

const DEMO_DATA_QUALITY: DataQuality = {
  rainfall: true,
  temperature: true,
  elevation: false,
  population: true,
  historical: true,
  shelters: true,
  roads: true,
  rivers: true,
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState('overview');
  const [hazard, setHazard] = useState<HazardType>('flood');
  const [studyArea, setStudyArea] = useState<StudyArea>(DEMO_STUDY_AREA);
  const [riskZones, setRiskZones] = useState<RiskZone[]>(DEMO_RISK_ZONES);
  const [shelters, setShelters] = useState<Shelter[]>(DEMO_SHELTERS);
  const [roads, setRoads] = useState<RoadSegment[]>(DEMO_ROADS);
  const [rivers, setRivers] = useState<RiverSegment[]>(DEMO_RIVERS);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [mlModelTrained, setMlModelTrained] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'demo' | 'uploaded'>('demo');
  const [dataQuality, setDataQualityState] = useState<DataQuality>(DEMO_DATA_QUALITY);

  const [rawUploaded, setRawUploadedState] = useState<{
    rainfall: any[];
    population: any[];
    historical: any[];
    shelters: any[];
    roads: any[];
    rivers: any[];
    studyArea: any | null;
  }>({
    rainfall: [],
    population: [],
    historical: [],
    shelters: [],
    roads: [],
    rivers: [],
    studyArea: null,
  });

  const alerts = useMemo(
    () => generateAlerts(riskZones, shelters, hazard),
    [riskZones, shelters, hazard],
  );

  const addUploadedFiles = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const clearUploadedFiles = () => setUploadedFiles([]);

  const setDataQuality = (dq: Partial<DataQuality>) => {
    setDataQualityState((prev) => ({ ...prev, ...dq }));
  };

  const setRawUploaded = (key: string, data: any[]) => {
    setRawUploadedState((prev) => ({ ...prev, [key]: data }));
  };

  const applyIngestedData = (payload: IngestedDataPayload) => {
    setDataSource('uploaded');
    if (payload.studyArea) setStudyArea(payload.studyArea);
    setRiskZones(payload.riskZones);
    setShelters(payload.shelters);
    setRoads(payload.roads);
    setRivers(payload.rivers);
    setDataQualityState((prev) => ({ ...prev, ...payload.dataQuality }));
    setSelectedZoneId(null);
  };

  const resetToDemo = () => {
    setDataSource('demo');
    setStudyArea(DEMO_STUDY_AREA);
    setRiskZones(DEMO_RISK_ZONES);
    setShelters(DEMO_SHELTERS);
    setRoads(DEMO_ROADS);
    setRivers(DEMO_RIVERS);
    setDataQualityState(DEMO_DATA_QUALITY);
    setUploadedFiles([]);
    setRawUploadedState({
      rainfall: [],
      population: [],
      historical: [],
      shelters: [],
      roads: [],
      rivers: [],
      studyArea: null,
    });
    setSelectedZoneId(null);
    setMlModelTrained(false);
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        hazard,
        setHazard,
        studyArea,
        riskZones,
        shelters,
        roads,
        rivers,
        alerts,
        uploadedFiles,
        addUploadedFiles,
        clearUploadedFiles,
        dataQuality,
        setDataQuality,
        selectedZoneId,
        setSelectedZoneId,
        mlModelTrained,
        setMlModelTrained,
        sidebarOpen,
        setSidebarOpen,
        dataSource,
        applyIngestedData,
        resetToDemo,
        rawUploaded,
        setRawUploaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
