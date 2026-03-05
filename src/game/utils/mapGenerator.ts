import * as Phaser from 'phaser';

export interface ExitTile {
  x: number;
  y: number;
  targetZoneId: string;
  targetX: number;
  targetY: number;
}

export interface GeneratedMap {
  tilemap: Phaser.Tilemaps.Tilemap;
  groundLayer: Phaser.Tilemaps.TilemapLayer;
  collisionLayer: Phaser.Tilemaps.TilemapLayer;
  encounterTiles: { x: number; y: number }[];
  exits: ExitTile[];
}

export interface NpcSpawn {
  x: number;
  y: number;
  dialogue: string;
  isHealer?: boolean;
  isTrainer?: boolean;
  trainerId?: string;
}

interface ZoneConfig {
  id: string;
  name: string;
  mapWidth: number;
  mapHeight: number;
  exits: ExitTile[];
  npcSpawns: NpcSpawn[];
}

// Tile indices within the tileset-campus strip
const TILE = {
  GRASS: 0,
  PATH: 1,
  WALL: 2,
  ENCOUNTER: 3,
  BUILDING: 4,
  WATER: 5,
  DOOR: 6,
  EXIT: 7,
} as const;

type TileValue = (typeof TILE)[keyof typeof TILE];

const MAP_WIDTH = 30;
const MAP_HEIGHT = 30;
const TILE_SIZE = 32;

const WALKABLE_TILES: number[] = [TILE.GRASS, TILE.PATH, TILE.ENCOUNTER, TILE.EXIT];
const COLLISION_TILES: number[] = [TILE.WALL, TILE.BUILDING];

void WALKABLE_TILES;

export const ZONE_CONFIGS: Record<string, ZoneConfig> = {
  'freshman-quad': {
    id: 'freshman-quad',
    name: 'FRESHMAN QUAD',
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    exits: [
      // North exit → campus-library, player spawns near south edge of library
      { x: 15, y: 0, targetZoneId: 'campus-library', targetX: 15, targetY: 27 },
      // East exit → quad-park, player spawns near west edge of park
      { x: 29, y: 15, targetZoneId: 'quad-park', targetX: 2, targetY: 15 },
      // West exit → campus-gym, player spawns near east edge of gym
      { x: 0, y: 15, targetZoneId: 'campus-gym', targetX: 27, targetY: 15 },
      // South exit → greek-row, player spawns near north edge of greek-row
      { x: 15, y: 29, targetZoneId: 'greek-row', targetX: 15, targetY: 2 },
    ],
    npcSpawns: [
      { x: 7, y: 3, dialogue: 'Welcome to the Freshman Quad! Walk into the tall grass to encounter wild Bros.', isHealer: false },
      { x: 24, y: 3, dialogue: 'Need a rest? Let me heal your Bros!', isHealer: true },
      { x: 7, y: 20, dialogue: 'Rush week is wild. I heard some legendary Bros hang out in the far corners of campus.', isHealer: false },
    ],
  },
  'campus-library': {
    id: 'campus-library',
    name: 'CAMPUS LIBRARY',
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    exits: [
      // South exit → freshman-quad
      { x: 15, y: 29, targetZoneId: 'freshman-quad', targetX: 15, targetY: 2 },
    ],
    npcSpawns: [
      { x: 15, y: 5, dialogue: 'Shhh! This is a library. But I heard the Bros in the courtyard grass are really studious.', isHealer: false },
      { x: 24, y: 15, dialogue: 'I can restore your Bros between study sessions!', isHealer: true },
      { x: 15, y: 15, dialogue: '', isTrainer: true, trainerId: 'treasurer_biff' },
      { x: 8, y: 10, dialogue: '', isTrainer: true, trainerId: 'president_newton' },
    ],
  },
  'quad-park': {
    id: 'quad-park',
    name: 'QUAD PARK',
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    exits: [
      // West exit → freshman-quad
      { x: 0, y: 15, targetZoneId: 'freshman-quad', targetX: 27, targetY: 15 },
    ],
    npcSpawns: [
      { x: 5, y: 5, dialogue: 'The park is chill but the tall grass hides some gnarly Bros!', isHealer: false },
      { x: 5, y: 24, dialogue: 'I heal Bros who need a break from the park life.', isHealer: true },
      { x: 15, y: 8, dialogue: '', isTrainer: true, trainerId: 'chill_master_blaze' },
    ],
  },
  'campus-gym': {
    id: 'campus-gym',
    name: 'CAMPUS GYM',
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    exits: [
      // East exit → freshman-quad
      { x: 29, y: 15, targetZoneId: 'freshman-quad', targetX: 2, targetY: 15 },
    ],
    npcSpawns: [
      { x: 15, y: 5, dialogue: 'Welcome to the gym! The training areas are full of powerful Bros.', isHealer: false },
      { x: 5, y: 15, dialogue: 'Heal up before your next workout session!', isHealer: true },
      { x: 10, y: 12, dialogue: '', isTrainer: true, trainerId: 'captain_chad' },
    ],
  },
  'greek-row': {
    id: 'greek-row',
    name: 'GREEK ROW',
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    exits: [
      // North exit → freshman-quad
      { x: 15, y: 0, targetZoneId: 'freshman-quad', targetX: 15, targetY: 27 },
    ],
    npcSpawns: [
      { x: 7, y: 15, dialogue: 'Greek Row is where the real Bros hang. Watch out for their yards!', isHealer: false },
      { x: 24, y: 15, dialogue: 'Pledge, let me heal your Bros so you can keep rushing!', isHealer: true },
      { x: 15, y: 10, dialogue: '', isTrainer: true, trainerId: 'dj_raven' },
      { x: 8, y: 20, dialogue: '', isTrainer: true, trainerId: 'mistress_mortem' },
    ],
  },
};

function isInRect(x: number, y: number, x1: number, y1: number, x2: number, y2: number): boolean {
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
}

// ---- Freshman Quad ----

function resolveFreshmanQuadTile(x: number, y: number, exitSet: Set<string>): TileValue {
  if (exitSet.has(`${x},${y}`)) return TILE.EXIT;

  // Border walls
  if (y === MAP_HEIGHT - 1) {
    const isExitGap = x >= 13 && x <= 16;
    return isExitGap ? TILE.PATH : TILE.WALL;
  }
  if (x === 0 || y === 0 || x === MAP_WIDTH - 1) {
    return TILE.WALL;
  }

  // Buildings in four quadrants
  if (isInRect(x, y, 3, 2, 8, 5)) return TILE.BUILDING;
  if (isInRect(x, y, 11, 2, 16, 5)) return TILE.BUILDING;
  if (isInRect(x, y, 3, 19, 8, 22)) return TILE.BUILDING;
  if (isInRect(x, y, 22, 2, 27, 5)) return TILE.BUILDING;
  if (isInRect(x, y, 22, 19, 27, 22)) return TILE.BUILDING;

  // Horizontal path ring (outer)
  if (isInRect(x, y, 4, 7, 25, 8)) return TILE.PATH;
  if (isInRect(x, y, 4, 21, 25, 22)) return TILE.PATH;

  // Vertical path ring (outer)
  if (isInRect(x, y, 4, 7, 5, 22)) return TILE.PATH;
  if (isInRect(x, y, 24, 7, 25, 22)) return TILE.PATH;

  // Center cross paths
  if (isInRect(x, y, 13, 1, 16, MAP_HEIGHT - 2)) return TILE.PATH;
  if (isInRect(x, y, 1, 13, MAP_WIDTH - 2, 16)) return TILE.PATH;

  // Encounter grass zones
  if (isInRect(x, y, 6, 9, 12, 12)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 17, 9, 23, 12)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 6, 17, 12, 20)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 17, 17, 23, 20)) return TILE.ENCOUNTER;

  return TILE.GRASS;
}

function buildFreshmanQuadData(exits: ExitTile[]): number[][] {
  const exitSet = new Set(exits.map((e) => `${e.x},${e.y}`));
  const map: number[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      map[y][x] = resolveFreshmanQuadTile(x, y, exitSet);
    }
  }
  return map;
}

// ---- Campus Library ----

function resolveCampusLibraryTile(x: number, y: number, exitSet: Set<string>): TileValue {
  if (exitSet.has(`${x},${y}`)) return TILE.EXIT;

  // Border walls (south has path gap for exit)
  if (y === MAP_HEIGHT - 1) {
    const isExit = x >= 13 && x <= 16;
    return isExit ? TILE.PATH : TILE.WALL;
  }
  if (x === 0 || y === 0 || x === MAP_WIDTH - 1) return TILE.WALL;

  // Main building block (north area — library building)
  if (isInRect(x, y, 2, 2, 27, 8)) return TILE.BUILDING;
  // Library doors / gaps
  if (isInRect(x, y, 10, 8, 12, 8)) return TILE.DOOR;
  if (isInRect(x, y, 17, 8, 19, 8)) return TILE.DOOR;

  // Side buildings (east and west stacks)
  if (isInRect(x, y, 2, 11, 8, 18)) return TILE.BUILDING;
  if (isInRect(x, y, 22, 11, 27, 18)) return TILE.BUILDING;

  // Narrow main path (north-south spine)
  if (isInRect(x, y, 14, 9, 15, MAP_HEIGHT - 2)) return TILE.PATH;

  // East-west connector path
  if (isInRect(x, y, 1, 19, MAP_WIDTH - 2, 20)) return TILE.PATH;

  // Courtyard encounter grass (between the buildings)
  if (isInRect(x, y, 9, 10, 13, 18)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 16, 10, 21, 18)) return TILE.ENCOUNTER;

  // Bottom encounter patch (near exit)
  if (isInRect(x, y, 9, 22, 20, 26)) return TILE.ENCOUNTER;

  return TILE.GRASS;
}

function buildCampusLibraryData(exits: ExitTile[]): number[][] {
  const exitSet = new Set(exits.map((e) => `${e.x},${e.y}`));
  const map: number[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      map[y][x] = resolveCampusLibraryTile(x, y, exitSet);
    }
  }
  return map;
}

// ---- Quad Park ----

function resolveQuadParkTile(x: number, y: number, exitSet: Set<string>): TileValue {
  if (exitSet.has(`${x},${y}`)) return TILE.EXIT;

  // Border walls (west has path gap for exit)
  if (x === 0) {
    const isExit = y >= 13 && y <= 16;
    return isExit ? TILE.PATH : TILE.WALL;
  }
  if (x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) return TILE.WALL;

  // Pond / water feature in the center
  if (isInRect(x, y, 12, 10, 20, 18)) return TILE.WATER;

  // Path around the pond
  if (isInRect(x, y, 10, 8, 22, 9)) return TILE.PATH;
  if (isInRect(x, y, 10, 19, 22, 20)) return TILE.PATH;
  if (isInRect(x, y, 10, 8, 11, 20)) return TILE.PATH;
  if (isInRect(x, y, 21, 8, 22, 20)) return TILE.PATH;

  // Main entry path from west exit
  if (isInRect(x, y, 1, 13, 10, 16)) return TILE.PATH;

  // Lots of encounter grass in open areas
  if (isInRect(x, y, 2, 2, 9, 11)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 23, 2, 27, 12)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 2, 18, 9, 27)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 23, 18, 27, 27)) return TILE.ENCOUNTER;

  // Park benches / structures (small buildings)
  if (isInRect(x, y, 2, 13, 4, 16)) return TILE.BUILDING;
  if (isInRect(x, y, 25, 13, 27, 16)) return TILE.BUILDING;

  return TILE.GRASS;
}

function buildQuadParkData(exits: ExitTile[]): number[][] {
  const exitSet = new Set(exits.map((e) => `${e.x},${e.y}`));
  const map: number[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      map[y][x] = resolveQuadParkTile(x, y, exitSet);
    }
  }
  return map;
}

// ---- Campus Gym ----

function resolveCampusGymTile(x: number, y: number, exitSet: Set<string>): TileValue {
  if (exitSet.has(`${x},${y}`)) return TILE.EXIT;

  // Border walls (east has path gap for exit)
  if (x === MAP_WIDTH - 1) {
    const isExit = y >= 13 && y <= 16;
    return isExit ? TILE.PATH : TILE.WALL;
  }
  if (x === 0 || y === 0 || y === MAP_HEIGHT - 1) return TILE.WALL;

  // Outer gym shell (large building frame)
  if (isInRect(x, y, 2, 2, 20, 27)) return TILE.BUILDING;

  // Interior open training floor (inside the building)
  if (isInRect(x, y, 4, 4, 18, 25)) return TILE.GRASS;

  // Training zones as encounter tiles (workout areas)
  if (isInRect(x, y, 5, 5, 9, 11)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 12, 5, 17, 11)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 5, 14, 9, 20)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 12, 14, 17, 20)) return TILE.ENCOUNTER;

  // Internal corridors
  if (isInRect(x, y, 4, 12, 18, 13)) return TILE.PATH;
  if (isInRect(x, y, 10, 4, 11, 25)) return TILE.PATH;

  // Entry corridor from east exit
  if (isInRect(x, y, 19, 13, 27, 16)) return TILE.PATH;

  // Locker room building (east side)
  if (isInRect(x, y, 22, 2, 27, 11)) return TILE.BUILDING;
  if (isInRect(x, y, 22, 19, 27, 27)) return TILE.BUILDING;

  return TILE.GRASS;
}

function buildCampusGymData(exits: ExitTile[]): number[][] {
  const exitSet = new Set(exits.map((e) => `${e.x},${e.y}`));
  const map: number[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      map[y][x] = resolveCampusGymTile(x, y, exitSet);
    }
  }
  return map;
}

// ---- Greek Row ----

function resolveGreekRowTile(x: number, y: number, exitSet: Set<string>): TileValue {
  if (exitSet.has(`${x},${y}`)) return TILE.EXIT;

  // Border walls (north has path gap for exit)
  if (y === 0) {
    const isExit = x >= 13 && x <= 16;
    return isExit ? TILE.PATH : TILE.WALL;
  }
  if (x === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1) return TILE.WALL;

  // Main road through the center (horizontal)
  if (isInRect(x, y, 1, 13, MAP_WIDTH - 2, 15)) return TILE.PATH;

  // North-south spine connecting to exit
  if (isInRect(x, y, 13, 1, 16, 12)) return TILE.PATH;
  if (isInRect(x, y, 13, 15, 16, MAP_HEIGHT - 2)) return TILE.PATH;

  // Frat houses (north side)
  if (isInRect(x, y, 1, 2, 6, 9)) return TILE.BUILDING;
  if (isInRect(x, y, 9, 2, 12, 9)) return TILE.BUILDING;
  if (isInRect(x, y, 17, 2, 20, 9)) return TILE.BUILDING;
  if (isInRect(x, y, 23, 2, 27, 9)) return TILE.BUILDING;

  // Frat houses (south side)
  if (isInRect(x, y, 1, 18, 6, 25)) return TILE.BUILDING;
  if (isInRect(x, y, 9, 18, 12, 25)) return TILE.BUILDING;
  if (isInRect(x, y, 17, 18, 20, 25)) return TILE.BUILDING;
  if (isInRect(x, y, 23, 18, 27, 25)) return TILE.BUILDING;

  // Yard encounter grass between houses (north side)
  if (isInRect(x, y, 7, 3, 8, 11)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 13, 3, 16, 9) && !(isInRect(x, y, 13, 1, 16, 12))) return TILE.ENCOUNTER;
  if (isInRect(x, y, 21, 3, 22, 11)) return TILE.ENCOUNTER;

  // Yard encounter grass between houses (south side)
  if (isInRect(x, y, 7, 16, 8, 26)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 21, 16, 22, 26)) return TILE.ENCOUNTER;

  return TILE.GRASS;
}

function buildGreekRowData(exits: ExitTile[]): number[][] {
  const exitSet = new Set(exits.map((e) => `${e.x},${e.y}`));
  const map: number[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      map[y][x] = resolveGreekRowTile(x, y, exitSet);
    }
  }
  return map;
}

// ---- Shared map builder ----

function buildTilemap(scene: Phaser.Scene, mapData: number[][], exits: ExitTile[]): GeneratedMap {
  const width = mapData[0].length;
  const height = mapData.length;

  const tilemap = scene.make.tilemap({
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    width,
    height,
  });

  const tileset = tilemap.addTilesetImage('tileset-campus', 'tileset-campus', TILE_SIZE, TILE_SIZE, 0, 0)!;

  const groundLayer = tilemap.createBlankLayer('ground', tileset, 0, 0)!;
  const collisionLayer = tilemap.createBlankLayer('collision', tileset, 0, 0)!;

  const encounterTiles: { x: number; y: number }[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tileIndex = mapData[y][x];

      if (COLLISION_TILES.includes(tileIndex)) {
        groundLayer.putTileAt(TILE.GRASS, x, y);
        collisionLayer.putTileAt(tileIndex, x, y);
      } else {
        // EXIT renders visually as PATH
        const visualIndex = tileIndex === TILE.EXIT ? TILE.PATH : tileIndex;
        groundLayer.putTileAt(visualIndex, x, y);
        collisionLayer.putTileAt(-1, x, y);
      }

      if (tileIndex === TILE.ENCOUNTER) {
        encounterTiles.push({ x, y });
      }
    }
  }

  collisionLayer.setCollision(COLLISION_TILES);

  return { tilemap, groundLayer, collisionLayer, encounterTiles, exits };
}

// ---- Public API ----

/** Kept for backwards compatibility — produces identical layout to the original. */
export function generateFreshmanQuad(scene: Phaser.Scene): GeneratedMap {
  const config = ZONE_CONFIGS['freshman-quad'];
  const mapData = buildFreshmanQuadData(config.exits);
  return buildTilemap(scene, mapData, config.exits);
}

export function generateZoneMap(scene: Phaser.Scene, zoneId: string): GeneratedMap {
  const config = ZONE_CONFIGS[zoneId];
  if (!config) {
    // Fallback to freshman quad for unknown zones
    return generateFreshmanQuad(scene);
  }

  let mapData: number[][];

  switch (zoneId) {
    case 'freshman-quad':
      mapData = buildFreshmanQuadData(config.exits);
      break;
    case 'campus-library':
      mapData = buildCampusLibraryData(config.exits);
      break;
    case 'quad-park':
      mapData = buildQuadParkData(config.exits);
      break;
    case 'campus-gym':
      mapData = buildCampusGymData(config.exits);
      break;
    case 'greek-row':
      mapData = buildGreekRowData(config.exits);
      break;
    default:
      mapData = buildFreshmanQuadData(config.exits);
  }

  return buildTilemap(scene, mapData, config.exits);
}
