import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import type { InventoryItem, InventoryResponse } from '../types';
import CharacterAvatar from '../components/CharacterAvatar';

const VALID_TYPES = ['All', 'Weapon', 'Shield', 'Helmet', 'Armor', 'Accessory', 'Consumable', 'Key Item', 'Unknown'];

export default function InventoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

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

  // Split empty states: truly no inventory vs filters hide all results
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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-amber-100">Current Inventory</h1>
          <p className="text-sm text-amber-400/70 mt-1">
            {inventory.total_unique_items} unique items &middot; {inventory.total_item_count} total
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

      {/* Filters */}
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <div 
            key={`${item.item_id_hex}-${item.item_name}`}
            className="bg-slate-900/80 border border-amber-800/30 rounded-lg p-4 hover:border-amber-600/50 transition-colors group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-amber-200 group-hover:text-amber-100 transition-colors">
                  {item.item_name}
                </h3>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-amber-900/40 text-amber-400 rounded border border-amber-800/30">
                  {item.type}
                </span>
              </div>
              <span className="text-2xl font-bold text-emerald-400">x{item.count}</span>
            </div>

            <p className="text-xs text-amber-300/60 mb-3 line-clamp-2 min-h-[2.5rem]">
              {item.description || 'No item description available yet.'}
            </p>

            {/* Equipped By */}
            {item.equipped_by && item.equipped_by.length > 0 && (
              <div className="mb-3 pt-3 border-t border-amber-800/20">
                <p className="text-[10px] uppercase tracking-wider text-amber-500/70 mb-1.5">Equipped by</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.equipped_by.map((eq, idx) => {
                    const charName = typeof eq === 'string' ? eq : eq.character_name;
                    return (
                      <span key={`${charName}-${idx}`} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/30 border border-blue-800/40 rounded text-[10px] text-blue-300">
                        {typeof eq !== 'string' && charName ? <CharacterAvatar name={charName} size={14} /> : null}
                        {charName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats snippet if any are non-zero */}
            {(() => {
              const stats = item.stats as { pa?: number; ma?: number; evade?: number } | undefined;
              if ((stats?.pa ?? 0) > 0 || (stats?.ma ?? 0) > 0 || (stats?.evade ?? 0) > 0) {
                return (
                  <div className="flex flex-wrap gap-2 text-[10px] text-amber-400/60 font-mono">
                    {(stats?.pa ?? 0) > 0 && <span>PA: {stats.pa}</span>}
                    {(stats?.ma ?? 0) > 0 && <span>MA: {stats.ma}</span>}
                    {(stats?.evade ?? 0) > 0 && <span>Ev: {stats.evade}</span>}
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-8 pt-4 border-t border-amber-800/20 text-center text-xs text-amber-500/50">
        Inventory counts are parser-verified from your uploaded save file. 
        Equipped items are cross-referenced and NOT subtracted from bag totals.
      </div>
    </div>
  );
}
