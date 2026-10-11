import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { EmberEconomyProvider } from './context/EmberEconomyContext';
import { AppLayout } from './components/layout/AppLayout';
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

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <EmberEconomyProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/academics" element={<AcademicsPage />} />
              <Route path="/rides" element={<RidesPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/campus" element={<CampusGuidePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/learning" element={<PeerLearningPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/badges" element={<BadgesPage />} />
              <Route path="/crates" element={<CratesPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </EmberEconomyProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
