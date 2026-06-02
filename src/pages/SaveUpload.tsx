import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useApi } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { Upload, FileUp, CheckCircle, AlertCircle, Loader2, Sword, Users, MapPin } from 'lucide-react';

export default function SaveUpload() {
  const api = useApi();
  const navigate = useNavigate();
  const { dispatch } = useApp();
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
      dispatch({
        type: 'ADD_PROJECT',
        payload: {
          id: res.project_id,
          name: res.project_name,
          description: 'Uploaded from CT save file',
          sources: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          character_count: res.characters_created,
          commit_count: 0,
        },
      });
      setTimeout(() => {
        navigate(`/project/${res.project_id}`);
      }, 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-1">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Sword className="w-7 h-7 md:w-8 md:h-8 text-amber-500" />
          Upload FFT Save
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Upload a Final Fantasy Tactics PSX save file to extract party data, story progress, and character info.
          Supports DuckStation / ePSXe memory card files (.mcr, .mcd, .mcs).
        </p>
      </div>

      {/* File Upload */}
      <div className="border-2 border-dashed border-border rounded-lg p-6 md:p-8 text-center hover:border-primary/50 transition-colors">
        <input
          ref={fileRef}
          type="file"
          accept=".mcr,.mcd,.mcs,.sav,.bin"
          onChange={handleFile}
          className="hidden"
        />
        
        {file ? (
          <div className="space-y-3">
            <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-500 mx-auto" />
            <div>
              <p className="font-medium text-sm md:text-base">{file.name}</p>
              <p className="text-xs md:text-sm text-muted-foreground">
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
            className="space-y-3 cursor-pointer w-full"
          >
            <Upload className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto" />
            <div>
                <p className="font-medium text-sm md:text-base">Click to upload a memory card file</p>
              <p className="text-xs md:text-sm text-muted-foreground">
                Supports .mcr, .mcd, .mcs, .sav, .bin
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Actions */}
      {file && !result && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleUpload}
            disabled={api.loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm"
          >
            {api.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
            Parse Memory Card
          </button>
          <button
            onClick={handleCreateProject}
            disabled={api.loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm"
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
          <p className="text-sm">{api.error}</p>
        </div>
      )}

      {/* Parse Result */}
      {result && !created && (
        <div className="space-y-4 md:space-y-6">
          <div className="p-4 md:p-6 bg-card border rounded-lg space-y-4">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
              Save Parsed Successfully
            </h2>

            {/* Characters */}
            {result.characters && result.characters.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  Characters ({result.characters.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.characters.map((c: any, i: number) => (
                    <div key={i} className="text-xs bg-muted/50 rounded-lg p-2.5">
                      <p className="font-medium">{c.name || `Character ${i}`}</p>
                      <p className="text-muted-foreground">
                        Lv {c.level || '?'} • HP {c.hp || '?'}/{c.maxhp || '?'} • MP {c.mp || '?'}/{c.maxmp || '?'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-3 text-xs">
              {result.gold !== undefined && (
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-medium">
                  {result.gold.toLocaleString()}g
                </span>
              )}
              {result.play_time && (
                <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 font-medium">
                  {result.play_time.hours}h {result.play_time.minutes}m
                </span>
              )}
              {result.inventory && (
                <span className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-600 font-medium">
                  {result.inventory.length} items
                </span>
              )}
            </div>
          </div>

          {/* Create Project CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setResult(null)}
              className="flex-1 px-4 py-3 border rounded-lg hover:bg-accent text-sm"
            >
              Upload Another
            </button>
            <button
              onClick={handleCreateProject}
              disabled={api.loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm"
            >
              {api.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sword className="w-5 h-5" />}
              Create Full Project
            </button>
          </div>
        </div>
      )}

      {/* Project Created */}
      {created && (
        <div className="p-4 md:p-6 bg-green-50 border border-green-200 rounded-lg space-y-4">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
            Project Created!
          </h2>
          <div className="space-y-1.5 text-sm text-green-700">
            <p><strong>{created.characters_created}</strong> characters created</p>
            <p><strong>{created.inventory_items}</strong> inventory items</p>
            <p><strong>{created.gold?.toLocaleString()}g</strong> gold</p>
          </div>
          <p className="text-sm text-green-600 animate-pulse">Redirecting to project...</p>
        </div>
      )}
    </div>
  );
}
