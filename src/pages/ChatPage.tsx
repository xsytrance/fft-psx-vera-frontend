import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  ArrowLeft,
  MessageSquare,
  Plus,
  Trash2,
  Shield,
  Download,
  X,
  MapPin,
  Search,
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
import type { InteractionMode } from '../types/api';
import TypingIndicator from '../components/ui/TypingIndicator';
import ModeIndicator from '../components/ui/ModeIndicator';
import { getCharacterAccent } from '../lib/theme';

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

/* ── Presence phrases per character personality ── */
const presencePhrases: Record<number, string[]> = {
  1: ['is feeling poetic…', 'strums a quiet Cuatro chord…', 'feels the coqui singing…', 'stands ready, volcanic and calm…'],
  2: ['bleeds between timelines…', 'rewinds the cosmic tape…', 'sees all, says little…', 'compresses truth into static…'],
  3: ['observes from Corozal…', 'holds the alliance steady…', 'remembers old debts…', 'commands with warm authority…'],
  4: ['watches from the edges…', 'weighs shifting allegiances…', 'reads the margins of fate…', 'stays silent, stays sharp…'],
  5: ['inscribes fate into stars…', 'feels the ledger growing…', 'chants the old plenas…', 'trembles with cosmic pride…'],
  6: ['exhumes hearts from shadow…', 'watches from the balcony…', 'senses threads converging…', 'prepares the chamber…'],
};

function getPresenceText(charId: number, charName: string): string {
  const phrases = presencePhrases[charId] ?? ['is present…'];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  return `${charName} ${phrase}`;
}

/* ── Commit phase categorisation ── */
function commitPhase(commit: (typeof mockCommits)[0]): 'before' | 'during' | 'after' {
  const chapterNum = parseInt(commit.chapter.replace(/\D/g, ''), 10) || 0;
  if (chapterNum <= 2) return 'before';
  if (chapterNum >= 8) return 'after';
  return 'during';
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useChat();
  const { state: appState } = useApp();
  const isDark = appState.darkMode;

  const characters = appState.characters.length ? appState.characters : mockCharacters;
  const commits = mockCommits;
  const conversations = state.conversations.length ? state.conversations : [];

  const convId = conversationId ?? state.activeConversationId;
  const activeConversation = conversations.find((c) => c.id === convId);

  const initialCharParam = searchParams.get('char');
  const initialCommitParam = searchParams.get('commit');

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [convSearch, setConvSearch] = useState('');
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
  const primaryChar = charObjs[0] ?? characters[0];
  const primaryAccent = getCharacterAccent(primaryChar?.id ?? 1, isDark);

  /* ── Immersion gradient based on selected character ── */
  const immersionGradient = useMemo(() => {
    const color = primaryAccent;
    return {
      background: `radial-gradient(ellipse at 10% 90%, ${color}08 0%, transparent 50%),
                   radial-gradient(ellipse at 90% 10%, ${color}06 0%, transparent 50%)`,
    };
  }, [primaryAccent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, sending]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');

    let conversation = activeConversation;
    if (!conversation) {
      const newConv = {
        id: `conv-${Date.now()}`,
        project_id: 1,
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

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(convSearch.toLowerCase())
  );

  const placeholderText = selectedChars.length === 1
    ? `Write to ${primaryChar?.name ?? 'character'}…`
    : `Write to ${charObjs.map((c) => c.name.split(' ')[0]).join(', ')}…`;

  return (
    <div
      className="fixed inset-0 flex"
      style={{ left: '18rem', ...immersionGradient }}
    >
      {/* ═══════════════════════════════════════════════
          MIDDLE COLUMN — Character Panel (w-80)
         ═══════════════════════════════════════════════ */}
      <div className="w-80 border-r border-border flex flex-col bg-secondary/30 backdrop-blur-sm shrink-0">
        {/* ── Header ── */}
        <div className="px-4 pt-4 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-foreground">Characters</h2>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {characters.length}
            </span>
          </div>
        </div>

        {/* ── Character List ── */}
        <div className="px-3 pt-3 pb-2 space-y-1">
          {characters.map((char) => {
            const isSelected = selectedChars.includes(char.id);
            const accent = getCharacterAccent(char.id, isDark);
            return (
              <motion.button
                key={char.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const newChars = selectedChars.includes(char.id)
                    ? selectedChars.filter((c) => c !== char.id)
                    : [...selectedChars, char.id];
                  dispatch({ type: 'SELECT_CHARACTERS', payload: newChars });
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group relative ${
                  isSelected
                    ? 'bg-primary/5'
                    : 'hover:bg-muted/60'
                }`}
              >
                {/* Avatar with accent ring */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif font-bold text-sm shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: accent,
                    boxShadow: isSelected
                      ? `0 0 0 3px ${accent}, 0 0 0 5px ${accent}22`
                      : `0 0 0 2px ${accent}44`,
                  }}
                >
                  {char.name.charAt(0)}
                </div>

                {/* Name + Role */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{char.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{char.role}</div>
                </div>

                {/* Status dot */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: char.is_active ? '#22c55e' : '#6b7280' }}
                />

                {/* Hover "Chat" ghost button */}
                <span
                  className={`absolute right-3 text-xs font-medium px-2 py-0.5 rounded-md transition-opacity duration-200 ${
                    isSelected
                      ? 'opacity-0'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={{ color: accent, backgroundColor: `${accent}18` }}
                >
                  Chat
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* ── Character Presence ── */}
        {charObjs.length > 0 && (
          <div className="px-4 py-3 border-t border-border/40">
            <div className="space-y-1.5">
              {charObjs.slice(0, 2).map((char) => (
                <p key={char.id} className="text-xs italic text-muted-foreground leading-relaxed">
                  {getPresenceText(char.id, char.name.split(' ')[0])}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ── Quick Timeline Strip ── */}
        <div className="px-4 py-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Story</span>
            <div className="flex-1 flex items-center gap-1.5">
              {(['before', 'during', 'after'] as const).map((phase, i) => {
                const phaseCommit = commits.find((c) => c.id === selectedCommit);
                const currentPhase = phaseCommit ? commitPhase(phaseCommit) : 'during';
                const isActive = currentPhase === phase;
                const colors = {
                  before: isDark ? '#908980' : '#6B6560',
                  during: isDark ? '#8B7EC8' : '#5B4B8A',
                  after: isDark ? '#D4884F' : '#C2703E',
                };
                return (
                  <button
                    key={phase}
                    onClick={() => navigate(`/project/1/timeline`)}
                    className="flex items-center gap-1 group"
                    title={`View ${phase} story timeline`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: isActive ? colors[phase] : `${colors[phase]}44`,
                        boxShadow: isActive ? `0 0 0 3px ${colors[phase]}33` : 'none',
                      }}
                    />
                    {i < 2 && (
                      <span
                        className="w-4 h-px transition-colors duration-300"
                        style={{ backgroundColor: `${colors[phase]}44` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {commitObj?.chapter ?? '—'}
            </span>
          </div>
        </div>

        {/* ── Conversations List ── */}
        <div className="flex-1 min-h-0 border-t border-border flex flex-col">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MessageSquare size={12} />
              Conversations
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                const newConv = {
                  id: `conv-${Date.now()}`,
                  project_id: 1,
                  character_ids: [1],
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
              <Plus size={14} />
            </Button>
          </div>

          {/* Search */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
                placeholder="Find conversation…"
                className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-2 pb-2">
            <div className="space-y-0.5">
              {filteredConversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                    convId === conv.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted/60 text-muted-foreground'
                  }`}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                >
                  <MessageSquare size={13} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{conv.title}</div>
                    <div className="truncate text-[10px] opacity-70">
                      {conv.messages.length} msgs · {modeLabels[conv.mode]}
                    </div>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive p-1 rounded transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConv(conv.id);
                    }}
                  >
                    <Trash2 size={11} />
                  </button>
                </motion.div>
              ))}
              {filteredConversations.length === 0 && (
                <div className="text-center py-4 text-xs text-muted-foreground italic">
                  No conversations yet
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT COLUMN — Chat Thread (flex-1)
         ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/40 backdrop-blur-[2px]">
        {/* ── Top Bar ── */}
        <div className="border-b border-border/60 px-4 py-3 flex items-center gap-3 bg-card/20 backdrop-blur-sm shrink-0">
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
          </Button>

          {/* Character Chips */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
            <AnimatePresence mode="popLayout">
              {charObjs.map((char) => {
                const accent = getCharacterAccent(char.id, isDark);
                return (
                  <motion.div
                    key={char.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}33` }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-serif font-bold"
                      style={{ backgroundColor: accent }}
                    >
                      {char.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium" style={{ color: accent }}>
                      {char.name.split(' ')[0]}
                    </span>
                    <button
                      onClick={() => {
                        const newChars = selectedChars.filter((c) => c !== char.id);
                        dispatch({ type: 'SELECT_CHARACTERS', payload: newChars.length ? newChars : [1] });
                      }}
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: accent }}
                    >
                      <X size={10} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Timeline Badge */}
          {commitObj && (
            <button
              onClick={() => navigate(`/project/1/timeline`)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors hover:bg-muted/60"
              style={{ backgroundColor: `${primaryAccent}14`, color: primaryAccent }}
            >
              <MapPin size={12} />
              <span className="truncate max-w-[180px]">
                {commitObj.title} — {commitObj.chapter}
              </span>
            </button>
          )}

          {/* Mode Switcher */}
          <DropdownMenu open={modeMenuOpen} onOpenChange={setModeMenuOpen}>
            <DropdownMenuTrigger asChild>
              <div>
                <ModeIndicator mode={mode} onClick={() => setModeMenuOpen(true)} />
              </div>
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

          {/* Knowledge Gate */}
          {mode === 'story-locked' && (
            <Badge
              variant="outline"
              className="gap-1 text-xs shrink-0 hidden sm:inline-flex"
              style={{ color: isDark ? '#D4884F' : '#B45309', borderColor: isDark ? '#D4884F44' : '#B4530944' }}
            >
              <Shield size={11} />
              Knowledge Gate
            </Badge>
          )}

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" title="Export conversation">
                <Download size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExport}>Export as JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Messages Area ── */}
        <ScrollArea className="flex-1 px-4 py-4" ref={messagesContainerRef}>
          <div className="max-w-3xl mx-auto space-y-1">
            <AnimatePresence mode="popLayout">
              {(activeConversation?.messages ?? []).map((msg, i) => (
                <motion.div
                  key={`${i}-${msg.content.slice(0, 20)}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  {msg.role === 'system' ? (
                    <div className="flex justify-center py-3">
                      <span className="text-xs italic text-muted-foreground/60">
                        ── {msg.content} ──
                      </span>
                    </div>
                  ) : msg.role === 'user' ? (
                    <div className="flex justify-end py-1">
                      <div className="flex gap-2 max-w-[85%] flex-row-reverse items-end">
                        <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-secondary text-muted-foreground">
                          <User size={12} />
                        </div>
                        <div className="rounded-2xl rounded-br-md px-4 py-3 text-sm bg-secondary text-secondary-foreground shadow-card">
                          <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start py-1">
                      <div className="flex gap-2 max-w-[85%] flex-row items-start">
                        <div
                          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white font-serif font-bold text-xs"
                          style={{
                            backgroundColor: getCharacterAccent(msg.character_id ?? primaryChar.id, isDark),
                          }}
                        >
                          {msg.character_name ? msg.character_name.charAt(0) : <Bot size={12} />}
                        </div>
                        <div className="flex flex-col">
                          {msg.character_name && (
                            <span
                              className="text-[11px] font-medium mb-0.5 ml-1"
                              style={{
                                color: getCharacterAccent(msg.character_id ?? primaryChar.id, isDark),
                              }}
                            >
                              {msg.character_name}
                            </span>
                          )}
                          <div
                            className="rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed text-card-foreground shadow-card"
                            style={{
                              backgroundColor: `${getCharacterAccent(msg.character_id ?? primaryChar.id, isDark)}14`,
                              borderLeftWidth: 3,
                              borderLeftStyle: 'solid',
                              borderLeftColor: getCharacterAccent(msg.character_id ?? primaryChar.id, isDark),
                            }}
                          >
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {sending && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.25 }}
                >
                  <TypingIndicator
                    characterName={primaryChar?.name ?? 'Character'}
                    accentColor={primaryAccent}
                    avatarInitial={primaryChar?.name?.charAt(0)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* ── Input Area ── */}
        <div className="shrink-0 px-4 py-3 bg-card/40 backdrop-blur-sm border-t border-border/60">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="flex items-end gap-2 rounded-2xl bg-card border border-border shadow-elevated p-2"
              initial={false}
              animate={{ y: 0 }}
            >
              <Input
                placeholder={placeholderText}
                className="flex-1 border-0 bg-transparent shadow-none text-sm px-3 py-2.5 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
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
                className="rounded-full shrink-0 h-9 w-9 transition-all duration-200"
                style={{
                  backgroundColor: input.trim() ? primaryAccent : undefined,
                }}
                onClick={handleSend}
                disabled={sending || !input.trim()}
              >
                <Send size={15} />
              </Button>
            </motion.div>
            <div className="text-center mt-1.5">
              <span className="text-[10px] text-muted-foreground/50">
                Press Enter to send
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
