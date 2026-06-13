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
  inventory?: SaveTruthInventoryItem[];
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

export interface SaveTruthInventoryItem {
  item_id: number | string | null;
  item_id_hex: string | null;
  item_name: string;
  count: number;
  category?: string;
  subcategory?: string | null;
  source_offset?: number | null;
  confidence?: string;
}

export interface InventoryCategorySummary {
  key: string;
  label: string;
  item_count: number;
  total_quantity: number;
}

export type InventoryEquippedBy = string | {
  character_name: string;
  canonical_name?: string | null;
  save_slot?: number | string | null;
  equipment_slot?: string | null;
};

export interface InventoryItem extends SaveTruthInventoryItem {
  type: string;
  description?: string | null;
  price?: number | null;
  stats?: Record<string, number>;
  effects?: string[];
  locations?: string[];
  equipped_by: InventoryEquippedBy[];
  sort_key?: string;
}

export interface InventoryResponse {
  project_id: number;
  project_name?: string;
  story_phase?: string;
  schema_version?: string | null;
  inventory_schema_version?: string;
  has_save_truth: boolean;
  gold?: number;
  inventory_count: number;
  total_quantity: number;
  total_unique_items?: number;
  total_item_count?: number;
  categories: InventoryCategorySummary[];
  items: InventoryItem[];
  warnings: string[];
  source?: {
    inventory_source?: 'save_truth' | 'legacy' | string;
    save_file_path?: string | null;
    source_file?: string | null;
  };
  item_db_path?: string;
}

export interface InventoryDiffItem {
  item_id_hex?: string | null;
  item_name: string;
  type?: string | null;
  before_count: number;
  after_count: number;
  delta: number;
}

export interface InventoryEquipmentDiff {
  character_name: string;
  equipment_slot?: string | null;
  item_id_hex?: string | null;
  item_name?: string | null;
}

export interface InventoryEquipmentChangedDiff {
  character_name: string;
  equipment_slot?: string | null;
  before: {
    item_id_hex?: string | null;
    item_name?: string | null;
  };
  after: {
    item_id_hex?: string | null;
    item_name?: string | null;
  };
}

export interface InventoryLatestDiffResponse {
  project_id: number;
  has_diff: boolean;
  diff: {
    generated_at?: string;
    before_source?: string | null;
    after_source?: string | null;
    gold?: {
      before: number;
      after: number;
      delta: number;
    } | null;
    items_added: InventoryDiffItem[];
    items_removed: InventoryDiffItem[];
    items_increased: InventoryDiffItem[];
    items_decreased: InventoryDiffItem[];
    equipment_added: InventoryEquipmentDiff[];
    equipment_removed: InventoryEquipmentDiff[];
    equipment_changed?: InventoryEquipmentChangedDiff[];
    warnings: string[];
  } | null;
  message?: string;
}

export interface SaveMemoryGoldFact {
  before: number;
  after: number;
  delta: number;
}

export interface SaveMemoryEvent {
  event_id: string;
  schema_version?: string;
  event_type: string;
  generated_at?: string;
  source?: string;
  project_id?: number;
  story_phase?: string | null;
  title: string;
  summary: string;
  facts: {
    gold?: SaveMemoryGoldFact | null;
    items_added?: InventoryDiffItem[];
    items_removed?: InventoryDiffItem[];
    items_increased?: InventoryDiffItem[];
    items_decreased?: InventoryDiffItem[];
    equipment_added?: InventoryEquipmentDiff[];
    equipment_removed?: InventoryEquipmentDiff[];
    equipment_changed?: InventoryEquipmentChangedDiff[];
  };
  warnings?: string[];
}

export interface SaveMemoryResponse {
  project_id: number;
  schema_version: string;
  has_memory: boolean;
  events: SaveMemoryEvent[];
  latest_event?: SaveMemoryEvent | null;
  message?: string;
  warnings?: string[];
}

export interface CampfireResponse {
  project_id: number;
  event: SaveMemoryEvent;
  question: string;
  responses: Array<{
    character_id: number;
    character_name: string;
    text: string;
  }>;
  prompt_inspections?: Array<{
    character_name: string;
    system_prompt: string;
  }>;
  warnings?: string[];
}
