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
  RotateCcw,
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
import { sendChatMessage } from '../lib/api';
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
  'story-locked': 'bg-primary',
  'post-end': 'bg-amber-600',
  casual: 'bg-emerald-600',
  'multi-character': 'bg-accent',
  agent: 'bg-slate-600',
};

export default function ChatPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useChat();
  const { state: appState } = useApp();

  const currentProjectId = appState.currentProject?.id ?? appState.projects[0]?.id ?? 0;

  // Get characters from context (loaded by ProjectDetail/AppContext)
  const allCharacters = useMemo(() => {
    return appState.characters.filter((c) => c.project_id === currentProjectId);
  }, [appState.characters, currentProjectId]);

  const conversations = state.conversations;

  const convId = conversationId ?? state.activeConversationId;
  const activeConversation = conversations.find((c) => c.id === convId);

  const initialCharParam = searchParams.get('char');
  const initialCommitParam = searchParams.get('commit');

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChars = useMemo(() => {
    if (activeConversation) return activeConversation.character_ids;
    if (state.selectedCharacterIds.length) return state.selectedCharacterIds;
    if (initialCharParam) return [Number(initialCharParam)];
    if (allCharacters.length > 0) return [allCharacters[0].id];
    return [];
  }, [activeConversation, state.selectedCharacterIds, initialCharParam, allCharacters]);

  const selectedCommit = useMemo(() => {
    if (activeConversation) return activeConversation.commit_id;
    if (state.selectedCommitId) return state.selectedCommitId;
    if (initialCommitParam) return Number(initialCommitParam);
    return null;
  }, [activeConversation, state.selectedCommitId, initialCommitParam]);

  const mode = (activeConversation?.mode ?? state.mode ?? 'story-locked') as InteractionMode;

  const effectiveCommitId = selectedCommit ?? activeConversation?.commit_id ?? null;
  // Default to casual mode when no commit is selected (story-locked requires a commit)
  const effectiveMode = (mode === 'story-locked' && !effectiveCommitId) ? 'casual' : mode;

  const primaryCharId = selectedChars[0];
  const primaryChar = allCharacters.find((c) => c.id === primaryCharId);
  const charObjs = allCharacters.filter((c) => selectedChars.includes(c.id));
  const accentColor = getCharacterAccent(primaryCharId, appState.darkMode);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');

    // Use the context conversation ID if it matches, otherwise let the backend create one
    const existingConvId = activeConversation?.id;

    // Dispatch user message to context immediately
    const userMsg = { role: 'user' as const, content: text };
    if (existingConvId) {
      dispatch({
        type: 'SEND_MESSAGE',
        payload: { conversationId: existingConvId, message: userMsg },
      });
    }

    setSending(true);
    try {
      const response = await sendChatMessage({
        conversation_id: existingConvId ?? null,
        project_id: currentProjectId,
        character_ids: selectedChars,
        commit_id: effectiveCommitId ?? undefined,
        mode: effectiveMode,
        message: text,
      });

      // Create conversation in context if new
      if (!existingConvId && response.conversation_id) {
        const newConv = {
          id: response.conversation_id,
          project_id: currentProjectId,
          character_ids: selectedChars,
          commit_id: effectiveCommitId,
          mode,
          title: `Chat with ${charObjs.map((c) => c.name).join(', ')}`,
          messages: [
            userMsg,
            {
              role: 'assistant' as const,
              content: response.message.content,
              character_id: response.message.character_id,
              character_name: response.message.character_name,
            },
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        dispatch({ type: 'CREATE_CONVERSATION', payload: newConv });
      } else if (existingConvId) {
        // Add assistant response to existing conversation
        dispatch({
          type: 'RECEIVE_MESSAGE',
          payload: {
            conversationId: existingConvId,
            message: {
              role: 'assistant' as const,
              content: response.message.content,
              character_id: response.message.character_id,
              character_name: response.message.character_name,
            },
          },
        });
      }
    } catch (err: any) {
      console.error('[Chat] Send error:', err);
      toast.error(`Chat error: ${err.message}`);
      // Remove the user message we optimistically added
    } finally {
      setSending(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activeConversation || regenerating) return;
    const msgs = activeConversation.messages;
    // Find last user message
    let lastUserIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') { lastUserIdx = i; break; }
    }
    if (lastUserIdx === -1) return;

    const lastUserMsg = msgs[lastUserIdx].content;
    setRegenerating(true);
    try {
      const response = await sendChatMessage({
        conversation_id: activeConversation.id,
        project_id: currentProjectId,
        character_ids: selectedChars,
        commit_id: effectiveCommitId ?? undefined,
        mode: effectiveMode,
        message: `__regenerate__ ${lastUserMsg}`,
      });

      // Remove messages after last user message, then add new response
      // Just update the conversation with trimmed messages + new response
      const trimmedMsgs = msgs.slice(0, lastUserIdx + 1);
      trimmedMsgs.push({
        role: 'assistant' as const,
        content: response.message.content,
        character_id: response.message.character_id,
        character_name: response.message.character_name,
      });

      const updatedConv = { ...activeConversation, messages: trimmedMsgs, updated_at: new Date().toISOString() };
      // Remove old, add updated
      dispatch({ type: 'DELETE_CONVERSATION', payload: activeConversation.id });
      dispatch({ type: 'CREATE_CONVERSATION', payload: updatedConv });
      toast.success('Response regenerated');
    } catch (err: any) {
      toast.error(`Regenerate failed: ${err.message}`);
    } finally {
      setRegenerating(false);
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

      {/* Left Sidebar: Character Selector & Conversations */}
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
                if (allCharacters.length === 0 || currentProjectId === 0) {
                  toast.error('No project or characters available');
                  return;
                }
                const newConv = {
                  id: `conv-${Date.now()}`,
                  project_id: currentProjectId,
                  character_ids: [allCharacters[0].id],
                  commit_id: null,
                  mode: 'story-locked' as InteractionMode,
                  title: `Chat with ${allCharacters[0].name}`,
                  messages: [],
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
            {allCharacters.map((char) => {
              const charAccent = getCharacterAccent(char.id, appState.darkMode);
              const charAvatar = getCharacterAvatar(char.id);
              return (
                <button
                  key={char.id}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                    selectedChars.includes(char.id)
                      ? 'bg-primary/20 text-primary'
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
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
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
                  convId === conv.id ? 'bg-primary/15 text-primary' : 'hover:bg-secondary text-muted-foreground'
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
                {modeLabels[mode]} • Project #{currentProjectId}
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

          {activeConversation && activeConversation.messages.length > 0 && (
            <Button
              variant="ghost" size="icon" className="shrink-0"
              onClick={handleRegenerate}
              disabled={regenerating}
              title="Regenerate last response"
            >
              <RotateCcw size={16} className={regenerating ? 'animate-spin' : ''} />
            </Button>
          )}

          <Button variant="ghost" size="icon" className="shrink-0" onClick={handleExport} title="Export conversation">
            <Download size={16} />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {(activeConversation?.messages ?? []).length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Bot size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Start a conversation with {primaryChar?.name ?? 'a character'}...</p>
                <p className="text-xs mt-1 opacity-60">Ask about the story, request hints, or just chat.</p>
              </div>
            )}
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
                          : 'bg-primary/20 text-primary'
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
                          : 'bg-primary/10 text-indigo-100 border border-primary/20'
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
                  <div className="bg-primary/10 rounded-lg px-3 py-2 text-sm text-primary border border-primary/20 flex items-center gap-1">
                    <Sparkles size={12} className="animate-pulse" />
                    Thinking...
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
              placeholder={primaryChar ? `Message ${primaryChar.name}...` : 'Select a character to chat...'}
              className="bg-secondary/50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending || !allCharacters.length}
            />
            <Button
              size="icon"
              className="bg-primary hover:bg-primary/90 shrink-0"
              onClick={handleSend}
              disabled={sending || !input.trim() || !allCharacters.length}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
