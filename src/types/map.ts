export interface MapZone {
  id: string;
  name: string;
  tilemapKey: string;
  tilesetKey: string;
  bgmKey?: string;
  encounters?: ZoneEncounter[];
  connections: ZoneConnection[];
  npcs: NPCSpawn[];
}

export interface ZoneEncounter {
  speciesId: number;
  minLevel: number;
  maxLevel: number;
  weight: number;       // relative spawn weight
}

export interface ZoneConnection {
  targetZoneId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  direction: 'up' | 'down' | 'left' | 'right';
}

export interface NPCSpawn {
  id: string;
  name: string;
  spriteKey: string;
  x: number;
  y: number;
  facing: 'up' | 'down' | 'left' | 'right';
  dialogueId?: string;
  isTrainer?: boolean;
  trainerData?: {
    party: { speciesId: number; level: number }[];
    defeatDialogueId: string;
    sightRange: number;
  };
}
