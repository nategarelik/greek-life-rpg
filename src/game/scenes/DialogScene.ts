import Phaser from 'phaser';

interface DialogData {
  pages: string[];
  onComplete?: () => void;
}

export class DialogScene extends Phaser.Scene {
  private pages: string[] = [];
  private currentPage = 0;
  private dialogText!: Phaser.GameObjects.Text;
  private advanceIndicator!: Phaser.GameObjects.Text;
  private onComplete?: () => void;
  private isTyping = false;
  private fullText = '';
  private typewriterTimer?: Phaser.Time.TimerEvent;
  private charIndex = 0;

  constructor() {
    super({ key: 'DialogScene' });
  }

  create(data: DialogData): void {
    this.pages = data.pages ?? [];
    this.currentPage = 0;
    this.onComplete = data.onComplete;
    this.isTyping = false;

    const { width, height } = this.cameras.main;

    // Semi-transparent background panel at bottom
    const panelHeight = 140;
    const panelY = height - panelHeight;

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRoundedRect(16, panelY - 4, width - 32, panelHeight, 8);
    bg.lineStyle(2, 0xffd700, 0.8);
    bg.strokeRoundedRect(16, panelY - 4, width - 32, panelHeight, 8);

    this.dialogText = this.add.text(36, panelY + 12, '', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: width - 72 },
      lineSpacing: 4,
    });

    this.advanceIndicator = this.add.text(width - 40, height - 20, '▼', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setVisible(false);

    this.tweens.add({
      targets: this.advanceIndicator,
      y: height - 16,
      duration: 400,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard!.on('keydown-ENTER', this.handleAdvance, this);
    this.input.keyboard!.on('keydown-SPACE', this.handleAdvance, this);
    this.input.keyboard!.on('keydown-Z', this.handleAdvance, this);

    this.showPage(0);
  }

  private showPage(pageIndex: number): void {
    if (pageIndex >= this.pages.length) {
      this.closeDialog();
      return;
    }

    this.currentPage = pageIndex;
    this.fullText = this.pages[pageIndex];
    this.charIndex = 0;
    this.isTyping = true;
    this.advanceIndicator.setVisible(false);
    this.dialogText.setText('');

    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
    }

    this.typewriterTimer = this.time.addEvent({
      delay: 30,
      repeat: this.fullText.length - 1,
      callback: () => {
        this.charIndex++;
        this.dialogText.setText(this.fullText.slice(0, this.charIndex));

        if (this.charIndex >= this.fullText.length) {
          this.isTyping = false;
          this.advanceIndicator.setVisible(true);
        }
      },
    });
  }

  private handleAdvance(): void {
    if (this.isTyping) {
      // Skip typewriter — show full text immediately
      if (this.typewriterTimer) {
        this.typewriterTimer.remove();
      }
      this.dialogText.setText(this.fullText);
      this.isTyping = false;
      this.advanceIndicator.setVisible(true);
      return;
    }

    this.showPage(this.currentPage + 1);
  }

  private closeDialog(): void {
    this.input.keyboard!.off('keydown-ENTER', this.handleAdvance, this);
    this.input.keyboard!.off('keydown-SPACE', this.handleAdvance, this);
    this.input.keyboard!.off('keydown-Z', this.handleAdvance, this);

    const callback = this.onComplete;
    this.scene.stop('DialogScene');
    if (callback) callback();
  }
}
