import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  X,
  Trash2,
  Code,
  Loader2,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Quote,
  User,
  MessageSquare,
  Users,
  Shield,
  BookOpen,
  Sparkles,
  FileJson,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { mockCharacters } from '../data/mockData';
import { getCharacterAccent } from '../lib/theme';
import type { Character } from '../types/api';

/* ─── TagInput (core logic preserved, styling upgraded) ─── */
function TagInput({
  label,
  values,
  onChange,
  placeholder,
  chipColor,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  chipColor?: string;
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
      <label className="text-sm font-medium font-sans text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <Badge
            key={v}
            variant="secondary"
            className="gap-1 pr-1 rounded-lg font-sans"
            style={
              chipColor
                ? { backgroundColor: `${chipColor}18`, color: chipColor, borderColor: `${chipColor}30` }
                : undefined
            }
          >
            {v}
            <button
              className="ml-1 hover:text-destructive transition-colors"
              onClick={() => onChange(values.filter((x) => x !== v))}
            >
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
          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl shrink-0"
          onClick={add}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

/* ─── Vertical Tab Config ─── */
const TABS = [
  { key: 'basic', label: 'Identity', icon: User },
  { key: 'speech', label: 'Voice & Speech', icon: MessageSquare },
  { key: 'relationships', label: 'Relationships', icon: Users },
  { key: 'knowledge', label: 'Knowledge Gates', icon: Shield },
  { key: 'backstory', label: 'Backstory', icon: BookOpen },
  { key: 'json', label: 'JSON', icon: FileJson },
] as const;

export default function CharacterEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: appState, dispatch } = useApp();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<string>('basic');
  const [copiedJson, setCopiedJson] = useState(false);

  const isDark = appState.darkMode;

  const character =
    appState.characters.find((c) => c.id === Number(id)) ??
    mockCharacters.find((c) => c.id === Number(id));

  const [form, setForm] = useState<Character | null>(null);

  useEffect(() => {
    if (character) {
      setForm({ ...character });
    }
  }, [character]);

  const accentColor = form ? getCharacterAccent(form.id, isDark) : '#5B4B8A';

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
    setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    dispatch({ type: 'UPDATE_CHARACTER', payload: form });
    setSaving(false);
    setSaved(true);
    toast.success('Character saved!');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    if (!form) return;
    if (confirm('Delete this character? This cannot be undone.')) {
      dispatch({ type: 'DELETE_CHARACTER', payload: form.id });
      toast.success('Character deleted');
      navigate('/project/1/characters');
    }
  };

  const copyJson = () => {
    if (!form) return;
    navigator.clipboard.writeText(JSON.stringify(form, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
    toast.success('JSON copied to clipboard');
  };

  if (!form) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12 text-muted-foreground font-sans">
        Character not found.
      </div>
    );
  }

  const initials = form.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/project/1/characters')}
        >
          <ArrowLeft size={16} />
          Characters
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl"
            onClick={() => navigate(`/chat?char=${form.id}`)}
          >
            Chat
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column — Sticky */}
        <aside className="lg:w-72 lg:shrink-0">
          <div className="lg:sticky lg:top-6 space-y-5">
            {/* Portrait */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className="flex items-center justify-center rounded-full text-white font-serif font-bold text-2xl"
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: accentColor,
                  boxShadow: `0 0 0 3px ${accentColor}33`,
                }}
              >
                {initials}
              </div>
              <div>
                <h1 className="font-serif text-2xl font-semibold text-foreground">
                  {form.name}
                </h1>
                <p className="text-sm text-muted-foreground font-sans mt-0.5">
                  {form.role}
                </p>
              </div>
              <Badge
                variant={form.is_active ? 'default' : 'secondary'}
                className="rounded-full text-xs font-sans"
                style={
                  form.is_active
                    ? { backgroundColor: `${accentColor}18`, color: accentColor, borderColor: `${accentColor}30` }
                    : undefined
                }
              >
                {form.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Vertical Tabs */}
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {TABS.map(({ key, label, icon: Icon }) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium font-sans transition-all whitespace-nowrap ${
                      active
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                    style={
                      active
                        ? {
                            borderLeft: `3px solid ${accentColor}`,
                            backgroundColor: `${accentColor}10`,
                          }
                        : { borderLeft: '3px solid transparent' }
                    }
                  >
                    <Icon size={16} style={active ? { color: accentColor } : undefined} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Column — Form Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* ─── Identity Tab ─── */}
              {tab === 'basic' && (
                <div className="space-y-5">
                  <Card className="bg-card border-border/50 rounded-2xl shadow-card">
                    <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium font-sans text-foreground">
                          Name
                        </label>
                        <Input
                          value={form.name}
                          onChange={(e) => update('name', e.target.value)}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium font-sans text-foreground">
                          Slug
                        </label>
                        <Input
                          value={form.slug}
                          onChange={(e) => update('slug', e.target.value)}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium font-sans text-foreground">
                          Role
                        </label>
                        <Input
                          value={form.role}
                          onChange={(e) => update('role', e.target.value)}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium font-sans text-foreground">
                          Affiliation
                        </label>
                        <Input
                          value={form.affiliation}
                          onChange={(e) => update('affiliation', e.target.value)}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium font-sans text-foreground">
                          Origin
                        </label>
                        <Input
                          value={form.origin}
                          onChange={(e) => update('origin', e.target.value)}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium font-sans text-foreground">
                          Tone
                        </label>
                        <Input
                          value={form.tone}
                          onChange={(e) => update('tone', e.target.value)}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium font-sans text-foreground">
                          Appearance
                        </label>
                        <Textarea
                          value={form.appearance}
                          onChange={(e) => update('appearance', e.target.value)}
                          rows={4}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30 resize-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <TagInput
                          label="Personality Traits"
                          values={form.personality}
                          onChange={(v) => update('personality', v)}
                          placeholder="Add trait..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <TagInput
                          label="Weapons / Tools"
                          values={form.weapons_tools}
                          onChange={(v) => update('weapons_tools', v)}
                          placeholder="Add weapon or tool..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── Voice & Speech Tab ─── */}
              {tab === 'speech' && (
                <div className="space-y-5">
                  <Card className="bg-card border-border/50 rounded-2xl shadow-card">
                    <CardContent className="p-5 space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium font-sans text-foreground">
                          Speech Pattern Description
                        </label>
                        <Textarea
                          value={form.speech_patterns.description}
                          onChange={(e) => update('speech_patterns.description', e.target.value)}
                          rows={4}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30 resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium font-sans text-foreground">
                          Code Switching
                        </label>
                        <Textarea
                          value={form.speech_patterns.code_switching}
                          onChange={(e) => update('speech_patterns.code_switching', e.target.value)}
                          rows={3}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30 resize-none"
                        />
                      </div>
                      <div className="bg-secondary/40 rounded-xl p-4 space-y-4">
                        <TagInput
                          label="Languages"
                          values={form.languages}
                          onChange={(v) => update('languages', v)}
                          placeholder="Add language..."
                          chipColor="#5B4B8A"
                        />
                      </div>
                      <div className="bg-secondary/40 rounded-xl p-4 space-y-4">
                        <TagInput
                          label="Example Phrases"
                          values={form.speech_patterns.example_phrases}
                          onChange={(v) => update('speech_patterns.example_phrases', v)}
                          placeholder="Add example phrase..."
                        />
                      </div>
                      <div className="bg-secondary/40 rounded-xl p-4 space-y-4">
                        <TagInput
                          label="Signature Expressions"
                          values={form.speech_patterns.signature_expressions}
                          onChange={(v) => update('speech_patterns.signature_expressions', v)}
                          placeholder="Add expression..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── Relationships Tab ─── */}
              {tab === 'relationships' && (
                <div className="space-y-5">
                  <Card className="bg-card border-border/50 rounded-2xl shadow-card">
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Allies */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <h3 className="text-sm font-semibold font-sans text-emerald-600 dark:text-emerald-400">
                              Allies
                            </h3>
                          </div>
                          <TagInput
                            label=""
                            values={form.relationships.allies}
                            onChange={(v) => update('relationships.allies', v)}
                            placeholder="Add ally..."
                            chipColor="#10B981"
                          />
                        </div>

                        {/* Enemies */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-rose-500/20">
                            <X size={16} className="text-rose-500" />
                            <h3 className="text-sm font-semibold font-sans text-rose-600 dark:text-rose-400">
                              Enemies
                            </h3>
                          </div>
                          <TagInput
                            label=""
                            values={form.relationships.enemies}
                            onChange={(v) => update('relationships.enemies', v)}
                            placeholder="Add enemy..."
                            chipColor="#F43F5E"
                          />
                        </div>

                        {/* Complex */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-amber-500/20">
                            <Sparkles size={16} className="text-amber-500" />
                            <h3 className="text-sm font-semibold font-sans text-amber-600 dark:text-amber-400">
                              Complex
                            </h3>
                          </div>
                          <TagInput
                            label=""
                            values={form.relationships.complex}
                            onChange={(v) => update('relationships.complex', v)}
                            placeholder="Add complex relationship..."
                            chipColor="#F59E0B"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── Knowledge Gates Tab (CRITICAL VISUAL) ─── */}
              {tab === 'knowledge' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Knows */}
                    <Card className="bg-card border-border/50 rounded-2xl shadow-card overflow-hidden">
                      <div className="bg-emerald-500/8 px-5 py-3 border-b border-emerald-500/15 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <h3 className="text-sm font-semibold font-sans text-emerald-700 dark:text-emerald-300">
                          Knows
                        </h3>
                      </div>
                      <CardContent className="p-5 space-y-3">
                        {form.knowledge_gates.knows.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">
                            Nothing recorded yet.
                          </p>
                        )}
                        {form.knowledge_gates.knows.map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-3 rounded-xl bg-emerald-500/8 px-4 py-3 border border-emerald-500/15"
                          >
                            <CheckCircle2
                              size={16}
                              className="text-emerald-500 shrink-0 mt-0.5"
                            />
                            <span className="text-sm text-foreground font-sans leading-relaxed">
                              {item}
                            </span>
                          </div>
                        ))}
                        <Textarea
                          value={form.knowledge_gates.knows.join('\n')}
                          onChange={(e) =>
                            update('knowledge_gates.knows', e.target.value.split('\n').filter(Boolean))
                          }
                          rows={4}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30 resize-none mt-2"
                          placeholder="One item per line..."
                        />
                      </CardContent>
                    </Card>

                    {/* Does Not Know */}
                    <Card className="bg-card border-border/50 rounded-2xl shadow-card overflow-hidden">
                      <div className="bg-rose-500/8 px-5 py-3 border-b border-rose-500/15 flex items-center gap-2">
                        <Lock size={18} className="text-rose-500" />
                        <h3 className="text-sm font-semibold font-sans text-rose-700 dark:text-rose-300">
                          Does Not Know
                        </h3>
                      </div>
                      <CardContent className="p-5 space-y-3">
                        {form.knowledge_gates.does_not_know.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">
                            Nothing recorded yet.
                          </p>
                        )}
                        {form.knowledge_gates.does_not_know.map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-3 rounded-xl bg-rose-500/8 px-4 py-3 border border-rose-500/15"
                          >
                            <Lock
                              size={16}
                              className="text-rose-500 shrink-0 mt-0.5"
                            />
                            <span className="text-sm text-foreground font-sans leading-relaxed">
                              {item}
                            </span>
                          </div>
                        ))}
                        <Textarea
                          value={form.knowledge_gates.does_not_know.join('\n')}
                          onChange={(e) =>
                            update(
                              'knowledge_gates.does_not_know',
                              e.target.value.split('\n').filter(Boolean)
                            )
                          }
                          rows={4}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30 resize-none mt-2"
                          placeholder="One item per line..."
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* ─── Backstory Tab ─── */}
              {tab === 'backstory' && (
                <div className="space-y-5">
                  <Card className="bg-card border-border/50 rounded-2xl shadow-card">
                    <CardContent className="p-5 space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium font-sans text-foreground">
                          Backstory Summary
                        </label>
                        <Textarea
                          value={form.backstory_summary}
                          onChange={(e) => update('backstory_summary', e.target.value)}
                          rows={6}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium font-sans text-foreground">
                          Notable Quotes
                        </label>
                        <TagInput
                          label=""
                          values={form.notable_quotes}
                          onChange={(v) => update('notable_quotes', v)}
                          placeholder="Add quote..."
                        />
                      </div>

                      {form.notable_quotes.length > 0 && (
                        <div className="space-y-3 pt-2">
                          {form.notable_quotes.map((quote, idx) => (
                            <div
                              key={idx}
                              className="relative pl-5 pr-4 py-4 rounded-xl bg-secondary/40 border-l-[3px]"
                              style={{ borderLeftColor: accentColor }}
                            >
                              <Quote
                                size={20}
                                className="absolute top-3 left-3 text-muted-foreground/20"
                                style={{ color: `${accentColor}30` }}
                              />
                              <p className="font-serif italic text-foreground leading-relaxed pl-4">
                                "{quote}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium font-sans text-foreground">
                          Roleplay Instructions
                        </label>
                        <Textarea
                          value={form.roleplay_instructions}
                          onChange={(e) => update('roleplay_instructions', e.target.value)}
                          rows={6}
                          className="rounded-xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/30 resize-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── JSON Tab ─── */}
              {tab === 'json' && (
                <Card className="bg-card border-border/50 rounded-2xl shadow-card">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code size={16} className="text-muted-foreground" />
                        <span className="text-sm font-medium font-sans text-foreground">
                          Character JSON
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-xl"
                        onClick={copyJson}
                      >
                        {copiedJson ? (
                          <>
                            <Check size={14} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-secondary rounded-xl p-4 text-xs overflow-auto max-h-[500px] text-muted-foreground font-mono leading-relaxed">
                      {JSON.stringify(form, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-border/50">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                size="default"
                className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-6"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saved ? (
                  <Check size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saved ? 'Saved!' : 'Save Character'}
              </Button>
            </motion.div>

            <Button
              variant="destructive"
              size="sm"
              className="gap-2 rounded-xl"
              onClick={handleDelete}
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
