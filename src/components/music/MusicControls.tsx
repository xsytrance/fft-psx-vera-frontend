import { Music, Pause, Play, RotateCcw, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from 'lucide-react';
import { useMusic, type MusicScreenId, type MusicTrackId } from '../../lib/music';

type MusicControlsProps = {
  mode?: 'compact' | 'settings';
};

function VolumeIcon({ muted, volume }: { muted: boolean; volume: number }) {
  if (muted) return <VolumeX size={16} />;
  if (volume < 0.5) return <Volume1 size={16} />;
  return <Volume2 size={16} />;
}

export default function MusicControls({ mode = 'compact' }: MusicControlsProps) {
  const music = useMusic();
  const muted = !music.enabled;
  const activeOverride = music.screenOverrides[music.currentScreen.id];

  if (mode === 'settings') {
    return (
      <div className="music-settings">
        <div className="music-settings__hero">
          <div>
            <p className="eyebrow eyebrow--ember">War-room soundtrack</p>
            <h2 className="section-title">Music</h2>
            <p className="empty-text">
              Three loopable Suno tactical JRPG tracks are built into the companion. Defaults follow the screen,
              and every screen can be reassigned without touching code.
            </p>
          </div>
          <button type="button" className={`music-power ${music.enabled ? 'active' : ''}`} onClick={music.toggleEnabled}>
            {music.enabled ? <Pause size={17} /> : <Play size={17} />}
            {music.enabled ? 'Music On' : 'Music Off'}
          </button>
        </div>

        <div className="music-now-card">
          <Music size={18} />
          <div>
            <strong>{music.currentTrack.title}</strong>
            <span>{music.currentScreen.label} · {music.isPlaying ? 'playing' : music.enabled ? 'tap play to allow audio' : 'off'}</span>
          </div>
        </div>

        <div className="music-row">
          <button type="button" className="music-icon-btn" aria-label="Previous track" onClick={music.previousTrack}>
            <SkipBack size={16} />
          </button>
          <label className="music-volume">
            <VolumeIcon muted={muted} volume={music.volume} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={music.volume}
              onChange={event => music.setVolume(Number(event.currentTarget.value))}
              aria-label="Music volume"
            />
            <span>{Math.round(music.volume * 100)}%</span>
          </label>
          <button type="button" className="music-icon-btn" aria-label="Next track" onClick={music.nextTrack}>
            <SkipForward size={16} />
          </button>
        </div>

        {music.blocked && (
          <p className="music-note">Browser autoplay blocked the soundtrack. Press <strong>Music On</strong> once and it will play after your tap.</p>
        )}

        <div className="music-track-grid">
          {music.tracks.map(track => (
            <button
              key={track.id}
              type="button"
              className={`music-track-card ${music.currentTrack.id === track.id ? 'active' : ''}`}
              onClick={() => {
                music.setCurrentScreenTrack(track.id);
                music.setEnabled(true);
              }}
            >
              <strong>{track.title}</strong>
              <span>{track.summary}</span>
              <small>{track.tags.join(' · ')}</small>
            </button>
          ))}
        </div>

        <div className="music-screen-map">
          <div className="music-screen-map__head">
            <div>
              <h3>Screen assignments</h3>
              <p>Change any screen’s default loop, or reset back to Vera’s suggested soundtrack.</p>
            </div>
            <button type="button" className="btn-back" onClick={music.resetAllScreenTracks}>
              <RotateCcw size={15} /> Reset all
            </button>
          </div>
          {music.screens.map(screen => {
            const selectedTrackId = music.screenOverrides[screen.id] ?? screen.defaultTrackId;
            const isCustom = Boolean(music.screenOverrides[screen.id]);
            return (
              <div key={screen.id} className="music-screen-row">
                <div>
                  <strong>{screen.label}</strong>
                  <span>{screen.description}</span>
                  <small>{isCustom ? 'Custom assignment' : 'App default'}</small>
                </div>
                <select
                  value={selectedTrackId}
                  onChange={event => music.setScreenTrack(screen.id, event.currentTarget.value as MusicTrackId)}
                  aria-label={`${screen.label} music track`}
                >
                  {music.tracks.map(track => <option key={track.id} value={track.id}>{track.title}</option>)}
                </select>
                {isCustom && (
                  <button type="button" className="music-reset-screen" onClick={() => music.clearScreenTrack(screen.id as MusicScreenId)}>
                    Default
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="music-compact" aria-label="Music controls">
      <div className="music-compact__meta">
        <Music size={15} />
        <div>
          <span>{music.currentTrack.title}</span>
          <small>{music.currentScreen.label}{activeOverride ? ' · custom' : ''}</small>
        </div>
      </div>
      <div className="music-compact__buttons">
        <button type="button" aria-label="Previous track" onClick={music.previousTrack}><SkipBack size={14} /></button>
        <button type="button" className={music.enabled ? 'active' : ''} aria-label={music.enabled ? 'Turn music off' : 'Turn music on'} onClick={music.toggleEnabled}>
          {music.enabled ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button type="button" aria-label="Next track" onClick={music.nextTrack}><SkipForward size={14} /></button>
      </div>
      <label className="music-compact__volume">
        <VolumeIcon muted={muted} volume={music.volume} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={music.volume}
          onChange={event => music.setVolume(Number(event.currentTarget.value))}
          aria-label="Music volume"
        />
      </label>
      {music.blocked && <small className="music-compact__blocked">Tap play to allow audio.</small>}
    </div>
  );
}
