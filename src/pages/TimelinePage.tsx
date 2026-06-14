import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Flame, ScrollText } from 'lucide-react';
import Eyebrow from '../components/ui/Eyebrow';
import TruthSeal from '../components/ui/TruthSeal';
import Badge from '../components/ui/Badge';
import type { SaveMemoryEvent, SaveMemoryResponse } from '../types';

function eventChips(event: SaveMemoryEvent) {
  const f = event.facts || {};
  const chips: { key: string; label: string; tone: 'aether' | 'danger' | 'gold' | 'caution' | 'arcane' }[] = [];
  const gained = (f.items_added?.length || 0) + (f.items_increased?.length || 0);
  const lost = (f.items_removed?.length || 0) + (f.items_decreased?.length || 0);
  const gear = (f.equipment_added?.length || 0) + (f.equipment_removed?.length || 0) + (f.equipment_changed?.length || 0);
  if (gained) chips.push({ key: 'gained', label: `+${gained} gained`, tone: 'aether' });
  if (lost) chips.push({ key: 'lost', label: `-${lost} spent`, tone: 'danger' });
  if (gear) chips.push({ key: 'gear', label: `${gear} re-armed`, tone: 'arcane' });
  if (f.gold) {
    const d = f.gold.delta;
    chips.push({ key: 'gil', label: `Gil ${d > 0 ? '+' : ''}${d.toLocaleString()}`, tone: 'caution' });
  }
  return chips;
}

export default function TimelinePage() {
  const { id } = useParams();
  const projectId = Number(id);
  const [memory, setMemory] = useState<SaveMemoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemory = useCallback(async () => {
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
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    fetchMemory();
  }, [projectId, fetchMemory]);

  const events = [...(memory?.events || [])].sort((a, b) => {
    const ta = a.generated_at ? Date.parse(a.generated_at) : 0;
    const tb = b.generated_at ? Date.parse(b.generated_at) : 0;
    return tb - ta;
  });

  return (
    <div className="page-timeline">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to={`/project/${projectId}`}>Party Ledger</Link> / <span>Timeline</span>
        </div>
        <div className="timeline-head">
          <div>
            <Eyebrow tone="aether">Save-memory archive</Eyebrow>
            <h1>Campaign Timeline</h1>
            <p className="timeline-sub">Every recorded turn of the campaign, drawn from parser-confirmed save changes.</p>
            <div style={{ marginTop: '0.6rem' }}><TruthSeal label="Parser-grounded record" /></div>
          </div>
          <div className="timeline-head-actions">
            <Link to={`/project/${projectId}/campfire`} className="btn-ember"><Flame size={16} /> Campfire</Link>
            <Link to={`/project/${projectId}`} className="btn-back"><ArrowLeft size={15} /> Back</Link>
          </div>
        </div>
      </div>

      <div className="timeline-body">
        {loading && <p className="empty-text">Reading the campaign ledger...</p>}
        {error && <p className="audit-error">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <div className="panel" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <span className="empty-icon"><ScrollText size={40} /></span>
            <h2 style={{ fontFamily: 'var(--font-serif)' }}>The ledger is empty</h2>
            <p className="empty-text" style={{ marginTop: '0.4rem' }}>
              No save memory has been recorded yet. Refresh your save to begin writing the campaign's history.
            </p>
          </div>
        )}

        {events.length > 0 && (
          <ol className="timeline">
            {events.map((event, idx) => (
              <li className="timeline-item" key={event.event_id || idx}>
                <div className="timeline-rail" aria-hidden="true">
                  <span className={`timeline-dot ${idx === 0 ? 'is-latest' : ''}`} />
                </div>
                <article className="timeline-card panel">
                  <div className="timeline-meta">
                    {event.generated_at && <span className="timeline-date">{event.generated_at}</span>}
                    {idx === 0 && <Badge tone="aether">Latest</Badge>}
                    {event.story_phase && <Badge tone="gold">{event.story_phase}</Badge>}
                  </div>
                  <h3 className="timeline-title">{event.title}</h3>
                  <p className="timeline-summary">{event.summary}</p>
                  {(() => {
                    const chips = eventChips(event);
                    if (!chips.length) return null;
                    return (
                      <div className="timeline-facts">
                        {chips.map(c => <Badge key={c.key} tone={c.tone}>{c.label}</Badge>)}
                      </div>
                    );
                  })()}
                  {event.warnings && event.warnings.length > 0 && (
                    <div className="timeline-warn">{event.warnings.map((w, i) => <div key={i}>{w}</div>)}</div>
                  )}
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
