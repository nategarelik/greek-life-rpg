import * as Phaser from 'phaser';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    this.add.text(cx, cy - 40, 'LOADING...', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Progress bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333);
    barBg.fillRect(cx - 150, cy, 300, 20);

    // Progress bar fill
    const barFill = this.add.graphics();

    let progress = 0;
    const timer = this.time.addEvent({
      delay: 30,
      repeat: 33,
      callback: () => {
        progress = Math.min(1, progress + 0.03);
        barFill.clear();
        barFill.fillStyle(0xffdd00);
        barFill.fillRect(cx - 150, cy, 300 * progress, 20);

        if (progress >= 1) {
          timer.remove();
          this.time.delayedCall(200, () => {
            this.scene.start('TitleScene');
          });
        }
      },
    });
  }
}
