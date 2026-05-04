import { HashRouter, Routes, Route } from 'react-router'
import { AppProvider } from './context/AppContext'
import { ChatProvider } from './context/ChatContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import ProjectNew from './pages/ProjectNew'
import ProjectDetail from './pages/ProjectDetail'
import CharacterBrowser from './pages/CharacterBrowser'
import CharacterEditor from './pages/CharacterEditor'
import TimelinePage from './pages/TimelinePage'
import ChatPage from './pages/ChatPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <ChatProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/project/new" element={<ProjectNew />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/project/:id/characters" element={<CharacterBrowser />} />
              <Route path="/project/:id/timeline" element={<TimelinePage />} />
              <Route path="/character/:id" element={<CharacterEditor />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:conversationId" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </ChatProvider>
      </AppProvider>
    </HashRouter>
  )
}
