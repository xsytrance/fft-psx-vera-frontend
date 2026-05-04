import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Project, Character } from '../types/api';

interface AppState {
  currentProject: Project | null;
  characters: Character[];
  darkMode: boolean;
  demoMode: boolean;
}

type AppAction =
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'SET_CHARACTERS'; payload: Character[] }
  | { type: 'UPDATE_CHARACTER'; payload: Character }
  | { type: 'DELETE_CHARACTER'; payload: number }
  | { type: 'TOGGLE_DEMO_MODE' }
  | { type: 'TOGGLE_DARK_MODE' };

const initialState: AppState = {
  currentProject: null,
  characters: [],
  darkMode: true,
  demoMode: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'SET_CHARACTERS':
      return { ...state, characters: action.payload };
    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter((c) => c.id !== action.payload),
      };
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
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
