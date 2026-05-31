import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Search, Users, Plus, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { getCharacterAccent, getCharacterAvatar } from '../lib/theme';
import { useApp } from '../context/AppContext';
import { mockCharacters } from '../data/mockData';

export default function CharacterBrowser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: appState } = useApp();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const projectId = Number(id) || 1;
  const characters = appState.characters.length
    ? appState.characters.filter((c) => c.project_id === projectId)
    : mockCharacters.filter((c) => c.project_id === projectId);

  const roles = useMemo(
    () => Array.from(new Set(mockCharacters.map((c) => c.role.split(',')[0].trim()))),
    []
  );

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      const matchName = c.name.toLowerCase().includes(query.toLowerCase());
      const matchAffil = c.affiliation.toLowerCase().includes(query.toLowerCase());
      const matchRole = roleFilter === '' || c.role.toLowerCase().includes(roleFilter.toLowerCase());
      return (matchName || matchAffil) && matchRole;
    });
  }, [query, roleFilter, characters]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(`/project/${id}`)}>
          <ArrowLeft size={16} />
          Project
        </Button>
        <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={() => {}}>
          <Plus size={16} />
          Add Character
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users size={24} className="text-primary" />
          Characters
        </h1>
        <p className="text-muted-foreground">Browse, search, and manage characters in this project.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, faction, or origin..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter size={14} className="text-muted-foreground shrink-0" />
          <Badge
            variant={roleFilter === '' ? 'default' : 'secondary'}
            className="cursor-pointer shrink-0"
            onClick={() => setRoleFilter('')}
          >
            All
          </Badge>
          {roles.map((role) => (
            <Badge
              key={role}
              variant={roleFilter === role ? 'default' : 'secondary'}
              className="cursor-pointer shrink-0"
              onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
            >
              {role}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((char) => {
          const accent = getCharacterAccent(char.id, appState.darkMode);
          const avatar = getCharacterAvatar(char.id);
          return (
            <Card
              key={char.id}
              className="bg-card border-border/50 cursor-pointer hover:border-primary/50 hover:bg-card/80 transition-all group"
              onClick={() => navigate(`/character/${char.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden border-2"
                    style={{ borderColor: accent }}
                  >
                    <img
                      src={avatar}
                      alt={char.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      {char.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <h3 className="font-semibold text-lg">{char.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{char.role}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="secondary" className="text-xs">{char.affiliation || 'No affiliation'}</Badge>
                  <Badge variant="secondary" className="text-xs">{char.origin}</Badge>
                </div>
                {char.personality.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {char.personality.slice(0, 4).map((trait) => (
                      <span key={trait} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users size={32} className="mx-auto mb-2 opacity-50" />
          <p>No characters match your search.</p>
        </div>
      )}
    </div>
  );
}
