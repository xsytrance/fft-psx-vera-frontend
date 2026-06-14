import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import CharacterDetail from './pages/CharacterDetail';
import ChatPage from './pages/ChatPage';
import GroupChatPage from './pages/GroupChatPage';
import DreamTeamList from './pages/DreamTeamList';
import DreamTeamBuilder from './pages/DreamTeamBuilder';
import DreamTeamChat from './pages/DreamTeamChat';
import InventoryPage from './pages/InventoryPage';
import CampfirePage from './pages/CampfirePage';
import TimelinePage from './pages/TimelinePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
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
      </AppProvider>
    </HashRouter>
  );
}
