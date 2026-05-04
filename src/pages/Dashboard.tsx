import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  MessageSquare,
  GitCommit,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { useChat } from '../context/ChatContext';
import { mockProject } from '../data/mockData';
import BookCover from '../components/ui/BookCover';
import { getCharacterAccent } from '../lib/theme';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const cardStaggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { state: appState } = useApp();
  const { state: chatState } = useChat();
  const isDark = appState.darkMode;

  const allProjects = appState.projects.length > 0
    ? appState.projects
    : [mockProject];

  const stats = [
    {
      label: 'Characters',
      value: appState.characters.length || 6,
      icon: Users,
    },
    { label: 'Commits', value: 13, icon: GitCommit },
    {
      label: 'Conversations',
      value: chatState.conversations.length || 2,
      icon: MessageSquare,
    },
    { label: 'Sources', value: mockProject.sources.length, icon: BookOpen },
    { label: 'Worlds', value: appState.projects.length || 1, icon: BookOpen },
  ];

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── Hero Welcome ── */}
      <motion.div className="space-y-3" variants={itemVariants}>
        <div className="flex items-center gap-2 text-primary">
          <Sparkles size={20} />
          <span className="text-sm font-medium uppercase tracking-wider font-sans">
            Welcome back
          </span>
        </div>
        <h1 className="font-serif text-4xl font-semibold text-primary">
          Your Living Library
        </h1>
        <p className="text-muted-foreground max-w-xl text-[15px] leading-relaxed font-sans">
          Step into worlds where characters remember, feel, and speak.
        </p>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={cardStaggerVariants}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={cardItemVariants}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="bg-card rounded-2xl shadow-card border border-border p-5 flex items-center gap-4 cursor-default hover:shadow-hover transition-shadow"
            >
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Icon size={22} />
              </div>
              <div>
                <div className="font-serif text-3xl font-semibold text-primary leading-none">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-sans mt-1">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Your Worlds — Project Grid ── */}
      <motion.div className="space-y-4" variants={itemVariants}>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Your Worlds
        </h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={cardStaggerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Project Cards — dynamic from state */}
          {allProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardItemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }}
              className="group bg-card rounded-2xl shadow-card border border-border p-5 cursor-pointer hover:shadow-hover transition-all"
              onClick={() => navigate(`/project/${project.id}`)}
            >
              <div className="flex items-start gap-4">
                <BookCover
                  label={project.name
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')}
                  gradient="from-indigo-500 to-violet-600"
                  spineColor="#5B4B8A"
                  className="w-16"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg font-semibold text-foreground truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4 pt-3 text-xs text-muted-foreground font-sans">
                    <span className="flex items-center gap-1.5">
                      <Users size={13} className="text-primary" />
                      {project.character_count ?? appState.characters.length ?? 6}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GitCommit size={13} className="text-primary" />
                      {project.commit_count ?? 13}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-primary" />
                      {project.sources?.length ?? 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl gap-1 font-sans"
                  >
                    Open <ArrowRight size={14} />
                  </Button>
                </div>
                <ArrowRight
                  size={16}
                  className="text-muted-foreground group-hover:text-primary transition-colors duration-200"
                />
              </div>
            </motion.div>
          ))}

          {/* New World CTA */}
          <motion.div
            variants={cardItemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }}
            className="bg-card rounded-2xl shadow-card border-2 border-dashed border-border p-5 cursor-pointer hover:border-primary/40 hover:shadow-hover transition-all flex flex-col items-center justify-center min-h-[180px] group"
            onClick={() => navigate('/project/new')}
          >
            <div className="w-12 h-12 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
              <Plus size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground mt-3 font-sans transition-colors">
              New World
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Recent Conversations ── */}
      <motion.div className="space-y-4" variants={itemVariants}>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Recent Conversations
        </h2>
        <motion.div className="space-y-3" variants={cardStaggerVariants}>
          {(chatState.conversations.length
            ? chatState.conversations
            : []
          ).map((conv) => {
            const charId = conv.character_ids?.[0] ?? 1;
            const accent = getCharacterAccent(charId, isDark);
            const char = appState.characters.find((c) => c.id === charId);
            const charName = char?.name ?? 'Character';
            const charInitial = charName.charAt(0);

            return (
              <motion.div
                key={conv.id}
                variants={cardItemVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="group bg-card rounded-xl shadow-card border border-border p-4 cursor-pointer hover:shadow-hover transition-all"
                onClick={() => navigate(`/chat/${conv.id}`)}
              >
                <div className="flex items-center gap-4">
                  {/* Character Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif font-bold text-sm shrink-0"
                    style={{
                      backgroundColor: accent,
                      boxShadow: `0 0 0 3px ${accent}33`,
                    }}
                  >
                    {charInitial}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate font-sans">
                      {conv.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 font-sans">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: `${accent}18`,
                          color: accent,
                        }}
                      >
                        {conv.mode}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {conv.messages.length} messages
                      </span>
                    </div>
                  </div>

                  {/* Resume Button */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl gap-1 font-sans"
                    >
                      Resume <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
