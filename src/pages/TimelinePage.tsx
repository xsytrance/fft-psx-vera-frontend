import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  MapPin,
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  ChevronDown,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { mockCommits, mockCharacters } from '../data/mockData';
import { useState, useMemo } from 'react';
import TimelineNode from '../components/ui/TimelineNode';
import { getCharacterAccent } from '../lib/theme';

/* ── Phase categorisation ── */
type Phase = 'before' | 'during' | 'after';

function commitPhase(commit: (typeof mockCommits)[0]): Phase {
  const chapterNum = parseInt(commit.chapter.replace(/\D/g, ''), 10) || 0;
  if (chapterNum <= 2) return 'before';
  if (chapterNum >= 8) return 'after';
  return 'during';
}

const phaseMeta: Record<
  Phase,
  { label: string; icon: typeof Sparkles; color: string; bg: string }
> = {
  before: {
    label: 'Before Story',
    icon: BookOpen,
    color: '#6B6560',
    bg: 'bg-muted/40',
  },
  during: {
    label: 'During Story',
    icon: Sparkles,
    color: '#5B4B8A',
    bg: 'bg-primary/5',
  },
  after: {
    label: 'After Story',
    icon: Clock,
    color: '#C2703E',
    bg: 'bg-accent/5',
  },
};

export default function TimelinePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedCommitId, setSelectedCommitId] = useState<number | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Record<Phase, boolean>>({
    before: false,
    during: true,
    after: false,
  });

  const selectedCommit = mockCommits.find((c) => c.id === selectedCommitId);
  const characterName = (cid: number) => mockCharacters.find((c) => c.id === cid)?.name ?? 'Unknown';
  const characterObj = (cid: number) => mockCharacters.find((c) => c.id === cid);

  /* Group commits by phase */
  const commitsByPhase = useMemo(() => {
    const grouped: Record<Phase, typeof mockCommits> = { before: [], during: [], after: [] };
    for (const commit of mockCommits.sort((a, b) => a.order_index - b.order_index)) {
      grouped[commitPhase(commit)].push(commit);
    }
    return grouped;
  }, []);

  const togglePhase = (phase: Phase) => {
    setExpandedPhases((prev) => ({ ...prev, [phase]: !prev[phase] }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* ═══════════════════════════════════════════════
          HEADER
         ═══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/project/${id}`)}
          >
            <ArrowLeft size={16} />
            Project
          </Button>
          <Button
            size="sm"
            className="gap-2 rounded-xl"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <Plus size={16} />
            New Checkpoint
          </Button>
        </div>

        <div className="space-y-1">
          <h1 className="font-serif text-4xl font-semibold text-foreground tracking-tight">
            Through Time
          </h1>
          <p className="text-sm text-muted-foreground">
            Every moment shapes what they know
          </p>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════
          MAIN GRID: Timeline (60%) + Detail (40%)
         ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Timeline Column ── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Gradient line background decoration */}
          <div className="relative">
            {/* Vertical gradient connector */}
            <div
              className="absolute left-[19px] top-8 bottom-8 w-0.5 rounded-full"
              style={{
                background: 'linear-gradient(to bottom, #6B656033, #5B4B8A66, #C2703E33)',
              }}
            />

            {/* Phase Accordions */}
            <div className="space-y-3 relative">
              {(['before', 'during', 'after'] as Phase[]).map((phase) => {
                const meta = phaseMeta[phase];
                const commits = commitsByPhase[phase];
                const isExpanded = expandedPhases[phase];
                const PhaseIcon = meta.icon;

                return (
                  <div key={phase} className="relative">
                    {/* Phase Header */}
                    <button
                      onClick={() => togglePhase(phase)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${meta.bg} hover:shadow-card`}
                    >
                      <PhaseIcon size={18} style={{ color: meta.color }} />
                      <span className="font-serif text-base font-semibold flex-1 text-left" style={{ color: meta.color }}>
                        {meta.label}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown size={16} className="text-muted-foreground" />
                      </motion.div>
                      <Badge variant="outline" className="text-[10px]">
                        {commits.length}
                      </Badge>
                    </button>

                    {/* Phase Content */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 pr-2 pt-2 pb-1 space-y-1">
                            {commits.map((commit, idx) => {
                              const isSelected = selectedCommitId === commit.id;
                              const char = characterObj(commit.character_id);
                              const accent = getCharacterAccent(commit.character_id, false);
                              const isLast = idx === commits.length - 1;

                              return (
                                <div key={commit.id} className="flex gap-3 relative">
                                  {/* Node + connector */}
                                  <div className="flex flex-col items-center gap-0 shrink-0 pt-3">
                                    <TimelineNode
                                      state={isSelected ? 'selected' : 'default'}
                                      color={accent}
                                      onClick={() => setSelectedCommitId(commit.id)}
                                    />
                                    {!isLast && (
                                      <div
                                        className="w-0.5 flex-1 min-h-[24px] mt-1 rounded-full"
                                        style={{ backgroundColor: `${accent}44` }}
                                      />
                                    )}
                                  </div>

                                  {/* Commit Card */}
                                  <motion.div
                                    layout
                                    onClick={() => setSelectedCommitId(commit.id)}
                                    className={`flex-1 cursor-pointer rounded-xl border transition-all duration-200 p-3 mb-2 ${
                                      isSelected
                                        ? 'border-primary/40 bg-primary/[0.04] shadow-card'
                                        : 'border-border/50 bg-card/40 hover:border-primary/20 hover:bg-primary/[0.02]'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1.5">
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] font-medium"
                                          style={isSelected ? { borderColor: `${accent}66`, color: accent } : {}}
                                        >
                                          {commit.chapter}
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px]">
                                          {commit.scene}
                                        </Badge>
                                        {commit.is_start && (
                                          <Badge className="text-[10px] bg-emerald-600 text-white">Start</Badge>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        {char && (
                                          <div
                                            className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-serif font-bold"
                                            style={{ backgroundColor: getCharacterAccent(char.id, false) }}
                                          >
                                            {char.name.charAt(0)}
                                          </div>
                                        )}
                                        {characterName(commit.character_id)}
                                      </span>
                                    </div>

                                    <h3
                                      className={`text-sm font-medium mb-1 transition-colors ${
                                        isSelected ? 'text-foreground' : 'text-foreground/80'
                                      }`}
                                    >
                                      {commit.title}
                                    </h3>

                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                                      <MapPin size={11} />
                                      <span className="line-clamp-1">{commit.location}</span>
                                    </div>

                                    <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
                                      {commit.situation}
                                    </p>
                                  </motion.div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Detail Panel (Right Column, Sticky) ── */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedCommit ? (
              <motion.div
                key={selectedCommit.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                className="lg:sticky lg:top-6"
              >
                <Card className="bg-card border-border/50 rounded-2xl shadow-elevated overflow-hidden">
                  <CardContent className="p-5 space-y-5">
                    {/* Title */}
                    <div className="space-y-1">
                      <h3 className="font-serif text-xl font-semibold text-foreground leading-snug">
                        {selectedCommit.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedCommit.chapter} · {selectedCommit.scene}
                      </p>
                    </div>

                    {/* Meta row */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={14} className="shrink-0" />
                        <span>{selectedCommit.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen size={14} className="shrink-0" />
                        <div className="flex items-center gap-1.5">
                          {(() => {
                            const char = characterObj(selectedCommit.character_id);
                            if (!char) return <span>{characterName(selectedCommit.character_id)}</span>;
                            return (
                              <>
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-serif font-bold"
                                  style={{ backgroundColor: getCharacterAccent(char.id, false) }}
                                >
                                  {char.name.charAt(0)}
                                </div>
                                <span>{char.name}</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Situation */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedCommit.situation}
                    </p>

                    {/* Knows */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        Knows
                      </h4>
                      <ScrollArea className="h-28">
                        <div className="space-y-1.5 pr-2">
                          {selectedCommit.knows.map((k) => (
                            <div
                              key={k}
                              className="flex items-start gap-2 px-3 py-2 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/10"
                            >
                              <CheckCircle2 size={12} className="shrink-0 mt-0.5 text-emerald-500/70" />
                              <span className="text-xs text-muted-foreground leading-relaxed">{k}</span>
                            </div>
                          ))}
                          {selectedCommit.knows.length === 0 && (
                            <span className="text-xs text-muted-foreground/50 italic">No knowledge recorded</span>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Does Not Know */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                        <Lock size={13} />
                        Does Not Know
                      </h4>
                      <ScrollArea className="h-28">
                        <div className="space-y-1.5 pr-2">
                          {selectedCommit.does_not_know.map((k) => (
                            <div
                              key={k}
                              className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-500/[0.06] border border-rose-500/10"
                            >
                              <Lock size={12} className="shrink-0 mt-0.5 text-rose-500/70" />
                              <span className="text-xs text-muted-foreground leading-relaxed">{k}</span>
                            </div>
                          ))}
                          {selectedCommit.does_not_know.length === 0 && (
                            <span className="text-xs text-muted-foreground/50 italic">No knowledge gaps recorded</span>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* CTA */}
                    <Button
                      className="w-full rounded-xl gap-2"
                      size="sm"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                      onClick={() => navigate(`/chat?commit=${selectedCommit.id}`)}
                    >
                      <MessageSquare size={14} />
                      Chat at this checkpoint
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:sticky lg:top-6"
              >
                <Card className="bg-card border-border/50 rounded-2xl shadow-card">
                  <CardContent className="p-8 text-center">
                    <Clock size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground font-medium mb-1">Select a checkpoint</p>
                    <p className="text-xs text-muted-foreground/60">Click any node on the timeline to view details and start a conversation.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
