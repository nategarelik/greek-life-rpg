import Phaser from 'phaser';

export class HealthBar extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private foreground: Phaser.GameObjects.Rectangle;
  private barWidth: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width = 120, height = 10) {
    super(scene, x, y);

    this.barWidth = width;

    this.background = scene.add.rectangle(0, 0, width, height, 0x333333).setOrigin(0, 0);
    this.foreground = scene.add.rectangle(0, 0, width, height, 0x44cc44).setOrigin(0, 0);

    this.add([this.background, this.foreground]);
    scene.add.existing(this);
  }

  setPercentage(pct: number): void {
    const clamped = Math.max(0, Math.min(1, pct));
    const targetWidth = Math.floor(this.barWidth * clamped);

    const color = clamped > 0.5 ? 0x44cc44 : clamped > 0.25 ? 0xdddd00 : 0xcc2222;
    this.foreground.setFillStyle(color);

    this.scene.tweens.add({
      targets: this.foreground,
      width: targetWidth,
      duration: 300,
      ease: 'Power1',
    });
  }
}
