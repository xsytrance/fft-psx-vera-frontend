import { HashRouter, Routes, Route } from 'react-router';
import { AppProvider } from './context/AppContext';
import { ChatProvider } from './context/ChatContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import SaveUpload from './pages/SaveUpload';

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <ChatProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:conversationId" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/save/upload" element={<SaveUpload />} />
            </Route>
          </Routes>
        </ChatProvider>
      </AppProvider>
    </HashRouter>
  );
}
