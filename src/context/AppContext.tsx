import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Project, Character } from '../types/api';
import * as apiClient from '../lib/api';

interface AppState {
  currentProject: Project | null;
  projects: Project[];
  characters: Character[];
  darkMode: boolean;
  demoMode: boolean;
  loading: boolean;
}

type AppAction =
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CHARACTERS'; payload: Character[] }
  | { type: 'UPDATE_CHARACTER'; payload: Character }
  | { type: 'DELETE_CHARACTER'; payload: number }
  | { type: 'TOGGLE_DEMO_MODE' }
  | { type: 'TOGGLE_DARK_MODE' };

const savedDark = typeof window !== 'undefined'
  ? window.localStorage.getItem('chronovera-theme-dark')
  : null;

const initialState: AppState = {
  currentProject: null,
  projects: [],
  characters: [],
  darkMode: savedDark !== null ? savedDark === 'true' : true,
  demoMode: false,
  loading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      if (state.projects.find(p => p.id === action.payload.id)) {
        return state;
      }
      return { ...state, projects: [...state.projects, action.payload] };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CHARACTERS':
      return { ...state, characters: action.payload };
    case 'UPDATE_CHARACTER': {
      const idx = state.characters.findIndex(c => c.id === action.payload.id);
      if (idx === -1) return state;
      const updated = [...state.characters];
      updated[idx] = action.payload;
      return { ...state, characters: updated };
    }
    case 'DELETE_CHARACTER':
      return { ...state, characters: state.characters.filter(c => c.id !== action.payload) };
    case 'TOGGLE_DEMO_MODE':
      return { ...state, demoMode: !state.demoMode };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    default:
      return state;
  }
}

const AppContext = createContext<
  { state: AppState; dispatch: React.Dispatch<AppAction> } | undefined
>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load projects from API on mount and when demoMode changes
  useEffect(() => {
    if (state.demoMode) return;
    
    let cancelled = false;
    dispatch({ type: 'SET_LOADING', payload: true });
    
    console.log('[AppContext] Loading projects from API...');
    
    apiClient.getProjects()
      .then(projects => {
        if (cancelled) return;
        console.log('[AppContext] Loaded', projects?.length, 'projects');
        if (projects && projects.length > 0) {
          dispatch({ type: 'SET_PROJECTS', payload: projects });
        }
      })
      .catch(err => {
        if (!cancelled) console.error('[AppContext] Failed to load projects:', err);
      })
      .finally(() => {
        if (!cancelled) dispatch({ type: 'SET_LOADING', payload: false });
      });
    
    return () => { cancelled = true; };
  }, [state.demoMode]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
