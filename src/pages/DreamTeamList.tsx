import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { api } from '../lib/api';
import type { DreamTeam } from '../types';

export default function DreamTeamList() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<DreamTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadTeams = useCallback(async () => {
    try {
      const data = await api.getDreamTeams(projectId!);
      setTeams(data.teams);
    } catch (e) {
      console.error('Failed to load teams', e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const data = await api.createDreamTeam(projectId!, { name: 'Untitled Dream Team', description: '' });
      navigate(`/project/${projectId}/dream-team/${data.id}`);
    } catch (e) {
      console.error('Failed to create team', e);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (teamId: number) => {
    if (!confirm('Delete this dream team?')) return;
    try {
      await api.deleteDreamTeam(projectId!, teamId);
      setTeams(teams.filter(t => t.id !== teamId));
    } catch (e) {
      console.error('Failed to delete', e);
    }
  };

  const handleShare = async (teamId: number) => {
    try {
      const data = await api.generateShareCode(teamId);
      const shareUrl = `${window.location.origin}/#/shared-team/${data.share_code}`;
      navigator.clipboard.writeText(shareUrl);
      alert(`Share code: ${data.share_code}\nURL copied to clipboard!`);
      loadTeams();
    } catch (e) {
      console.error('Failed to generate share code', e);
    }
  };

  return (
    <div className="dream-team-list">
      <div className="page-header">
        <div>
          <h1>Dream Team</h1>
          <p>Build, customize, and share your ultimate FFT party</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
          {creating ? 'Creating...' : '+ Create Team'}
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : teams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚔️</div>
          <h3>No dream teams yet</h3>
          <p>Create your first dream team to assemble your ultimate FFT party</p>
          <button className="btn btn-primary" onClick={handleCreate} style={{ marginTop: '1rem' }}>
            Create Your First Team
          </button>
        </div>
      ) : (
        <div className="team-grid">
          {teams.map(team => (
            <div key={team.id} className="team-card">
              <div className="team-card-header">
                <h3>{team.name}</h3>
                {team.share_code && (
                  <span className="badge badge-success">🔗 {team.share_code}</span>
                )}
              </div>
              <p className="team-desc">{team.description || 'No description'}</p>
              <div className="team-meta">
                <span>{team.member_count}/5 members</span>
                <span>•</span>
                <span>{team.created_at ? new Date(team.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="team-card-actions">
                <Link to={`/project/${projectId}/dream-team/${team.id}`} className="btn btn-sm">
                  Edit Team
                </Link>
                <Link to={`/project/${projectId}/dream-team/${team.id}/chat`} className="btn btn-sm">
                  Chat
                </Link>
                <button className="btn btn-sm" onClick={() => handleShare(team.id)}>
                  Share
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(team.id)}>
                  Delete
                </button>
              </div>
              {team.members.length > 0 && (
                <div className="team-preview">
                  {team.members.map(m => (
                    <div key={m.id} className="team-preview-char">
                      <div className="char-avatar-sm">
                        <img src={m.display_name.toLowerCase().replace(/\s+/g, '_') + '.png'} alt={m.display_name}
                             onError={e => { (e.target as HTMLImageElement).src = '/assets/job_avatars/squire.jpg'; }}
                        />
                      </div>
                      <span className="char-name-sm">{m.display_name}</span>
                      <span className="char-job-sm">{m.job} Lv.{m.level}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
