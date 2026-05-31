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
    { label: 'Characters', value: totalCharacters, icon: Users, color: 'text-indigo-400' },
    { label: 'Worlds', value: allProjects.length, icon: GitCommit, color: 'text-emerald-400' },
    { label: 'Conversations', value: chatState.conversations.length, icon: MessageSquare, color: 'text-amber-400' },
    { label: 'Sources', value: totalSources, icon: BookOpen, color: 'text-violet-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles size={20} />
          <span className="text-sm font-medium uppercase tracking-wider">Welcome back</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">IvaliceVera</h1>
        <p className="text-muted-foreground max-w-xl">
          Upload a Final Fantasy Tactics save file, explore characters, and chat at any point in the story.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* FFT Upload CTA */}
          <Card
            className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer"
            onClick={() => navigate('/save/upload')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Upload className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-200">Upload FFT Save</h3>
                <p className="text-sm text-amber-400/70 mt-1">
                  Import a Final Fantasy Tactics save file to create a project with characters and story progress
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
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
                className="bg-card border-border/50 cursor-pointer hover:border-indigo-500/50 hover:bg-card/80 transition-all group overflow-hidden"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-14 rounded-lg overflow-hidden shadow-sm bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold text-xs">
                      {project.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-indigo-400 transition-colors" />
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
            className="border-dashed border-border/50 hover:border-indigo-500/50 hover:bg-card/80 transition-all cursor-pointer"
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

      {/* Recent Conversations */}
      {chatState.conversations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Conversations</h2>
          <div className="space-y-2">
            {chatState.conversations.map((conv) => (
              <Card
                key={conv.id}
                className="bg-card/50 border-border/50 cursor-pointer hover:border-indigo-500/50 transition-all"
                onClick={() => navigate(`/chat/${conv.id}`)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <MessageSquare size={14} className="text-indigo-400" />
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
