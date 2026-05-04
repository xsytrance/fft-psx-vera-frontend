import { useState, useMemo } from 'react';
import {
  Settings,
  Copy,
  Download,
  CheckCircle2,
  Globe,
  FlaskConical,
  Info,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { useApp } from '../context/AppContext';
import { mockCharacters, mockCommits } from '../data/mockData';
import { toast } from 'sonner';

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings size={24} className="text-indigo-400" />
          Settings
        </h1>
        <p className="text-muted-foreground">Configure MultiVera and export character personas.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary border border-border/50">
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="mode">Mode</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="mt-4 space-y-4">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download size={16} />
                Persona Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Character</label>
                  <select
                    className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm"
                    value={exportCharId}
                    onChange={(e) => setExportCharId(Number(e.target.value))}
                  >
                    {mockCharacters.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Checkpoint</label>
                  <select
                    className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm"
                    value={exportCommitId}
                    onChange={(e) => setExportCommitId(Number(e.target.value))}
                  >
                    {mockCommits.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mode</label>
                  <select
                    className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm"
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

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy System Prompt'}
                </Button>
                <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={handleDownloadPersona}>
                  <Download size={14} />
                  Download JSON
                </Button>
              </div>

              <ScrollArea className="h-80 rounded-lg bg-secondary/50 border border-border/30 p-4">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{systemPrompt}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mode" className="mt-4 space-y-4">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical size={16} />
                Application Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <div className="text-sm font-medium">Demo Mode</div>
                  <div className="text-xs text-muted-foreground">Use mock data instead of a live backend API</div>
                </div>
                <Button
                  variant={appState.demoMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => appDispatch({ type: 'TOGGLE_DEMO_MODE' })}
                >
                  {appState.demoMode ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <div className="text-sm font-medium">Dark Theme</div>
                  <div className="text-xs text-muted-foreground">Toggle between light and dark mode</div>
                </div>
                <Button
                  variant={appState.darkMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => appDispatch({ type: 'TOGGLE_DARK_MODE' })}
                >
                  {appState.darkMode ? 'Dark' : 'Light'}
                </Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium">Knowledge Gate Enforcement</div>
                  <div className="text-xs text-muted-foreground">Strictly filter character knowledge by checkpoint</div>
                </div>
                <Badge variant="outline" className="text-emerald-400">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-4 space-y-4">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info size={16} />
                About MultiVera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                MultiVera is a Character Context Engine and Interaction Platform designed for storytellers,
                roleplayers, and worldbuilders. It enables you to create rich character personas, manage
                narrative timelines, and chat with characters in multiple interaction modes while enforcing
                knowledge boundaries.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="px-3 py-2 rounded-md bg-secondary/50">
                  <div className="text-muted-foreground text-xs">Version</div>
                  <div>v1.0.0-demo</div>
                </div>
                <div className="px-3 py-2 rounded-md bg-secondary/50">
                  <div className="text-muted-foreground text-xs">Backend</div>
                  <div>FastAPI (ready)</div>
                </div>
                <div className="px-3 py-2 rounded-md bg-secondary/50">
                  <div className="text-muted-foreground text-xs">Frontend</div>
                  <div>React 19 + Tailwind</div>
                </div>
                <div className="px-3 py-2 rounded-md bg-secondary/50">
                  <div className="text-muted-foreground text-xs">Characters</div>
                  <div>{mockCharacters.length} loaded</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Globe size={12} />
                <span>Built with React, Tailwind CSS, shadcn/ui, and Lucide icons.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
