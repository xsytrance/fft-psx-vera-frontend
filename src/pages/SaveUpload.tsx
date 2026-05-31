import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useApi } from '../hooks/useApi';
import { Upload, FileUp, CheckCircle, AlertCircle, Loader2, Sword, Users, MapPin } from 'lucide-react';

export default function SaveUpload() {
  const api = useApi();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [created, setCreated] = useState<any>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
      setCreated(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const res = await api.uploadSave(file);
    if (res) setResult(res);
  };

  const handleCreateProject = async () => {
    if (!file) return;
    const res = await api.createProjectFromSave(file, 'Final Fantasy Tactics');
    if (res) {
      setCreated(res);
      // Navigate to the project after a short delay
      setTimeout(() => {
        navigate(`/project/${res.project_id}`);
      }, 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sword className="w-8 h-8 text-amber-500" />
          Upload FFT Save
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload a Final Fantasy Tactics save file to extract party data, story progress, and character info.
          Supports both the 2MB fftsave.bin archive and 40KB resume files.
        </p>
      </div>

      {/* File Upload */}
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
        <input
          ref={fileRef}
          type="file"
          accept=".png,.sav,.bin"
          onChange={handleFile}
          className="hidden"
        />
        
        {file ? (
          <div className="space-y-3">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-sm text-primary hover:underline"
            >
              Choose different file
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="space-y-3 cursor-pointer"
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium">Click to upload a save file</p>
              <p className="text-sm text-muted-foreground">
                Supports .png, .sav, .bin files
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Actions */}
      {file && !result && (
        <div className="flex gap-4">
          <button
            onClick={handleUpload}
            disabled={api.loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {api.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
            Parse Save
          </button>
          <button
            onClick={handleCreateProject}
            disabled={api.loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {api.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sword className="w-5 h-5" />}
            Parse & Create Project
          </button>
        </div>
      )}

      {/* Error */}
      {api.error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{api.error}</p>
        </div>
      )}

      {/* Parse Result */}
      {result && !created && (
        <div className="space-y-6">
          <div className="p-6 bg-card border rounded-lg space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Save Parsed Successfully
            </h2>

            {/* Story Progress */}
            {result.story_progress && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Story Progress
                </h3>
                <div className="pl-6 space-y-1 text-sm">
                  <p>Chapter/Scene: 0x{result.story_progress?.raw_38?.toString(16).padStart(2, '0')}, 0x{result.story_progress?.raw_39?.toString(16).padStart(2, '0')}</p>
                  <p>Player Characters: {(result.player_characters || []).map((c: any) => typeof c === 'string' ? c : c.name).join(', ') || 'None'}</p>
                </div>
              </div>
            )}

            {/* Party Context */}
            {result.party_context && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Party
                </h3>
                <div className="pl-6 space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Always present:</span>{' '}
                    {(result.party_context.always_present || []).join(', ')}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Likely present:</span>{' '}
                    {(result.party_context.likely_present || []).join(', ')}
                  </p>
                  <p className="text-muted-foreground italic">{result.party_context.phase_context}</p>
                </div>
              </div>
            )}
          </div>

          {/* Create Project CTA */}
          <div className="flex gap-4">
            <button
              onClick={() => setResult(null)}
              className="flex-1 px-6 py-3 border rounded-lg hover:bg-accent"
            >
              Upload Another
            </button>
            <button
              onClick={handleCreateProject}
              disabled={api.loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {api.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sword className="w-5 h-5" />}
              Create Full Project
            </button>
          </div>
        </div>
      )}

      {/* Project Created */}
      {created && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-green-800">
            <CheckCircle className="w-6 h-6" />
            Project Created!
          </h2>
          <div className="space-y-2 text-sm text-green-700">
            <p><strong>{created.characters_created}</strong> characters created</p>
            <p><strong>{created.commits_created}</strong> story commits created</p>
            <p>Characters: {created.character_slugs.join(', ')}</p>
            <p>Story phase: {created.story_phase}</p>
          </div>
          <p className="text-sm text-green-600 animate-pulse">Redirecting to project...</p>
        </div>
      )}
    </div>
  );
}
