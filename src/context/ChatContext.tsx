import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Conversation, InteractionMode, Message } from '../types/api';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedCharacterIds: number[];
  selectedCommitId: number | null;
  mode: InteractionMode;
  knowledgeGateActive: boolean;
}

type ChatAction =
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'SELECT_CHARACTERS'; payload: number[] }
  | { type: 'SELECT_COMMIT'; payload: number | null }
  | { type: 'SET_MODE'; payload: InteractionMode }
  | { type: 'SEND_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'RECEIVE_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'CREATE_CONVERSATION'; payload: Conversation }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'SET_KNOWLEDGE_GATE'; payload: boolean };

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  selectedCharacterIds: [],
  selectedCommitId: null,
  mode: 'story-locked',
  knowledgeGateActive: true,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };
    case 'SELECT_CHARACTERS':
      return { ...state, selectedCharacterIds: action.payload };
    case 'SELECT_COMMIT':
      return { ...state, selectedCommitId: action.payload };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SEND_MESSAGE': {
      const convs = state.conversations.map((c) =>
        c.id === action.payload.conversationId
          ? { ...c, messages: [...c.messages, action.payload.message], updated_at: new Date().toISOString() }
          : c
      );
      return { ...state, conversations: convs };
    }
    case 'RECEIVE_MESSAGE': {
      const convs = state.conversations.map((c) =>
        c.id === action.payload.conversationId
          ? { ...c, messages: [...c.messages, action.payload.message], updated_at: new Date().toISOString() }
          : c
      );
      return { ...state, conversations: convs };
    }
    case 'CREATE_CONVERSATION':
      return {
        ...state,
        conversations: [...state.conversations, action.payload],
        activeConversationId: action.payload.id,
        selectedCharacterIds: action.payload.character_ids,
        selectedCommitId: action.payload.commit_id,
        mode: action.payload.mode,
      };
    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter((c) => c.id !== action.payload),
        activeConversationId:
          state.activeConversationId === action.payload
            ? state.conversations.find((c) => c.id !== action.payload)?.id ?? null
            : state.activeConversationId,
      };
    case 'SET_KNOWLEDGE_GATE':
      return { ...state, knowledgeGateActive: action.payload };
    default:
      return state;
  }
}

const ChatContext = createContext<
  { state: ChatState; dispatch: React.Dispatch<ChatAction> } | undefined
>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  return <ChatContext.Provider value={{ state, dispatch }}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
