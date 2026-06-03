import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const pid = Number(id);
    const project = state.projects.find(p => p.id === pid);
    const char = project?.characters?.find(c => c.id === Number(charId));
    if (char) setCharacter(char);
  }, [id, charId, state.projects]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setStreaming(false);
    setLoading(false);
  }, []);

  const send = async () => {
    if (!input.trim() || !character || loading) return;
    const msg = input.trim();
    setInput('');
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msg, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    // Create placeholder for streaming response
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      character_name: character.name,
      timestamp: Date.now(),
      streaming: true,
    }]);

    try {
      const r = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: Number(id), character_id: character.id, message: msg }),
        signal: controller.signal,
      });

      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      const reader = r.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse SSE format — skip event: lines, process data: lines
          if (line.startsWith('event: ')) {
            continue;
          }

          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const data = JSON.parse(jsonStr);

              if (data.text) {
                fullText += data.text;
                // Update the streaming message
                setMessages(prev => prev.map(m =>
                  m.id === aiMsgId ? { ...m, content: fullText } : m
                ));
              }

              if (data.response) {
                // Final response
                setMessages(prev => prev.map(m =>
                  m.id === aiMsgId ? { ...m, content: data.response, streaming: false } : m
                ));
              }

              if (data.error) {
                setMessages(prev => prev.map(m =>
                  m.id === aiMsgId ? { ...m, content: `(Error: ${data.error})`, streaming: false } : m
                ));
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User stopped streaming — keep whatever we have
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, streaming: false } : m
        ));
      } else {
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, content: `(Error: ${err.message})`, streaming: false } : m
        ));
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      abortRef.current = null;
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
              {msg.streaming && <span className="streaming-cursor">▊</span>}
            </div>
          </div>
        ))}
        {loading && !streaming && (
          <div className="message assistant">
            <div className="msg-bubble typing"><span>●●●</span></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input-bar">
        {streaming && (
          <button onClick={stopStreaming} className="btn-stop" title="Stop generating">
            ■ Stop
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
          placeholder={streaming ? `${character.name} is speaking...` : `Message ${character.name}...`}
          disabled={loading && !streaming}
        />
        <button onClick={send} disabled={loading || !input.trim()}>
          {streaming ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
