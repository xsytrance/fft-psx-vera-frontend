import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Users,
  GitCommit,
  BookOpen,
  ChevronRight,
  Upload,
  Star,
  Shield,
  Swords,
  Sparkles,
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

  const projectId = Number(id) || 0;
  const project = appState.projects.find((p) => p.id === projectId);

  // Filter characters by project
  const characters = appState.characters.length
    ? appState.characters.filter((c) => c.project_id === projectId)
    : [];

  const commits: any[] = []; // TODO: filter by project when multi-project commits exist
  const sources = project?.sources ?? [];

  // Dynamic initials for the project icon
  const initials = (project?.name ?? 'FT')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          Dashboard
        </Button>
        <div className="text-center space-y-4 py-16">
          <div className="text-6xl opacity-20 font-serif">⚔</div>
          <h1 className="text-2xl font-bold text-muted-foreground">No Project Selected</h1>
          <p className="text-muted-foreground">Upload an FFT save file or create a new project to begin your journey through Ivalice.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/save/upload')}>
              <Upload size={16} className="mr-2" />
              Upload FFT Save
            </Button>
            <Button variant="outline" onClick={() => navigate('/project/new')}>
              Create Project
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/')}>
        <ArrowLeft size={16} />
        Dashboard
      </Button>

      {/* Project Header */}
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
            <Users size={14} />
            <span>{characters.length} characters</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <GitCommit size={14} />
            <span>{commits.length} commits</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BookOpen size={14} />
            <span>{sources.length} sources</span>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary border border-border/40">
          <TabsTrigger value="characters" className="gap-1.5">
            <Users size={14} /> Characters
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <GitCommit size={14} /> Timeline
          </TabsTrigger>
          <TabsTrigger value="lore" className="gap-1.5">
            <BookOpen size={14} /> Lore
          </TabsTrigger>
          <TabsTrigger value="zodiac" className="gap-1.5">
            <Star size={14} /> Zodiac
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Shield size={14} /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="characters" className="mt-4">
          {characters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Swords size={32} className="mx-auto mb-3 opacity-30" />
              <p>No characters yet. Upload an FFT save file to populate this project.</p>
              <p className="text-xs mt-2 opacity-60">Characters will be extracted from your save data including stats, job, and equipment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((char) => (
                <Card
                  key={char.id}
                  className="bg-card border-border/40 cursor-pointer hover:border-primary/40 transition-all group"
                  onClick={() => navigate(`/character/${char.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden border-2"
                        style={{ borderColor: getCharacterAccent(char.id, appState.darkMode) }}
                      >
                        <img
                          src={getCharacterAvatar(char.id)}
                          alt={char.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <h3 className="font-semibold">{char.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{char.role}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="secondary" className="text-[10px]">{char.affiliation}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          {commits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GitCommit size={32} className="mx-auto mb-2 opacity-30" />
              <p>No story commits yet. Upload an FFT save file to build the timeline.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commits
                .sort((a, b) => a.order_index - b.order_index)
                .map((commit) => (
                  <Card key={commit.id} className="bg-card/50 border-border/40">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 min-w-[80px]">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <div className="text-xs text-muted-foreground">{commit.chapter}</div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{commit.title}</div>
                        <div className="text-sm text-muted-foreground">{commit.location}</div>
                        <div className="text-xs text-muted-foreground/70 line-clamp-2">{commit.situation}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lore" className="mt-4">
          <div className="space-y-4">
            {/* Main lore card */}
            <Card className="bg-card border-border/40">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Swords size={18} className="text-primary" />
                  <h3 className="font-semibold text-lg">Ivalice — The War of the Lions</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ivalice is a medieval fantasy world torn by the War of the Lions — a conflict between
                  the Houses of the royal family, manipulated by the corrupt Church of Glabados and the
                  ancient Lucavi demons. The story follows Ramza Beoulve, a young noble who becomes
                  embroiled in a conspiracy that threatens the entire realm.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {[
                    { icon: '⚔️', label: 'The War of the Lions', desc: 'Royal succession conflict that tore Ivalice apart' },
                    { icon: '⛪', label: 'Church of Glabados', desc: 'Corrupt religious authority pulling strings behind the throne' },
                    { icon: '👹', label: 'The Lucavi', desc: 'Ancient demons seeking resurrection through the Zodiac Stones' },
                    { icon: '💎', label: 'The Zodiac Stones', desc: 'Mystical Auracite artifacts that grant demonic power' },
                    { icon: '🛡️', label: 'The Corpse Brigade', desc: 'Deserter resistance movement fighting for survival' },
                    { icon: '🌟', label: 'Auracite', desc: 'Crystallized souls of the dead — the source of all magic' },
                    { icon: '📜', label: 'Germonik Scriptures', desc: 'Ancient text revealing the truth about the Lucavi' },
                    { icon: '🏰', label: 'Knights Templar', desc: 'Secret guardians protecting Ivalice from the Lucavi' },
                  ].map((item) => (
                    <div key={item.label} className="px-4 py-3 rounded-xl bg-secondary/40 border border-border/20 hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-sm font-medium text-foreground/90">{item.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key locations */}
            <Card className="bg-card border-border/40">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  Key Locations of Ivalice
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    'Goug Machine City', 'Zarghidas', 'Dorter', 'Bervenia',
                    'Limberry Castle', 'Mandalia Plains', 'Orbonne Monastery',
                    'Riovanes Castle', 'St. Murond Temple', 'Deepground',
                    'Balka', 'Lesalia',
                  ].map((loc) => (
                    <div key={loc} className="px-3 py-1.5 rounded-lg bg-secondary/30 text-xs text-muted-foreground border border-border/10">
                      📍 {loc}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zodiac" className="mt-4">
          <Card className="bg-card border-border/40">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-primary" />
                <h3 className="font-semibold text-lg">The Zodiac Stones</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Zodiac Stones are powerful Auracite artifacts, each containing the essence of a Lucavi demon.
                Named after the twelve astrological signs, they grant their wielder immense power — at a terrible cost.
                The Lucavi seek hosts to manifest in the physical world, and the Zodiac Stones are the key to their resurrection.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {[
                  { name: 'Belias', sign: 'Aries', element: 'Fire', color: '#CC4400', host: 'Elmdore' },
                  { name: 'Hashmal', sign: 'Taurus', element: 'Earth', color: '#448833', host: 'Goffard' },
                  { name: 'Cuchulainn', sign: 'Gemini', element: 'Wind', color: '#CCAA22', host: 'Wiegraf (former)' },
                  { name: 'Mateus', sign: 'Cancer', element: 'Ice', color: '#3366AA', host: 'Argath' },
                  { name: 'Adrammelech', sign: 'Leo', element: 'Lightning', color: '#CCCC44', host: 'Dycedarg (former)' },
                  { name: 'Zalera', sign: 'Virgo', element: 'Poison', color: '#AAAA33', host: 'Nil' },
                  { name: 'Shemhazai', sign: 'Libra', element: 'Earth', color: '#66AA66', host: 'Nil' },
                  { name: 'Zeromus', sign: 'Scorpio', element: 'Dark', color: '#663399', host: 'Marach (intended)' },
                  { name: 'Ultima', sign: 'Sagittarius', element: 'Holy', color: '#AA44AA', host: 'Alma (intended)' },
                ].map((z) => (
                  <div key={z.name} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/40 border border-border/20">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: z.color }}
                    >
                      {z.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{z.name}</div>
                      <div className="text-[10px] text-muted-foreground">{z.sign} • {z.element} • Host: {z.host}</div>
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
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm">Story phase auto-detection</span>
                  <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30">Active</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                  <span className="text-sm">Zodiac Stone tracking</span>
                  <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">Beta</Badge>
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
