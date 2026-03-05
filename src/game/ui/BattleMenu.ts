import Phaser from 'phaser';

type MenuSelection = 'fight' | 'bag' | 'bros' | 'run';

const MENU_ITEMS: MenuSelection[] = ['fight', 'bag', 'bros', 'run'];
const LABELS: Record<MenuSelection, string> = {
  fight: 'FIGHT',
  bag: 'BAG',
  bros: 'BROS',
  run: 'RUN',
};

export class BattleMenu extends Phaser.GameObjects.Container {
  private cursor = 0;
  private onSelect: ((selection: MenuSelection) => void) | null = null;
  private itemTexts: Phaser.GameObjects.Text[] = [];
  private cursorText: Phaser.GameObjects.Text;
  private keyListeners: (() => void)[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);

    const background = scene.add
      .rectangle(0, 0, width, height, 0x111111, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffffff, 0.5);

    this.add(background);

    const colWidth = width / 2;
    const rowHeight = height / 2;

    MENU_ITEMS.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const tx = col * colWidth + 24;
      const ty = row * rowHeight + 12;

      const text = scene.add
        .text(tx, ty, LABELS[item], {
          fontSize: '14px',
          color: '#ffffff',
          fontFamily: 'monospace',
        })
        .setOrigin(0, 0);

      this.add(text);
      this.itemTexts.push(text);
    });

    this.cursorText = scene.add
      .text(0, 0, '>', { fontSize: '14px', color: '#ffdd00', fontFamily: 'monospace' })
      .setOrigin(0, 0);
    this.add(this.cursorText);

    scene.add.existing(this);
  }

  show(onSelect: (selection: MenuSelection) => void): void {
    this.onSelect = onSelect;
    this.cursor = 0;
    this.setVisible(true);
    this.updateCursor();
    this.bindKeys();
  }

  hide(): void {
    this.setVisible(false);
    this.unbindKeys();
    this.onSelect = null;
  }

  private updateCursor(): void {
    const col = this.cursor % 2;
    const row = Math.floor(this.cursor / 2);
    const colWidth = 120;
    const rowHeight = 32;
    this.cursorText.setPosition(col * colWidth + 8, row * rowHeight + 12);
  }

  private bindKeys(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    const onLeft = () => this.moveCursor(-1);
    const onRight = () => this.moveCursor(1);
    const onUp = () => this.moveCursor(-2);
    const onDown = () => this.moveCursor(2);
    const onEnter = () => this.select();
    const onZ = () => this.select();

    kb.on('keydown-LEFT', onLeft);
    kb.on('keydown-RIGHT', onRight);
    kb.on('keydown-UP', onUp);
    kb.on('keydown-DOWN', onDown);
    kb.on('keydown-ENTER', onEnter);
    kb.on('keydown-Z', onZ);

    this.keyListeners = [
      () => kb.off('keydown-LEFT', onLeft),
      () => kb.off('keydown-RIGHT', onRight),
      () => kb.off('keydown-UP', onUp),
      () => kb.off('keydown-DOWN', onDown),
      () => kb.off('keydown-ENTER', onEnter),
      () => kb.off('keydown-Z', onZ),
    ];
  }

  private unbindKeys(): void {
    this.keyListeners.forEach((fn) => fn());
    this.keyListeners = [];
  }

  private moveCursor(delta: number): void {
    this.cursor = Math.max(0, Math.min(3, this.cursor + delta));
    this.updateCursor();
  }

  private select(): void {
    const selection = MENU_ITEMS[this.cursor];
    this.hide();
    this.onSelect?.(selection);
  }
}
