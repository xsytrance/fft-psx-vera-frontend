import { useState, useCallback } from 'react';
import type { Character, Commit, IngestionStatus, InteractionMode } from '../types/api';
import * as api from '../lib/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (e: any) {
      setError(e.message || 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Projects ──────────────────────────────────────────────────────────────

  const getProjects = useCallback(() => call(() => api.getProjects()), [call]);
  const getProject = useCallback((id: number) => call(() => api.getProject(id)), [call]);
  const createProject = useCallback((data: { name: string; description: string }) => call(() => api.createProject(data)), [call]);
  const deleteProject = useCallback((id: number) => call(() => api.deleteProject(id)), [call]);

  // ── Characters ────────────────────────────────────────────────────────────

  const getCharacters = useCallback((projectId: number) => call(() => api.getCharacters(projectId)), [call]);
  const getCharacter = useCallback((id: number) => call(() => api.getCharacter(id)), [call]);
  const createCharacter = useCallback((projectId: number, data: Partial<Character>) => call(() => api.createCharacter(projectId, data)), [call]);
  const updateCharacter = useCallback((id: number, data: Partial<Character>) => call(() => api.updateCharacter(id, data)), [call]);
  const deleteCharacter = useCallback((id: number) => call(() => api.deleteCharacter(id)), [call]);

  // ── Commits ───────────────────────────────────────────────────────────────

  const getCommits = useCallback((characterId?: number) => call(() => api.getCommits(characterId)), [call]);
  const createCommit = useCallback((characterId: number, data: Partial<Commit>) => call(() => api.createCommit(characterId, data)), [call]);
  const updateCommit = useCallback((id: number, data: Partial<Commit>) => call(() => api.updateCommit(id, data)), [call]);
  const deleteCommit = useCallback((id: number) => call(() => api.deleteCommit(id)), [call]);

  // ── Conversations ─────────────────────────────────────────────────────────

  const getConversations = useCallback(() => call(() => api.getConversations()), [call]);
  const getConversation = useCallback((id: string) => call(() => api.getConversation(id)), [call]);
  const createConversation = useCallback((data: {
    project_id: number;
    character_ids: number[];
    commit_id?: number;
    mode: InteractionMode;
    title?: string;
  }) => call(() => api.createConversation(data)), [call]);
  const deleteConversation = useCallback((id: string) => call(() => api.deleteConversation(id)), [call]);

  // ── Chat ──────────────────────────────────────────────────────────────────

  const sendChatMessage = useCallback((data: {
    conversation_id?: string | null;
    project_id: number;
    character_ids: number[];
    commit_id?: number;
    mode: InteractionMode;
    message: string;
  }) => call(() => api.sendChatMessage(data)), [call]);

  const getIngestionStatus = useCallback(async (): Promise<IngestionStatus> => {
    return { status: 'complete', progress: 100, message: 'Ready' };
  }, []);

  // ── FFT Save File ─────────────────────────────────────────────────────────

  const uploadSave = useCallback((file: File) => call(() => api.uploadSave(file)), [call]);
  const createProjectFromSave = useCallback((file: File, projectName: string) => call(() => api.createProjectFromSave(file, projectName)), [call]);

  // ── FFT Lore KB ───────────────────────────────────────────────────────────

  const getLoreCharacters = useCallback(() => call(() => api.getLoreCharacters()), [call]);
  const getLoreCharacter = useCallback((slug: string) => call(() => api.getLoreCharacter(slug)), [call]);
  const getLoreCommits = useCallback((phase?: string) => call(() => api.getLoreCommits(phase)), [call]);

  return {
    loading,
    error,
    setError,
    getProjects,
    getProject,
    createProject,
    deleteProject,
    getCharacters,
    getCharacter,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    getCommits,
    createCommit,
    updateCommit,
    deleteCommit,
    getConversations,
    getConversation,
    createConversation,
    deleteConversation,
    sendChatMessage,
    getIngestionStatus,
    uploadSave,
    createProjectFromSave,
    getLoreCharacters,
    getLoreCharacter,
    getLoreCommits,
  };
}
