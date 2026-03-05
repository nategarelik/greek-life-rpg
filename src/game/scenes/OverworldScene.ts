import * as Phaser from 'phaser';
import { Direction, type GridEngine } from 'grid-engine';
import type { BattleConfig } from '@/types/battle';
import { gameState } from '@/game/GameState';
import { generateFreshmanQuad } from '@/game/utils/mapGenerator';
import { EncounterSystem } from '@/game/systems/EncounterSystem';
import { ENCOUNTER_MAP } from '@/data/encounters';

// Tile index used to identify encounter tiles from mapGenerator
const ENCOUNTER_TILE_INDEX = 3;
const TILE_SIZE = 32;
const TUTORIAL_DISPLAY_DURATION = 3000;

// Extend scene type to include grid-engine plugin mapping
interface OverworldSceneWithPlugin extends Phaser.Scene {
  gridEngine: GridEngine;
}

interface NpcData {
  x: number;
  y: number;
  dialogue: string;
  sprite: Phaser.GameObjects.Image;
  isHealer?: boolean;
}

type FacingDirection = 'up' | 'down' | 'left' | 'right';

export class OverworldScene extends Phaser.Scene {
  private playerSprite!: Phaser.GameObjects.Image;
  private encounterTiles!: Set<string>;
  private lastPlayerPos = { x: -1, y: -1 };
  private inBattle = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private facingDirection: FacingDirection = 'down';
  private npcs: NpcData[] = [];
  private dialogueBox?: Phaser.GameObjects.Container;
  private hudBar!: Phaser.GameObjects.Container;
  private zoneLabelText!: Phaser.GameObjects.Text;
  private tutorialOverlay?: Phaser.GameObjects.Container;
  private encounterSystem!: EncounterSystem;

  constructor() {
    super({ key: 'OverworldScene' });
  }

  create(): void {
    this.inBattle = false;
    this.encounterSystem = new EncounterSystem();

    const self = this as unknown as OverworldSceneWithPlugin;
    const { width, height } = this.cameras.main;

    const { tilemap, groundLayer, collisionLayer, encounterTiles } = generateFreshmanQuad(this);

    this.encounterTiles = new Set(encounterTiles.map((t) => `${t.x},${t.y}`));

    this.playerSprite = this.add.image(-100, -100, 'player-down').setDepth(10);

    self.gridEngine.create(tilemap, {
      characters: [
        {
          id: 'player',
          sprite: this.playerSprite as unknown as Phaser.GameObjects.Sprite,
          startPosition: { x: 15, y: 15 },
          speed: 4,
        },
      ],
    });

    const mapWidth = tilemap.widthInPixels;
    const mapHeight = tilemap.heightInPixels;
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.playerSprite);
    this.cameras.main.setZoom(1.5);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.input.keyboard!.on('keydown-SPACE', () => this.tryNpcInteraction());

    this.input.keyboard!.on('keydown-ENTER', () => {
      if (this.inBattle || this.dialogueBox) return;
      this.scene.pause('OverworldScene');
      this.scene.launch('PauseMenuScene');
    });

    this.addNpcs(tilemap);
    this.buildHud(width, height);
    this.showZoneLabel();
    this.showTutorialOverlay(width, height);

    void groundLayer;
    void collisionLayer;
    void ENCOUNTER_TILE_INDEX;
  }

  update(): void {
    if (this.inBattle) return;
    if (this.dialogueBox) return;

    const self = this as unknown as OverworldSceneWithPlugin;

    if (this.cursors.left.isDown) {
      self.gridEngine.move('player', Direction.LEFT);
      this.setFacing('left');
    } else if (this.cursors.right.isDown) {
      self.gridEngine.move('player', Direction.RIGHT);
      this.setFacing('right');
    } else if (this.cursors.up.isDown) {
      self.gridEngine.move('player', Direction.UP);
      this.setFacing('up');
    } else if (this.cursors.down.isDown) {
      self.gridEngine.move('player', Direction.DOWN);
      this.setFacing('down');
    }

    const pos = self.gridEngine.getPosition('player');

    this.playerSprite.setPosition(
      pos.x * TILE_SIZE + TILE_SIZE / 2,
      pos.y * TILE_SIZE + TILE_SIZE / 2,
    );

    if (pos.x !== this.lastPlayerPos.x || pos.y !== this.lastPlayerPos.y) {
      this.lastPlayerPos = { ...pos };
      this.checkEncounter(pos.x, pos.y);
    }
  }

  private setFacing(direction: FacingDirection): void {
    if (this.facingDirection === direction) return;
    this.facingDirection = direction;
    this.playerSprite.setTexture(`player-${direction}`);
  }

  private buildHud(width: number, height: number): void {
    this.hudBar = this.add.container(0, 0);
    this.hudBar.setScrollFactor(0).setDepth(50);

    const topBar = this.add.rectangle(0, 0, width, 26, 0x000000, 0.65).setOrigin(0);
    this.zoneLabelText = this.add.text(width / 2, 13, '', {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const bottomBar = this.add.rectangle(0, height - 22, width, 22, 0x000000, 0.65).setOrigin(0);
    const hintText = this.add.text(width / 2, height - 11, 'SPACE: Interact  |  ENTER: Menu', {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.hudBar.add([topBar, this.zoneLabelText, bottomBar, hintText]);
  }

  private showZoneLabel(): void {
    const zoneName = 'FRESHMAN QUAD';
    this.zoneLabelText.setText(zoneName);

    const fadeInOut = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height * 0.15,
      zoneName,
      {
        fontSize: '28px',
        color: '#ffd700',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      },
    ).setOrigin(0.5).setScrollFactor(0).setDepth(45).setAlpha(0);

    this.tweens.add({
      targets: fadeInOut,
      alpha: { from: 0, to: 1 },
      duration: 600,
      yoyo: true,
      hold: 1400,
      onComplete: () => fadeInOut.destroy(),
    });
  }

  private showTutorialOverlay(width: number, height: number): void {
    const container = this.add.container(0, 0);
    container.setScrollFactor(0).setDepth(60);

    const bg = this.add.rectangle(width / 2, height / 2, width * 0.75, 80, 0x000000, 0.82)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffd700, 0.7);

    const text = this.add.text(
      width / 2,
      height / 2,
      'Arrow keys to move.\nWalk into the tall grass to find wild Bros!',
      {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center',
      },
    ).setOrigin(0.5);

    container.add([bg, text]);
    this.tutorialOverlay = container;

    this.time.delayedCall(TUTORIAL_DISPLAY_DURATION, () => {
      this.tweens.add({
        targets: container,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          container.destroy();
          this.tutorialOverlay = undefined;
        },
      });
    });
  }

  private addNpcs(tilemap: Phaser.Tilemaps.Tilemap): void {
    void tilemap;

    const npcPositions = [
      { x: 7, y: 3, dialogue: 'Welcome to the Freshman Quad! Walk into the tall grass to encounter wild Bros.', isHealer: false },
      { x: 24, y: 3, dialogue: 'Need a rest? Let me heal your Bros!', isHealer: true },
      { x: 7, y: 20, dialogue: 'Rush week is wild. I heard some legendary Bros hang out in the far corners of campus.', isHealer: false },
    ];

    for (const pos of npcPositions) {
      const sprite = this.add.image(
        pos.x * TILE_SIZE + TILE_SIZE / 2,
        pos.y * TILE_SIZE + TILE_SIZE / 2,
        'npc',
      ).setDepth(9);

      this.npcs.push({ x: pos.x, y: pos.y, dialogue: pos.dialogue, sprite, isHealer: pos.isHealer });
    }
  }

  private tryNpcInteraction(): void {
    if (this.inBattle) return;
    if (this.dialogueBox) {
      this.closeDialogue();
      return;
    }

    const self = this as unknown as OverworldSceneWithPlugin;
    const pos = self.gridEngine.getPosition('player');

    const faceOffset = this.getFacingOffset();
    const targetX = pos.x + faceOffset.x;
    const targetY = pos.y + faceOffset.y;

    const npc = this.npcs.find((n) => n.x === targetX && n.y === targetY);
    if (!npc) return;

    if (npc.isHealer) {
      gameState.party.healAll();
      this.showDialogue('Your Bros have been fully healed!');
    } else {
      this.showDialogue(npc.dialogue);
    }
  }

  private getFacingOffset(): { x: number; y: number } {
    switch (this.facingDirection) {
      case 'up':    return { x: 0, y: -1 };
      case 'down':  return { x: 0, y: 1 };
      case 'left':  return { x: -1, y: 0 };
      case 'right': return { x: 1, y: 0 };
    }
  }

  private showDialogue(text: string): void {
    const { width, height } = this.cameras.main;
    const container = this.add.container(0, 0);
    container.setScrollFactor(0).setDepth(55);

    const bg = this.add.rectangle(width / 2, height - 72, width * 0.9, 100, 0x000000, 0.88)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff, 0.5);

    const dialogText = this.add.text(width / 2, height - 72, text, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: width * 0.82 },
      align: 'left',
    }).setOrigin(0.5);

    const closeHint = this.add.text(width - 24, height - 30, 'SPACE', {
      fontSize: '11px',
      color: '#888888',
      fontFamily: 'monospace',
    }).setOrigin(1, 0.5);

    container.add([bg, dialogText, closeHint]);
    this.dialogueBox = container;
  }

  private closeDialogue(): void {
    if (!this.dialogueBox) return;
    this.dialogueBox.destroy();
    this.dialogueBox = undefined;
  }

  private checkEncounter(x: number, y: number): void {
    const isEncounterTile = this.encounterTiles.has(`${x},${y}`);
    if (!this.encounterSystem.checkEncounter(isEncounterTile)) return;
    if (!gameState.hasStarterBro()) return;
    this.triggerWildBattle();
  }

  private triggerWildBattle(): void {
    this.inBattle = true;
    this.scene.pause('OverworldScene');

    const table = ENCOUNTER_MAP[gameState.currentZoneId];
    let battleConfig: BattleConfig;

    if (table) {
      battleConfig = this.encounterSystem.generateEncounter(table.encounters);
    } else {
      // Fallback if no encounter table for current zone
      battleConfig = {
        isWild: true,
        enemyParty: [{ speciesId: 1, level: 3 }],
      };
    }

    this.scene.launch('TransitionScene', {
      targetScene: 'BattleScene',
      targetData: battleConfig,
    });

    this.scene.get('BattleScene').events.once('shutdown', () => {
      this.inBattle = false;
      this.scene.resume('OverworldScene');
    });
  }
}
