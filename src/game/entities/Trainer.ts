import Phaser from 'phaser';
import { NPC } from './NPC';
import type { NPCConfig } from './NPC';

export interface TrainerConfig extends NPCConfig {
  sightRange: number;
  party: { speciesId: number; level: number }[];
  defeatDialogueId: string;
}

export class Trainer extends NPC {
  readonly sightRange: number;
  readonly party: { speciesId: number; level: number }[];
  readonly defeatDialogueId: string;

  constructor(scene: Phaser.Scene, config: TrainerConfig) {
    super(scene, config);
    this.sightRange = config.sightRange;
    this.party = config.party;
    this.defeatDialogueId = config.defeatDialogueId;
  }

  isInLineOfSight(playerPos: { x: number; y: number }): boolean {
    const sprite = this.getSprite();
    const tileSize = 32;

    const trainerTileX = Math.floor(sprite.x / tileSize);
    const trainerTileY = Math.floor(sprite.y / tileSize);

    const dx = playerPos.x - trainerTileX;
    const dy = playerPos.y - trainerTileY;

    switch (this.facing) {
      case 'up':
        return dx === 0 && dy < 0 && Math.abs(dy) <= this.sightRange;
      case 'down':
        return dx === 0 && dy > 0 && dy <= this.sightRange;
      case 'left':
        return dy === 0 && dx < 0 && Math.abs(dx) <= this.sightRange;
      case 'right':
        return dy === 0 && dx > 0 && dx <= this.sightRange;
      default:
        return false;
    }
  }

  isDefeated(defeatedTrainers: string[]): boolean {
    return defeatedTrainers.includes(this.id);
  }
}
