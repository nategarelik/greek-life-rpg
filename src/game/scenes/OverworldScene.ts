import Phaser from 'phaser';
import { Direction, type GridEngine } from 'grid-engine';
import type { BattleConfig } from '@/types/battle';
import { generateFreshmanQuad } from '@/game/utils/mapGenerator';

// Tile index used to identify encounter tiles from mapGenerator
const ENCOUNTER_TILE_INDEX = 3;
const ENCOUNTER_CHANCE = 0.15;

// Extend scene type to include grid-engine plugin mapping
interface OverworldSceneWithPlugin extends Phaser.Scene {
  gridEngine: GridEngine;
}

export class OverworldScene extends Phaser.Scene {
  private playerSprite!: Phaser.GameObjects.Image;
  private encounterTiles!: Set<string>;
  private lastPlayerPos = { x: -1, y: -1 };
  private inBattle = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'OverworldScene' });
  }

  create(): void {
    this.inBattle = false;

    const self = this as unknown as OverworldSceneWithPlugin;

    const { tilemap, groundLayer, collisionLayer, encounterTiles } = generateFreshmanQuad(this);

    // Build a quick lookup set for encounter positions
    this.encounterTiles = new Set(encounterTiles.map((t) => `${t.x},${t.y}`));

    // Player sprite — positioned by gridEngine; we set it offscreen first
    this.playerSprite = this.add.image(-100, -100, 'player').setDepth(10);

    self.gridEngine.create(tilemap, {
      characters: [
        {
          id: 'player',
          sprite: this.playerSprite as unknown as Phaser.GameObjects.Sprite,
          startPosition: { x: 15, y: 15 },
          speed: 4,
          charLayer: 'ground',
        },
      ],
    });

    // Camera bounds to map size
    const mapWidth = tilemap.widthInPixels;
    const mapHeight = tilemap.heightInPixels;
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.playerSprite);
    this.cameras.main.setZoom(1.5);

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.addNpcs(tilemap);

    // Suppress unused var warnings for layers — layers are rendered by Phaser automatically
    void groundLayer;
    void collisionLayer;
  }

  update(): void {
    if (this.inBattle) return;

    const self = this as unknown as OverworldSceneWithPlugin;

    if (this.cursors.left.isDown) {
      self.gridEngine.move('player', Direction.LEFT);
    } else if (this.cursors.right.isDown) {
      self.gridEngine.move('player', Direction.RIGHT);
    } else if (this.cursors.up.isDown) {
      self.gridEngine.move('player', Direction.UP);
    } else if (this.cursors.down.isDown) {
      self.gridEngine.move('player', Direction.DOWN);
    }

    const pos = self.gridEngine.getPosition('player');

    // Update sprite world position manually (Image, not Sprite)
    const TILE_SIZE = 32;
    this.playerSprite.setPosition(
      pos.x * TILE_SIZE + TILE_SIZE / 2,
      pos.y * TILE_SIZE + TILE_SIZE / 2,
    );

    if (pos.x !== this.lastPlayerPos.x || pos.y !== this.lastPlayerPos.y) {
      this.lastPlayerPos = { ...pos };
      this.checkEncounter(pos.x, pos.y);
    }
  }

  private addNpcs(tilemap: Phaser.Tilemaps.Tilemap): void {
    const TILE_SIZE = 32;
    const npcPositions = [
      { x: 7, y: 3 },
      { x: 24, y: 3 },
      { x: 7, y: 20 },
    ];

    void tilemap;

    for (const pos of npcPositions) {
      this.add.image(
        pos.x * TILE_SIZE + TILE_SIZE / 2,
        pos.y * TILE_SIZE + TILE_SIZE / 2,
        'npc',
      ).setDepth(9);
    }
  }

  private checkEncounter(x: number, y: number): void {
    if (!this.encounterTiles.has(`${x},${y}`)) return;
    if (Math.random() > ENCOUNTER_CHANCE) return;

    this.triggerWildBattle();
  }

  private triggerWildBattle(): void {
    this.inBattle = true;
    this.scene.pause('OverworldScene');

    const encounterPool = [1, 4, 7, 10, 13];
    const speciesId = encounterPool[Math.floor(Math.random() * encounterPool.length)];
    const level = Math.floor(Math.random() * 4) + 2;

    const battleConfig: BattleConfig = {
      isWild: true,
      enemyParty: [{ speciesId, level }],
    };

    this.scene.launch('TransitionScene', {
      targetScene: 'BattleScene',
      targetData: battleConfig,
    });

    // Resume overworld when battle ends
    this.scene.get('BattleScene').events.once('shutdown', () => {
      this.inBattle = false;
      this.scene.resume('OverworldScene');
    });
  }
}
