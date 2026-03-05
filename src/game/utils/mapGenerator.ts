import * as Phaser from 'phaser';

export interface GeneratedMap {
  tilemap: Phaser.Tilemaps.Tilemap;
  groundLayer: Phaser.Tilemaps.TilemapLayer;
  collisionLayer: Phaser.Tilemaps.TilemapLayer;
  encounterTiles: { x: number; y: number }[];
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
} as const;

type TileValue = (typeof TILE)[keyof typeof TILE];

const MAP_WIDTH = 30;
const MAP_HEIGHT = 30;
const TILE_SIZE = 32;

const WALKABLE_TILES: number[] = [TILE.GRASS, TILE.PATH, TILE.ENCOUNTER];
const COLLISION_TILES: number[] = [TILE.WALL, TILE.BUILDING];

function buildFreshmanQuadData(): number[][] {
  const map: number[][] = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      map[y][x] = resolveTile(x, y);
    }
  }

  return map;
}

function resolveTile(x: number, y: number): TileValue {
  // Border walls (south row has path gap in center for exit)
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

  // Encounter grass zones (inside the outer path ring, away from buildings/paths)
  if (isInRect(x, y, 6, 9, 12, 12)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 17, 9, 23, 12)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 6, 17, 12, 20)) return TILE.ENCOUNTER;
  if (isInRect(x, y, 17, 17, 23, 20)) return TILE.ENCOUNTER;

  return TILE.GRASS;
}

function isInRect(x: number, y: number, x1: number, y1: number, x2: number, y2: number): boolean {
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
}

export function generateFreshmanQuad(scene: Phaser.Scene): GeneratedMap {
  const mapData = buildFreshmanQuadData();

  const tilemap = scene.make.tilemap({
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  });

  const tileset = tilemap.addTilesetImage('tileset-campus', 'tileset-campus', TILE_SIZE, TILE_SIZE, 0, 0)!;

  const groundLayer = tilemap.createBlankLayer('ground', tileset, 0, 0)!;
  const collisionLayer = tilemap.createBlankLayer('collision', tileset, 0, 0)!;

  const encounterTiles: { x: number; y: number }[] = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tileIndex = mapData[y][x];

      if (COLLISION_TILES.includes(tileIndex)) {
        groundLayer.putTileAt(TILE.GRASS, x, y);
        collisionLayer.putTileAt(tileIndex, x, y);
      } else {
        groundLayer.putTileAt(tileIndex, x, y);
        collisionLayer.putTileAt(-1, x, y);
      }

      if (tileIndex === TILE.ENCOUNTER) {
        encounterTiles.push({ x, y });
      }
    }
  }

  // Set collision on wall and building tiles in the collision layer
  collisionLayer.setCollision(COLLISION_TILES);

  return { tilemap, groundLayer, collisionLayer, encounterTiles };
}
