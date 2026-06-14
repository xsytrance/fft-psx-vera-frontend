import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Square, RotateCcw, Copy, Check, ShieldCheck, SendHorizonal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MessageContent from '../components/ui/MessageContent';
import { api } from '../lib/api';
import type { Character, ChatMessage, SaveTruthCharacter } from '../types';

const normalizeName = (value: string | null | undefined) =>
  (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export default function ChatPage() {
  const { id, charId } = useParams();
  const { state } = useApp();
  const [character, setCharacter] = useState<Character | null>(null);
  const [grounded, setGrounded] = useState<SaveTruthCharacter | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const pid = Number(id);
    const project = state.projects.find(p => p.id === pid);
    const char = project?.characters?.find(c => c.id === Number(charId));
    if (char) setCharacter(char);
  }, [id, charId, state.projects]);

  // Parser-confirmed facts for this character — what they actually know from the save.
  useEffect(() => {
    if (!id || !character) return;
    let cancelled = false;
    api.getSaveTruth(id)
      .then(data => {
        if (cancelled) return;
        const target = normalizeName(character.name);
        const match = data.characters.find(c => normalizeName(c.name) === target)
          || data.characters.find(c => {
            const n = normalizeName(c.name);
            return Boolean(n && target && (n.includes(target) || target.includes(n)));
          });
        setGrounded(match || null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id, character]);

  // Restore this character's most recent saved thread so chat history survives reloads.
  useEffect(() => {
    if (!id || !character) return;
    let cancelled = false;
    conversationIdRef.current = null;
    api.listConversations(id)
      .then(async ({ conversations }) => {
        if (cancelled) return;
        const match = conversations.find(c => c.mode === 'chat' && c.character_ids.includes(character.id));
        if (!match) return;
        conversationIdRef.current = match.id;
        const full = await api.getConversation(match.id);
        if (cancelled) return;
        setMessages(full.messages.map(m => ({
          id: m.id,
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
          character_name: m.character_name || undefined,
          timestamp: m.created_at ? Date.parse(m.created_at) : Date.now(),
        })));
      })
      .catch(() => { /* persistence is best-effort; chat works without it */ });
    return () => { cancelled = true; };
  }, [id, character]);

  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (conversationIdRef.current) return conversationIdRef.current;
    if (!id || !character) return null;
    try {
      const conv = await api.createConversation(id, { mode: 'chat', character_ids: [character.id] });
      conversationIdRef.current = conv.id;
      return conv.id;
    } catch {
      return null;
    }
  }, [id, character]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 168)}px`;
  }, [input]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setLoading(false);
  }, []);

  const streamReply = useCallback(async (userText: string, persist: boolean) => {
    if (!character) return;
    setLoading(true);
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    // Persist the user turn (best-effort; never blocks or breaks the chat).
    let convId: string | null = null;
    if (persist) {
      convId = await ensureConversation();
      if (convId) {
        api.appendConversationMessage(convId, { role: 'user', content: userText, character_id: character.id }).catch(() => {});
      }
    }

    const aiMsgId = `a-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: aiMsgId, role: 'assistant', content: '', character_name: character.name,
      timestamp: Date.now(), streaming: true,
    }]);

    let fullText = '';
    let failed = false;
    try {
      const r = await api.streamChat({ project_id: Number(id), character_id: character.id, message: userText }, controller.signal);
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
          if (!line.trim() || line.startsWith('event: ')) continue;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullText += data.text;
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fullText } : m));
              }
              if (data.response) {
                fullText = data.response;
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: data.response, streaming: false } : m));
              }
              if (data.error) {
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: `Error: ${data.error}`, streaming: false, error: true } : m));
              }
            } catch { /* skip malformed chunk */ }
          }
        }
      }
    } catch (err) {
      failed = true;
      if (err instanceof Error && err.name === 'AbortError') {
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, streaming: false, stopped: true } : m));
      } else {
        const message = err instanceof Error ? err.message : String(err);
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: `Could not reach ${character.name}: ${message}`, streaming: false, error: true } : m));
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      abortRef.current = null;
      // Persist the assistant turn only on a clean, non-empty completion.
      if (persist && convId && fullText.trim() && !failed) {
        api.appendConversationMessage(convId, {
          role: 'assistant', content: fullText, character_name: character.name, character_id: character.id,
        }).catch(() => {});
      }
    }
  }, [character, id, ensureConversation]);

  const send = useCallback(() => {
    const msg = input.trim();
    if (!msg || !character || loading) return;
    setInput('');
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', content: msg, timestamp: Date.now() }]);
    streamReply(msg, true);
  }, [input, character, loading, streamReply]);

  const regenerate = useCallback(() => {
    if (streaming || loading) return;
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    setMessages(prev => prev.slice(0, prev.map(m => m.id).lastIndexOf(lastUser.id) + 1));
    // Regenerate is a transient re-roll; don't double-persist the same turn.
    streamReply(lastUser.content, false);
  }, [messages, streaming, loading, streamReply]);

  const copy = useCallback((text: string, msgId: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(c => (c === msgId ? null : c)), 1400);
    }).catch(() => {});
  }, []);

  if (!character) return <div className="page-loading">Loading...</div>;

  const lastAssistantId = [...messages].reverse().find(m => m.role === 'assistant')?.id;

  return (
    <div className="page-chat">
      <header className="chat-header">
        <Link to={`/project/${id}/character/${charId}`} className="btn-back"><ArrowLeft size={15} /> Back</Link>
        <div className="chat-char-info">
          {character.avatar_url
            ? <img src={character.avatar_url} alt="" className="chat-avatar" />
            : <div className="chat-avatar avatar-fallback msg-avatar">{character.name[0]}</div>}
          <div>
            <h2>{character.name}</h2>
            <p>{character.role || 'Party Member'}{grounded && grounded.level > 0 ? ` · Lv.${grounded.level} ${grounded.job}` : ''}</p>
          </div>
        </div>
      </header>

      <details className="chat-grounding">
        <summary>
          <ShieldCheck size={14} />
          <span>
            {grounded
              ? `Grounded in your save — Lv.${grounded.level} ${grounded.job}${grounded.equipment?.length ? ` · ${grounded.equipment.length} equipped` : ''}`
              : 'Grounded in your uploaded save — answers stay true to parser facts'}
          </span>
        </summary>
        <div className="chat-grounding-body">
          {grounded && grounded.equipment && grounded.equipment.length > 0 ? (
            <ul className="grounding-gear">
              {grounded.equipment.map(item => (
                <li key={item.slot}>
                  <span>{item.slot.replaceAll('_', ' ')}</span>
                  <strong>{item.item_name}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>The parser confirms this character from your save. They will not invent gear, items, or counts that the save does not contain.</p>
          )}
        </div>
      </details>

      <div className="chat-messages">
        <div className="chat-thread">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <p>Speak with <strong>{character.name}</strong></p>
              <p className="hint">Ask about the campaign, your party, a battle, or the road ahead.</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role}`}>
              {msg.role === 'assistant' && (
                character.avatar_url
                  ? <img src={character.avatar_url} alt="" className="msg-avatar" />
                  : <div className="msg-avatar avatar-fallback">{(msg.character_name || character.name)[0]}</div>
              )}
              <div className={`msg-bubble ${msg.error ? 'is-error' : ''}`}>
                {msg.role === 'assistant' && <span className="msg-name">{msg.character_name}</span>}
                {msg.role === 'assistant'
                  ? <MessageContent text={msg.content || (msg.streaming ? '' : '…')} />
                  : <p className="msg-user-text">{msg.content}</p>}
                {msg.streaming && <span className="streaming-cursor">▊</span>}
                {msg.stopped && <span className="msg-flag">stopped</span>}
                {msg.role === 'assistant' && !msg.streaming && msg.content && (
                  <div className="msg-actions">
                    <button type="button" onClick={() => copy(msg.content, msg.id)} title="Copy">
                      {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
                      {copiedId === msg.id ? 'Copied' : 'Copy'}
                    </button>
                    {msg.id === lastAssistantId && (
                      <button type="button" onClick={regenerate} disabled={loading} title="Regenerate">
                        <RotateCcw size={13} /> Regenerate
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && !streaming && (
            <div className="message assistant">
              <div className="msg-bubble typing"><span className="dot" /><span className="dot" /><span className="dot" /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="chat-input-bar">
        <div className="chat-input-inner">
          {streaming && (
            <button onClick={stopStreaming} className="btn-stop" title="Stop generating">
              <Square size={13} /> Stop
            </button>
          )}
          <textarea
            ref={taRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (streaming) stopStreaming();
                else send();
              }
            }}
            placeholder={streaming ? `${character.name} is speaking…` : `Message ${character.name}…  (Shift+Enter for newline)`}
            disabled={loading && !streaming}
          />
          <button className="chat-send" onClick={send} disabled={loading || !input.trim()} title="Send">
            <SendHorizonal size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
