import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  ArrowLeft,
  User,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  StopCircle,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  MessageSquarePlus,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import * as apiClient from '../lib/api';

// ── Types ──

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  character_name?: string;
  timestamp: number;
  status: 'streaming' | 'complete' | 'error' | 'stopped';
  feedback?: 'up' | 'down' | null;
}

interface Conversation {
  id: string;
  title: string;
  character_name: string;
  last_message: string;
  updated_at: number;
  messages: ChatMessage[];
}

// ── Constants ──

const CHAR_EMOJIS: Record<string, string> = {
  crono: '🔴',
  marle: '🩷',
  lucca: '🟡',
  robo: '🟢',
  frog: '🟩',
  ayla: '🟤',
  magus: '🟣',
};

const ERA_LABELS: Record<string, string> = {
  crono: '1000 AD',
  marle: '1000 AD',
  lucca: '1000 AD',
  robo: '2300 AD',
  frog: '600 AD',
  ayla: '65M BC',
  magus: '12K BC',
};

const QUICK_PROMPTS = [
  'Tell me about yourself',
  'What do you see around you?',
  'How strong are you?',
  'Who are your friends?',
];

// ── Helpers ──

function genId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Component ──

export default function ChatPage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [projectId, setProjectId] = useState<number | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedChar, setSelectedChar] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Derived
  const activeConv = conversations.find(c => c.id === activeConvId) || null;
  const messages = activeConv?.messages || [];
  const isStreaming = messages.some(m => m.status === 'streaming');

  // ── Load project & characters ──
  useEffect(() => {
    const load = async () => {
      try {
        const projects = await apiClient.getProjects();
        if (projects.length === 0) return;
        const latest = projects[projects.length - 1];
        setProjectId(latest.id);
        const chars = await apiClient.getCharacters(latest.id);
        setCharacters(chars);
        if (chars.length > 0) setSelectedChar(chars[0]);
      } catch (err) {
        console.error('Failed to load project:', err);
      }
    };
    load();
  }, []);

  // ── Auto-scroll ──
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Focus input on mount ──
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConvId]);

  // ── Create new conversation ──
  const newConversation = useCallback((char?: any) => {
    const c = char || selectedChar;
    if (!c) return;
    const conv: Conversation = {
      id: genId(),
      title: `Chat with ${c.name}`,
      character_name: c.name,
      last_message: '',
      updated_at: Date.now(),
      messages: [],
    };
    setConversations(prev => [conv, ...prev]);
    setActiveConvId(conv.id);
    return conv.id;
  }, [selectedChar]);

  // ── Send message ──
  const sendMessage = useCallback(async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || !selectedChar || !projectId || isStreaming) return;

    let convId = activeConvId;
    if (!convId) {
      convId = newConversation();
      if (!convId) return;
    }

    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      content: msgText,
      timestamp: Date.now(),
      status: 'complete',
    };

    const assistantMsg: ChatMessage = {
      id: genId(),
      role: 'assistant',
      content: '',
      character_name: selectedChar.name,
      timestamp: Date.now(),
      status: 'streaming',
    };

    setInput('');

    // Add user message + streaming placeholder
    setConversations(prev =>
      prev.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, userMsg, assistantMsg], last_message: msgText, updated_at: Date.now() }
          : c
      )
    );

    // Abort controller for stop support
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await apiClient.chat(
        projectId,
        selectedChar.id,
        msgText,
        controller.signal,
      );

      // Update assistant message with response
      setConversations(prev =>
        prev.map(c =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map(m =>
                  m.id === assistantMsg.id
                    ? { ...m, content: resp.response || '(No response)', status: 'complete' as const }
                    : m
                ),
                last_message: resp.response?.substring(0, 80) || '',
                updated_at: Date.now(),
              }
            : c
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User stopped — mark as stopped with partial content
        setConversations(prev =>
          prev.map(c =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === assistantMsg.id
                      ? { ...m, status: 'stopped' as const, content: m.content || '(Generation stopped)' }
                      : m
                  ),
                }
              : c
          )
        );
      } else {
        setConversations(prev =>
          prev.map(c =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === assistantMsg.id
                      ? { ...m, status: 'error' as const, content: `Error: ${err.message || 'Failed to get response'}` }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      abortRef.current = null;
    }
  }, [input, selectedChar, projectId, isStreaming, activeConvId, newConversation]);

  // ── Stop generation ──
  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ── Regenerate last response ──
  const regenerate = useCallback(() => {
    if (!activeConv || isStreaming) return;
    const msgs = activeConv.messages;
    // Find last user message
    let lastUserIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') { lastUserIdx = i; break; }
    }
    if (lastUserIdx < 0) return;

    const userMsg = msgs[lastUserIdx];
    // Remove everything after the last user message
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConvId
          ? { ...c, messages: c.messages.slice(0, lastUserIdx + 1) }
          : c
      )
    );
    // Resend
    setTimeout(() => sendMessage(userMsg.content), 50);
  }, [activeConv, isStreaming, activeConvId, sendMessage]);

  // ── Copy message ──
  const copyMessage = useCallback(async (msg: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = msg.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  // ── Feedback ──
  const setFeedback = useCallback((msgId: string, feedback: 'up' | 'down') => {
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConvId
          ? {
              ...c,
              messages: c.messages.map(m =>
                m.id === msgId ? { ...m, feedback } : m
              ),
            }
          : c
      )
    );
  }, [activeConvId]);

  // ── Delete conversation ──
  const deleteConversation = useCallback((convId: string) => {
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConvId === convId) {
      setActiveConvId(null);
    }
  }, [activeConvId]);

  // ── Select character ──
  const selectCharacter = (char: any) => {
    setSelectedChar(char);
    setShowCharPicker(false);
    // Start new conversation with this character
    newConversation(char);
  };

  // ── Auto-resize textarea ──
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3rem)] flex max-w-6xl mx-auto">
      {/* ── Conversation List Sidebar (desktop) ── */}
      <div className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card/30">
        <div className="p-4 border-b border-border">
          <Button
            variant="default"
            size="sm"
            className="w-full gap-2"
            onClick={() => newConversation()}
            disabled={!selectedChar}
          >
            <MessageSquarePlus size={16} />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8 px-4">
              No conversations yet. Select a character and start chatting.
            </p>
          )}
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors group ${
                activeConvId === conv.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted/50 text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {CHAR_EMOJIS[conv.character_name.toLowerCase()] || '⚪'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{conv.character_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {conv.last_message || 'New conversation'}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                  title="Delete conversation"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Header ── */}
        <div className="flex items-center gap-2 px-3 md:px-4 py-2.5 border-b border-border shrink-0 bg-background/80 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:hidden">
            <ArrowLeft size={18} />
          </Button>

          {/* Mobile character picker */}
          <div className="md:hidden flex-1 min-w-0">
            <button
              onClick={() => setShowCharPicker(!showCharPicker)}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <span className="text-lg">{selectedChar ? CHAR_EMOJIS[selectedChar.slug] || '⚪' : '⏳'}</span>
              <span className="truncate">{selectedChar?.name || 'Select'}</span>
              <ChevronDown size={14} className={`transition-transform ${showCharPicker ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Desktop: show active character */}
          <div className="hidden md:flex items-center gap-2 flex-1 min-w-0">
            {activeConv && (
              <>
                <span className="text-lg">
                  {CHAR_EMOJIS[activeConv.character_name.toLowerCase()] || '⚪'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{activeConv.character_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {ERA_LABELS[activeConv.character_name.toLowerCase()] || ''} • {activeConv.messages.length} messages
                  </p>
                </div>
              </>
            )}
            {!activeConv && selectedChar && (
              <>
                <span className="text-lg">{CHAR_EMOJIS[selectedChar.slug] || '⚪'}</span>
                <div>
                  <p className="text-sm font-semibold">{selectedChar.name}</p>
                  <p className="text-[10px] text-muted-foreground">{ERA_LABELS[selectedChar.slug] || ''}</p>
                </div>
              </>
            )}
          </div>

          {/* New chat button (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => newConversation()}
            disabled={!selectedChar}
            title="New chat"
            className="md:hidden"
          >
            <MessageSquarePlus size={18} />
          </Button>
        </div>

        {/* ── Mobile Character Picker Dropdown ── */}
        {showCharPicker && (
          <div className="md:hidden border-b border-border bg-card shadow-lg">
            <div className="p-2 grid grid-cols-2 gap-1.5">
              {characters.map((char) => {
                const emoji = CHAR_EMOJIS[char.slug] || '⚪';
                const isActive = selectedChar?.id === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => selectCharacter(char)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{char.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{ERA_LABELS[char.slug] || ''}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Messages Area ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center px-4">
              <div className="text-center space-y-4 max-w-sm">
                <div className="text-5xl">
                  {selectedChar ? CHAR_EMOJIS[selectedChar.slug] || '⚪' : '⏳'}
                </div>
                <div>
                  <p className="font-serif text-xl font-semibold">
                    {selectedChar ? `Talk to ${selectedChar.name}` : 'Select a character'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedChar
                      ? `They know about your party, inventory, and story progress. Their knowledge depends on how far you've gotten.`
                      : 'Choose a character to start chatting.'}
                  </p>
                </div>
                {selectedChar && (
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); sendMessage(q); }}
                        className="px-3 py-1.5 rounded-full text-xs border border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-4 px-3 md:px-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`group ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                  {/* ── Assistant message ── */}
                  {msg.role === 'assistant' && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm">
                          {msg.character_name ? CHAR_EMOJIS[msg.character_name.toLowerCase()] || '⏳' : '⏳'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm font-semibold">{msg.character_name}</span>
                          <span className="text-[10px] text-muted-foreground/60">{formatTime(msg.timestamp)}</span>
                          {msg.status === 'streaming' && (
                            <span className="text-[10px] text-primary/60 animate-pulse">● streaming</span>
                          )}
                          {msg.status === 'stopped' && (
                            <span className="text-[10px] text-amber-500">stopped</span>
                          )}
                          {msg.status === 'error' && (
                            <span className="text-[10px] text-destructive">error</span>
                          )}
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/60 prose-pre:rounded-lg prose-code:text-primary">
                          {msg.content ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          ) : msg.status === 'streaming' ? (
                            <div className="flex items-center gap-1.5 py-1">
                              <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          ) : null}
                        </div>

                        {/* Per-message actions */}
                        {msg.status === 'complete' && (
                          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyMessage(msg)}
                              className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy"
                            >
                              {copiedId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                            <button
                              onClick={() => setFeedback(msg.id, 'up')}
                              className={`p-1.5 rounded-lg hover:bg-muted/50 transition-colors ${msg.feedback === 'up' ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'}`}
                              title="Good response"
                            >
                              <ThumbsUp size={14} />
                            </button>
                            <button
                              onClick={() => setFeedback(msg.id, 'down')}
                              className={`p-1.5 rounded-lg hover:bg-muted/50 transition-colors ${msg.feedback === 'down' ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                              title="Bad response"
                            >
                              <ThumbsDown size={14} />
                            </button>
                          </div>
                        )}

                        {/* Stopped: offer continue */}
                        {msg.status === 'stopped' && (
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={regenerate}>
                              <RotateCcw size={12} /> Continue
                            </Button>
                          </div>
                        )}

                        {/* Error: offer retry */}
                        {msg.status === 'error' && (
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={regenerate}>
                              <RotateCcw size={12} /> Retry
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── User message ── */}
                  {msg.role === 'user' && (
                    <div className="flex gap-3 justify-end">
                      <div className="max-w-[80%] md:max-w-[70%]">
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed">
                          {msg.content}
                        </div>
                        <p className="text-[10px] text-muted-foreground/50 text-right mt-1">{formatTime(msg.timestamp)}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <User size={14} className="text-accent" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Input Area ── */}
        <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-sm p-3 md:p-4">
          {/* Stop / Regenerate bar */}
          {isStreaming && (
            <div className="flex justify-center mb-2">
              <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={stopGeneration}>
                <StopCircle size={14} /> Stop generating
              </Button>
            </div>
          )}
          {!isStreaming && activeConv && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
            <div className="flex justify-center mb-2">
              <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground" onClick={regenerate}>
                <RotateCcw size={14} /> Regenerate
              </Button>
            </div>
          )}

          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={selectedChar ? `Message ${selectedChar.name}...` : 'Select a character first'}
                  disabled={!selectedChar || isStreaming}
                  rows={1}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 min-h-[40px] max-h-[160px]"
                />
              </div>
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || !selectedChar || isStreaming}
                size="icon"
                className="shrink-0 h-10 w-10"
              >
                <Send size={16} />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/40 text-center mt-1.5">
              Enter to send · Shift+Enter for new line · AI-generated responses may contain inaccuracies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
