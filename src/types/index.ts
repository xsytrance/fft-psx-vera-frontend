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
  streaming?: boolean;
}

export interface AvailableCharacter {
  name: string;
  display_name: string;
  role: string;
  affiliation: string;
  avatar_url: string;
  base_level: number;
  base_job: string;
}

export interface JobInfo {
  name: string;
  tier: number;
  branch: string;
  prereqs: string[];
  abilities: { action?: string[]; reaction?: string[]; support?: string[]; movement?: string[] };
  description?: string;
}

export interface EquipmentData {
  equipment: {
    weapon?: string[];
    armor?: string[];
    helmet?: string[];
    shield?: string[];
    accessory?: string[];
  };
  level_range: string;
}

export interface DreamTeam {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  share_code: string | null;
  member_count: number;
  members: DreamTeamMember[];
  created_at: string | null;
}

export interface DreamTeamMember {
  id?: number;
  character_name: string;
  display_name: string;
  job: string;
  level: number;
  equipment: Record<string, string>;
  abilities: Record<string, string[]>;
  slot_index: number;
}

export interface GroupChatResponse {
  character_name: string;
  character_id: number;
  text: string;
}

export interface GroupChatResponses {
  responses: Record<string, string>;
  characters: string[];
  mode: string;
}
