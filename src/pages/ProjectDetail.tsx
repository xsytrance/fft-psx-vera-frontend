import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Users,
  GitCommit,
  BookOpen,
  ChevronRight,
  Upload,
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

  const commits = []; // TODO: filter by project when multi-project commits exist
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
          <h1 className="text-2xl font-bold text-muted-foreground">No Project Selected</h1>
          <p className="text-muted-foreground">Upload an FFT save file or create a new project to get started.</p>
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-bold text-lg">
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
        <TabsList className="bg-secondary border border-border/50">
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="lore">Lore</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="characters" className="mt-4">
          {characters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No characters yet. Upload an FFT save file to populate this project.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((char) => (
                <Card
                  key={char.id}
                  className="bg-card border-border/50 cursor-pointer hover:border-indigo-500/50 transition-all group"
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
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-indigo-400" />
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
              <p>No story commits yet. Upload an FFT save file to build the timeline.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commits
                .sort((a, b) => a.order_index - b.order_index)
                .map((commit) => (
                  <Card key={commit.id} className="bg-card/50 border-border/50">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 min-w-[80px]">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
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
          <Card className="bg-card border-border/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Ivalice — The World of Final Fantasy Tactics</h3>
              <p className="text-sm text-muted-foreground">
                Ivalice is a medieval fantasy world torn by the War of the Lions — a conflict between
                the Houses of the royal family, manipulated by the corrupt Church of Glabados and the
                ancient Lucavi demons. The story follows Ramza Beoulve, a young noble who becomes
                embroiled in a conspiracy that threatens the entire realm.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'The War of the Lions — royal succession conflict',
                  'The Church of Glabados — corrupt religious authority',
                  'The Lucavi — ancient demons seeking resurrection',
                  'The Zodiac Stones — mystical Auracite artifacts',
                  'The Corpse Brigade — deserter resistance movement',
                  'The Metal Demons — otherworldly threat from beyond',
                ].map((lore) => (
                  <div key={lore} className="px-3 py-2 rounded-md bg-secondary/50 text-sm text-muted-foreground">
                    {lore}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Project Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm">Auto-extract characters from saves</span>
                  <Badge variant="outline" className="text-xs">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm">Knowledge gate enforcement</span>
                  <Badge variant="outline" className="text-xs text-emerald-400">Active</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm">Story phase auto-detection</span>
                  <Badge variant="outline" className="text-xs text-emerald-400">Active</Badge>
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
