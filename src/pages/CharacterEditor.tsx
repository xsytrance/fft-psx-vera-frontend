import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Save, X, Trash2, Code, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { mockCharacters } from '../data/mockData';
import type { Character } from '../types/api';

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput('');
    }
  };
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1 pr-1">
            {v}
            <button className="ml-1 hover:text-destructive" onClick={() => onChange(values.filter((x) => x !== v))}>
              <X size={12} />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder || 'Add item...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button variant="outline" size="sm" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
}

export default function CharacterEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: appState, dispatch } = useApp();
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('basic');

  const character = appState.characters.find((c) => c.id === Number(id)) ?? mockCharacters.find((c) => c.id === Number(id));

  const [form, setForm] = useState<Character | null>(null);

  useEffect(() => {
    if (character) {
      setForm({ ...character });
    }
  }, [character]);

  const update = useCallback((path: string, value: unknown) => {
    setForm((prev) => {
      if (!prev) return prev;
      const keys = path.split('.');
      const next = { ...prev } as Record<string, unknown>;
      let current: Record<string, unknown> = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
      return next as unknown as Character;
    });
  }, []);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    dispatch({ type: 'UPDATE_CHARACTER', payload: form });
    setSaving(false);
    toast.success('Character saved!');
  };

  const handleDelete = () => {
    if (!form) return;
    if (confirm('Delete this character? This cannot be undone.')) {
      dispatch({ type: 'DELETE_CHARACTER', payload: form.id });
      toast.success('Character deleted');
      navigate('/project/1/characters');
    }
  };

  if (!form) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12 text-muted-foreground">
        Character not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/project/1/characters')}>
          <ArrowLeft size={16} />
          Characters
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/chat?char=${form.id}`)}>
            Chat
          </Button>
          <Button variant="destructive" size="sm" className="gap-2" onClick={handleDelete}>
            <Trash2 size={14} />
            Delete
          </Button>
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center text-indigo-300 font-bold text-xl border border-indigo-500/20">
          {form.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{form.name}</h1>
          <p className="text-sm text-muted-foreground">{form.slug}</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary border border-border/50 flex-wrap h-auto">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="speech">Speech</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="backstory">Backstory</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4 space-y-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={form.name} onChange={(e) => update('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Input value={form.role} onChange={(e) => update('role', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Affiliation</label>
                <Input value={form.affiliation} onChange={(e) => update('affiliation', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Origin</label>
                <Input value={form.origin} onChange={(e) => update('origin', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <Input value={form.tone} onChange={(e) => update('tone', e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Appearance</label>
                <Textarea value={form.appearance} onChange={(e) => update('appearance', e.target.value)} rows={3} />
              </div>
              <TagInput
                label="Personality Traits"
                values={form.personality}
                onChange={(v) => update('personality', v)}
                placeholder="Add trait..."
              />
              <TagInput
                label="Languages"
                values={form.languages}
                onChange={(v) => update('languages', v)}
                placeholder="Add language..."
              />
              <TagInput
                label="Weapons / Tools"
                values={form.weapons_tools}
                onChange={(v) => update('weapons_tools', v)}
                placeholder="Add weapon or tool..."
              />
              <TagInput
                label="Notable Quotes"
                values={form.notable_quotes}
                onChange={(v) => update('notable_quotes', v)}
                placeholder="Add quote..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speech" className="mt-4 space-y-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Speech Pattern Description</label>
                <Textarea
                  value={form.speech_patterns.description}
                  onChange={(e) => update('speech_patterns.description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Code Switching</label>
                <Textarea
                  value={form.speech_patterns.code_switching}
                  onChange={(e) => update('speech_patterns.code_switching', e.target.value)}
                  rows={2}
                />
              </div>
              <TagInput
                label="Example Phrases"
                values={form.speech_patterns.example_phrases}
                onChange={(v) => update('speech_patterns.example_phrases', v)}
                placeholder="Add example phrase..."
              />
              <TagInput
                label="Signature Expressions"
                values={form.speech_patterns.signature_expressions}
                onChange={(v) => update('speech_patterns.signature_expressions', v)}
                placeholder="Add expression..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="mt-4 space-y-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 space-y-4">
              <TagInput
                label="Allies"
                values={form.relationships.allies}
                onChange={(v) => update('relationships.allies', v)}
                placeholder="Add ally..."
              />
              <TagInput
                label="Enemies"
                values={form.relationships.enemies}
                onChange={(v) => update('relationships.enemies', v)}
                placeholder="Add enemy..."
              />
              <TagInput
                label="Complex Relationships"
                values={form.relationships.complex}
                onChange={(v) => update('relationships.complex', v)}
                placeholder="Add complex relationship..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-4 space-y-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Knows (one per line)</label>
                <Textarea
                  value={form.knowledge_gates.knows.join('\n')}
                  onChange={(e) => update('knowledge_gates.knows', e.target.value.split('\n').filter(Boolean))}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Does Not Know (one per line)</label>
                <Textarea
                  value={form.knowledge_gates.does_not_know.join('\n')}
                  onChange={(e) => update('knowledge_gates.does_not_know', e.target.value.split('\n').filter(Boolean))}
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backstory" className="mt-4 space-y-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Backstory Summary</label>
                <Textarea
                  value={form.backstory_summary}
                  onChange={(e) => update('backstory_summary', e.target.value)}
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Roleplay Instructions</label>
                <Textarea
                  value={form.roleplay_instructions}
                  onChange={(e) => update('roleplay_instructions', e.target.value)}
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="mt-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <Code size={16} />
              <CardTitle className="text-base">Character JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 rounded-lg p-4 text-xs overflow-auto max-h-[500px] text-muted-foreground">
                {JSON.stringify(form, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
