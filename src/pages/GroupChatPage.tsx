import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { Landmark, MessagesSquare, Download, Mic, Check, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Character, ChatMessage } from '../types';

export default function GroupChatPage() {
  const { id } = useParams();
  const { state } = useApp();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChars, setSelectedChars] = useState<number[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [mode, setMode] = useState<'council' | 'dialogue'>('council');
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const pid = Number(id);
    const project = state.projects.find(p => p.id === pid);
    if (project?.characters) setCharacters(project.characters);
  }, [id, state.projects]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const toggleChar = (charId: number) => {
    setSelectedChars(prev => {
      if (prev.includes(charId)) return prev.filter(cid => cid !== charId);
      if (prev.length >= 4) return prev;
      return [...prev, charId];
    });
  };

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setStreaming(false);
    setLoading(false);
    setActiveSpeaker(null);
  }, []);

  const exportConversation = useCallback(() => {
    const lines = messages.map(m => {
      if (m.role === 'user') return `You: ${m.content}`;
      return `${m.character_name || '???'}: ${m.content}`;
    });
    const selNames = selectedChars.map(cid => characters.find(c => c.id === cid)?.name).join(', ');
    const header = `# FFT PSX Vera - ${mode === 'council' ? 'Council' : 'Dialogue'}\n# ${new Date().toLocaleString()}\n# Characters: ${selNames}\n\n`;
    const blob = new Blob([header + lines.join('\n\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fft-vera-${mode}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages, mode, selectedChars, characters]);

  const send = async () => {
    if (!input.trim() || selectedChars.length < 2 || loading) return;
    const msg = input.trim();
    setInput('');
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msg, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    // Create placeholder messages for each character
    const charPlaceholders: Record<string, string> = {};
    selectedChars.forEach(cid => {
      const charName = characters.find(c => c.id === cid)?.name || `Char ${cid}`;
      const msgId = `group-${Date.now()}-${cid}`;
      charPlaceholders[charName] = msgId;
      setMessages(prev => [...prev, {
        id: msgId,
        role: 'assistant',
        content: '',
        character_name: charName,
        timestamp: Date.now(),
        streaming: true,
      }]);
    });

    try {
      const r = await fetch('/api/chat/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: Number(id),
          character_ids: selectedChars,
          message: msg,
          mode,
        }),
        signal: controller.signal,
      });

      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      const reader = r.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith('event: ')) continue;

          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const data = JSON.parse(jsonStr);

              if (data.text && data.character_name) {
                setActiveSpeaker(data.character_name);
                const msgId = charPlaceholders[data.character_name];
                if (msgId) {
                  setMessages(prev => prev.map(m =>
                    m.id === msgId ? { ...m, content: m.content + data.text } : m
                  ));
                }
              }

              if (data.responses) {
                for (const [charName, response] of Object.entries(data.responses)) {
                  const msgId = charPlaceholders[charName];
                  if (msgId) {
                    setMessages(prev => prev.map(m =>
                      m.id === msgId ? { ...m, content: response as string, streaming: false } : m
                    ));
                  }
                }
              }

              if (data.error) {
                setMessages(prev => [...prev, {
                  id: `err-${Date.now()}`,
                  role: 'assistant',
                  content: `(Error: ${data.error})`,
                  character_name: data.character_name || 'System',
                  timestamp: Date.now(),
                }]);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.streaming ? { ...m, streaming: false } : m
        ));
      } else {
        const message = err instanceof Error ? err.message : String(err);
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `(Error: ${message})`,
          character_name: 'System',
          timestamp: Date.now(),
        }]);
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      setActiveSpeaker(null);
      abortRef.current = null;
    }
  };

  const modeLabel = mode === 'council' ? 'War Council' : 'Dialogue';
  const ModeIcon = mode === 'council' ? Landmark : MessagesSquare;

  return (
    <div className="page-chat group-chat">
      <header className="chat-header">
        <Link to={`/project/${id}`} className="btn-back"><ArrowLeft size={15} /> Back</Link>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}><ModeIcon size={18} /> {modeLabel}</h2>
          <p className="chat-subtitle">
            {selectedChars.length < 2
              ? 'Select 2-4 characters to begin'
              : `${selectedChars.length} characters selected`}
          </p>
        </div>
        <div className="chat-header-actions">
          <button
            className={`mode-toggle ${mode === 'council' ? 'active' : ''}`}
            onClick={() => setMode(m => m === 'council' ? 'dialogue' : 'council')}
          >
            <ModeIcon size={14} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />
            {mode === 'council' ? 'Council' : 'Dialogue'}
          </button>
          {messages.length > 0 && (
            <button className="btn-export" onClick={exportConversation} title="Export conversation">
              <Download size={14} style={{ verticalAlign: '-2px', marginRight: '0.3rem' }} /> Export
            </button>
          )}
        </div>
      </header>

      <div className="char-selector">
        <p className="selector-label">Select characters:</p>
        <div className="selector-chips">
          {characters.map(char => {
            const isSelected = selectedChars.includes(char.id);
            return (
              <button
                key={char.id}
                className={`char-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleChar(char.id)}
              >
                {char.avatar_url ? (
                  <img src={char.avatar_url} alt="" className="chip-avatar" />
                ) : (
                  <span className="chip-emoji">{char.name[0]}</span>
                )}
                <span className="chip-name">{char.name}</span>
                {isSelected && <span className="chip-check"><Check size={13} /></span>}
              </button>
            );
          })}
        </div>
      </div>

      {activeSpeaker && (
        <div className="active-speaker-banner">
          <span className="speaker-icon" style={{ display: 'inline-flex' }}><Mic size={14} /></span>
          <span><strong>{activeSpeaker}</strong> is speaking...</span>
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 && selectedChars.length >= 2 && (
          <div className="chat-welcome">
            <p>Ask a question and hear from <strong>{selectedChars.map(cid => characters.find(c => c.id === cid)?.name).join(', ')}</strong></p>
            <p className="hint">Each character will respond in their own voice</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="msg-avatar-wrap">
                {characters.find(c => c.name === msg.character_name)?.avatar_url ? (
                  <img
                    src={characters.find(c => c.name === msg.character_name)?.avatar_url}
                    alt=""
                    className={`msg-avatar ${activeSpeaker === msg.character_name ? 'speaking' : ''}`}
                  />
                ) : (
                  <div className={`msg-avatar avatar-fallback ${activeSpeaker === msg.character_name ? 'speaking' : ''}`}>
                    {(msg.character_name || '?')[0]}
                  </div>
                )}
              </div>
            )}
            <div className="msg-bubble">
              {msg.role === 'assistant' && (
                <span className="msg-name">{msg.character_name}</span>
              )}
              <p>{msg.content}</p>
              {msg.streaming && <span className="streaming-cursor">{"\u258A"}</span>}
            </div>
          </div>
        ))}
        {loading && !streaming && (
          <div className="message assistant">
            <div className="msg-bubble typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input-bar">
        {streaming && (
          <button onClick={stopStreaming} className="btn-stop" title="Stop generating">
            {"\u25A0"} Stop
          </button>
        )}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (streaming) stopStreaming();
              else send();
            }
          }}
          placeholder={streaming ? 'Characters are speaking...' : 'Ask the group...'}
          disabled={loading && !streaming}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim() || selectedChars.length < 2}
        >
          {streaming ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
