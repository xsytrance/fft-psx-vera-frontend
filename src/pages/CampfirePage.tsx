import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Flame } from 'lucide-react';
import TruthSeal from '../components/ui/TruthSeal';
import Panel from '../components/ui/Panel';
import type { CampfireResponse, InventoryDiffItem, InventoryEquipmentChangedDiff, InventoryEquipmentDiff, SaveMemoryEvent, SaveMemoryResponse } from '../types';

const DEFAULT_CAMPFIRE_QUESTION = 'What do you all make of what changed since the last save?';

function formatDelta(delta: number) {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function EventItemList({ title, items }: { title: string; items?: InventoryDiffItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-amber-300">{title}</h3>
      <ul className="space-y-2 text-sm">
        {items.map((item, idx) => (
          <li key={`${title}-${item.item_id_hex || item.item_name}-${idx}`} className="rounded border border-amber-900/30 bg-slate-900/60 p-2 text-amber-100/90">
            <span className="font-semibold">{item.item_name || 'Unknown parsed item ID'}</span>
            {item.item_id_hex && <span className="ml-2 font-mono text-xs text-amber-400/70">{item.item_id_hex}</span>}
            <span className="ml-2 text-xs text-amber-500/80">{item.before_count} → {item.after_count}</span>
            <span className="ml-2 font-mono text-xs text-emerald-300">{formatDelta(item.delta)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EquipmentList({ title, items }: { title: string; items?: InventoryEquipmentDiff[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-blue-300">{title}</h3>
      <ul className="space-y-2 text-sm">
        {items.map((item, idx) => (
          <li key={`${title}-${item.character_name}-${item.equipment_slot}-${idx}`} className="rounded border border-blue-900/30 bg-slate-900/60 p-2 text-blue-100/90">
            <span className="font-semibold">{item.character_name}</span>
            {item.equipment_slot && <span className="ml-2 text-xs text-blue-300/70">{item.equipment_slot}</span>}
            <span className="ml-2">{item.item_name || 'Unknown parsed item ID'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EquipmentChanges({ items }: { items?: InventoryEquipmentChangedDiff[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-purple-300">Changed equipment</h3>
      <ul className="space-y-2 text-sm">
        {items.map((item, idx) => (
          <li key={`${item.character_name}-${item.equipment_slot}-${idx}`} className="rounded border border-purple-900/30 bg-slate-900/60 p-2 text-purple-100/90">
            <span className="font-semibold">{item.character_name}</span>
            {item.equipment_slot && <span className="ml-2 text-xs text-purple-300/70">{item.equipment_slot}</span>}
            <span className="ml-2">{item.before.item_name || 'Unknown parsed item ID'} → {item.after.item_name || 'Unknown parsed item ID'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SaveMemoryFacts({ event }: { event: SaveMemoryEvent }) {
  const facts = event.facts || {};
  return (
    <div className="space-y-4">
      {facts.gold && (
        <div className="rounded border border-yellow-800/40 bg-yellow-950/20 p-3 text-yellow-100">
          Gil: {facts.gold.before} → {facts.gold.after} <span className="font-mono">({formatDelta(facts.gold.delta)})</span>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <EventItemList title="Gained" items={facts.items_added} />
        <EventItemList title="Lost" items={facts.items_removed} />
        <EventItemList title="Increased" items={facts.items_increased} />
        <EventItemList title="Decreased" items={facts.items_decreased} />
        <EquipmentList title="Newly equipped" items={facts.equipment_added} />
        <EquipmentList title="Unequipped" items={facts.equipment_removed} />
        <EquipmentChanges items={facts.equipment_changed} />
      </div>
      {event.warnings && event.warnings.length > 0 && (
        <div className="rounded border border-yellow-800/40 bg-yellow-950/20 p-3 text-sm text-yellow-200">
          {event.warnings.map((warning, idx) => <div key={`${warning}-${idx}`}>{warning}</div>)}
        </div>
      )}
    </div>
  );
}

export default function CampfirePage() {
  const { id } = useParams();
  const projectId = Number(id);
  const [memory, setMemory] = useState<SaveMemoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [campfireError, setCampfireError] = useState<string | null>(null);
  const [campfireResult, setCampfireResult] = useState<CampfireResponse | null>(null);

  const fetchMemory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/save-memory`);
      if (!res.ok) throw new Error(`Save memory unavailable (${res.status})`);
      const data: SaveMemoryResponse = await res.json();
      setMemory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save memory unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    fetchMemory();
  }, [projectId]);

  const askCampfire = async () => {
    const event = memory?.latest_event;
    if (!event) return;
    setAsking(true);
    setCampfireError(null);
    setCampfireResult(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/campfire/save-memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.event_id,
          question: question.trim() || DEFAULT_CAMPFIRE_QUESTION,
          mode: 'campfire',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Campfire could not answer yet.');
      setCampfireResult(data as CampfireResponse);
    } catch (err) {
      setCampfireError(err instanceof Error ? err.message : 'Campfire could not answer yet.');
    } finally {
      setAsking(false);
    }
  };

  const latest = memory?.latest_event || null;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto text-amber-100">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow eyebrow--ember mb-1">Parser-grounded save memory</p>
          <h1 className="flex items-center gap-2 text-3xl font-serif font-bold">
            <Flame size={26} className="text-orange-400" /> Campfire
          </h1>
          <p className="mt-1 text-sm text-amber-400/70">Campfire memories are drawn from parser-confirmed save changes. The party can react and reflect, but they cannot invent save facts.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={fetchMemory} disabled={loading} className="rounded border border-amber-800/50 px-3 py-2 text-sm text-amber-200 hover:bg-amber-900/30 disabled:opacity-60">Refresh Memory</button>
          <Link to={`/project/${projectId}`} className="rounded border border-amber-800/50 px-3 py-2 text-sm text-amber-200 hover:bg-amber-900/30">Back to Project</Link>
        </div>
      </div>

      {latest && (
        <details className="audit-drawer mb-6">
          <summary>Inspect Save Memory Schema</summary>
          <div className="audit-drawer__body">
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap">
              {JSON.stringify(latest, null, 2)}
            </pre>
          </div>
        </details>
      )}

      {loading && <div className="rounded border border-amber-900/30 bg-slate-950/40 p-6 text-amber-300/70">Reading save memory...</div>}
      {error && <div className="rounded border border-red-800/40 bg-red-950/30 p-6 text-red-200">{error}</div>}

      {!loading && !error && !latest && (
        <div className="rounded border border-amber-800/30 bg-amber-950/20 p-8 text-center text-amber-300/80">
          <h2 className="mb-2 text-xl font-serif font-bold">No save memory recorded yet.</h2>
          <p>{memory?.message || 'No save memory has been recorded yet. Refresh your save to create parser-grounded memory for the party to discuss.'}</p>
        </div>
      )}

      {latest && (
        <div className="space-y-6">
          <Panel variant="ember">
            <div className="mb-4">
              <div className="mb-1 flex flex-wrap items-center gap-3">
                <p className="eyebrow eyebrow--ember">Since the last save refresh</p>
                <TruthSeal label="From your save" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-orange-100">{latest.title}</h2>
              <p className="mt-2 text-lg text-amber-100/90">{latest.summary}</p>
              {latest.generated_at && <p className="mt-1 text-xs text-amber-500/70 font-mono">Generated: {latest.generated_at}</p>}
            </div>
            <SaveMemoryFacts event={latest} />
          </Panel>

          <Panel variant="arcane">
            <h2 className="mb-2 text-xl font-serif font-bold text-purple-100">Ask at Campfire</h2>
            <textarea
              value={question}
              onChange={event => setQuestion(event.target.value)}
              placeholder="Ask the party about what changed since the last save..."
              rows={3}
              className="mb-3 w-full resize-none rounded border border-purple-800/40 bg-slate-950 p-3 text-sm text-purple-100 placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-600/60"
            />
            <button
              type="button"
              onClick={askCampfire}
              disabled={asking}
              className="rounded bg-purple-700 px-4 py-2 text-sm font-semibold text-purple-50 hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {asking ? 'Asking at campfire...' : 'Ask at Campfire'}
            </button>

            {campfireError && <div className="mt-3 rounded border border-red-800/40 bg-red-950/30 p-3 text-red-200">{campfireError}</div>}
            {campfireResult && (
              <div className="mt-5 space-y-3">
                {campfireResult.warnings && campfireResult.warnings.length > 0 && (
                  <div className="rounded border border-yellow-800/40 bg-yellow-950/20 p-3 text-sm text-yellow-200">
                    {campfireResult.warnings.map((warning, idx) => <div key={`${warning}-${idx}`}>{warning}</div>)}
                  </div>
                )}
                {campfireResult.responses.map(response => (
                  <div key={`${response.character_id}-${response.character_name}`} className="rounded border border-purple-800/40 bg-slate-900/70 p-4">
                    <h3 className="mb-1 font-semibold text-purple-200">{response.character_name}</h3>
                    <p className="whitespace-pre-wrap text-sm text-purple-50/90">{response.text}</p>
                  </div>
                ))}
                {campfireResult.prompt_inspections && campfireResult.prompt_inspections.length > 0 && (
                  <details className="audit-drawer mt-6">
                    <summary>Prompt Inspector</summary>
                    <div className="audit-drawer__body space-y-4">
                      {campfireResult.prompt_inspections.map((insp, idx) => (
                        <div key={idx}>
                          <h4 className="mb-2 font-semibold text-amber-300">System Prompt: {insp.character_name}</h4>
                          <pre className="max-h-64 overflow-auto whitespace-pre-wrap">
                            {insp.system_prompt}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
