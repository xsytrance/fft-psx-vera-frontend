import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  GitCommit,
  BookOpen,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { mockProject, mockCharacters, mockCommits } from '../data/mockData';
import BookCover from '../components/ui/BookCover';
import CharacterCard from '../components/ui/CharacterCard';
import { getCharacterAccent } from '../lib/theme';

const tabList = [
  { id: 'characters', label: 'Characters' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'lore', label: 'Lore' },
  { id: 'settings', label: 'Settings' },
];

const loreItems = [
  { title: 'The GRATS warriors of Borinquen', desc: 'An elite cosmic fighting force sworn to protect Puerto Rican heritage across galaxies.' },
  { title: 'The Mystical Cuatro and its heart-binding power', desc: 'A four-stringed instrument that doubles as a weapon and a vessel for ancestral souls.' },
  { title: 'The 36 Chambers facility and Burrow Fortress', desc: 'An ancient subterranean complex beneath the Pisces estuary, built from kauri wood older than starlight.' },
  { title: 'The Exhumerator and the Shield Doncellas', desc: 'A mystical figure who can exhume hearts, guarded by red-haired maidens armed with cosmic blade-lutes.' },
  { title: 'Cosmic Technology and the Jibaro spacecraft', desc: 'Advanced tech woven from Borincano cultural memory — ships that navigate by song and ancestral star-maps.' },
  { title: 'The Bamboo Mountain entity', desc: 'A being older than the Red Noodle Clan itself, dwelling at the void-side base of Bamboo Mountain.' },
];

const settingsItems = [
  { label: 'Auto-extract characters from sources', status: 'Enabled', statusType: 'neutral' as const },
  { label: 'Knowledge gate enforcement', status: 'Active', statusType: 'success' as const },
  { label: 'Timeline auto-build', status: 'Manual', statusType: 'neutral' as const },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

export default function ProjectDetail() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('characters');

  const characters = mockCharacters;
  const commits = mockCommits;
  const sources = mockProject.sources;

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── Back Button ── */}
      <motion.div variants={itemVariants}>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground rounded-xl font-sans"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
          Library
        </Button>
      </motion.div>

      {/* ── Hero Header ── */}
      <motion.div
        className="relative rounded-2xl p-6 md:p-8 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, transparent 100%)' }}
        variants={itemVariants}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div className="relative flex flex-col md:flex-row items-start gap-5">
          <BookCover
            label={mockProject.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
            gradient="from-indigo-500 to-violet-600"
            spineColor="#5B4B8A"
            className="w-[120px] rounded-2xl"
          />
          <div className="flex-1 min-w-0 space-y-3">
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              {mockProject.name}
            </h1>
            <p className="text-[15px] text-muted-foreground leading-relaxed font-sans line-clamp-3 max-w-2xl">
              {mockProject.description}
            </p>
            <div className="flex flex-wrap items-center gap-5 pt-1">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
                <Users size={15} className="text-primary" />
                <span>{characters.length} characters</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
                <GitCommit size={15} className="text-primary" />
                <span>{commits.length} commits</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
                <BookOpen size={15} className="text-primary" />
                <span>{sources.length} sources</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 flex-wrap">
          {tabList.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium font-sans transition-colors duration-200 ${
                tab === t.id
                  ? 'bg-primary text-primary-foreground shadow-card'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* ── Characters Tab ── */}
          {tab === 'characters' && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={staggerVariants}
              initial="hidden"
              animate="visible"
            >
              {characters.map((char) => (
                <motion.div key={char.id} variants={itemVariants}>
                  <CharacterCard
                    characterId={char.id}
                    name={char.name}
                    role={char.role}
                    affiliation={char.affiliation}
                    personality={char.personality.slice(0, 3)}
                    onClick={() => navigate(`/character/${char.id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── Timeline Tab ── */}
          {tab === 'timeline' && (
            <Card className="bg-card border-border shadow-card rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-6">
                {/* Horizontal timeline strip */}
                <div className="relative">
                  <div className="flex items-center gap-1 overflow-x-auto pb-4 scrollbar-thin">
                    {commits
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((commit, index, arr) => {
                        const accent = getCharacterAccent(commit.character_id ?? 1, false);
                        const isLast = index === arr.length - 1;

                        return (
                          <div key={commit.id} className="flex items-center shrink-0">
                            <div className="flex flex-col items-center gap-1.5 min-w-[100px] px-1">
                              <motion.div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: accent }}
                                whileHover={{ scale: 1.4 }}
                                transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                              />
                              <span className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider text-center">
                                {commit.chapter}
                              </span>
                            </div>
                            {!isLast && (
                              <div
                                className="w-6 h-px shrink-0"
                                style={{
                                  background: `linear-gradient(to right, ${accent}, ${getCharacterAccent(arr[index + 1].character_id ?? 1, false)})`,
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Commit cards */}
                <div className="space-y-3">
                  {commits
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((commit) => {
                      const char = characters.find((c) => c.id === commit.character_id);
                      const accent = getCharacterAccent(commit.character_id ?? 1, false);

                      return (
                        <motion.div
                          key={commit.id}
                          whileHover={{ y: -2, transition: { duration: 0.2 } }}
                          className="rounded-xl border border-border bg-card/60 p-4 hover:shadow-hover transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="w-1 self-stretch rounded-full shrink-0"
                              style={{ backgroundColor: accent }}
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-muted-foreground font-sans uppercase tracking-wider">
                                  {commit.chapter}
                                </span>
                                {char && (
                                  <span
                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium font-sans"
                                    style={{
                                      backgroundColor: `${accent}18`,
                                      color: accent,
                                    }}
                                  >
                                    {char.name}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-serif text-base font-medium text-foreground">
                                {commit.title}
                              </h4>
                              <p className="text-sm text-muted-foreground font-sans">
                                {commit.location}
                              </p>
                              <p className="text-xs text-muted-foreground/70 line-clamp-2 font-sans leading-relaxed">
                                {commit.situation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Lore Tab ── */}
          {tab === 'lore' && (
            <Card className="bg-card border-border shadow-card rounded-2xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    World Lore
                  </h3>
                  <p className="text-[15px] text-muted-foreground leading-relaxed font-sans max-w-3xl">
                    The Red Noodle Clan saga spans across Borincano Island, the
                    cosmic void, and the mystical People of Pisces tavern. Key
                    lore elements include Cosmic Technology (Cos-Tech), the
                    Cuatro as both weapon and instrument, the thirty-six chambers
                    beneath the estuary, and the enigmatic Hackermouth oracle
                    trapped in magnetic tape.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loreItems.map((item, index) => (
                    <motion.div
                      key={item.title}
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      className="rounded-xl border border-border bg-card/60 p-4 hover:shadow-hover transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
                          style={{
                            backgroundColor: `hsl(${258 + index * 20}, 31%, ${40 + index * 5}%)`,
                          }}
                        />
                        <div className="space-y-1">
                          <h4 className="font-serif text-sm font-semibold text-foreground">
                            {item.title}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Settings Tab ── */}
          {tab === 'settings' && (
            <Card className="bg-card border-border shadow-card rounded-2xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  Project Settings
                </h3>

                <div className="space-y-0 divide-y divide-border/50">
                  {settingsItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between py-4"
                    >
                      <span className="text-sm text-foreground font-sans">
                        {item.label}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs rounded-lg font-sans ${
                          item.statusType === 'success'
                            ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-xl font-sans"
                  >
                    Delete World
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
