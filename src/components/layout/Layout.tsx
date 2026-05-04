import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import LibrarySidebar from './LibrarySidebar';
import { mockProject, mockCharacters, mockConversations } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { useChat } from '../../context/ChatContext';

export default function Layout() {
  const { dispatch: appDispatch, state } = useApp();
  const { dispatch: chatDispatch } = useChat();

  useEffect(() => {
    appDispatch({ type: 'SET_PROJECT', payload: mockProject });
    appDispatch({ type: 'SET_CHARACTERS', payload: mockCharacters });
    chatDispatch({ type: 'SET_CONVERSATIONS', payload: mockConversations });
  }, [appDispatch, chatDispatch]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <LibrarySidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-6">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" theme={state.darkMode ? 'dark' : 'light'} />
    </div>
  );
}
