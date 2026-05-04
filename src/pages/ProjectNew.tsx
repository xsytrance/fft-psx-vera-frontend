import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

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
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/')}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </Button>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground">Start a new story world. Upload source material to begin.</p>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              placeholder="e.g. Red Noodle Clan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="A short summary of your story world..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Source Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-indigo-500/50 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drop .txt, .md, .pdf, or .docx files here, or{' '}
              <label className="text-indigo-400 cursor-pointer hover:underline">
                click to browse
                <input type="file" multiple className="hidden" onChange={handleFileInput} accept=".txt,.md,.pdf,.docx" />
              </label>
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-secondary/50">
                  <FileText size={14} className="text-indigo-400" />
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}

          {ingesting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ingesting sources...</span>
                <span className="text-indigo-400 font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {done && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 size={16} />
              <span>Ingestion complete! Characters and commits extracted.</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate('/')}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={ingesting || done || !name.trim()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {ingesting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          {ingesting ? 'Processing...' : done ? 'Done' : 'Create Project'}
        </Button>
        {done && (
          <Button variant="ghost" className="text-indigo-400" onClick={() => navigate('/project/1')}>
            View Project →
          </Button>
        )}
      </div>
    </div>
  );
}
