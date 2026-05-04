export type InteractionMode =
  | 'story-locked'
  | 'post-end'
  | 'casual'
  | 'multi-character'
  | 'agent';

export interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  sources: string[];
  character_count: number;
  commit_count: number;
}

export interface Character {
  id: number;
  project_id: number;
  slug: string;
  name: string;
  role: string;
  affiliation: string;
  origin: string;
  appearance: string;
  personality: string[];
  tone: string;
  languages: string[];
  speech_patterns: {
    description: string;
    example_phrases: string[];
    code_switching: string;
    signature_expressions: string[];
  };
  relationships: {
    allies: string[];
    enemies: string[];
    complex: string[];
  };
  notable_quotes: string[];
  weapons_tools: string[];
  backstory_summary: string;
  roleplay_instructions: string;
  knowledge_gates: {
    knows: string[];
    does_not_know: string[];
  };
  is_player: boolean;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

export interface Commit {
  id: number;
  project_id: number;
  character_id: number;
  commit_id: string;
  title: string;
  location: string;
  situation: string;
  knows: string[];
  does_not_know: string[];
  chapter: string;
  scene: string;
  order_index: number;
  is_start: boolean;
  is_end: boolean;
  metadata: Record<string, unknown>;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  character_id?: number;
  character_name?: string;
}

export interface Conversation {
  id: string;
  project_id: number;
  character_ids: number[];
  commit_id: number;
  mode: InteractionMode;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface PersonaExport {
  name: string;
  system_prompt: string;
  character_json: Character;
  commit_json: Commit | null;
  mode_rules: string;
  version: string;
}

export interface IngestionStatus {
  status: 'idle' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
}
