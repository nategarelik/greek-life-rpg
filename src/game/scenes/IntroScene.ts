import * as Phaser from 'phaser';
import { gameState } from '@/game/GameState';
import { createStarterBro } from '@/game/entities/BroInstance';
import { BRO_MAP } from '@/data/bros';

interface StarterOption {
  speciesId: number;
  label: string;
  description: string;
  color: number;
}

const STARTER_OPTIONS: StarterOption[] = [
  {
    speciesId: 1,
    label: 'Lil Pledge',
    description: 'Strong and athletic.\nNever skips leg day.',
    color: 0xcc3333,
  },
  {
    speciesId: 7,
    label: 'Shy Nerd',
    description: 'Quiet but brilliant.\nWill carry you in exams.',
    color: 0x3333cc,
  },
  {
    speciesId: 10,
    label: 'Chill Dude',
    description: 'Relaxed vibes.\nNothing bothers this guy.',
    color: 0x33cc33,
  },
];

type IntroPhase = 'typewriter' | 'selection' | 'confirm' | 'done';

export class IntroScene extends Phaser.Scene {
  private phase: IntroPhase = 'typewriter';
  private selectedIndex = 0;
  private typewriterLines: string[] = [
    'Welcome to State University...',
    "You've just arrived for Rush Week\nat Sigma Sigma Sigma.",
    'But first... every pledge needs a Bro.',
  ];
  private currentLine = 0;
  private displayedText = '';
  private charIndex = 0;
  private typewriterEvent?: Phaser.Time.TimerEvent;
  private mainText!: Phaser.GameObjects.Text;
  private continueHint!: Phaser.GameObjects.Text;
  private starterCards: Phaser.GameObjects.Container[] = [];
  private selectionContainer!: Phaser.GameObjects.Container;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private canInput = false;

  constructor() {
    super({ key: 'IntroScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

    this.mainText = this.add.text(width / 2, height * 0.4, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center',
      wordWrap: { width: width * 0.8 },
    }).setOrigin(0.5).setDepth(5);

    this.continueHint = this.add.text(width / 2, height * 0.85, 'Press ENTER to continue', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(5).setVisible(false);

    this.tweens.add({
      targets: this.continueHint,
      alpha: { from: 1, to: 0.2 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.input.keyboard!.on('keydown-ENTER', () => this.handleEnter());
    this.input.keyboard!.on('keydown-Z', () => this.handleEnter());
    this.input.keyboard!.on('keydown-LEFT', () => this.handleLeft());
    this.input.keyboard!.on('keydown-RIGHT', () => this.handleRight());

    this.selectionContainer = this.add.container(0, 0);
    this.selectionContainer.setVisible(false);

    this.buildSelectionUI(width, height);

    this.cameras.main.setAlpha(0);
    this.tweens.add({
      targets: this.cameras.main,
      alpha: 1,
      duration: 800,
      onComplete: () => {
        this.startTypewriter();
      },
    });
  }

  private buildSelectionUI(width: number, height: number): void {
    const titleText = this.add.text(width / 2, 60, 'Choose your starter Bro!', {
      fontSize: '22px',
      color: '#ffd700',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(5);

    const cardWidth = 180;
    const cardHeight = 220;
    const spacing = 220;
    const startX = width / 2 - spacing;

    this.selectionContainer.add(titleText);

    for (let i = 0; i < STARTER_OPTIONS.length; i++) {
      const option = STARTER_OPTIONS[i];
      const cx = startX + i * spacing;
      const cy = height * 0.48;

      const card = this.createStarterCard(option, cardWidth, cardHeight, i === this.selectedIndex);
      card.setPosition(cx, cy);

      this.starterCards.push(card);
      this.selectionContainer.add(card);
    }

    const hintText = this.add.text(width / 2, height * 0.88, 'LEFT/RIGHT to select   ENTER to confirm', {
      fontSize: '13px',
      color: '#888888',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(5);

    this.selectionContainer.add(hintText);
  }

  private createStarterCard(
    option: StarterOption,
    cardWidth: number,
    cardHeight: number,
    selected: boolean,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);

    const borderColor = selected ? 0xffd700 : 0x444444;
    const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x111111).setOrigin(0.5);
    bg.setStrokeStyle(selected ? 3 : 1, borderColor);

    const shape = this.add.circle(0, -50, 36, option.color);

    const nameText = this.add.text(0, 10, option.label, {
      fontSize: '15px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    const species = BRO_MAP[option.speciesId];
    const typeText = this.add.text(0, 36, species ? species.type.toUpperCase() : '', {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const descText = this.add.text(0, 68, option.description, {
      fontSize: '12px',
      color: '#cccccc',
      fontFamily: 'monospace',
      align: 'center',
      wordWrap: { width: cardWidth - 16 },
    }).setOrigin(0.5);

    container.add([bg, shape, nameText, typeText, descText]);
    container.setDepth(6);

    return container;
  }

  private updateCardHighlight(): void {
    for (let i = 0; i < this.starterCards.length; i++) {
      const card = this.starterCards[i];
      const selected = i === this.selectedIndex;
      const bg = card.getAt(0) as Phaser.GameObjects.Rectangle;
      bg.setStrokeStyle(selected ? 3 : 1, selected ? 0xffd700 : 0x444444);
      card.setScale(selected ? 1.08 : 1.0);
    }
  }

  private startTypewriter(): void {
    this.phase = 'typewriter';
    this.currentLine = 0;
    this.typewriterLine(this.typewriterLines[0]);
  }

  private typewriterLine(line: string): void {
    this.displayedText = '';
    this.charIndex = 0;
    this.canInput = false;
    this.continueHint.setVisible(false);
    this.mainText.setText('');

    this.typewriterEvent = this.time.addEvent({
      delay: 40,
      repeat: line.length - 1,
      callback: () => {
        this.displayedText += line[this.charIndex];
        this.charIndex++;
        this.mainText.setText(this.displayedText);

        if (this.charIndex >= line.length) {
          this.canInput = true;
          this.continueHint.setVisible(true);
        }
      },
    });
  }

  private handleEnter(): void {
    if (this.phase === 'typewriter') {
      if (!this.canInput) {
        this.skipTypewriter();
        return;
      }

      this.currentLine++;
      if (this.currentLine < this.typewriterLines.length) {
        this.typewriterLine(this.typewriterLines[this.currentLine]);
      } else {
        this.showStarterSelection();
      }
      return;
    }

    if (this.phase === 'selection') {
      this.confirmSelection();
    }
  }

  private skipTypewriter(): void {
    if (this.typewriterEvent) {
      this.typewriterEvent.remove();
    }
    const line = this.typewriterLines[this.currentLine];
    this.mainText.setText(line);
    this.canInput = true;
    this.continueHint.setVisible(true);
  }

  private handleLeft(): void {
    if (this.phase !== 'selection') return;
    this.selectedIndex = (this.selectedIndex - 1 + STARTER_OPTIONS.length) % STARTER_OPTIONS.length;
    this.updateCardHighlight();
  }

  private handleRight(): void {
    if (this.phase !== 'selection') return;
    this.selectedIndex = (this.selectedIndex + 1) % STARTER_OPTIONS.length;
    this.updateCardHighlight();
  }

  private showStarterSelection(): void {
    this.phase = 'selection';
    this.continueHint.setVisible(false);

    this.tweens.add({
      targets: this.mainText,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.mainText.setText('').setAlpha(1);
        this.selectionContainer.setVisible(true);
        this.selectionContainer.setAlpha(0);
        this.tweens.add({
          targets: this.selectionContainer,
          alpha: 1,
          duration: 500,
        });
      },
    });
  }

  private confirmSelection(): void {
    this.phase = 'confirm';
    const option = STARTER_OPTIONS[this.selectedIndex];

    this.selectionContainer.setVisible(false);

    const { width, height } = this.cameras.main;
    const confirmText = this.add.text(
      width / 2,
      height / 2,
      `You chose ${option.label}!\nTime to start your rush.`,
      {
        fontSize: '22px',
        color: '#ffd700',
        fontFamily: 'monospace',
        align: 'center',
      },
    ).setOrigin(0.5).setDepth(10).setAlpha(0);

    this.tweens.add({
      targets: confirmText,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        this.time.delayedCall(1800, () => {
          this.finalizeStarterAndTransition(option);
        });
      },
    });
  }

  private finalizeStarterAndTransition(option: StarterOption): void {
    const species = BRO_MAP[option.speciesId];
    if (!species) return;

    gameState.reset();
    const starter = createStarterBro(option.speciesId, 5);
    starter.nickname = option.label;
    starter.originalTrainer = gameState.playerName;
    gameState.party.addToParty(starter);

    this.cameras.main.fadeOut(600, 0, 0, 0, () => {
      this.scene.start('OverworldScene');
    });
  }
}
