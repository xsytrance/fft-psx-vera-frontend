import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Send,
  ArrowLeft,
  User,
  Trash2,
  Clock,
  Zap,
  Swords,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import * as apiClient from '../lib/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  character_name?: string;
  timestamp: number;
}

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
  crono: '1000 AD — Present',
  marle: '1000 AD — Present',
  lucca: '1000 AD — Present',
  robo: '2300 AD — Future',
  frog: '600 AD — Middle Ages',
  ayla: '65,000,000 BC — Prehistory',
  magus: '12,000 BC — Dark Age',
};

const QUICK_PROMPTS = [
  'Tell me about yourself',
  'What do you see around you?',
  'How strong are you?',
  'Who are your friends?',
];

export default function ChatPage() {
  const navigate = useNavigate();

  const [projectId, setProjectId] = useState<number | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedChar, setSelectedChar] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCharPicker, setShowCharPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load characters from latest project
  useEffect(() => {
    const loadProject = async () => {
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
    loadProject();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedChar || !projectId || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await apiClient.chat(
        projectId,
        selectedChar.id,
        userMsg.content,
      );

      const botMsg: ChatMessage = {
        role: 'assistant',
        content: resp.response || '(No response)',
        character_name: resp.character_name || selectedChar.name,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to get response'}`,
        character_name: 'System',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, selectedChar, projectId, loading]);

  const clearChat = () => setMessages([]);

  const selectCharacter = (char: any) => {
    setSelectedChar(char);
    setMessages([]);
    setShowCharPicker(false);
  };

  return (
    <div className="h-[calc(100vh-3rem)] md:h-[calc(100vh-3rem)] flex flex-col max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 pb-3 border-b border-border shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:hidden">
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-lg font-semibold">Character Chat</h1>
          {selectedChar && (
            <p className="text-xs text-muted-foreground truncate">
              {CHAR_EMOJIS[selectedChar.slug] || '⚪'} {selectedChar.name} — {ERA_LABELS[selectedChar.slug] || ''}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat">
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 gap-3 pt-3">
        {/* ── Mobile Character Picker (dropdown) ── */}
        <div className="md:hidden shrink-0">
          <button
            onClick={() => setShowCharPicker(!showCharPicker)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedChar ? CHAR_EMOJIS[selectedChar.slug] || '⚪' : '⏳'}</span>
              <span className="font-medium">{selectedChar?.name || 'Select character'}</span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${showCharPicker ? 'rotate-180' : ''}`} />
          </button>
          {showCharPicker && (
            <div className="mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              {characters.map((char) => {
                const emoji = CHAR_EMOJIS[char.slug] || '⚪';
                const isActive = selectedChar?.id === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => selectCharacter(char)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{char.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{char.role}</p>
                    </div>
                    {char.is_active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Desktop Character Selector (left sidebar) ── */}
        <div className="hidden md:block w-56 shrink-0 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">
            Party Members
          </p>
          {characters.map((char) => {
            const emoji = CHAR_EMOJIS[char.slug] || '⚪';
            const isActive = selectedChar?.id === char.id;
            return (
              <button
                key={char.id}
                onClick={() => {
                  setSelectedChar(char);
                  setMessages([]);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                    : 'hover:bg-muted/50 text-foreground border border-transparent'
                }`}
              >
                <span className="text-lg">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate">{char.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {char.role}
                  </p>
                </div>
                {char.is_active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
              </button>
            );
          })}

          {/* Save Info */}
          {characters.length > 0 && projectId && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">
                Save Data
              </p>
              <div className="space-y-1.5 px-1 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock size={11} />
                  <span>21h 20m played</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Swords size={11} />
                  <span>7 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={11} />
                  <span>ATB System</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Chat Area ── */}
        <div className="flex-1 flex flex-col min-w-0 rounded-2xl border border-border bg-card/50">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3 px-4">
                <div className="text-4xl">
                  {selectedChar ? CHAR_EMOJIS[selectedChar.slug] || '⚪' : '⏳'}
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold">
                    {selectedChar ? `Talk to ${selectedChar.name}` : 'Select a character'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    {selectedChar
                      ? `They know about your party, inventory, and how far you've progressed.`
                      : 'Choose a character to start chatting.'}
                  </p>
                </div>
                {selectedChar && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="px-3 py-1.5 rounded-full text-[11px] border border-border/60 text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 min-h-0">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 md:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-sm">
                        {msg.character_name ? CHAR_EMOJIS[msg.character_name.toLowerCase()] || '⏳' : '⏳'}
                      </span>
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-3 md:px-4 py-2.5 md:py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/60 text-foreground'
                    }`}
                    style={{ color: msg.role === 'assistant' ? 'hsl(var(--foreground))' : undefined }}
                  >
                    {msg.role === 'assistant' && (
                      <p className="text-[10px] font-semibold text-primary/60 mb-1">
                        {msg.character_name}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                      <User size={14} className="text-accent" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 md:gap-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm animate-pulse">⏳</span>
                  </div>
                  <div className="bg-muted/60 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Input Bar ── */}
          <div className="p-3 border-t border-border shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={selectedChar ? `Message ${selectedChar.name}...` : 'Select a character first'}
                disabled={!selectedChar || loading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || !selectedChar || loading}
                size="icon"
              >
                <Send size={16} />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <p className="text-[10px] text-muted-foreground">
                {characters.length === 0
                  ? 'Upload a save file first →'
                  : `${selectedChar?.name || '?'} • ${messages.length} messages`}
              </p>
              <p className="text-[10px] text-muted-foreground/50 hidden md:block">
                Enter to send • Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
