import Phaser from 'phaser';
import { MOVE_MAP } from '../../data/moves';
import { TYPE_COLORS } from '../../data/constants';

interface MoveSlot {
  moveId: number;
  currentPP: number;
}

export class MoveSelector extends Phaser.GameObjects.Container {
  private cursor = 0;
  private moves: MoveSlot[] = [];
  private onSelect: ((moveIndex: number) => void) | null = null;
  private onBack: (() => void) | null = null;
  private slots: Phaser.GameObjects.Container[] = [];
  private cursorText: Phaser.GameObjects.Text;
  private keyListeners: (() => void)[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);

    const background = scene.add
      .rectangle(0, 0, width, height, 0x111133, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xaaaaff, 0.6);
    this.add(background);

    const colWidth = width / 2;
    const rowHeight = height / 2;

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const container = scene.add.container(col * colWidth + 6, row * rowHeight + 6);
      this.add(container);
      this.slots.push(container);
    }

    this.cursorText = scene.add
      .text(0, 0, '>', { fontSize: '12px', color: '#ffdd00', fontFamily: 'monospace' })
      .setOrigin(0, 0);
    this.add(this.cursorText);

    scene.add.existing(this);
    this.setVisible(false);
  }

  show(
    moves: MoveSlot[],
    onSelect: (moveIndex: number) => void,
    onBack: () => void,
  ): void {
    this.moves = moves;
    this.onSelect = onSelect;
    this.onBack = onBack;
    this.cursor = 0;
    this.setVisible(true);
    this.renderSlots();
    this.updateCursor();
    this.bindKeys();
  }

  hide(): void {
    this.setVisible(false);
    this.unbindKeys();
    this.onSelect = null;
    this.onBack = null;
  }

  private renderSlots(): void {
    this.slots.forEach((container, index) => {
      container.removeAll(true);

      const moveSlot = this.moves[index];
      if (!moveSlot) {
        const empty = this.scene.add.text(0, 0, '—', {
          fontSize: '12px',
          color: '#666666',
          fontFamily: 'monospace',
        });
        container.add(empty);
        return;
      }

      const move = MOVE_MAP[moveSlot.moveId];
      if (!move) return;

      const color = TYPE_COLORS[move.type] ?? '#ffffff';

      const nameText = this.scene.add.text(14, 2, move.name, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace',
      });

      const typeText = this.scene.add.text(14, 16, move.type.toUpperCase(), {
        fontSize: '10px',
        color,
        fontFamily: 'monospace',
      });

      const ppText = this.scene.add.text(80, 16, `${moveSlot.currentPP}/${move.pp}`, {
        fontSize: '10px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      });

      container.add([nameText, typeText, ppText]);
    });
  }

  private updateCursor(): void {
    const colWidth = 128;
    const rowHeight = 40;
    const col = this.cursor % 2;
    const row = Math.floor(this.cursor / 2);
    this.cursorText.setPosition(col * colWidth + 2, row * rowHeight + 2);
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
    const onEsc = () => this.back();
    const onX = () => this.back();

    kb.on('keydown-LEFT', onLeft);
    kb.on('keydown-RIGHT', onRight);
    kb.on('keydown-UP', onUp);
    kb.on('keydown-DOWN', onDown);
    kb.on('keydown-ENTER', onEnter);
    kb.on('keydown-Z', onZ);
    kb.on('keydown-ESC', onEsc);
    kb.on('keydown-X', onX);

    this.keyListeners = [
      () => kb.off('keydown-LEFT', onLeft),
      () => kb.off('keydown-RIGHT', onRight),
      () => kb.off('keydown-UP', onUp),
      () => kb.off('keydown-DOWN', onDown),
      () => kb.off('keydown-ENTER', onEnter),
      () => kb.off('keydown-Z', onZ),
      () => kb.off('keydown-ESC', onEsc),
      () => kb.off('keydown-X', onX),
    ];
  }

  private unbindKeys(): void {
    this.keyListeners.forEach((fn) => fn());
    this.keyListeners = [];
  }

  private moveCursor(delta: number): void {
    const maxIndex = Math.min(3, this.moves.length - 1);
    this.cursor = Math.max(0, Math.min(maxIndex, this.cursor + delta));
    this.updateCursor();
  }

  private select(): void {
    const cb = this.onSelect;
    this.hide();
    cb?.(this.cursor);
  }

  private back(): void {
    const cb = this.onBack;
    this.hide();
    cb?.();
  }
}
