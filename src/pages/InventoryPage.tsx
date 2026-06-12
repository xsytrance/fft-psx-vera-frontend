import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import type { InventoryEquippedBy, InventoryItem, InventoryResponse } from '../types';

const VALID_TYPES = ['All', 'Weapon', 'Shield', 'Helmet', 'Armor', 'Accessory', 'Consumable', 'Key Item', 'Unknown'];

function formatStatLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function meaningfulStats(stats?: Record<string, number>) {
  if (!stats) return [];
  return Object.entries(stats).filter(([, value]) => typeof value === 'number' && value !== 0);
}

function isUnknownItem(item: InventoryItem) {
  return item.item_name.startsWith('Unknown_0x') || item.type === 'Unknown';
}

function equippedByLabel(eq: InventoryEquippedBy) {
  if (typeof eq === 'string') return eq;
  const alias = eq.canonical_name && eq.canonical_name !== eq.character_name ? ` (${eq.canonical_name})` : '';
  const slot = eq.equipment_slot ? ` - ${eq.equipment_slot}` : '';
  const saveSlot = eq.save_slot !== undefined && eq.save_slot !== null ? ` - save slot ${eq.save_slot}` : '';
  return `${eq.character_name}${alias}${slot}${saveSlot}`;
}

type AskPartyResponse = {
  question: string;
  responses: Array<{ character_id: number; character_name: string; text: string }>;
  warnings?: string[];
};

const DEFAULT_ITEM_QUESTION = 'What can you tell me about this item from our inventory?';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-amber-900/20 py-2 text-sm">
      <span className="text-amber-500/80">{label}</span>
      <span className="text-right text-amber-100">{value}</span>
    </div>
  );
}

function ItemDetailDrawer({ item, projectId, onClose }: { item: InventoryItem; projectId: number; onClose: () => void }) {
  const stats = meaningfulStats(item.stats);
  const unknown = isUnknownItem(item);
  const [askQuestion, setAskQuestion] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [askResult, setAskResult] = useState<AskPartyResponse | null>(null);

  const askParty = async () => {
    setAskLoading(true);
    setAskError(null);
    setAskResult(null);
    try {
      const question = askQuestion.trim() || DEFAULT_ITEM_QUESTION;
      const res = await fetch(`/api/projects/${projectId}/inventory/items/ask-party`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.item_id,
          item_id_hex: item.item_id_hex,
          item_name: item.item_name,
          question,
          mode: 'campfire',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = typeof data.detail === 'string' ? data.detail : 'Party could not answer about this item.';
        throw new Error(detail);
      }
      setAskResult(data as AskPartyResponse);
    } catch (err) {
      const fallback = 'This item could not be verified in the current parsed save, so the party will not comment on it.';
      setAskError(err instanceof Error ? err.message : fallback);
    } finally {
      setAskLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-stretch md:justify-end" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-item-detail-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-amber-800/40 bg-slate-950 p-5 shadow-2xl md:h-full md:max-h-none md:w-[480px] md:rounded-none md:border-y-0 md:border-r-0"
        onClick={event => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-amber-500/70">Item details</p>
            <h2 id="inventory-item-detail-title" className="text-2xl font-serif font-bold text-amber-100">
              {item.item_name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded border border-amber-800/40 bg-amber-950/40 px-2 py-1 text-amber-300">{item.item_id_hex || 'No ID'}</span>
              <span className="rounded border border-blue-800/40 bg-blue-950/40 px-2 py-1 text-blue-300">{item.type}</span>
              {item.confidence && <span className="rounded border border-emerald-800/40 bg-emerald-950/30 px-2 py-1 text-emerald-300">{item.confidence}</span>}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close item details"
            onClick={onClose}
            className="rounded border border-amber-800/50 px-3 py-1 text-lg text-amber-300 hover:bg-amber-900/30"
          >
            x
          </button>
        </div>

        {unknown && (
          <div className="mb-4 rounded border border-yellow-700/50 bg-yellow-950/20 p-3 text-sm text-yellow-200">
            This item ID was parsed from the save, but metadata is incomplete. Unknown parsed data is still valuable.
          </div>
        )}

        <section className="mb-5 rounded border border-amber-900/30 bg-slate-900/50 p-3">
          <DetailRow label="Count in bag" value={`x${item.count}`} />
          <DetailRow label="Item ID" value={item.item_id_hex} />
          <DetailRow label="Source offset" value={item.source_offset !== undefined && item.source_offset !== null ? `0x${Number(item.source_offset).toString(16).toUpperCase()}` : null} />
          <DetailRow label="Price" value={item.price !== undefined && item.price !== null ? `${item.price} gil` : null} />
        </section>

        <section className="mb-5">
          <h3 className="mb-2 font-semibold text-amber-200">Description</h3>
          <p className="rounded border border-amber-900/30 bg-slate-900/50 p-3 text-sm text-amber-100/80">
            {item.description || 'No item description available yet.'}
          </p>
        </section>

        <section className="mb-5">
          <h3 className="mb-2 font-semibold text-amber-200">Stats</h3>
          {stats.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {stats.map(([key, value]) => (
                <div key={key} className="rounded border border-amber-900/30 bg-slate-900/50 p-2">
                  <div className="text-xs text-amber-500/70">{formatStatLabel(key)}</div>
                  <div className="font-mono text-lg text-amber-100">{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded border border-amber-900/30 bg-slate-900/50 p-3 text-sm text-amber-400/70">No stat modifiers recorded.</p>
          )}
        </section>

        <section className="mb-5">
          <h3 className="mb-2 font-semibold text-amber-200">Effects</h3>
          {item.effects && item.effects.length > 0 ? (
            <ul className="space-y-2 text-sm text-amber-100/80">
              {item.effects.map((effect, idx) => <li key={`${effect}-${idx}`} className="rounded border border-amber-900/30 bg-slate-900/50 p-2">{effect}</li>)}
            </ul>
          ) : (
            <p className="rounded border border-amber-900/30 bg-slate-900/50 p-3 text-sm text-amber-400/70">No special effects recorded.</p>
          )}
        </section>

        <section className="mb-5">
          <h3 className="mb-2 font-semibold text-amber-200">Locations</h3>
          {item.locations && item.locations.length > 0 ? (
            <ul className="space-y-2 text-sm text-amber-100/80">
              {item.locations.map((location, idx) => <li key={`${location}-${idx}`} className="rounded border border-amber-900/30 bg-slate-900/50 p-2">{location}</li>)}
            </ul>
          ) : (
            <p className="rounded border border-amber-900/30 bg-slate-900/50 p-3 text-sm text-amber-400/70">No location metadata recorded yet.</p>
          )}
        </section>

        <section className="mb-5">
          <h3 className="mb-2 font-semibold text-amber-200">Also currently equipped by</h3>
          {item.equipped_by && item.equipped_by.length > 0 ? (
            <ul className="space-y-2 text-sm text-blue-200">
              {item.equipped_by.map((eq, idx) => (
                <li key={`${equippedByLabel(eq)}-${idx}`} className="rounded border border-blue-800/40 bg-blue-950/30 p-2">
                  {equippedByLabel(eq)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded border border-blue-900/30 bg-slate-900/50 p-3 text-sm text-blue-300/70">No equipped cross-references for this item.</p>
          )}
          <p className="mt-2 text-xs text-amber-500/70">
            Equipped references are cross-checks only. They are not subtracted from bag inventory counts.
          </p>
        </section>

        <section className="mb-5 rounded border border-purple-800/40 bg-purple-950/20 p-3">
          <h3 className="mb-2 font-semibold text-purple-200">Ask Party About This Item</h3>
          <p className="mb-3 text-xs text-purple-200/70">
            The answer is grounded in parser-confirmed inventory data. Characters cannot invent item counts or ownership.
          </p>
          <textarea
            value={askQuestion}
            onChange={event => setAskQuestion(event.target.value)}
            placeholder={DEFAULT_ITEM_QUESTION}
            rows={3}
            className="mb-3 w-full resize-none rounded border border-purple-800/40 bg-slate-950 p-2 text-sm text-purple-100 placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-600/60"
          />
          <button
            type="button"
            onClick={askParty}
            disabled={askLoading}
            className="rounded bg-purple-700 px-3 py-2 text-sm font-semibold text-purple-50 hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {askLoading ? 'Asking party...' : 'Ask Party'}
          </button>

          {askError && (
            <div className="mt-3 rounded border border-red-800/50 bg-red-950/30 p-3 text-sm text-red-200">
              {askError}
            </div>
          )}

          {askResult && (
            <div className="mt-4 space-y-3">
              {askResult.warnings && askResult.warnings.length > 0 && (
                <div className="rounded border border-yellow-800/50 bg-yellow-950/20 p-2 text-xs text-yellow-200">
                  {askResult.warnings.map((warning, idx) => <div key={`${warning}-${idx}`}>{warning}</div>)}
                </div>
              )}
              {askResult.responses.map(response => (
                <div key={`${response.character_id}-${response.character_name}`} className="rounded border border-purple-800/40 bg-slate-900/70 p-3">
                  <div className="mb-1 text-sm font-semibold text-purple-200">{response.character_name}</div>
                  <p className="whitespace-pre-wrap text-sm text-purple-50/90">{response.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <details className="rounded border border-amber-900/30 bg-slate-900/50 p-3 text-xs text-amber-300/70">
          <summary className="cursor-pointer font-semibold text-amber-300">Raw parser/enrichment JSON</summary>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words">{JSON.stringify(item, null, 2)}</pre>
        </details>
      </aside>
    </div>
  );
}

export default function InventoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const projectId = Number(id);

  useEffect(() => {
    if (!projectId) return;
    
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/projects/${projectId}/inventory`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch inventory`);
        const data: InventoryResponse = await res.json();
        setInventory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [projectId]);

  useEffect(() => {
    if (!selectedItem) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem]);

  const filteredItems = inventory?.items.filter(item => {
    const description = item.description || '';
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  if (loading) {
    return (
      <div className="p-6 text-center text-amber-300 animate-pulse">
        Loading inventory...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-400 border border-red-800 bg-red-900/20 rounded-lg">
        <p className="font-bold">Error loading inventory</p>
        <p className="text-sm mt-2">{error}</p>
        <button 
          onClick={() => navigate(`/project/${projectId}`)}
          className="mt-4 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded text-sm"
        >
          Back to Project
        </button>
      </div>
    );
  }

  const hasAnyItems = inventory && inventory.items.length > 0;
  
  if (!hasAnyItems) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto text-amber-400/70 border border-amber-800/30 bg-amber-950/20 rounded-lg p-8">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-xl font-serif font-bold mb-2">No inventory entries parsed yet.</h3>
          <p className="text-sm mb-6">Characters must not guess your item list. The parser found no items in this save.</p>
          <Link 
            to={`/project/${projectId}`}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded text-sm transition-colors"
          >
            Back to Project
          </Link>
        </div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto text-amber-400/70 border border-amber-800/30 bg-amber-950/20 rounded-lg p-8">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-xl font-serif font-bold mb-2">No items match your filters.</h3>
          <p className="text-sm mb-6">Try adjusting your search query or category filter.</p>
          <button 
            onClick={() => { setSearchQuery(''); setFilterType('All'); }}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded text-sm transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    );
  }

  const uniqueItemCount = inventory?.inventory_count ?? inventory?.total_unique_items ?? 0;
  const totalQuantity = inventory?.total_quantity ?? inventory?.total_item_count ?? 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-amber-100">Current Inventory</h1>
          <p className="text-sm text-amber-400/70 mt-1">
            {uniqueItemCount} unique items &middot; {totalQuantity} total
            {inventory.has_save_truth && <span className="ml-2 text-emerald-400">(Parser-verified Save Truth)</span>}
          </p>
        </div>
        <Link 
          to={`/project/${projectId}`}
          className="px-4 py-2 bg-amber-800/50 hover:bg-amber-700/50 border border-amber-700 text-amber-200 rounded text-sm transition-colors"
        >
          &larr; Back to Project
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-900 border border-amber-800/50 rounded text-amber-100 placeholder-amber-600/50 focus:outline-none focus:border-amber-600"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-amber-800/50 rounded text-amber-100 focus:outline-none focus:border-amber-600"
        >
          {VALID_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <button 
            type="button"
            key={`${item.item_id_hex}-${item.item_name}`}
            onClick={() => setSelectedItem(item)}
            className="text-left bg-slate-900/80 border border-amber-800/30 rounded-lg p-4 hover:border-amber-600/50 focus:outline-none focus:ring-2 focus:ring-amber-500/70 transition-colors group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-amber-200 group-hover:text-amber-100 transition-colors">
                  {item.item_name}
                </h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="inline-block px-2 py-0.5 text-xs bg-amber-900/40 text-amber-400 rounded border border-amber-800/30">
                    {item.type}
                  </span>
                  <span className="inline-block px-2 py-0.5 text-xs bg-slate-800/80 text-amber-300/80 rounded border border-amber-900/30">
                    {item.item_id_hex || 'No ID'}
                  </span>
                </div>
              </div>
              <span className="text-2xl font-bold text-emerald-400">x{item.count}</span>
            </div>

            {isUnknownItem(item) && (
              <p className="mb-2 rounded border border-yellow-700/40 bg-yellow-950/20 px-2 py-1 text-[11px] text-yellow-200/80">
                Parsed ID; metadata incomplete.
              </p>
            )}

            <p className="text-xs text-amber-300/60 mb-3 line-clamp-2 min-h-[2.5rem]">
              {item.description || 'No item description available yet.'}
            </p>

            {item.equipped_by && item.equipped_by.length > 0 && (
              <div className="mb-3 pt-3 border-t border-amber-800/20">
                <p className="text-[10px] uppercase tracking-wider text-amber-500/70 mb-1.5">Equipped by</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.equipped_by.map((eq, idx) => {
                    const charName = typeof eq === 'string' ? eq : eq.character_name;
                    return (
                      <span key={`${charName}-${idx}`} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/30 border border-blue-800/40 rounded text-[10px] text-blue-300">
                        {charName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {(() => {
              const stats = meaningfulStats(item.stats).slice(0, 3);
              if (stats.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-2 text-[10px] text-amber-400/60 font-mono">
                  {stats.map(([key, value]) => <span key={key}>{formatStatLabel(key)}: {value}</span>)}
                </div>
              );
            })()}

            <div className="mt-3 text-xs font-semibold text-amber-400/80 group-hover:text-amber-200">View details</div>
          </button>
        ))}
      </div>

      <details className="mt-6 rounded border border-amber-800/30 bg-slate-950/40 p-3 text-xs text-amber-400/70">
        <summary className="cursor-pointer font-semibold text-amber-300">Inventory contract details</summary>
        <div className="mt-3 grid gap-1 text-left font-mono">
          <div>inventory_schema_version: {inventory.inventory_schema_version || 'unknown'}</div>
          <div>schema_version: {inventory.schema_version || 'null'}</div>
          <div>source.inventory_source: {inventory.source?.inventory_source || 'unknown'}</div>
          <div>warnings: {inventory.warnings?.length ?? 0}</div>
        </div>
      </details>

      {selectedItem && <ItemDetailDrawer item={selectedItem} projectId={projectId} onClose={() => setSelectedItem(null)} />}

      <div className="mt-8 pt-4 border-t border-amber-800/20 text-center text-xs text-amber-500/50">
        Inventory counts are parser-verified from your uploaded save file. 
        Equipped items are cross-referenced and NOT subtracted from bag totals.
      </div>
    </div>
  );
}
