import type { Project, Character, Commit, Conversation } from '../types/api';

// Minimal mock data for build compatibility — used as fallback when API data is empty
// These are CT-themed placeholders, not real data
export const mockProject: Project = {
  id: 0,
  name: 'Chrono Trigger',
  description: 'Upload a CT save file to get started',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  sources: [],
  character_count: 0,
  commit_count: 0,
};

export const mockCharacters: Character[] = [];
export const mockCommits: Commit[] = [];
export const mockConversations: Conversation[] = [];
export const mockCharacterResponses: Record<number, string[]> = {};
