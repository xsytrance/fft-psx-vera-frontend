import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Download,
  CheckCircle2,
  Globe,
  FlaskConical,
  Info,
  Shield,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { useApp } from '../context/AppContext';
import { mockCharacters, mockCommits } from '../data/mockData';
import { toast } from 'sonner';

const tabTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

export default function SettingsPage() {
  const { state: appState, dispatch: appDispatch } = useApp();
  const [tab, setTab] = useState('export');
  const [copied, setCopied] = useState(false);

  const [exportCharId, setExportCharId] = useState<number>(1);
  const [exportCommitId, setExportCommitId] = useState<number>(1);
  const [exportMode, setExportMode] = useState<string>('story-locked');

  const character = mockCharacters.find((c) => c.id === exportCharId);
  const commit = mockCommits.find((c) => c.id === exportCommitId);

  const systemPrompt = useMemo(() => {
    if (!character) return '';
    const modeRules: Record<string, string> = {
      'story-locked': `You are ${character.name}. You exist inside the story at the checkpoint "${commit?.title ?? 'unknown'}". You do not know anything that happens after this point. You know: ${commit?.knows.join(', ') ?? 'N/A'}. You do not know: ${commit?.does_not_know.join(', ') ?? 'N/A'}.`,
      'post-end': `You are ${character.name}. You have lived the entire story. You now reflect with full knowledge of all events, outcomes, and consequences. You may discuss regrets, "what ifs", and the full arc of your existence.`,
      casual: `You are ${character.name}, now a companion to the user. Help them while staying in character. Your core identity remains, but knowledge boundaries are relaxed.`,
      'multi-character': `You are ${character.name} in a multi-character conversation. Respect group dynamics and relationship data. Characters may interact with each other as well as the user.`,
      agent: `You are ${character.name}. This is an exportable agent persona. Maintain all voice constraints, speech patterns, and identity anchors across all interactions.`,
    };
    return [
      `=== MultiVera Persona Export ===`,
      `Character: ${character.name}`,
      `Mode: ${exportMode}`,
      `Commit: ${commit?.title ?? 'none'}`,
      ``,
      `== Identity Anchor ==`,
      `Name: ${character.name}`,
      `Role: ${character.role}`,
      `Affiliation: ${character.affiliation}`,
      `Origin: ${character.origin}`,
      `Appearance: ${character.appearance}`,
      `Tone: ${character.tone}`,
      `Languages: ${character.languages.join(', ')}`,
      ``,
      `== Mode Rules ==`,
      modeRules[exportMode] ?? modeRules['story-locked'],
      ``,
      `== Speech Patterns ==`,
      `Description: ${character.speech_patterns.description}`,
      `Code Switching: ${character.speech_patterns.code_switching}`,
      `Signature Expressions: ${character.speech_patterns.signature_expressions.join(', ')}`,
      `Example Phrases:`,
      ...character.speech_patterns.example_phrases.map((p) => `  - "${p}"`),
      ``,
      `== Knowledge Gates ==`,
      `Knows: ${character.knowledge_gates.knows.join(', ') || 'N/A'}`,
      `Does Not Know: ${character.knowledge_gates.does_not_know.join(', ') || 'N/A'}`,
      ``,
      `== Relationships ==`,
      `Allies: ${character.relationships.allies.join(', ') || 'None'}`,
      `Enemies: ${character.relationships.enemies.join(', ') || 'None'}`,
      `Complex: ${character.relationships.complex.join(', ') || 'None'}`,
      ``,
      `== Roleplay Instructions ==`,
      character.roleplay_instructions,
    ].join('\n');
  }, [character, commit, exportMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(systemPrompt);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPersona = () => {
    const data = {
      name: character?.name ?? 'Unknown',
      system_prompt: systemPrompt,
      character_json: character ?? {},
      commit_json: commit ?? null,
      mode_rules: exportMode,
      version: 'multivera-v1',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character?.slug ?? 'persona'}-${exportMode}.json`;
    a.click();
    toast.success('Persona file downloaded');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ── Header ── */}
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' as const }}
      >
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="font-sans text-sm text-muted-foreground">
          Configure your library and export personas
        </p>
      </motion.div>

      {/* ── Pill Tabs ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' as const, delay: 0.05 }}
      >
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-transparent gap-2 p-0 h-auto">
            <TabsTrigger
              value="export"
              className="rounded-full px-5 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-secondary data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-secondary/80"
            >
              Export
            </TabsTrigger>
            <TabsTrigger
              value="mode"
              className="rounded-full px-5 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-secondary data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-secondary/80"
            >
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="rounded-full px-5 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-secondary data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-secondary/80"
            >
              About
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* ── Export Tab ── */}
            {tab === 'export' && (
              <TabsContent value="export" className="mt-6" forceMount>
                <motion.div
                  key="export"
                  {...tabTransition}
                  className="space-y-6"
                >
                  <Card className="bg-card rounded-2xl shadow-card border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                        <Download size={18} className="text-primary" />
                        Persona Export
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Dropdowns */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="font-sans text-sm font-medium text-foreground">
                            Character
                          </label>
                          <select
                            className="w-full rounded-xl bg-secondary border-0 px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-colors cursor-pointer"
                            value={exportCharId}
                            onChange={(e) => setExportCharId(Number(e.target.value))}
                          >
                            {mockCharacters.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="font-sans text-sm font-medium text-foreground">
                            Checkpoint
                          </label>
                          <select
                            className="w-full rounded-xl bg-secondary border-0 px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-colors cursor-pointer"
                            value={exportCommitId}
                            onChange={(e) => setExportCommitId(Number(e.target.value))}
                          >
                            {mockCommits.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="font-sans text-sm font-medium text-foreground">
                            Mode
                          </label>
                          <select
                            className="w-full rounded-xl bg-secondary border-0 px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-colors cursor-pointer"
                            value={exportMode}
                            onChange={(e) => setExportMode(e.target.value)}
                          >
                            <option value="story-locked">Story-Locked</option>
                            <option value="post-end">Post-End</option>
                            <option value="casual">Casual Companion</option>
                            <option value="multi-character">Multi-Character</option>
                            <option value="agent">Agent Persona</option>
                          </select>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          className="rounded-xl gap-2 px-4 py-2 h-auto border-border/50 hover:bg-secondary/80 transition-colors"
                          onClick={handleCopy}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {copied ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.6, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <CheckCircle2 size={16} className="text-emerald-500" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="copy"
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.6, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <Copy size={16} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <span>{copied ? 'Copied!' : 'Copy System Prompt'}</span>
                        </Button>
                        <Button
                          className="rounded-xl gap-2 px-4 py-2 h-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          onClick={handleDownloadPersona}
                        >
                          <Download size={16} />
                          Download JSON
                        </Button>
                      </div>

                      {/* System Prompt Preview */}
                      <ScrollArea className="h-80 rounded-xl bg-secondary/50 border border-border/30 p-4">
                        <pre className="font-mono text-[13px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {systemPrompt}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            )}

            {/* ── Appearance Tab ── */}
            {tab === 'mode' && (
              <TabsContent value="mode" className="mt-6" forceMount>
                <motion.div
                  key="mode"
                  {...tabTransition}
                  className="space-y-6"
                >
                  <Card className="bg-card rounded-2xl shadow-card border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                        <FlaskConical size={18} className="text-primary" />
                        Appearance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-0">
                      {/* Demo Mode Row */}
                      <div className="flex items-center justify-between py-4 border-b border-border/30">
                        <div className="space-y-0.5">
                          <div className="font-sans text-sm font-medium text-foreground">
                            Demo Mode
                          </div>
                          <div className="font-sans text-xs text-muted-foreground">
                            Use mock data instead of a live backend API
                          </div>
                        </div>
                        <button
                          onClick={() => appDispatch({ type: 'TOGGLE_DEMO_MODE' })}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${
                            appState.demoMode ? 'bg-primary' : 'bg-muted'
                          }`}
                          aria-label="Toggle demo mode"
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                              appState.demoMode ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Dark Theme Row */}
                      <div className="flex items-center justify-between py-4 border-b border-border/30">
                        <div className="space-y-0.5">
                          <div className="font-sans text-sm font-medium text-foreground">
                            Dark Theme
                          </div>
                          <div className="font-sans text-xs text-muted-foreground">
                            Toggle between light and dark mode
                          </div>
                        </div>
                        <button
                          onClick={() => appDispatch({ type: 'TOGGLE_DARK_MODE' })}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${
                            appState.darkMode ? 'bg-primary' : 'bg-muted'
                          }`}
                          aria-label="Toggle dark theme"
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                              appState.darkMode ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                          <span className="absolute left-1.5 text-[9px] text-white/80">
                            {appState.darkMode && <Moon size={10} />}
                          </span>
                          <span className="absolute right-1.5 text-[9px] text-white/80">
                            {!appState.darkMode && <Sun size={10} />}
                          </span>
                        </button>
                      </div>

                      {/* Knowledge Gate Row */}
                      <div className="flex items-center justify-between py-4">
                        <div className="space-y-0.5">
                          <div className="font-sans text-sm font-medium text-foreground">
                            Knowledge Gate Enforcement
                          </div>
                          <div className="font-sans text-xs text-muted-foreground">
                            Strictly filter character knowledge by checkpoint
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="rounded-full px-3 py-1 text-xs font-medium text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                        >
                          <Shield size={12} className="mr-1.5" />
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            )}

            {/* ── About Tab ── */}
            {tab === 'about' && (
              <TabsContent value="about" className="mt-6" forceMount>
                <motion.div
                  key="about"
                  {...tabTransition}
                  className="space-y-6"
                >
                  <Card className="bg-card rounded-2xl shadow-card border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                        <Info size={18} className="text-primary" />
                        About MultiVera
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Literary description */}
                      <p className="font-serif italic text-[15px] text-muted-foreground leading-relaxed">
                        MultiVera is a Character Context Engine and Interaction Platform
                        designed for storytellers, roleplayers, and worldbuilders. It enables
                        you to create rich character personas, manage narrative timelines, and
                        chat with characters in multiple interaction modes while enforcing
                        knowledge boundaries.
                      </p>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Version', value: 'v1.0.0-demo' },
                          { label: 'Backend', value: 'FastAPI (ready)' },
                          { label: 'Frontend', value: 'React 19 + Tailwind' },
                          { label: 'Characters', value: `${mockCharacters.length} loaded` },
                        ].map((item, i) => (
                          <motion.div
                            key={item.label}
                            className="px-4 py-3 rounded-xl bg-secondary/50 space-y-1"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: 0.1 + i * 0.05 }}
                          >
                            <div className="font-sans text-xs text-muted-foreground">
                              {item.label}
                            </div>
                            <div className="font-sans text-sm font-medium text-foreground">
                              {item.value}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center gap-2 font-sans text-xs text-muted-foreground pt-2">
                        <Globe size={12} />
                        <span>
                          Built with React, Tailwind CSS, shadcn/ui, and Lucide icons.
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
}
