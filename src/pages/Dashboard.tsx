import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Clock,
  MessageSquare,
  Upload,
  Users,
  Swords,
  Zap,
  Globe,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useApp } from '../context/AppContext';
import CharacterAvatar from '../components/CharacterAvatar';
import * as apiClient from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [stats, setStats] = useState({ projects: 0, characters: 0 });

  useEffect(() => {
    apiClient.getProjects()
      .then(projects => {
        dispatch({ type: 'SET_PROJECTS', payload: projects });
        setStats({
          projects: projects.length,
          characters: state.characters.length,
        });
      })
      .catch(console.error);
  }, []);

  const projectCount = state.projects.length;
  const latestProject = state.projects[state.projects.length - 1];

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
      {/* ── Welcome Header ── */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5 md:p-8">
        <div className="absolute inset-0 bg-portal-glow opacity-30 pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] text-primary/70 mb-1 md:mb-2">
            War of the Lions
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-2">
            FFT PSX Vera
          </h1>
          <p className="text-muted-foreground max-w-xl text-xs md:text-sm leading-relaxed">
            Upload your Final Fantasy Tactics save file, chat with characters at any point
            in the timeline — from the present to the darkest past.
          </p>
          <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
            <Button size="sm" className="gap-2 text-xs md:text-sm" onClick={() => navigate('/save/upload')}>
              <Upload size={14} /> Upload Save
            </Button>
            {latestProject && (
              <Button size="sm" variant="outline" className="gap-2 text-xs md:text-sm" onClick={() => navigate(`/project/${latestProject.id}`)}>
                <Swords size={14} /> Continue Quest
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {[
          { label: 'Projects', value: projectCount, icon: Globe, color: 'text-portal' },
          { label: 'Characters', value: stats.characters, icon: Users, color: 'text-era-gold' },
          { label: 'Chapters', value: 7, icon: Clock, color: 'era-past' },
          { label: 'Battle Time', value: '—', icon: Zap, color: 'era-dark' },
        ].map((s) => (
          <Card key={s.label} className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <s.icon size={18} className={`${s.color} md:w-5 md:h-5`} />
            <div>
              <p className="text-lg md:text-2xl font-semibold">{s.value}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Save Upload Card */}
        <Card className="p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Upload size={18} className="text-portal" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-1">Upload Memory Card</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Parses PSX memory card saves. Extracts party stats, equipment, inventory, and story progress.
              </p>
              <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => navigate('/save/upload')}>
                <Upload size={12} /> Upload .mcr / .mcd?
              </Button>
            </div>
          </div>
        </Card>

        {/* Characters Card */}
        <Card className="p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/10 shrink-0">
              <Users size={18} className="text-era-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-1">Talk to FFT Characters</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Ramza, Delita, Agrias, Mustadio, Rapha, Marach, Meliadoul — each with unique personality and era knowledge.
              </p>
              <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => navigate('/chat')}>
                <MessageSquare size={12} /> Open Chat
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── FFT Lore Quick Reference ── */}
      {latestProject && (
        <Card className="p-4 md:p-5">
          <h3 className="text-sm font-semibold text-primary/80 mb-3">World of Final Fantasy Tactics</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            The War of the Lions. A kingdom torn by royal succession, manipulated by the corrupt
            Church of Glabados and the ancient Lucavi demons. From the battlefields of Ivalice
            to the depths of the Zodiac Stones &mdash; every choice shapes the fate of the realm.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              'War of the Lions', 'Lucavi', 'Zodiac Stones', 'Church of Glabados',
              'Corpse Brigade', 'Ramza Beoulve', 'Delita Heiral', 'Agrias Oaks',
              'Mustadio Bunansa', 'Meliadoul Tengille', 'Orlande', 'Wiegraf',
              'Auracite', 'Goug Machine City', 'Orbonne Monastery',
            ].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] md:text-[11px] font-medium bg-primary/8 text-primary/70 border border-primary/15"
              >
                {tag}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
