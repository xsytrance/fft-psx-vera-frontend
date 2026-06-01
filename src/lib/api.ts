import type { Project, Character, Commit, Conversation, Message, InteractionMode } from '../types/api';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Projects ─────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  return fetchJson<Project[]>('/projects');
}

export async function getProject(id: number): Promise<Project> {
  return fetchJson<Project>(`/projects/${id}`);
}

export async function createProject(data: { name: string; description: string }): Promise<Project> {
  return fetchJson<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: number): Promise<void> {
  await fetchJson(`/projects/${id}`, { method: 'DELETE' });
}

// ── Characters ───────────────────────────────────────────────────────────────

export async function getCharacters(projectId: number): Promise<Character[]> {
  return fetchJson<Character[]>(`/projects/${projectId}/characters`);
}

export async function getCharacter(id: number): Promise<Character> {
  return fetchJson<Character>(`/characters/${id}`);
}

export async function createCharacter(
  projectId: number,
  data: Partial<Character>,
): Promise<Character> {
  return fetchJson<Character>(`/projects/${projectId}/characters`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCharacter(id: number, data: Partial<Character>): Promise<Character> {
  return fetchJson<Character>(`/characters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCharacter(id: number): Promise<void> {
  await fetchJson(`/characters/${id}`, { method: 'DELETE' });
}

// ── Commits ──────────────────────────────────────────────────────────────────

export async function getCommits(characterId?: number): Promise<Commit[]> {
  const url = characterId ? `/characters/${characterId}/commits` : '/commits';
  return fetchJson<Commit[]>(url);
}

export async function createCommit(
  characterId: number,
  data: Partial<Commit>,
): Promise<Commit> {
  return fetchJson<Commit>(`/characters/${characterId}/commits`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCommit(id: number, data: Partial<Commit>): Promise<Commit> {
  return fetchJson<Commit>(`/commits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCommit(id: number): Promise<void> {
  await fetchJson(`/commits/${id}`, { method: 'DELETE' });
}

// ── Conversations & Chat ─────────────────────────────────────────────────────

export async function getConversations(): Promise<Conversation[]> {
  return fetchJson<Conversation[]>('/conversations');
}

export async function getConversation(id: string): Promise<Conversation> {
  return fetchJson<Conversation>(`/conversations/${id}`);
}

export async function createConversation(data: {
  project_id: number;
  character_ids: number[];
  commit_id?: number;
  mode: InteractionMode;
  title?: string;
}): Promise<Conversation> {
  return fetchJson<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteConversation(id: string): Promise<void> {
  await fetchJson(`/conversations/${id}`, { method: 'DELETE' });
}

export async function sendChatMessage(data: {
  conversation_id?: string | null;
  project_id: number;
  character_ids: number[];
  commit_id?: number;
  mode: InteractionMode;
  message: string;
}): Promise<{ conversation_id: string; message: Message; mode: string; knowledge_gate_active: boolean }> {
  return fetchJson<{ conversation_id: string; message: Message; mode: string; knowledge_gate_active: boolean }>('/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── ChronoVera Chat (simplified) ──────────────────────────────────────────────

export async function chat(
  projectId: number,
  characterId: number,
  message: string,
): Promise<{ response: string; character_name: string; model: string }> {
  return fetchJson<{ response: string; character_name: string; model: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({
      project_id: projectId,
      character_id: characterId,
      message,
    }),
  });
}

// ── CT Save File ────────────────────────────────────────────────────────────

export async function uploadSave(file: File): Promise<{
  success: boolean;
  filename: string;
  file_size: number;
  story_progress: any;
  player_characters: any[];
  party_context: any;
}> {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_BASE}/save/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function createProjectFromSave(
  file: File,
  projectName: string,
): Promise<{
  success: boolean;
  project_id: number;
  project_name: string;
  characters_created: number;
  commits_created: number;
  character_slugs: string[];
  story_phase: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('project_name', projectName);
  
  const res = await fetch(`${API_BASE}/save/create-project`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── CT Lore KB ──────────────────────────────────────────────────────────────

export async function getLoreCharacters(): Promise<{ characters: Array<{ name: string; slug: string; role: string; affiliation: string }> }> {
  return fetchJson('/lore/characters');
}

export async function getLoreCharacter(slug: string): Promise<Character> {
  return fetchJson<Character>(`/lore/characters/${slug}`);
}

export async function getLoreCommits(phase?: string): Promise<{ commits: Commit[] }> {
  const url = phase ? `/lore/commits?phase=${phase}` : '/lore/commits';
  return fetchJson(url);
}
