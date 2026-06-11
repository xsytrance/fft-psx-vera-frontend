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

export interface SaveTruthEquipment {
  slot: string;
  item_id: number | null;
  item_id_hex: string | null;
  item_name: string;
}

export interface SaveTruthCharacter {
  id: number;
  slot: number;
  name: string;
  canonical_name: string | null;
  job: string;
  level: number;
  hp: number;
  mp: number;
  equipment: SaveTruthEquipment[];
  has_equipment: boolean;
  equipment_count: number;
}

export interface SaveTruthValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface NormalizedSaveTruth {
  schema_version: string;
  source?: Record<string, unknown>;
  player_state?: Record<string, unknown>;
  story?: Record<string, unknown>;
  party?: {
    characters?: Record<string, unknown>[];
  };
  inventory?: Record<string, unknown>;
  confidence?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SaveTruth {
  project_id: number;
  project_name: string;
  schema_version: string | null;
  save_truth: NormalizedSaveTruth;
  validation: SaveTruthValidation;
  story_progress: Record<string, unknown>;
  story_phase: string;
  character_count: number;
  saved_character_count: number;
  characters_with_equipment: number;
  gold: number;
  inventory_count: number;
  save_file_path: string | null;
  characters: SaveTruthCharacter[];
}

export interface EquipmentTruth {
  matched: boolean;
  save_character: {
    slot: number | null;
    name: string;
    canonical_name: string | null;
    job: string;
    level: number;
  } | null;
  equipment: SaveTruthEquipment[];
  expected_item_names: string[];
}

export interface PromptInspectorResult {
  project_id: number;
  character_id: number;
  character_name: string;
  message: string;
  story_phase: string;
  equipment_truth: EquipmentTruth;
  prompt_contains_actual_equipment_header: boolean;
  prompt_contains_expected_items: Record<string, boolean>;
  system_prompt: string;
}

export interface EquipmentTruthTestResult {
  project_id: number;
  character_id: number;
  character_name: string;
  message: string;
  model: string;
  equipment_truth: EquipmentTruth;
  response: string;
  score: {
    pass: boolean;
    mentioned_items: string[];
    missing_items: string[];
    expected_count: number;
  };
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
