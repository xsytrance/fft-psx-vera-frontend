import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Users,
  GitCommit,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { mockProject, mockCharacters, mockCommits } from '../data/mockData';
import { getCharacterAvatar, getCharacterAccent } from '../lib/theme';
import { useApp } from '../context/AppContext';

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { state: appState } = useApp();
  const [tab, setTab] = useState('characters');

  const characters = mockCharacters;
  const commits = mockCommits;
  const sources = mockProject.sources;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/')}>
        <ArrowLeft size={16} />
        Dashboard
      </Button>

      {/* Project Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold text-lg">
            RN
          </div>
          <div>
            <h1 className="text-2xl font-bold">{mockProject.name}</h1>
            <p className="text-muted-foreground text-sm">{mockProject.description}</p>
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
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="space-y-3">
            {commits
              .sort((a, b) => a.order_index - b.order_index)
              .map((commit) => (
                <Card key={commit.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 min-w-[80px]">
                      <div className="w-3 h-3 rounded-full bg-indigo-500" />
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
        </TabsContent>

        <TabsContent value="lore" className="mt-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">World Lore</h3>
              <p className="text-sm text-muted-foreground">
                The Red Noodle Clan saga spans across Borincano Island, the cosmic void, and the mystical
                People of Pisces tavern. Key lore elements include Cosmic Technology (Cos-Tech), the
                Cuatro as both weapon and instrument, the thirty-six chambers beneath the estuary,
                and the enigmatic Hackermouth oracle trapped in magnetic tape.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'The GRATS warriors of Borinquen',
                  'The Mystical Cuatro and its heart-binding power',
                  'The 36 Chambers facility and Burrow Fortress',
                  'The Exhumerator and the Shield Doncellas',
                  'Cosmic Technology and the Jibaro spacecraft',
                  'The Bamboo Mountain entity',
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
                  <span className="text-sm">Auto-extract characters from sources</span>
                  <Badge variant="outline" className="text-xs">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm">Knowledge gate enforcement</span>
                  <Badge variant="outline" className="text-xs text-emerald-400">Active</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm">Timeline auto-build</span>
                  <Badge variant="outline" className="text-xs">Manual</Badge>
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
