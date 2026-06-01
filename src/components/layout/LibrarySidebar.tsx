import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Watch,
  MessageSquare,
  Users,
  Clock,
  Settings,
  Plus,
  Search,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../ui/button';
import ProjectChip from '../ui/ProjectChip';
import { useApp } from '../../context/AppContext';
import { getCharacterAccent } from '../../lib/theme';
import { getCharacterAvatar } from '../../lib/theme';

function useNavItems(projectId: number | undefined) {
  const pid = projectId ?? 1;
  return [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: `/project/${pid}`, icon: Watch, label: 'Project' },
    { to: `/project/${pid}/characters`, icon: Users, label: 'Characters' },
    { to: `/project/${pid}/timeline`, icon: Clock, label: 'Timeline' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];
}

/**
 * LibrarySidebar — Replaces the original Sidebar with a literary, book-like
 * design while keeping the exact same navigation logic (NavLink, routes,
 * useNavigate) and all nav items intact.
 */
export default function LibrarySidebar() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isDark = state.darkMode;

  const characters = state.characters;
  const project = state.currentProject;

  const [search, setSearch] = useState('');

  return (
    <aside className="w-72 h-screen shrink-0 flex flex-col bg-sidebar-background border-r border-sidebar-border overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5 text-sidebar-primary">
          <Watch size={22} strokeWidth={1.8} />
          <h1 className="font-serif text-xl font-semibold tracking-tight">
            ChronoVera
          </h1>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className={
              'w-full rounded-xl border border-sidebar-border bg-secondary py-2 pl-9 pr-3 ' +
              'text-sm text-sidebar-foreground placeholder:text-muted-foreground ' +
              'focus:outline-none focus:ring-2 focus:ring-sidebar-ring'
            }
          />
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 space-y-5">

        {/* Navigation */}
        <nav className="space-y-0.5">
          {useNavItems(project?.id).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                  )
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* ── Active Era / Project ── */}
        {project && (
          <section>
            <h2 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Era
            </h2>
            <div className="flex gap-2.5 px-2 overflow-x-auto pb-1">
              <ProjectChip
                label={project.name
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')}
                gradient="from-indigo-500 to-violet-600"
                spineColor="#5B4B8A"
                subLabel="Project"
                onClick={() => navigate(`/project/${project.id}`)}
              />
            </div>
          </section>
        )}

        {/* ── Characters Quick-Switch ── */}
        {characters.length > 0 && (
          <section>
            <h2 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Characters
            </h2>
            <div className="flex gap-2 px-2 overflow-x-auto pb-1">
              {characters
                .filter((char) => !project || char.project_id === project.id)
                .map((char) => {
                const accent = getCharacterAccent(char.id, isDark);
                const avatar = getCharacterAvatar(char.id);
                return (
                  <motion.button
                    key={char.id}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/character/${char.id}`)}
                    className="flex flex-col items-center gap-1 shrink-0"
                    title={char.name}
                  >
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden border-2"
                      style={{
                        borderColor: accent,
                        boxShadow: `0 0 0 2px ${accent}33`,
                      }}
                    >
                      <img
                        src={avatar}
                        alt={char.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[48px]">
                      {char.name.split(' ')[0]}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* ── Bottom Actions ── */}
      <div className="p-3 border-t border-sidebar-border space-y-2 shrink-0">
        {/* New Project CTA */}
        <Button
          variant="default"
          size="sm"
          className="w-full justify-center gap-2"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          onClick={() => navigate('/project/new')}
        >
          <Plus size={16} />
          New Project
        </Button>

        {/* Theme Toggle + Status */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            className="flex items-center gap-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors rounded-lg px-2 py-1 hover:bg-sidebar-accent"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-[10px] text-sidebar-foreground/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>ChronoVera</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ── Utility ── */
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
