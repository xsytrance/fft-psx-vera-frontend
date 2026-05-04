import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import {
  Send,
  ArrowLeft,
  MessageSquare,
  Plus,
  Trash2,
  Shield,
  Download,
  ChevronDown,
  Sparkles,
  User,
  Bot,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useChat } from '../context/ChatContext';
import { useApp } from '../context/AppContext';
import { mockCharacters, mockCommits, mockCharacterResponses } from '../data/mockData';
import { getCharacterAccent, getCharacterAvatar } from '../lib/theme';
import type { InteractionMode } from '../types/api';

const modeLabels: Record<InteractionMode, string> = {
  'story-locked': 'Story-Locked',
  'post-end': 'Post-End',
  casual: 'Casual Companion',
  'multi-character': 'Multi-Character',
  agent: 'Agent Persona',
};

const modeColors: Record<InteractionMode, string> = {
  'story-locked': 'bg-indigo-600',
  'post-end': 'bg-amber-600',
  casual: 'bg-emerald-600',
  'multi-character': 'bg-violet-600',
  agent: 'bg-slate-600',
};

export default function ChatPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useChat();
  const { state: appState } = useApp();

  const currentProjectId = appState.currentProject?.id ?? 1;
  const characters = appState.characters.length
    ? appState.characters.filter((c) => c.project_id === currentProjectId)
    : mockCharacters.filter((c) => c.project_id === currentProjectId);
  const commits = mockCommits;
  const conversations = state.conversations.length ? state.conversations : [];

  const convId = conversationId ?? state.activeConversationId;
  const activeConversation = conversations.find((c) => c.id === convId);

  const initialCharParam = searchParams.get('char');
  const initialCommitParam = searchParams.get('commit');

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChars = useMemo(() => {
    if (activeConversation) return activeConversation.character_ids;
    if (state.selectedCharacterIds.length) return state.selectedCharacterIds;
    if (initialCharParam) return [Number(initialCharParam)];
    return [1];
  }, [activeConversation, state.selectedCharacterIds, initialCharParam]);

  const selectedCommit = useMemo(() => {
    if (activeConversation) return activeConversation.commit_id;
    if (state.selectedCommitId) return state.selectedCommitId;
    if (initialCommitParam) return Number(initialCommitParam);
    return 1;
  }, [activeConversation, state.selectedCommitId, initialCommitParam]);

  const mode = activeConversation?.mode ?? state.mode ?? 'story-locked';

  const commitObj = commits.find((c) => c.id === selectedCommit);
  const charObjs = characters.filter((c) => selectedChars.includes(c.id));

  const primaryCharId = selectedChars[0];
  const primaryChar = characters.find((c) => c.id === primaryCharId);
  const accentColor = getCharacterAccent(primaryCharId, appState.darkMode);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');

    let conversation = activeConversation;
    if (!conversation) {
      const newConv = {
        id: `conv-${Date.now()}`,
        project_id: currentProjectId,
        character_ids: selectedChars,
        commit_id: selectedCommit,
        mode: mode as InteractionMode,
        title: `Chat with ${charObjs.map((c) => c.name).join(', ')}`,
        messages: [
          {
            role: 'system' as const,
            content: `System: ${mode} mode at ${commitObj?.title ?? 'unknown'}`,
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dispatch({ type: 'CREATE_CONVERSATION', payload: newConv });
      conversation = newConv;
    }

    dispatch({
      type: 'SEND_MESSAGE',
      payload: { conversationId: conversation.id, message: { role: 'user', content: text } },
    });

    setSending(true);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1000));
    setSending(false);

    if (mode === 'multi-character' && selectedChars.length > 1) {
      for (const charId of selectedChars) {
        const char = characters.find((c) => c.id === charId);
        const responses = mockCharacterResponses[charId] ?? ['...'];
        const response = responses[Math.floor(Math.random() * responses.length)];
        dispatch({
          type: 'RECEIVE_MESSAGE',
          payload: {
            conversationId: conversation.id,
            message: {
              role: 'assistant',
              content: response,
              character_id: charId,
              character_name: char?.name ?? 'Unknown',
            },
          },
        });
      }
    } else {
      const primaryCharId = selectedChars[0];
      const char = characters.find((c) => c.id === primaryCharId);
      const responses = mockCharacterResponses[primaryCharId] ?? ['...'];
      const response = responses[Math.floor(Math.random() * responses.length)];
      dispatch({
        type: 'RECEIVE_MESSAGE',
        payload: {
          conversationId: conversation.id,
          message: {
            role: 'assistant',
            content: response,
            character_id: primaryCharId,
            character_name: char?.name ?? 'Unknown',
          },
        },
      });
    }
  };

  const handleDeleteConv = (id: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: id });
    toast.success('Conversation deleted');
  };

  const handleExport = () => {
    if (!activeConversation) return;
    const data = JSON.stringify(activeConversation, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${activeConversation.id}.json`;
    a.click();
    toast.success('Conversation exported');
  };

  return (
    <div className="fixed inset-0 flex bg-background" style={{ left: '16rem' }}>
      {/* Ambient background layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          opacity: appState.darkMode ? 0.05 : 0.03,
          background: `radial-gradient(circle at 70% 30%, ${accentColor} 0%, transparent 60%), radial-gradient(circle at 30% 70%, ${accentColor}88 0%, transparent 50%)`,
        }}
        aria-hidden="true"
      />

      {/* Left Sidebar: Conversations & Character Selector */}
      <div className="w-72 border-r border-border flex flex-col bg-secondary/20 z-10">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare size={14} />
              Conversations
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                const newConv = {
                  id: `conv-${Date.now()}`,
                  project_id: currentProjectId,
                  character_ids: characters.length > 0 ? [characters[0].id] : [1],
                  commit_id: 1,
                  mode: 'story-locked' as InteractionMode,
                  title: 'New Conversation',
                  messages: [
                    {
                      role: 'system' as const,
                      content: 'System context initialized.',
                    },
                  ],
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                dispatch({ type: 'CREATE_CONVERSATION', payload: newConv });
                navigate(`/chat/${newConv.id}`);
              }}
            >
              <Plus size={16} />
            </Button>
          </div>
          <div className="space-y-1">
            {characters.map((char) => {
              const charAccent = getCharacterAccent(char.id, appState.darkMode);
              const charAvatar = getCharacterAvatar(char.id);
              return (
                <button
                  key={char.id}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                    selectedChars.includes(char.id)
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'hover:bg-secondary text-muted-foreground'
                  }`}
                  onClick={() => {
                    const newChars = selectedChars.includes(char.id)
                      ? selectedChars.filter((c) => c !== char.id)
                      : [...selectedChars, char.id];
                    dispatch({ type: 'SELECT_CHARACTERS', payload: newChars });
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full overflow-hidden border"
                    style={{ borderColor: charAccent }}
                  >
                    <img
                      src={charAvatar}
                      alt={char.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="truncate">{char.name}</span>
                  {selectedChars.includes(char.id) && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer text-xs transition-colors ${
                  convId === conv.id ? 'bg-indigo-500/15 text-indigo-300' : 'hover:bg-secondary text-muted-foreground'
                }`}
                onClick={() => navigate(`/chat/${conv.id}`)}
              >
                <MessageSquare size={14} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{conv.title}</div>
                  <div className="truncate text-[10px] opacity-70">
                    {conv.messages.length} msgs • {conv.mode}
                  </div>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 hover:text-destructive p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConv(conv.id);
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Top Bar */}
        <div className="border-b border-border px-4 py-3 flex items-center gap-4 bg-card/30 shrink-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
          </Button>

          {/* Character Avatars */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex -space-x-2">
              {charObjs.map((char) => {
                const charAccent = getCharacterAccent(char.id, appState.darkMode);
                const charAvatar = getCharacterAvatar(char.id);
                return (
                  <div
                    key={char.id}
                    className="w-8 h-8 rounded-full border-2 border-background overflow-hidden"
                    style={{ borderColor: charAccent }}
                    title={char.name}
                  >
                    <img
                      src={charAvatar}
                      alt={char.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {charObjs.map((c) => c.name).join(', ') || 'No character selected'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {commitObj?.title ?? 'No checkpoint'} • {commitObj?.chapter}
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 shrink-0">
                <div className={`w-2 h-2 rounded-full ${modeColors[mode]}`} />
                {modeLabels[mode]}
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              {(Object.keys(modeLabels) as InteractionMode[]).map((m) => (
                <DropdownMenuItem key={m} onClick={() => dispatch({ type: 'SET_MODE', payload: m })}>
                  <div className={`w-2 h-2 rounded-full ${modeColors[m]} mr-2`} />
                  {modeLabels[m]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Knowledge Gate Badge */}
          {mode === 'story-locked' && (
            <Badge variant="outline" className="gap-1 text-amber-400 border-amber-400/30 shrink-0">
              <Shield size={12} />
              Knowledge Gate Active
            </Badge>
          )}

          <Button variant="ghost" size="icon" className="shrink-0" onClick={handleExport} title="Export conversation">
            <Download size={16} />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {(activeConversation?.messages ?? []).map((msg, i) => {
              const msgAccent = msg.character_id
                ? getCharacterAccent(msg.character_id, appState.darkMode)
                : accentColor;
              const msgAvatar = msg.character_id ? getCharacterAvatar(msg.character_id) : undefined;
              return (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                      className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold overflow-hidden ${
                        msg.role === 'user'
                          ? 'bg-secondary text-muted-foreground'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User size={12} />
                      ) : msgAvatar ? (
                        <img src={msgAvatar} alt={msg.character_name || ''} className="w-full h-full object-cover" />
                      ) : (
                        <Bot size={12} />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-secondary text-foreground'
                          : msg.role === 'system'
                          ? 'bg-amber-500/10 text-amber-300 text-xs italic'
                          : 'bg-indigo-500/10 text-indigo-100 border border-indigo-500/20'
                      }`}
                      style={
                        msg.role === 'assistant' && msg.character_id
                          ? {
                              backgroundColor: `${msgAccent}14`,
                              borderColor: `${msgAccent}33`,
                              color: undefined,
                            }
                          : undefined
                      }
                    >
                      {msg.role === 'assistant' && msg.character_name && (
                        <div
                          className="text-[10px] font-semibold mb-1"
                          style={{ color: msgAccent }}
                        >
                          {msg.character_name}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {sending && primaryChar && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div
                    className="w-7 h-7 rounded-full overflow-hidden border-2 flex items-center justify-center"
                    style={{ borderColor: accentColor }}
                  >
                    <img
                      src={getCharacterAvatar(primaryCharId)}
                      alt={primaryChar.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-indigo-500/10 rounded-lg px-3 py-2 text-sm text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                    <Sparkles size={12} className="animate-pulse" />
                    Typing...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border px-4 py-3 bg-card/30 shrink-0">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Input
              placeholder="Send a message..."
              className="bg-secondary/50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending}
            />
            <Button
              size="icon"
              className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
              onClick={handleSend}
              disabled={sending || !input.trim()}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
