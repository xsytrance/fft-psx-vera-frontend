import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Plus, MapPin, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { mockCommits, mockCharacters } from '../data/mockData';
import { useState } from 'react';

export default function TimelinePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedCommitId, setSelectedCommitId] = useState<number | null>(null);

  const selectedCommit = mockCommits.find((c) => c.id === selectedCommitId);
  const characterName = (cid: number) => mockCharacters.find((c) => c.id === cid)?.name ?? 'Unknown';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(`/project/${id}`)}>
          <ArrowLeft size={16} />
          Project
        </Button>
        <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus size={16} />
          New Checkpoint
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock size={24} className="text-indigo-400" />
          Timeline
        </h1>
        <p className="text-muted-foreground">Select a checkpoint to set the story context for conversations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {mockCommits
            .sort((a, b) => a.order_index - b.order_index)
            .map((commit, idx) => {
              const isSelected = selectedCommitId === commit.id;
              return (
                <div key={commit.id} className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      className={`w-4 h-4 rounded-full border-2 transition-colors ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'bg-background border-muted-foreground/30 hover:border-indigo-400'
                      }`}
                      onClick={() => setSelectedCommitId(commit.id)}
                    />
                    {idx < mockCommits.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border/50 min-h-[20px]" />
                    )}
                  </div>
                  <Card
                    className={`flex-1 border-border/50 cursor-pointer transition-all ${
                      isSelected ? 'border-indigo-500/50 bg-indigo-500/5' : 'hover:border-indigo-500/30'
                    }`}
                    onClick={() => setSelectedCommitId(commit.id)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{commit.chapter}</Badge>
                          <Badge variant="outline" className="text-[10px]">{commit.scene}</Badge>
                          {commit.is_start && <Badge className="text-[10px] bg-emerald-600">Start</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">{characterName(commit.character_id)}</span>
                      </div>
                      <h3 className="font-semibold text-sm">{commit.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        <span className="line-clamp-1">{commit.location}</span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 line-clamp-2">{commit.situation}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border/50 sticky top-6">
            <CardContent className="p-4 space-y-4">
              {selectedCommit ? (
                <>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{selectedCommit.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedCommit.chapter} • {selectedCommit.scene}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin size={14} />
                      <span>{selectedCommit.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen size={14} />
                      <span>{characterName(selectedCommit.character_id)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedCommit.situation}</p>
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Knows
                    </h4>
                    <ScrollArea className="h-24">
                      <ul className="space-y-1">
                        {selectedCommit.knows.map((k) => (
                          <li key={k} className="text-xs text-muted-foreground list-disc ml-4">{k}</li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-rose-400 flex items-center gap-1">
                      <Clock size={12} />
                      Does Not Know
                    </h4>
                    <ScrollArea className="h-24">
                      <ul className="space-y-1">
                        {selectedCommit.does_not_know.map((k) => (
                          <li key={k} className="text-xs text-muted-foreground list-disc ml-4">{k}</li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    size="sm"
                    onClick={() => navigate(`/chat?commit=${selectedCommit.id}`)}
                  >
                    Chat at this checkpoint
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Clock size={24} className="mx-auto mb-2 opacity-50" />
                  <p>Select a checkpoint to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
