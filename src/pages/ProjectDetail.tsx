import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Users, GitCommit, BookOpen, ChevronRight,
  Star, Shield, Swords,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { getCharacterAvatar, getCharacterAccent } from '../lib/theme';
import { useApp } from '../context/AppContext';

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state: appState } = useApp();
  const [tab, setTab] = useState('characters');
  const [fetchedProject, setFetchedProject] = useState<any>(null);
  const [fetchedCharacters, setFetchedCharacters] = useState<any[]>([]);
  const fetchedRef = useRef(false);

  const projectId = Number(id) || 0;
  const project = appState.projects.find((p) => p.id === projectId) || fetchedProject;

  useEffect(() => {
    // If project is already in context, just fetch characters
    const existingProject = appState.projects.find((p) => p.id === projectId);
    if (existingProject) {
      if (fetchedRef.current) return;
      fetchedRef.current = true;
      console.log('[PD] Project in context, fetching characters for', projectId);
      fetch('/api/projects/' + projectId + '/characters')
        .then(r => r.json())
        .then(chars => {
          console.log('[PD] Got chars:', chars?.length);
          if (Array.isArray(chars)) setFetchedCharacters(chars);
        })
        .catch(e => console.error('[PD] Char error:', e.message));
      return;
    }

    // Project not in context — fetch both project and characters
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    console.log('[PD] Fetching project + chars for', projectId);
    fetch('/api/projects/' + projectId)
      .then(r => r.json())
      .then(data => {
        console.log('[PD] Got project:', data.name);
        setFetchedProject(data);
        return fetch('/api/projects/' + projectId + '/characters');
      })
      .then(r => r.json())
      .then(chars => {
        console.log('[PD] Got chars:', chars?.length);
        if (Array.isArray(chars)) setFetchedCharacters(chars);
      })
      .catch(e => console.error('[PD] Error:', e.message));
  }, [projectId]);

  const contextChars = appState.characters.filter((c) => c.project_id === projectId);
  const characters = contextChars.length > 0 ? contextChars : fetchedCharacters;

  const initials = (project?.name ?? 'FT')
    .split(' ').map((w: string) => w[0]).slice(0, 2).join('');

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Dashboard
        </Button>
        <div className="text-center space-y-4 py-16">
          <div className="text-6xl opacity-20 font-serif">⚔</div>
          <h1 className="text-2xl font-bold text-muted-foreground">Loading project...</h1>
          <p className="text-muted-foreground">Fetching project #{projectId} from server...</p>
        </div>
      </div>
    );
  }

  const sources = project?.sources ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Dashboard
      </Button>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-card">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground text-sm">{project.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users size={14} /><span>{characters.length} characters</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <GitCommit size={14} /><span>{project.commit_count ?? 0} commits</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BookOpen size={14} /><span>{sources.length} sources</span>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary border border-border/40">
          <TabsTrigger value="characters"><Users size={14} className="mr-1"/>Characters</TabsTrigger>
          <TabsTrigger value="timeline"><GitCommit size={14} className="mr-1"/>Timeline</TabsTrigger>
          <TabsTrigger value="lore"><BookOpen size={14} className="mr-1"/>Lore</TabsTrigger>
          <TabsTrigger value="zodiac"><Star size={14} className="mr-1"/>Zodiac</TabsTrigger>
          <TabsTrigger value="settings"><Shield size={14} className="mr-1"/>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="characters" className="mt-4">
          {characters.length === 0 ? (
            <div className="text-center py-12">
              <Swords size={32} className="mx-auto mb-3 opacity-30 text-primary" />
              <h3 className="text-lg font-semibold mb-2">No Characters Loaded</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                This project has {project.character_count ?? '?'} characters in the database.
                They will appear here once the frontend loads them.
              </p>
              <Button className="mt-4" onClick={() => navigate('/')}>Back to Dashboard</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((char) => (
                <Card key={char.id} className="bg-card border-border/40 cursor-pointer hover:border-primary/40 transition-all group"
                  onClick={() => navigate(`/character/${char.id}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2"
                        style={{ borderColor: getCharacterAccent(char.id, appState.darkMode) }}>
                        <img src={getCharacterAvatar(char.id)} alt={char.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <h3 className="font-semibold">{char.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{char.role}</p>
                    {char.affiliation && <Badge variant="secondary" className="text-[10px]">{char.affiliation}</Badge>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="text-center py-12 text-muted-foreground">
            <GitCommit size={32} className="mx-auto mb-2 opacity-30" />
            <p>No story commits loaded yet.</p>
          </div>
        </TabsContent>

        <TabsContent value="lore" className="mt-4">
          <Card className="bg-card border-border/40">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Swords size={18} className="text-primary" />
                <h3 className="font-semibold text-lg">Ivalice — The War of the Lions</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ivalice is a medieval fantasy world torn by the War of the Lions — a conflict between
                the Houses of the royal family, manipulated by the corrupt Church of Glabados and the
                ancient Lucavi demons seeking resurrection through the Zodiac Stones.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {[
                  { icon: '⚔️', label: 'The War of the Lions', desc: 'Royal succession conflict' },
                  { icon: '⛪', label: 'Church of Glabados', desc: 'Corrupt religious authority' },
                  { icon: '👹', label: 'The Lucavi', desc: 'Ancient demons seeking resurrection' },
                  { icon: '💎', label: 'The Zodiac Stones', desc: 'Mystical Auracite artifacts' },
                  { icon: '🛡️', label: 'The Corpse Brigade', desc: 'Deserter resistance movement' },
                  { icon: '🌟', label: 'Auracite', desc: 'Crystallized souls — source of all magic' },
                ].map((item) => (
                  <div key={item.label} className="px-4 py-3 rounded-xl bg-secondary/40 border border-border/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zodiac" className="mt-4">
          <Card className="bg-card border-border/40">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-primary" />
                <h3 className="font-semibold text-lg">The Zodiac Stones</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Powerful Auracite artifacts, each containing the essence of a Lucavi demon.
                They grant immense power — at a terrible cost.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {[
                  { name: 'Belias', sign: 'Aries', element: 'Fire', color: '#CC4400' },
                  { name: 'Hashmal', sign: 'Taurus', element: 'Earth', color: '#448833' },
                  { name: 'Cuchulainn', sign: 'Gemini', element: 'Wind', color: '#CCAA22' },
                  { name: 'Mateus', sign: 'Cancer', element: 'Ice', color: '#3366AA' },
                  { name: 'Adrammelech', sign: 'Leo', element: 'Lightning', color: '#CCCC44' },
                  { name: 'Zeromus', sign: 'Scorpio', element: 'Dark', color: '#663399' },
                  { name: 'Ultima', sign: 'Sagittarius', element: 'Holy', color: '#AA44AA' },
                ].map((z) => (
                  <div key={z.name} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/40 border border-border/20">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: z.color }}>
                      {z.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{z.name}</div>
                      <div className="text-[10px] text-muted-foreground">{z.sign} • {z.element}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="bg-card border-border/40">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Project Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm">Auto-extract characters from saves</span>
                  <Badge variant="outline" className="text-xs">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm">Knowledge gate enforcement</span>
                  <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30">Active</Badge>
                </div>
              </div>
              <Button variant="destructive" size="sm">Delete Project</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
