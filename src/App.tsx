import { lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import { MusicProvider } from './lib/music';

// Route-level code splitting: each page (and heavy deps like the markdown
// renderer) loads on demand, keeping the initial bundle small.
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProjectView = lazy(() => import('./pages/ProjectView'));
const CharacterDetail = lazy(() => import('./pages/CharacterDetail'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const GroupChatPage = lazy(() => import('./pages/GroupChatPage'));
const DreamTeamList = lazy(() => import('./pages/DreamTeamList'));
const DreamTeamBuilder = lazy(() => import('./pages/DreamTeamBuilder'));
const DreamTeamChat = lazy(() => import('./pages/DreamTeamChat'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const CampfirePage = lazy(() => import('./pages/CampfirePage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <MusicProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/project/:id" element={<ProjectView />} />
              <Route path="/project/:id/inventory" element={<InventoryPage />} />
              <Route path="/project/:id/campfire" element={<CampfirePage />} />
              <Route path="/project/:id/timeline" element={<TimelinePage />} />
              <Route path="/project/:id/group-chat" element={<GroupChatPage />} />
              <Route path="/project/:id/character/:charId" element={<CharacterDetail />} />
              <Route path="/project/:id/character/:charId/chat" element={<ChatPage />} />
              <Route path="/project/:id/dream-team" element={<DreamTeamList />} />
              <Route path="/project/:id/dream-team/:teamId" element={<DreamTeamBuilder />} />
              <Route path="/project/:id/dream-team/:teamId/chat" element={<DreamTeamChat />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </MusicProvider>
      </AppProvider>
    </HashRouter>
  );
}
