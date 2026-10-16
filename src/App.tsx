import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { EmberEconomyProvider } from './context/EmberEconomyContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { RidesPage } from './pages/RidesPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { CampusGuidePage } from './pages/CampusGuidePage';
import { EventsPage } from './pages/EventsPage';
import { PeerLearningPage } from './pages/PeerLearningPage';
import { SettingsPage } from './pages/SettingsPage';
import { BadgesPage } from './pages/BadgesPage';
import { CratesPage } from './pages/CratesPage';
import { WalletPage } from './pages/WalletPage';
import { DailyUpdatesPage } from './pages/DailyUpdatesPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <EmberEconomyProvider>
          <AppLayout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/updates"
                element={
                  <ProtectedRoute>
                    <DailyUpdatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/academics"
                element={
                  <ProtectedRoute>
                    <AcademicsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rides"
                element={
                  <ProtectedRoute>
                    <RidesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenges"
                element={
                  <ProtectedRoute>
                    <ChallengesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campus"
                element={
                  <ProtectedRoute>
                    <CampusGuidePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <EventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learning"
                element={
                  <ProtectedRoute>
                    <PeerLearningPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/badges"
                element={
                  <ProtectedRoute>
                    <BadgesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/crates"
                element={
                  <ProtectedRoute>
                    <CratesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <WalletPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </EmberEconomyProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
