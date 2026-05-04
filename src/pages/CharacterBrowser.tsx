import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, BookX, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import CharacterCard from '../components/ui/CharacterCard';
import { mockCharacters } from '../data/mockData';

export default function CharacterBrowser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const roles = useMemo(
    () => Array.from(new Set(mockCharacters.map((c) => c.role.split(',')[0].trim()))),
    []
  );

  const filtered = useMemo(() => {
    return mockCharacters.filter((c) => {
      const matchName = c.name.toLowerCase().includes(query.toLowerCase());
      const matchAffil = c.affiliation.toLowerCase().includes(query.toLowerCase());
      const matchRole = roleFilter === '' || c.role.toLowerCase().includes(roleFilter.toLowerCase());
      return (matchName || matchAffil) && matchRole;
    });
  }, [query, roleFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Top bar */}
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
          className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => {}}
        >
          <Plus size={16} />
          Add Character
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-4xl font-semibold text-foreground tracking-tight">
          The Cast
        </h1>
        <p className="text-muted-foreground font-sans">
          {filtered.length} {filtered.length === 1 ? 'soul' : 'souls'} inhabit this world
        </p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Find a character..."
            className="pl-11 py-3 h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => setRoleFilter('')}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              roleFilter === ''
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            All
          </button>
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                roleFilter === role
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((char, index) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: index * 0.08,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <CharacterCard
              characterId={char.id}
              name={char.name}
              role={char.role}
              affiliation={char.affiliation}
              personality={char.personality}
              onClick={() => navigate(`/character/${char.id}`)}
              onChat={() => navigate(`/chat?char=${char.id}`)}
            />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-20 space-y-4"
        >
          <BookX size={48} className="mx-auto text-muted-foreground/40" />
          <p className="text-lg text-muted-foreground font-serif">
            No characters found in this world
          </p>
          <Button
            variant="outline"
            className="rounded-xl gap-2"
            onClick={() => {}}
          >
            <Plus size={16} />
            Add a character
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
