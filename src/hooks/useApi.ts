import { useState, useCallback } from 'react';
import type { Project, Character, Commit, Conversation, IngestionStatus } from '../types/api';
import { mockProject, mockCharacters, mockCommits, mockConversations } from '../data/mockData';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

  const getProjects = useCallback(async (): Promise<Project[]> => {
    setLoading(true);
    await delay();
    setLoading(false);
    return [mockProject];
  }, []);

  const getProject = useCallback(async (id: number): Promise<Project | null> => {
    setLoading(true);
    await delay();
    setLoading(false);
    return id === mockProject.id ? mockProject : null;
  }, []);

  const createProject = useCallback(async (data: { name: string; description: string }): Promise<Project> => {
    setLoading(true);
    await delay(800);
    setLoading(false);
    return { ...mockProject, ...data, id: Date.now() };
  }, []);

  const getCharacters = useCallback(async (projectId: number): Promise<Character[]> => {
    setLoading(true);
    await delay();
    setLoading(false);
    return projectId === mockProject.id ? mockCharacters : [];
  }, []);

  const getCharacter = useCallback(async (id: number): Promise<Character | null> => {
    setLoading(true);
    await delay();
    setLoading(false);
    return mockCharacters.find((c) => c.id === id) ?? null;
  }, []);

  const updateCharacter = useCallback(async (id: number, data: Partial<Character>): Promise<Character> => {
    setLoading(true);
    await delay(600);
    setLoading(false);
    const existing = mockCharacters.find((c) => c.id === id);
    if (!existing) throw new Error('Character not found');
    return { ...existing, ...data } as Character;
  }, []);

  const deleteCharacter = useCallback(async (_id: number): Promise<void> => {
    setLoading(true);
    await delay(400);
    setLoading(false);
  }, []);

  const getCommits = useCallback(async (characterId?: number): Promise<Commit[]> => {
    setLoading(true);
    await delay();
    setLoading(false);
    if (!characterId) return mockCommits;
    return mockCommits.filter((c) => c.character_id === characterId);
  }, []);

  const getConversations = useCallback(async (): Promise<Conversation[]> => {
    setLoading(true);
    await delay();
    setLoading(false);
    return mockConversations;
  }, []);

  const getConversation = useCallback(async (id: string): Promise<Conversation | null> => {
    setLoading(true);
    await delay();
    setLoading(false);
    return mockConversations.find((c) => c.id === id) ?? null;
  }, []);

  const createConversation = useCallback(
    async (data: {
      project_id: number;
      character_ids: number[];
      commit_id: number;
      mode: string;
      title: string;
    }): Promise<Conversation> => {
      setLoading(true);
      await delay(500);
      setLoading(false);
      const conv: Conversation = {
        id: `conv-${Date.now()}`,
        project_id: data.project_id,
        character_ids: data.character_ids,
        commit_id: data.commit_id,
        mode: data.mode as Conversation['mode'],
        title: data.title,
        messages: [
          {
            role: 'system',
            content: `System context for ${data.title}`,
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return conv;
    },
    []
  );

  const sendChatMessage = useCallback(
    async (data: {
      conversation_id: string | null;
      project_id: number;
      character_ids: number[];
      commit_id: number;
      mode: string;
      message: string;
    }): Promise<{ message: { role: string; content: string; character_id: number; character_name: string } }> => {
      setLoading(true);
      await delay(1000 + Math.random() * 1000);
      setLoading(false);
      const char = mockCharacters.find((c) => c.id === data.character_ids[0]);
      return {
        message: {
          role: 'assistant',
          content: `Mock response from ${char?.name ?? 'character'} to: "${data.message}"`,
          character_id: data.character_ids[0],
          character_name: char?.name ?? 'Unknown',
        },
      };
    },
    []
  );

  const getIngestionStatus = useCallback(async (): Promise<IngestionStatus> => {
    setLoading(true);
    await delay();
    setLoading(false);
    return { status: 'complete', progress: 100, message: 'Ingestion complete' };
  }, []);

  return {
    loading,
    error,
    setError,
    getProjects,
    getProject,
    createProject,
    getCharacters,
    getCharacter,
    updateCharacter,
    deleteCharacter,
    getCommits,
    getConversations,
    getConversation,
    createConversation,
    sendChatMessage,
    getIngestionStatus,
  };
}
