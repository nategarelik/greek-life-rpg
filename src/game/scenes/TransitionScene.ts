import Phaser from 'phaser';

interface TransitionData {
  targetScene: string;
  targetData?: Record<string, unknown>;
}

export class TransitionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TransitionScene' });
  }

  create(data: TransitionData): void {
    const { width, height } = this.cameras.main;

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0)
      .setOrigin(0)
      .setDepth(100);

    this.tweens.add({
      targets: overlay,
      fillAlpha: 1,
      duration: 500,
      ease: 'Linear',
      onComplete: () => {
        this.scene.stop(data.targetScene);
        this.scene.start(data.targetScene, data.targetData ?? {});

        this.time.delayedCall(100, () => {
          this.tweens.add({
            targets: overlay,
            fillAlpha: 0,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
              this.scene.stop('TransitionScene');
            },
          });
        });
      },
    });
  }
}
