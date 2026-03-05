import * as Phaser from 'phaser';

export class Player {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private facingDirection: string = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.add.sprite(x, y, 'player');
  }

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  getFacingDirection(): string {
    return this.facingDirection;
  }

  setFacingDirection(direction: string): void {
    this.facingDirection = direction;
  }

  getGridPosition(): { x: number; y: number } {
    // Grid position is managed by GridEngine; callers retrieve it from the plugin.
    // This returns the last known world position converted to a tile coordinate.
    const tileSize = 32;
    return {
      x: Math.floor(this.sprite.x / tileSize),
      y: Math.floor(this.sprite.y / tileSize),
    };
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
