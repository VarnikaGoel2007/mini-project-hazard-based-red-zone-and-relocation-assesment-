import { AppProvider, useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import OverviewDashboard from '@/pages/OverviewDashboard';
import RiskMapPage from '@/pages/RiskMapPage';
import DataUploadPage from '@/pages/DataUploadPage';
import HazardAssessmentPage from '@/pages/HazardAssessmentPage';
import ShelterCapacityPage from '@/pages/ShelterCapacityPage';
import SafeLocationPage from '@/pages/SafeLocationPage';
import ReportsPage from '@/pages/ReportsPage';

function PageRouter() {
  const { currentPage } = useApp();

  switch (currentPage) {
    case 'overview':
      return <OverviewDashboard />;
    case 'risk-map':
      return <RiskMapPage />;
    case 'data-upload':
      return <DataUploadPage />;
    case 'hazard-assessment':
      return <HazardAssessmentPage />;
    case 'shelter-capacity':
      return <ShelterCapacityPage />;
    case 'safe-location':
      return <SafeLocationPage />;
    case 'reports':
      return <ReportsPage />;
    default:
      return <OverviewDashboard />;
  }
}

function App() {
  return (
    <AppProvider>
      <Layout>
        <PageRouter />
      </Layout>
    </AppProvider>
  );
}

export default App;
