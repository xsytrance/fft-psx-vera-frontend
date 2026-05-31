import { useNavigate } from 'react-router';
import {
  BookOpen,
  Users,
  MessageSquare,
  GitCommit,
  Plus,
  ArrowRight,
  Sparkles,
  Upload,
  Sword,
  Star,
  Shield,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { useApp } from '../context/AppContext';
import { useChat } from '../context/ChatContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { state: appState } = useApp();
  const { state: chatState } = useChat();

  const allProjects = appState.projects;

  // Count total characters across all projects
  const totalCharacters = appState.characters.length;
  const totalSources = allProjects.reduce((sum, p) => sum + (p.sources?.length ?? 0), 0);

  const stats = [
    { label: 'Characters', value: totalCharacters, icon: Users, color: 'text-amber-400', zodiac: '♈' },
    { label: 'Worlds', value: allProjects.length, icon: GitCommit, color: 'text-sky-400', zodiac: '♉' },
    { label: 'Conversations', value: chatState.conversations.length, icon: MessageSquare, color: 'text-emerald-400', zodiac: '♊' },
    { label: 'Sources', value: totalSources, icon: BookOpen, color: 'text-violet-400', zodiac: '♋' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header — Ivalice Banner */}
      <div className="space-y-3 relative">
        {/* Decorative zodiac accent */}
        <div className="absolute -top-2 right-0 text-6xl opacity-[0.04] font-serif select-none pointer-events-none">
          ✦
        </div>
        <div className="flex items-center gap-2 text-primary">
          <Star size={18} className="animate-pulse" />
          <span className="text-xs font-medium uppercase tracking-[0.2em]">Ivalice Awaits</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          IvaliceVera
        </h1>
        <p className="text-muted-foreground max-w-xl leading-relaxed">
          Upload a <strong className="text-primary">Final Fantasy Tactics</strong> save file to analyze your party,
          explore the world of Ivalice, and chat with characters at any point in the War of the Lions.
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground/60 pt-1">
          <span className="flex items-center gap-1"><Shield size={12} /> Knowledge Gates</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Sparkles size={12} /> Zodiac Stones</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Star size={12} /> Auracite</span>
        </div>
      </div>

      {/* Stats Row — Zodiac-themed */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-card/60 border-border/40 hover:border-primary/30 transition-all group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-lg bg-secondary/80 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="text-[10px] opacity-50">{stat.zodiac}</span>
                    {stat.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen size={18} className="text-primary/60" />
          Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* FFT Upload CTA — Gold themed */}
          <Card
            className="bg-gradient-to-br from-primary/8 to-accent/5 border-primary/25 hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => navigate('/save/upload')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">Upload FFT Save</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Import a Final Fantasy Tactics save to create a project with characters and story progress
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
                <Sword className="w-4 h-4 mr-2" />
                Upload Save
              </Button>
            </CardContent>
          </Card>

          {/* Project Cards */}
          {allProjects.map((project) => {
            const projectChars = appState.characters.filter((c: any) => c.project_id === project.id);
            const charCount = projectChars.length;

            return (
              <Card
                key={project.id}
                className="bg-card border-border/40 cursor-pointer hover:border-primary/40 hover:bg-card/80 transition-all group overflow-hidden"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-14 rounded-lg overflow-hidden shadow-sm bg-gradient-to-br from-primary/80 to-accent flex items-center justify-center text-primary-foreground font-bold text-xs">
                      {project.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users size={12} /> {charCount}</span>
                    <span className="flex items-center gap-1"><GitCommit size={12} /> {project.commit_count ?? 0}</span>
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {project.sources?.length ?? 0}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Create New CTA */}
          <Card
            className="border-dashed border-border/40 hover:border-primary/40 hover:bg-card/80 transition-all cursor-pointer"
            onClick={() => navigate('/project/new')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center h-full text-muted-foreground hover:text-foreground gap-2">
              <div className="w-10 h-10 rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center">
                <Plus size={20} />
              </div>
              <span className="text-sm font-medium">Create New Project</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ivalice Lore Quick Reference */}
      <Card className="bg-card/40 border-border/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="text-3xl opacity-20 font-serif select-none">⚔</div>
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-semibold text-primary/80">The World of Ivalice</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The War of the Lions — a conflict born of royal succession, manipulated by the corrupt Church of Glabados
                and the ancient Lucavi demons seeking resurrection through the Zodiac Stones. Auracite, the crystallized
                souls of the dead, holds the power to summon these demons. The story follows Ramza Beoulve, a young noble
                who uncovers a conspiracy that threatens all of Ivalice.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Zodiac Stones', 'Auracite', 'Lucavi', 'Germonik Scriptures', 'Knights Templar', 'War of the Lions'].map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/8 text-primary/70 border border-primary/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Conversations */}
      {chatState.conversations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Conversations</h2>
          <div className="space-y-2">
            {chatState.conversations.map((conv) => (
              <Card
                key={conv.id}
                className="bg-card/50 border-border/40 cursor-pointer hover:border-primary/40 transition-all"
                onClick={() => navigate(`/chat/${conv.id}`)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                      <MessageSquare size={14} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{conv.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {conv.mode} • {conv.messages.length} messages
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Resume
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
