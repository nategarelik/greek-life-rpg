import Phaser from 'phaser';

const MENU_ITEMS = ['New Game', 'Continue', 'Settings'] as const;
type MenuItem = typeof MENU_ITEMS[number];

export class TitleScene extends Phaser.Scene {
  private selectedIndex = 0;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private selectionIndicator!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private canInput = true;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const cx = width / 2;

    this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);

    this.add.text(cx, 120, 'BRO-MON', {
      fontSize: '72px',
      color: '#ffd700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(cx, 195, 'Greek Life RPG', {
      fontSize: '22px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(cx, 240, 'Pledge Sigma Sigma Sigma', {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const menuStartY = 340;
    const menuSpacing = 48;

    MENU_ITEMS.forEach((item, index) => {
      const text = this.add.text(cx + 20, menuStartY + index * menuSpacing, item, {
        fontSize: '28px',
        color: '#ffffff',
        fontFamily: 'monospace',
      }).setOrigin(0.5);
      this.menuTexts.push(text);
    });

    this.selectionIndicator = this.add.text(cx - 80, menuStartY, '>', {
      fontSize: '28px',
      color: '#ffd700',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.updateSelection();
    this.setupInputHandlers();
  }

  private setupInputHandlers(): void {
    this.input.keyboard!.on('keydown-UP', () => {
      if (!this.canInput) return;
      this.selectedIndex = (this.selectedIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
      this.updateSelection();
    });

    this.input.keyboard!.on('keydown-DOWN', () => {
      if (!this.canInput) return;
      this.selectedIndex = (this.selectedIndex + 1) % MENU_ITEMS.length;
      this.updateSelection();
    });

    this.input.keyboard!.on('keydown-ENTER', () => {
      if (!this.canInput) return;
      this.selectMenuItem(MENU_ITEMS[this.selectedIndex]);
    });

    this.input.keyboard!.on('keydown-Z', () => {
      if (!this.canInput) return;
      this.selectMenuItem(MENU_ITEMS[this.selectedIndex]);
    });
  }

  private updateSelection(): void {
    const menuStartY = 340;
    const menuSpacing = 48;

    this.menuTexts.forEach((text, index) => {
      text.setColor(index === this.selectedIndex ? '#ffd700' : '#ffffff');
    });

    this.selectionIndicator.setY(menuStartY + this.selectedIndex * menuSpacing);

    this.tweens.add({
      targets: this.selectionIndicator,
      x: { from: 115, to: 120 },
      duration: 300,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private selectMenuItem(item: MenuItem): void {
    this.canInput = false;

    switch (item) {
      case 'New Game':
        this.cameras.main.fadeOut(500, 0, 0, 0, () => {
          this.scene.start('OverworldScene');
        });
        break;
      case 'Continue':
        this.showMessage('No save data found.');
        break;
      case 'Settings':
        this.showMessage('Settings coming soon.');
        break;
    }
  }

  private showMessage(msg: string): void {
    const { width, height } = this.cameras.main;
    const overlay = this.add.rectangle(width / 2, height / 2, 400, 80, 0x000000, 0.9)
      .setOrigin(0.5)
      .setDepth(10);
    const text = this.add.text(width / 2, height / 2, msg, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(11);

    this.time.delayedCall(1500, () => {
      overlay.destroy();
      text.destroy();
      this.canInput = true;
    });
  }
}
