import { useNavigate } from 'react-router';
import {
  BookOpen,
  Users,
  MessageSquare,
  GitCommit,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { useApp } from '../context/AppContext';
import { useChat } from '../context/ChatContext';
import { mockProject } from '../data/mockData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { state: appState } = useApp();
  const { state: chatState } = useChat();

  const stats = [
    { label: 'Characters', value: appState.characters.length || 6, icon: Users, color: 'text-indigo-400' },
    { label: 'Commits', value: 13, icon: GitCommit, color: 'text-emerald-400' },
    { label: 'Conversations', value: chatState.conversations.length || 2, icon: MessageSquare, color: 'text-amber-400' },
    { label: 'Sources', value: mockProject.sources.length, icon: BookOpen, color: 'text-violet-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles size={20} />
          <span className="text-sm font-medium uppercase tracking-wider">Welcome back</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Your Story Worlds</h1>
        <p className="text-muted-foreground max-w-xl">
          Browse your projects, continue conversations, and manage characters across the MultiVera universe.
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
          {/* Project Card */}
          <Card
            className="bg-card border-border/50 cursor-pointer hover:border-indigo-500/50 hover:bg-card/80 transition-all group"
            onClick={() => navigate('/project/1')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold">
                  RN
                </div>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-indigo-400 transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <h3 className="font-semibold">{mockProject.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{mockProject.description}</p>
              <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users size={12} /> 6</span>
                <span className="flex items-center gap-1"><GitCommit size={12} /> 13</span>
                <span className="flex items-center gap-1"><BookOpen size={12} /> 3</span>
              </div>
            </CardContent>
          </Card>

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
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Conversations</h2>
        <div className="space-y-2">
          {(chatState.conversations.length ? chatState.conversations : []).map((conv) => (
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
    </div>
  );
}
