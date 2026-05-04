import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CountrySelect from './pages/CountrySelect';
import BuildingTypeSelect from './pages/BuildingTypeSelect';
import { WallSelect, RoofSelect, FoundationSelect } from './pages/MaterialSelect';
import FeaturesSelect from './pages/FeaturesSelect';
import DesignSummary from './pages/DesignSummary';
import DesignWorkshop from './pages/DesignWorkshop';
import Results from './pages/Results';
import SavedProjects from './pages/SavedProjects';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/design" element={<DesignWorkshop />} />
            <Route path="/design/country" element={<CountrySelect />} />
            <Route path="/design/building" element={<BuildingTypeSelect />} />
            <Route path="/design/walls" element={<WallSelect />} />
            <Route path="/design/roof" element={<RoofSelect />} />
            <Route path="/design/foundation" element={<FoundationSelect />} />
            <Route path="/design/features" element={<FeaturesSelect />} />
            <Route path="/design/summary" element={<DesignSummary />} />
            <Route path="/results" element={<Results />} />
            <Route path="/saved" element={<SavedProjects />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;