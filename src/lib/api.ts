/**
 * Centralized, typed API client for the FFT PSX Vera backend.
 * Every `/api/...` call goes through here so URLs, payloads, and error handling
 * live in one place. Pages call `api.*`; SSE/streaming and file uploads have
 * tailored helpers.
 */
import type {
  Project, SaveTruth, PromptInspectorResult, EquipmentTruthTestResult,
  AvatarOption, InventoryResponse, InventoryLatestDiffResponse,
  SaveMemoryResponse, CampfireResponse, DreamTeam, DreamTeamMember,
  AvailableCharacter, JobInfo, EquipmentData,
  Conversation, ConversationSummary, ConversationMessage,
} from '../types';

const BASE = '/api';

type Id = number | string;

export class ApiError extends Error {
  status?: number;
  body?: unknown;
  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

function errorMessage(body: unknown, res: Response): string {
  if (body && typeof body === 'object') {
    const rec = body as Record<string, unknown>;
    if (typeof rec.detail === 'string') return rec.detail;
    if (typeof rec.error === 'string') return rec.error;
  }
  return res.statusText || `HTTP ${res.status}`;
}

interface RequestOptions {
  method?: string;
  json?: unknown;
  form?: FormData;
  signal?: AbortSignal;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const init: RequestInit = { method: opts.method ?? 'GET', signal: opts.signal };
  if (opts.json !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(opts.json);
  } else if (opts.form) {
    init.body = opts.form;
  }
  const res = await fetch(`${BASE}${path}`, init);
  const body = await parseBody(res);
  if (!res.ok) throw new ApiError(errorMessage(body, res), res.status, body);
  return body as T;
}

/** POST a JSON body and return the raw Response for SSE/stream consumption. */
async function requestStream(path: string, json: unknown, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(json),
    signal,
  });
  if (!res.ok) throw new ApiError(`HTTP ${res.status}`, res.status);
  return res;
}

// ── Tailored request/response shapes ────────────────────────────────────────
export interface UploadResult {
  ok: boolean;
  status: number;
  statusText: string;
  requestId?: string;
  body: unknown;
}

export interface AskPartyRequest {
  item_id?: number | string | null;
  item_id_hex?: string | null;
  item_name: string;
  question: string;
  mode: string;
}
export interface AskPartyResponse {
  question: string;
  responses: Array<{ character_id: number; character_name: string; text: string }>;
  warnings?: string[];
}

export interface CampfireRequest { event_id: string; question: string; mode: string }

export interface ChatStreamRequest { project_id: number; character_id: number; message: string }
export interface GroupChatRequest { project_id: number; character_ids: number[]; message: string; mode: string }
export interface DreamTeamChatRequest { team_id: number; message: string }

async function uploadSave(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
  const body = await parseBody(res);
  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    requestId: res.headers.get('x-request-id') || undefined,
    body,
  };
}

export const api = {
  // ── Projects ──────────────────────────────────────────────────────────────
  getProjects: () => request<Project[]>('/projects'),
  getProject: (id: Id) => request<Project>(`/projects/${id}`),
  uploadSave,

  // ── Save truth / chat QA ────────────────────────────────────────────────────
  getSaveTruth: (projectId: Id) => request<SaveTruth>(`/projects/${projectId}/save-truth`),
  getPromptInspector: (projectId: Id, characterId: Id) =>
    request<PromptInspectorResult>(`/projects/${projectId}/characters/${characterId}/prompt-inspector`),
  runEquipmentTruthTest: (projectId: Id, characterId: Id, message: string) =>
    request<EquipmentTruthTestResult>(`/projects/${projectId}/characters/${characterId}/equipment-truth-test`, { method: 'POST', json: { message } }),

  // ── Avatars ─────────────────────────────────────────────────────────────────
  getAvatars: () => request<{ avatars: AvatarOption[] }>('/avatars'),
  setAvatar: (projectId: Id, characterId: Id, avatarUrl: string) =>
    request<unknown>(`/projects/${projectId}/characters/${characterId}/set-avatar`, { method: 'POST', json: { avatar_url: avatarUrl } }),
  uploadAvatar: (projectId: Id, characterId: Id, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ url: string }>(`/projects/${projectId}/characters/${characterId}/avatar`, { method: 'POST', form });
  },

  // ── Inventory ───────────────────────────────────────────────────────────────
  getInventory: (projectId: Id) => request<InventoryResponse>(`/projects/${projectId}/inventory`),
  getInventoryDiffLatest: (projectId: Id) => request<InventoryLatestDiffResponse>(`/projects/${projectId}/inventory/diff/latest`),
  askPartyAboutItem: (projectId: Id, payload: AskPartyRequest) =>
    request<AskPartyResponse>(`/projects/${projectId}/inventory/items/ask-party`, { method: 'POST', json: payload }),

  // ── Save memory / campfire ──────────────────────────────────────────────────
  getSaveMemory: (projectId: Id) => request<SaveMemoryResponse>(`/projects/${projectId}/save-memory`),
  askCampfire: (projectId: Id, payload: CampfireRequest) =>
    request<CampfireResponse>(`/projects/${projectId}/campfire/save-memory`, { method: 'POST', json: payload }),

  // ── Dream teams ─────────────────────────────────────────────────────────────
  getDreamTeams: (projectId: Id) => request<{ teams: DreamTeam[] }>(`/projects/${projectId}/dream-teams`),
  createDreamTeam: (projectId: Id, payload: { name: string; description: string }) =>
    request<DreamTeam>(`/projects/${projectId}/dream-teams`, { method: 'POST', json: payload }),
  deleteDreamTeam: (projectId: Id, teamId: Id) => request<unknown>(`/projects/${projectId}/dream-teams/${teamId}`, { method: 'DELETE' }),
  generateShareCode: (teamId: Id) => request<{ share_code: string }>(`/dream-teams/${teamId}/generate-share-code`, { method: 'POST' }),
  getDreamTeam: (projectId: Id, teamId: Id) => request<DreamTeam>(`/projects/${projectId}/dream-teams/${teamId}`),
  getAvailableCharacters: () => request<{ characters: AvailableCharacter[] }>('/characters'),
  getJobs: () => request<{ jobs: JobInfo[] }>('/jobs'),
  getJobEquipment: (jobName: string, level: number) =>
    request<EquipmentData>(`/jobs/${encodeURIComponent(jobName)}/equipment?level=${level}`),
  addMember: (projectId: Id, teamId: Id, member: DreamTeamMember) =>
    request<unknown>(`/projects/${projectId}/dream-teams/${teamId}/members`, { method: 'POST', json: member }),
  updateMember: (teamId: Id, memberId: Id, member: DreamTeamMember) =>
    request<unknown>(`/dream-teams/${teamId}/members/${memberId}`, { method: 'PUT', json: member }),
  removeMember: (teamId: Id, memberId: Id) => request<unknown>(`/dream-teams/${teamId}/members/${memberId}`, { method: 'DELETE' }),

  // ── Conversations (chat history persistence) ─────────────────────────────────
  listConversations: (projectId: Id) =>
    request<{ conversations: ConversationSummary[] }>(`/projects/${projectId}/conversations`),
  createConversation: (projectId: Id, payload: { mode?: string; title?: string | null; character_ids?: number[]; commit_id?: number | null }) =>
    request<Conversation>(`/projects/${projectId}/conversations`, { method: 'POST', json: payload }),
  getConversation: (conversationId: string) => request<Conversation>(`/conversations/${conversationId}`),
  appendConversationMessage: (conversationId: string, payload: { role: string; content: string; character_name?: string | null; character_id?: number | null; metadata?: Record<string, unknown> }) =>
    request<{ message: ConversationMessage; message_count: number; title: string | null; updated_at: string | null }>(`/conversations/${conversationId}/messages`, { method: 'POST', json: payload }),
  renameConversation: (conversationId: string, title: string | null) =>
    request<ConversationSummary>(`/conversations/${conversationId}`, { method: 'PATCH', json: { title } }),
  deleteConversation: (conversationId: string) =>
    request<{ deleted: boolean; id: string }>(`/conversations/${conversationId}`, { method: 'DELETE' }),

  // ── Streaming chat (returns raw Response for SSE reading) ─────────────────────
  streamChat: (payload: ChatStreamRequest, signal?: AbortSignal) => requestStream('/chat/stream', payload, signal),
  streamGroupChat: (payload: GroupChatRequest, signal?: AbortSignal) => requestStream('/chat/group', payload, signal),
  streamDreamTeamChat: (payload: DreamTeamChatRequest, signal?: AbortSignal) => requestStream('/dream-team/chat', payload, signal),
};
