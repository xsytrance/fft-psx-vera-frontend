import type { Project, Character, Commit, Conversation, Message } from '../types/api';

// Minimal mock data for build compatibility — used as fallback when API data is empty
export const mockProject: Project = {
  id: 1,
  name: 'Final Fantasy Tactics',
  description: 'Upload a FFT save file to get started',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  sources: [],
  character_count: 0,
  commit_count: 0,
};

export const mockCharacters: Character[] = [];
export const mockCommits: Commit[] = [];
export const mockConversations: Conversation[] = [];

// Chat mock: character ID -> canned responses for demo/fallback
export const mockCharacterResponses: Record<number, string[]> = {};
