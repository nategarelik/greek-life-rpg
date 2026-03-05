import * as Phaser from 'phaser';

export interface NPCConfig {
  id: string;
  x: number;
  y: number;
  spriteKey: string;
  facing?: string;
  dialogueId?: string;
}

export class NPC {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  readonly id: string;
  readonly dialogueId: string | undefined;
  protected facing: string;

  constructor(scene: Phaser.Scene, config: NPCConfig) {
    this.scene = scene;
    this.id = config.id;
    this.dialogueId = config.dialogueId;
    this.facing = config.facing ?? 'down';

    this.sprite = scene.add.sprite(config.x, config.y, config.spriteKey);
    this.sprite.setDepth(9);
  }

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  facePlayer(playerPos: { x: number; y: number }): void {
    const dx = playerPos.x - this.sprite.x;
    const dy = playerPos.y - this.sprite.y;

    if (Math.abs(dx) >= Math.abs(dy)) {
      this.facing = dx > 0 ? 'right' : 'left';
    } else {
      this.facing = dy > 0 ? 'down' : 'up';
    }
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
