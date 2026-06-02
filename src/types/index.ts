export interface Character {
  id: number;
  name: string;
  slug: string;
  role: string;
  level: number;
  avatar_url: string;
  in_party: boolean;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  story_phase: string;
  characters: Character[];
}

export interface AvatarOption {
  job: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  character_name?: string;
  timestamp: number;
}
