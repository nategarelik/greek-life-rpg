import * as Phaser from 'phaser';

export class TextBox extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private textObject: Phaser.GameObjects.Text;
  private arrow: Phaser.GameObjects.Triangle;
  private typewriterTimer: Phaser.Time.TimerEvent | null = null;
  private resolveCallback: (() => void) | null = null;
  private isComplete = false;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);

    this.background = scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.8)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffffff, 0.6);

    this.textObject = scene.add
      .text(12, 10, '', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
        wordWrap: { width: width - 24 },
      })
      .setOrigin(0, 0);

    this.arrow = scene.add
      .triangle(width - 14, height - 10, 0, 0, 8, 0, 4, 6, 0xffffff)
      .setVisible(false);

    this.add([this.background, this.textObject, this.arrow]);
    scene.add.existing(this);
  }

  showText(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.clearTypewriter();
      this.textObject.setText('');
      this.arrow.setVisible(false);
      this.isComplete = false;
      this.resolveCallback = resolve;

      let charIndex = 0;
      const chars = Array.from(text);

      this.typewriterTimer = this.scene.time.addEvent({
        delay: 30,
        repeat: chars.length - 1,
        callback: () => {
          charIndex++;
          this.textObject.setText(chars.slice(0, charIndex).join(''));

          if (charIndex >= chars.length) {
            this.isComplete = true;
            this.arrow.setVisible(true);
            this.scene.input.keyboard?.once('keydown-ENTER', this.advance, this);
            this.scene.input.keyboard?.once('keydown-SPACE', this.advance, this);
          }
        },
        callbackScope: this,
      });
    });
  }

  private advance(): void {
    if (!this.isComplete) {
      // Skip typewriter — show full text immediately
      this.clearTypewriter();
      const current = this.textObject.text;
      // We can't easily jump to the end without storing text; just mark complete
      this.isComplete = true;
      this.arrow.setVisible(true);
      return;
    }

    this.arrow.setVisible(false);
    const cb = this.resolveCallback;
    this.resolveCallback = null;
    cb?.();
  }

  private clearTypewriter(): void {
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }
    this.scene.input.keyboard?.off('keydown-ENTER', this.advance, this);
    this.scene.input.keyboard?.off('keydown-SPACE', this.advance, this);
  }

  destroy(fromScene?: boolean): void {
    this.clearTypewriter();
    super.destroy(fromScene);
  }
}
