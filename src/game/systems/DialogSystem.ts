import Phaser from 'phaser';

export interface DialogPage {
  text: string;
  speakerName?: string;
}

export interface DialogChoice {
  text: string;
  value: string;
}

const DIALOG_WIDTH = 600;
const DIALOG_HEIGHT = 120;
const DIALOG_X = 100;
const DIALOG_Y = 450;
const PADDING = 16;

export class DialogSystem {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private textObject: Phaser.GameObjects.Text;
  private advanceIndicator: Phaser.GameObjects.Text;
  private pages: DialogPage[] = [];
  private currentPage: number = 0;
  private isTyping: boolean = false;
  private typeSpeed: number = 30;
  private onComplete?: () => void;
  private advanceKey: Phaser.Input.Keyboard.Key | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.background = scene.add.rectangle(0, 0, DIALOG_WIDTH, DIALOG_HEIGHT, 0x1a1a2e, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4488ff);

    this.nameText = scene.add.text(PADDING, PADDING, '', {
      fontSize: '14px',
      color: '#aaddff',
      fontStyle: 'bold',
    });

    this.textObject = scene.add.text(PADDING, PADDING + 20, '', {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: DIALOG_WIDTH - PADDING * 2 },
      lineSpacing: 4,
    });

    this.advanceIndicator = scene.add.text(
      DIALOG_WIDTH - PADDING,
      DIALOG_HEIGHT - PADDING,
      '▼',
      { fontSize: '14px', color: '#aaaaaa' }
    ).setOrigin(1, 1).setVisible(false);

    this.container = scene.add.container(DIALOG_X, DIALOG_Y, [
      this.background,
      this.nameText,
      this.textObject,
      this.advanceIndicator,
    ]);

    this.container.setDepth(100).setVisible(false).setScrollFactor(0);

    if (scene.input.keyboard) {
      this.advanceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
  }

  showDialog(pages: DialogPage[], onComplete?: () => void): void {
    this.pages = pages;
    this.currentPage = 0;
    this.onComplete = onComplete;
    this.container.setVisible(true);
    this.showPage(0);
  }

  async showChoice(prompt: string, choices: DialogChoice[]): Promise<string> {
    return new Promise((resolve) => {
      this.showDialog([{ text: prompt }], () => {
        this.showChoiceButtons(choices, resolve);
      });
    });
  }

  setTypeSpeed(speed: number): void {
    this.typeSpeed = speed;
  }

  destroy(): void {
    this.container.destroy();
  }

  private showPage(index: number): void {
    const page = this.pages[index];
    if (!page) return;

    this.nameText.setText(page.speakerName ?? '');
    this.textObject.setText('');
    this.advanceIndicator.setVisible(false);
    this.typeText(page.text).then(() => {
      this.advanceIndicator.setVisible(true);
      this.waitForAdvance();
    });
  }

  private async typeText(text: string): Promise<void> {
    this.isTyping = true;
    this.textObject.setText('');

    for (let i = 0; i <= text.length; i++) {
      if (!this.isTyping) {
        this.textObject.setText(text);
        break;
      }
      this.textObject.setText(text.slice(0, i));
      await delay(this.typeSpeed);
    }

    this.isTyping = false;
  }

  private waitForAdvance(): void {
    const checkAdvance = () => {
      if (!this.advanceKey) return;
      if (Phaser.Input.Keyboard.JustDown(this.advanceKey)) {
        this.advance();
      } else {
        this.scene.time.delayedCall(50, checkAdvance);
      }
    };
    this.scene.time.delayedCall(100, checkAdvance);
  }

  private advance(): void {
    if (this.isTyping) {
      this.isTyping = false;
      return;
    }

    const nextPage = this.currentPage + 1;
    if (nextPage < this.pages.length) {
      this.currentPage = nextPage;
      this.showPage(nextPage);
    } else {
      this.finish();
    }
  }

  private finish(): void {
    this.container.setVisible(false);
    this.pages = [];
    this.onComplete?.();
    this.onComplete = undefined;
  }

  private showChoiceButtons(choices: DialogChoice[], resolve: (value: string) => void): void {
    const buttonTexts: Phaser.GameObjects.Text[] = [];

    choices.forEach((choice, index) => {
      const btn = this.scene.add.text(
        DIALOG_X + PADDING,
        DIALOG_Y + PADDING + index * 28,
        `> ${choice.text}`,
        { fontSize: '16px', color: '#ffffff', backgroundColor: '#1a1a2e' }
      )
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(101)
        .on('pointerover', () => btn.setColor('#ffdd44'))
        .on('pointerout', () => btn.setColor('#ffffff'))
        .on('pointerdown', () => {
          buttonTexts.forEach((b) => b.destroy());
          resolve(choice.value);
        });

      buttonTexts.push(btn);
    });
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
