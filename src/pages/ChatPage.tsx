import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import type { Character, ChatMessage } from '../types';

export default function ChatPage() {
  const { id, charId } = useParams();
  const { state } = useApp();
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pid = Number(id);
    const project = state.projects.find(p => p.id === pid);
    const char = project?.characters?.find(c => c.id === Number(charId));
    if (char) setCharacter(char);
  }, [id, charId, state.projects]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !character || loading) return;
    const msg = input.trim();
    setInput('');
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msg, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: Number(id), character_id: character.id, message: msg }),
      });
      const data = await r.json();
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || '(No response)',
        character_name: character.name,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: '(Error)', timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  if (!character) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page-chat">
      <header className="chat-header">
        <Link to={`/project/${id}/character/${charId}`} className="btn-back">← Back</Link>
        <div className="chat-char-info">
          {character.avatar_url && <img src={character.avatar_url} alt="" className="chat-avatar" />}
          <div>
            <h2>{character.name}</h2>
            <p>{character.role || 'Party Member'}</p>
          </div>
        </div>
      </header>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <p>Start chatting with <strong>{character.name}</strong></p>
            <p className="hint">Ask about the story, your party, gameplay tips...</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && character.avatar_url && (
              <img src={character.avatar_url} alt="" className="msg-avatar" />
            )}
            <div className="msg-bubble">
              {msg.role === 'assistant' && <span className="msg-name">{msg.character_name}</span>}
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="msg-bubble typing"><span>●●●</span></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input-bar">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={`Message ${character.name}...`}
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}
