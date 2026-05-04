import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Loader2,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const, staggerChildren: 0.08 },
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

export default function ProjectNew() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [ingesting, setIngesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      ['.txt', '.md', '.pdf', '.docx'].some((ext) => f.name.endsWith(ext))
    );
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }
    setIngesting(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 10 + Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setIngesting(false);
        setDone(true);
        toast.success('Project created and sources ingested!');
      }
      setProgress(Math.min(p, 100));
    }, 600);
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-8"
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
          Back to Library
        </Button>
      </motion.div>

      {/* ── Header ── */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <h1 className="font-serif text-4xl font-semibold text-primary">
          Add a New World
        </h1>
        <p className="text-muted-foreground text-[15px] leading-relaxed font-sans">
          Start a new story world. Upload source material to bring your
          characters to life.
        </p>
      </motion.div>

      {/* ── Form Card ── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card border-border shadow-elevated rounded-2xl">
          <CardContent className="p-8 space-y-6">
            {/* Project Name */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium font-sans text-foreground">
                World Name
              </label>
              <Input
                placeholder="e.g. Red Noodle Clan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl bg-secondary border-border font-serif text-lg placeholder:text-muted-foreground/60 h-12"
              />
            </div>

            {/* Description */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium font-sans text-foreground">
                Description
              </label>
              <Textarea
                placeholder="A short summary of your story world..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl bg-secondary border-border resize-none font-sans text-[15px] placeholder:text-muted-foreground/60 leading-relaxed"
              />
            </div>

            {/* Upload Area */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium font-sans text-foreground">
                Source Files
              </label>
              <div
                className="border-2 border-dashed border-accent/40 rounded-xl p-8 text-center hover:border-accent/70 transition-colors bg-secondary/50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
              >
                <BookOpen size={32} className="mx-auto text-accent mb-3" />
                <p className="text-sm text-muted-foreground font-sans">
                  <span className="font-medium text-foreground">
                    Drop your story here
                  </span>
                  <br />
                  <span className="text-xs">
                    .txt, .md, .pdf, or .docx
                  </span>
                </p>
                <label className="inline-block mt-3 text-sm text-primary cursor-pointer hover:underline font-sans">
                  click to browse
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileInput}
                    accept=".txt,.md,.pdf,.docx"
                  />
                </label>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-sm px-4 py-2.5 rounded-xl bg-secondary/60 border border-border/50 font-sans"
                  >
                    <FileText size={16} className="text-accent shrink-0" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {(f.size / 1024).toFixed(1)} KB
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Progress */}
            {ingesting && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center justify-between text-sm font-sans">
                  <span className="text-muted-foreground">
                    Ingesting sources...
                  </span>
                  <span className="text-accent font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress
                  value={progress}
                  className="h-2 rounded-full bg-secondary"
                  // Using accent color via inline style since Progress component
                  // may not support custom indicator classes directly
                  style={{ backgroundColor: 'var(--secondary)' }}
                />
              </motion.div>
            )}

            {/* Done Message */}
            {done && (
              <motion.div
                className="flex items-center gap-2 text-sm font-sans"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-emerald-600">
                  Ingestion complete! Characters and commits extracted.
                </span>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="rounded-xl font-sans"
              >
                Cancel
              </Button>
              <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={handleCreate}
                  disabled={ingesting || done || !name.trim()}
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-sans shadow-card hover:shadow-hover transition-shadow"
                >
                  {ingesting ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : null}
                  {ingesting
                    ? 'Processing...'
                    : done
                    ? 'Done'
                    : 'Create World'}
                </Button>
              </motion.div>
            </div>

            {done && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <Button
                  variant="ghost"
                  className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl font-sans"
                  onClick={() => navigate('/project/1')}
                >
                  View Project →
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
