import type { Project, Character, Commit, Conversation } from '../types/api';

// Empty initial state — data is loaded from the API
export const mockProject: Project = {
  id: 0,
  name: '',
  description: '',
  created_at: '',
  updated_at: '',
  sources: [],
  character_count: 0,
  commit_count: 0,
};

export const mockCharacters: Character[] = [];
export const mockCommits: Commit[] = [];
export const mockConversations: Conversation[] = [];
