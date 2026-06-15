import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import MessageContent from '../components/ui/MessageContent';
import { api } from '../lib/api';
import type { DreamTeam } from '../types';

// Tactical-fantasy palette — references the design tokens from App.css.
const FFT_THEME = {
  primary: 'var(--bg-elevated)',
  accent: 'var(--bronze)',
  gold: 'var(--gold)',
  dark: 'var(--bg)',
  card: 'var(--bg-card)',
  text: 'var(--text)',
  muted: 'var(--text-secondary)',
  border: 'var(--border)',
  user: 'var(--blue-dim)',
  char: 'var(--bg-card)',
};

export default function DreamTeamChat() {
  const { id: projectId, teamId } = useParams<{ id: string; teamId: string }>();
  const [team, setTeam] = useState<DreamTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<{ character: string; text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [partialResponses, setPartialResponses] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadTeam = useCallback(async () => {
    try {
      setTeam(await api.getDreamTeam(projectId!, teamId!));
    } catch (e) {
      console.error('Failed to load team', e);
    } finally {
      setLoading(false);
    }
  }, [projectId, teamId]);

  useEffect(() => { loadTeam(); }, [loadTeam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || streaming || !team) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { character: 'You', text: userText, isUser: true }]);
    setStreaming(true);

    // Clear any partial responses
    setMessages(prev => prev.filter(m => m.isUser));

    // Collect streaming responses
    const charResponses: Record<string, string> = {};
    team.members.forEach(m => { charResponses[m.display_name] = ''; });

    try {
      abortControllerRef.current = new AbortController();
      const res = await api.streamDreamTeamChat({
        team_id: parseInt(teamId!),
        message: userText,
      }, abortControllerRef.current.signal);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          // Split on double newlines (SSE event separator)
          const events = buffer.split(/\n\n+/);
          buffer = events.pop() || '';

          for (const event of events) {
            if (!event.trim()) continue;
            // Extract the data: line from the SSE event block
            const dataMatch = event.match(/data:\s*(.+)$/m);
            if (!dataMatch) continue;

            try {
              const data = JSON.parse(dataMatch[1].trim());
              if (data.character_name && data.text) {
                charResponses[data.character_name] = (charResponses[data.character_name] || '') + data.text;
                // Also update partialResponses state for the "thinking" indicator
                setPartialResponses(prev => ({ ...prev, [data.character_name]: charResponses[data.character_name] }));
                // Update messages to show current state
                setMessages(prev => {
                  const filtered = prev.filter(m => m.isUser);
                  const charMsgs = Object.entries(charResponses)
                    .filter(([, text]) => text.length > 0)
                    .map(([char, text]) => ({ character: char, text, isUser: false }));
                  return [...filtered, ...charMsgs];
                });
              }
            } catch {
              // Not JSON, skip
            }
          }
        }
      }
    } catch (e) {
      if (!(e instanceof Error) || e.name !== 'AbortError') {
        console.error('Chat error:', e);
      }
    } finally {
      setStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setStreaming(false);
  };

  if (loading || !team) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: FFT_THEME.muted }}>
        Loading dream team...
      </div>
    );
  }

  if (team.members.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</div>
        <h2 style={{ color: FFT_THEME.accent, marginBottom: '1rem' }}>No team members yet</h2>
        <p style={{ color: FFT_THEME.muted, marginBottom: '2rem' }}>
          Add characters to your dream team first to start chatting with them.
        </p>
        <Link to={`/project/${projectId}/dream-team/${teamId}`} className="btn" style={{
          background: FFT_THEME.accent, color: FFT_THEME.primary,
        }}>
          Edit Team
        </Link>
      </div>
    );
  }

  return (
    <div className="dream-team-chat" style={{
      display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)',
      background: `linear-gradient(180deg, ${FFT_THEME.dark}, ${FFT_THEME.primary})`,
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 2rem',
        borderBottom: `1px solid ${FFT_THEME.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: FFT_THEME.primary,
      }}>
        <div>
          <Link to={`/project/${projectId}/dream-team/${teamId}`} style={{
            color: FFT_THEME.muted, textDecoration: 'none', fontSize: '0.9rem', marginRight: '1rem',
          }}>
            ← Back to Team
          </Link>
          <h2 style={{ color: FFT_THEME.accent, margin: '0.5rem 0 0 0', fontSize: '1.2rem' }}>
            Chat with {team.name}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {team.members.map(m => (
              <span key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                background: 'rgba(201,162,39,0.1)', padding: '0.25rem 0.75rem',
                borderRadius: '16px', fontSize: '0.8rem', color: FFT_THEME.text,
              }}>
                <img src={m.display_name.toLowerCase().replace(/\s+/g, '_') + '.png'}
                     alt={m.display_name} style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                     onError={e => { (e.target as HTMLImageElement).src = '/assets/job_avatars/squire.jpg'; }}
                />
                {m.display_name} <span style={{ color: FFT_THEME.muted }}>({m.job})</span>
              </span>
            ))}
          </div>
        </div>
        {streaming && (
          <button className="btn btn-sm btn-danger" onClick={handleStop}>
            ⏹ Stop
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '2rem',
        display: 'flex', flexDirection: 'column', gap: '1.5rem',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: FFT_THEME.muted, marginTop: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <p>Ask your dream team anything!</p>
            <p style={{ fontSize: '0.85rem' }}>
              {team.members.map(m => `${m.display_name} will respond as ${m.job}`).join(' • ')}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{
              maxWidth: '75%',
              background: msg.isUser ? FFT_THEME.user : FFT_THEME.card,
              padding: '1rem 1.25rem',
              borderRadius: msg.isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              border: msg.isUser ? 'none' : `1px solid ${FFT_THEME.border}`,
              color: msg.isUser ? 'var(--text-strong)' : FFT_THEME.text,
            }}>
              {!msg.isUser && (
                <div style={{
                  fontSize: '0.75rem', color: FFT_THEME.accent,
                  marginBottom: '0.35rem', fontWeight: 'bold',
                }}>
                  {msg.character}
                </div>
              )}
              {msg.isUser
                ? <div style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                : <MessageContent text={msg.text} />}
            </div>
          </div>
        ))}

        {streaming && (
          <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', flexWrap: 'wrap' }}>
            {team.members.map(m => (
              partialResponses[m.display_name] && (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: FFT_THEME.muted, fontSize: '0.85rem',
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%',
                    background: FFT_THEME.accent, animation: 'pulse 1s infinite',
                  }} />
                  {m.display_name}...
                </div>
              )
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '1.5rem 2rem',
        borderTop: `1px solid ${FFT_THEME.border}`,
        background: FFT_THEME.primary,
      }}>
        <div style={{
          display: 'flex', gap: '1rem', maxWidth: '800px', margin: '0 auto',
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={streaming ? 'Streaming...' : `Ask your dream team anything...`}
            disabled={streaming}
            rows={2}
            style={{
              flex: 1, padding: '1rem',
              background: FFT_THEME.dark,
              border: `1px solid ${FFT_THEME.border}`,
              color: FFT_THEME.text,
              borderRadius: '12px',
              fontSize: '1rem',
              resize: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            style={{
              padding: '0.75rem 1.5rem',
              background: input.trim() && !streaming ? FFT_THEME.accent : FFT_THEME.border,
              color: input.trim() && !streaming ? FFT_THEME.primary : FFT_THEME.muted,
              border: 'none',
              borderRadius: '12px',
              cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: '1rem',
              alignSelf: 'flex-end',
              transition: 'all 0.2s',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
