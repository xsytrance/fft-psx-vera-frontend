import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import type { DreamTeam, DreamTeamMember, AvailableCharacter, JobInfo, EquipmentData } from '../types';

// Tactical-fantasy palette — references the design tokens from App.css so the
// builder stays in step with the rest of the app (no hardcoded colors).
const FFT_THEME = {
  primary: 'var(--bg-elevated)',
  accent: 'var(--bronze)',
  gold: 'var(--gold)',
  dark: 'var(--bg)',
  card: 'var(--bg-card)',
  text: 'var(--text)',
  muted: 'var(--text-secondary)',
  border: 'var(--border)',
  success: 'var(--confirm)',
  danger: 'var(--danger)',
};

export default function DreamTeamBuilder() {
  const { id: projectId, teamId } = useParams<{ id: string; teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<DreamTeam | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCharModal, setShowCharModal] = useState(false);
  const [characters, setCharacters] = useState<AvailableCharacter[]>([]);
  const [searchChar, setSearchChar] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Edit state for a member
  const [editMember, setEditMember] = useState<DreamTeamMember | null>(null);
  const [jobs, setJobs] = useState<JobInfo[]>([]);
  const [jobEquipment, setJobEquipment] = useState<Record<string, EquipmentData>>({});
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(30);
  const [selectedEquipment, setSelectedEquipment] = useState<Record<string, string>>({});
  const [selectedAbilities, setSelectedAbilities] = useState<Record<string, string[]>>({});

  const loadTeam = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/dream-teams/${teamId}`);
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      } else {
        navigate(`/project/${projectId}/dream-team`);
      }
    } catch (e) {
      console.error('Failed to load team', e);
    } finally {
      setLoading(false);
    }
  }, [projectId, teamId, navigate]);

  const loadCharacters = useCallback(async () => {
    try {
      const res = await fetch('/api/characters');
      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters);
      }
    } catch (e) {
      console.error('Failed to load characters', e);
    }
  }, []);

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    } catch (e) {
      console.error('Failed to load jobs', e);
    }
  }, []);

  const loadJobEquipment = useCallback(async (jobName: string) => {
    if (jobEquipment[jobName]) return;
    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobName)}/equipment?level=${selectedLevel}`);
      if (res.ok) {
        const data = await res.json();
        setJobEquipment(prev => ({ ...prev, [jobName]: data }));
      }
    } catch (e) {
      console.error('Failed to load equipment', e);
    }
  }, [jobEquipment, selectedLevel]);

  useEffect(() => {
    loadTeam();
    loadCharacters();
    loadJobs();
  }, [loadTeam, loadCharacters, loadJobs]);

  const filteredCharacters = characters.filter(c =>
    c.display_name.toLowerCase().includes(searchChar.toLowerCase()) ||
    c.name.toLowerCase().includes(searchChar.toLowerCase())
  );

  const openCharModal = (slotIndex: number) => {
    setSelectedSlot(slotIndex);
    setShowCharModal(true);
    setSearchChar('');
  };

  const selectCharacter = (char: AvailableCharacter) => {
    if (!team) return;

    const existingMember = team.members.find(m => m.slot_index === selectedSlot);
    const newMember: DreamTeamMember = {
      character_name: char.name,
      display_name: char.display_name,
      job: char.base_job,
      level: char.base_level,
      equipment: {},
      abilities: {},
      slot_index: selectedSlot || 0,
    };

    if (existingMember) {
      // Update existing member
      updateMember(newMember);
    } else {
      // Add new member
      addMember(newMember);
    }

    setShowCharModal(false);
    setSelectedSlot(null);
  };

  const addMember = async (member: DreamTeamMember) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/dream-teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      if (res.ok) {
        loadTeam();
      }
    } catch (e) {
      console.error('Failed to add member', e);
    }
  };

  const updateMember = async (member: DreamTeamMember) => {
    try {
      // If updating existing, use PUT; if new, use POST
      if (member.id) {
        await fetch(`/api/dream-teams/${teamId}/members/${member.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(member),
        });
      } else {
        await addMember(member);
        // After add, we need the ID - reload and find
        await loadTeam();
      }
      setEditMember(null);
    } catch (e) {
      console.error('Failed to update member', e);
    }
  };

  const removeMember = async (memberId: number) => {
    if (!confirm('Remove this character from the team?')) return;
    try {
      await fetch(`/api/dream-teams/${teamId}/members/${memberId}`, { method: 'DELETE' });
      loadTeam();
    } catch (e) {
      console.error('Failed to remove member', e);
    }
  };

  const openEditModal = (member: DreamTeamMember) => {
    setEditMember(member);
    setSelectedJob(member.job);
    setSelectedLevel(member.level);
    setSelectedEquipment(member.equipment || {});
    setSelectedAbilities(member.abilities || {});
    loadJobEquipment(member.job);
  };

  const handleSaveEdit = async () => {
    if (!editMember) return;
    const updated = {
      ...editMember,
      job: selectedJob,
      level: selectedLevel,
      equipment: selectedEquipment,
      abilities: selectedAbilities,
    };
    await updateMember(updated);
  };

  const toggleAbility = (category: string, ability: string) => {
    const current = selectedAbilities[category] || [];
    if (current.includes(ability)) {
      setSelectedAbilities({
        ...selectedAbilities,
        [category]: current.filter(a => a !== ability),
      });
    } else {
      setSelectedAbilities({
        ...selectedAbilities,
        [category]: [...current, ability],
      });
    }
  };

  const selectEquipment = (slot: string, item: string) => {
    setSelectedEquipment({ ...selectedEquipment, [slot]: item });
  };

  const getJobAbilities = (jobName: string) => {
    const job = jobs.find(j => j.name === jobName);
    return job?.abilities || {};
  };

  const filteredJobs = jobs.filter(j =>
    j.name.toLowerCase().includes(selectedJob.toLowerCase()) ||
    j.name.toLowerCase().includes(searchChar.toLowerCase())
  );

  if (loading || !team) {
    return (
      <div className="dream-team-list" style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem' }}>⚔️</div>
        <p>Loading dream team...</p>
      </div>
    );
  }

  return (
    <div className="dream-team-builder">
      {/* Header */}
      <div className="page-header fft-header" style={{
        background: `linear-gradient(135deg, ${FFT_THEME.primary}, ${FFT_THEME.dark})`,
        borderBottom: `2px solid ${FFT_THEME.accent}`,
        padding: '1.5rem 2rem',
      }}>
        <div>
          <Link to={`/project/${projectId}/dream-team`} style={{ color: FFT_THEME.muted, textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Back to Teams
          </Link>
          <h1 style={{ color: FFT_THEME.accent, fontSize: '2rem', margin: '0.5rem 0 0.25rem 0' }}>{team.name}</h1>
          <p style={{ color: FFT_THEME.text, margin: 0 }}>
            {team.members.length}/5 members • {new Date(team.created_at || '').toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/project/${projectId}/dream-team/${teamId}/chat`} className="btn" style={{
            background: FFT_THEME.accent, color: FFT_THEME.primary, fontWeight: 'bold',
          }}>
            💬 Chat as Team
          </Link>
          <Link to={`/project/${projectId}/dream-team`} className="btn" style={{
            border: `1px solid ${FFT_THEME.accent}`, color: FFT_THEME.accent,
          }}>
            Save & Exit
          </Link>
        </div>
      </div>

      {/* Team Roster */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        <div className="team-roster" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const member = team.members.find(m => m.slot_index === i);
            return (
              <div key={i} className="slot-card" style={{
                background: member ? FFT_THEME.card : 'rgba(255,255,255,0.03)',
                border: `1px solid ${member ? FFT_THEME.border : '2px dashed rgba(201,162,39,0.3)'}`,
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.2s',
              }}>
                <div className="slot-number" style={{
                  position: 'absolute', top: '0.5rem', left: '0.75rem',
                  fontSize: '0.75rem', color: FFT_THEME.muted, fontWeight: 'bold',
                }}>
                  SLOT {i + 1}
                </div>

                {member ? (
                  <>
                    <div className="member-avatar" style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      margin: '0 auto 1rem', overflow: 'hidden',
                      border: `2px solid ${FFT_THEME.accent}`,
                    }}>
                      <img src={member.display_name.toLowerCase().replace(/\s+/g, '_') + '.png'} alt={member.display_name}
                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                           onError={e => { (e.target as HTMLImageElement).src = '/assets/character_avatars/squire.png'; }}
                      />
                    </div>
                    <h3 style={{ color: FFT_THEME.accent, margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>
                      {member.display_name}
                    </h3>
                    <p style={{ color: FFT_THEME.text, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                      {member.job}
                    </p>
                    <p style={{ color: FFT_THEME.muted, margin: '0 0 1rem 0', fontSize: '0.85rem' }}>
                      Lv. {member.level}
                    </p>

                    {member.equipment && Object.keys(member.equipment).length > 0 && (
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.25rem', fontSize: '0.7rem', marginBottom: '1rem',
                      }}>
                        {Object.entries(member.equipment).map(([slot, item]) => (
                          <div key={slot} style={{ color: FFT_THEME.muted, fontSize: '0.65rem' }}>
                            <span style={{ color: FFT_THEME.accent }}>{slot}: </span>
                            {item}
                          </div>
                        ))}
                      </div>
                    )}

                    {member.abilities && Object.values(member.abilities).flat().length > 0 && (
                      <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '0.25rem',
                        justifyContent: 'center', marginBottom: '1rem',
                      }}>
                        {Object.entries(member.abilities).map(([, abls]) =>
                          (abls || []).slice(0, 2).map(ab => (
                            <span key={ab} style={{
                              background: 'rgba(201,162,39,0.15)', color: FFT_THEME.gold,
                              padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem',
                            }}>
                              {ab}
                            </span>
                          ))
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button className="btn btn-sm" onClick={() => openEditModal(member)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => removeMember(member.id!)}>
                        🗑️
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      margin: '0 auto 1rem', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '2rem',
                      border: `2px dashed rgba(201,162,39,0.3)`,
                    }}>
                      +
                    </div>
                    <p style={{ color: FFT_THEME.muted, margin: '0 0 1rem 0' }}>
                      Empty slot
                    </p>
                    <button className="btn" onClick={() => openCharModal(i)} style={{
                      background: 'transparent', border: `1px solid ${FFT_THEME.accent}`,
                      color: FFT_THEME.accent,
                    }}>
                      Add Character
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Character Selection Modal */}
      {showCharModal && (
        <div className="modal-overlay" onClick={() => setShowCharModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header" style={{ borderBottom: `1px solid ${FFT_THEME.border}` }}>
              <h2 style={{ color: FFT_THEME.accent, margin: 0 }}>Select Character</h2>
              <button className="btn-close" onClick={() => setShowCharModal(false)}>✕</button>
            </div>
            <div style={{ padding: '1rem' }}>
              <input
                type="text"
                placeholder="Search characters..."
                value={searchChar}
                onChange={e => setSearchChar(e.target.value)}
                className="dt-input"
                style={{ width: '100%', marginBottom: '1rem' }}
                autoFocus
              />
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredCharacters.map(char => (
                  <div key={char.name} className="dt-pick" onClick={() => selectCharacter(char)}>
                    <img src={char.avatar_url} alt={char.display_name}
                         style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                         onError={e => { (e.target as HTMLImageElement).src = '/assets/character_avatars/squire.png'; }}
                    />
                    <div>
                      <div style={{ color: FFT_THEME.text, fontWeight: 'bold' }}>{char.display_name}</div>
                      <div style={{ color: FFT_THEME.muted, fontSize: '0.85rem' }}>
                        {char.role} • {char.base_job} Lv.{char.base_level}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editMember && (
        <div className="modal-overlay" onClick={() => setEditMember(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header" style={{ borderBottom: `1px solid ${FFT_THEME.border}` }}>
              <h2 style={{ color: FFT_THEME.accent, margin: 0 }}>
                Edit: {editMember.display_name}
              </h2>
              <button className="btn-close" onClick={() => setEditMember(null)}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Job Selection */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: FFT_THEME.accent, margin: '0 0 1rem 0' }}>Job Class</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <select
                    value={selectedJob}
                    onChange={e => {
                      setSelectedJob(e.target.value);
                      loadJobEquipment(e.target.value);
                    }}
                    className="dt-input"
                    style={{ flex: 1 }}
                  >
                    <option value="">Select a job...</option>
                    {filteredJobs.map(job => (
                      <option key={job.name} value={job.name}>
                        {job.name} ({job.tier === 0 ? 'Exclusive' : `Tier ${job.tier}`})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={selectedLevel}
                    onChange={e => {
                      const lv = parseInt(e.target.value) || 30;
                      setSelectedLevel(lv);
                      if (selectedJob) loadJobEquipment(selectedJob);
                    }}
                    className="dt-input"
                    style={{ width: '80px', textAlign: 'center' }}
                  />
                </div>

                {/* Equipment */}
                {selectedJob && jobEquipment[selectedJob] && (
                  <div className="dt-equip-box">
                    <h4 style={{ color: 'var(--gold)', margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontFamily: 'var(--font-serif)' }}>
                      Recommended Equipment (Lv.{jobEquipment[selectedJob].level_range})
                    </h4>
                    <div className="dt-equip-grid">
                      {Object.entries(jobEquipment[selectedJob].equipment).map(([slot, items]) => (
                        <div key={slot}>
                          <label className="dt-label">
                            {slot}
                          </label>
                          <select
                            value={selectedEquipment[slot] || ''}
                            onChange={e => selectEquipment(slot, e.target.value)}
                            className="dt-input"
                            style={{ width: '100%', fontSize: '0.85rem' }}
                          >
                            <option value="">-- None --</option>
                            {items.map(item => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Abilities */}
                {selectedJob && (() => {
                  const abilities = getJobAbilities(selectedJob);
                  return (
                    <div>
                      <h4 style={{ color: 'var(--gold)', margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontFamily: 'var(--font-serif)' }}>
                        Available Abilities
                      </h4>
                      {Object.entries(abilities).map(([category, abList]) => (
                        <div key={category} style={{ marginBottom: '0.75rem' }}>
                          <label className="dt-label">
                            {category}
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {(abList || []).map(ab => {
                              const selected = (selectedAbilities[category] || []).includes(ab);
                              return (
                                <button key={ab} type="button" onClick={() => toggleAbility(category, ab)} className={`dt-ability ${selected ? 'on' : ''}`}>
                                  {ab}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn-ghost" onClick={() => setEditMember(null)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
