import * as Phaser from 'phaser';
import type { BattleParticipant, BattleAction, BattleConfig } from '@/types/battle';
import { BattleSystem } from '@/game/systems/BattleSystem';
import { BattleStateMachine } from '@/game/states/BattleStateMachine';
import { TextBox } from '@/game/ui/TextBox';
import { HealthBar } from '@/game/ui/HealthBar';
import { IntroState } from '@/game/states/battle-states/IntroState';
import { PlayerTurnState } from '@/game/states/battle-states/PlayerTurnState';
import { EnemyTurnState } from '@/game/states/battle-states/EnemyTurnState';
import { AttackState } from '@/game/states/battle-states/AttackState';
import { FaintState } from '@/game/states/battle-states/FaintState';
import { VictoryState } from '@/game/states/battle-states/VictoryState';
import { CatchState } from '@/game/states/battle-states/CatchState';
import { FleeState } from '@/game/states/battle-states/FleeState';
import { BRO_MAP } from '@/data/bros';
import { gameState } from '@/game/GameState';
import { addXP } from '@/game/entities/BroInstance';

type MenuSelection = 'fight' | 'bag' | 'bros' | 'run';

interface ExtendedParticipant extends BattleParticipant {
  broType: string;
  expYield: number;
  currentXP: number;
}

export class BattleScene extends Phaser.Scene {
  private playerSide!: ExtendedParticipant;
  private enemySide!: ExtendedParticipant;
  private playerAction!: BattleAction;
  private enemyAction!: BattleAction;
  private battleSystem!: BattleSystem;
  private stateMachine!: BattleStateMachine;
  private textBox!: TextBox;
  private playerHealthBar!: HealthBar;
  private enemyHealthBar!: HealthBar;
  private playerSprite!: Phaser.GameObjects.Image;
  private enemySprite!: Phaser.GameObjects.Image;
  private battleMenu!: Phaser.GameObjects.Container;
  private moveSelector!: Phaser.GameObjects.Container;
  private menuCallback?: (selection: MenuSelection) => void;
  private moveSelectorCallback?: (index: number) => void;
  private config!: BattleConfig;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(data: BattleConfig): void {
    this.config = data;
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);
    this.add.rectangle(0, height * 0.55, width, height * 0.45, 0x2a2a4e).setOrigin(0);

    // Build participant data
    this.enemySide = this.buildEnemyParticipant(data.enemyParty[0]);
    this.playerSide = this.buildPlayerParticipant();

    // Sprites
    const enemyTypeKey = `bro-${this.enemySide.broType}`;
    this.enemySprite = this.add.image(width * 0.7, height * 0.3, enemyTypeKey).setScale(1.5);
    const playerTypeKey = `bro-${this.playerSide.broType}`;
    this.playerSprite = this.add.image(width * 0.25, height * 0.55, playerTypeKey).setScale(1.5);

    // Health bars
    this.enemyHealthBar = new HealthBar(this, width * 0.45, height * 0.18, 160);
    this.playerHealthBar = new HealthBar(this, width * 0.05, height * 0.62, 160);

    // Text labels
    this.add.text(width * 0.45, height * 0.12, this.enemySide.name, {
      fontSize: '16px', color: '#ffffff', fontFamily: 'monospace',
    });
    this.add.text(width * 0.05, height * 0.57, this.playerSide.name, {
      fontSize: '16px', color: '#ffffff', fontFamily: 'monospace',
    });

    // TextBox
    this.textBox = new TextBox(this, 0, height - 90, width, 90);

    // Build menus (hidden initially)
    this.battleMenu = this.createBattleMenu();
    this.moveSelector = this.createMoveSelector();

    // Initialize systems
    this.battleSystem = new BattleSystem(this.playerSide, this.enemySide, data.isWild);
    this.stateMachine = new BattleStateMachine();

    this.stateMachine.addState('intro', new IntroState(this));
    this.stateMachine.addState('player_turn', new PlayerTurnState(this));
    this.stateMachine.addState('enemy_turn', new EnemyTurnState(this));
    this.stateMachine.addState('attack', new AttackState(this));
    this.stateMachine.addState('faint', new FaintState(this));
    this.stateMachine.addState('victory', new VictoryState(this));
    this.stateMachine.addState('catch', new CatchState(this));
    this.stateMachine.addState('flee', new FleeState(this));

    this.stateMachine.setState('intro');
  }

  update(time: number, delta: number): void {
    this.stateMachine.update(time, delta);
  }

  // --- Accessors used by battle states ---

  getPlayerAction(): BattleAction {
    return this.playerAction;
  }

  getEnemyAction(): BattleAction {
    return this.enemyAction;
  }

  setPlayerAction(action: BattleAction): void {
    this.playerAction = action;
  }

  setEnemyAction(action: BattleAction): void {
    this.enemyAction = action;
  }

  getBattleSystem(): BattleSystem {
    return this.battleSystem;
  }

  getBattleStateMachine(): BattleStateMachine {
    return this.stateMachine;
  }

  getPlayerSide(): ExtendedParticipant {
    return this.playerSide;
  }

  getEnemySide(): ExtendedParticipant {
    return this.enemySide;
  }

  getPlayerSprite(): Phaser.GameObjects.Image {
    return this.playerSprite;
  }

  getEnemySprite(): Phaser.GameObjects.Image {
    return this.enemySprite;
  }

  getEnemyCatchRate(): number {
    const species = BRO_MAP[this.enemySide.speciesId];
    return species?.catchRate ?? 128;
  }

  getTextBox(): TextBox {
    return this.textBox;
  }

  updateHealthBars(): void {
    this.playerHealthBar.setPercentage(this.playerSide.currentSTA / this.playerSide.maxSTA);
    this.enemyHealthBar.setPercentage(this.enemySide.currentSTA / this.enemySide.maxSTA);
  }

  showBattleMenu(callback: (selection: MenuSelection) => void): void {
    this.menuCallback = callback;
    this.battleMenu.setVisible(true);
  }

  hideBattleMenu(): void {
    this.battleMenu.setVisible(false);
    this.menuCallback = undefined;
  }

  showMoveSelector(callback: (moveIndex: number) => void): void {
    this.moveSelectorCallback = callback;
    this.moveSelector.setVisible(true);
  }

  hideMoveSelector(): void {
    this.moveSelector.setVisible(false);
    this.moveSelectorCallback = undefined;
  }

  applyLevelUp(newLevel: number): void {
    this.playerSide.level = newLevel;
    this.syncPlayerXpToParty();
  }

  syncPlayerXpToParty(): void {
    const activeBro = gameState.party.getFirstNonFainted();
    if (!activeBro) return;

    const xpGained = this.playerSide.currentXP;
    if (xpGained > 0) {
      addXP(activeBro, xpGained);
    }

    activeBro.currentSTA = this.playerSide.currentSTA;
    activeBro.level = this.playerSide.level;
    activeBro.statusEffect = this.playerSide.statusEffect;
  }

  onCatchSuccess(): void {
    // Will be connected to party system in integration step
  }

  endBattle(outcome: 'victory' | 'defeat' | 'flee'): void {
    this.syncPlayerXpToParty();

    this.time.delayedCall(300, () => {
      this.scene.stop('BattleScene');
      const overworld = this.scene.get('OverworldScene');
      if (overworld) {
        this.scene.resume('OverworldScene');
      } else {
        this.scene.start('OverworldScene');
      }
    });
  }

  // --- Private builders ---

  private buildEnemyParticipant(config: { speciesId: number; level: number }): ExtendedParticipant {
    const species = BRO_MAP[config.speciesId];
    const name = species?.name ?? `Bro #${config.speciesId}`;
    const level = config.level;

    const maxSTA = Math.floor(((species?.baseStats.stamina ?? 45) * 2 * level) / 100) + level + 10;

    const learnedMoves = (species?.learnset ?? [])
      .filter((entry) => entry.level <= level)
      .slice(-4)
      .map((entry) => ({ moveId: entry.moveId, currentPP: 20 }));

    const moves = learnedMoves.length > 0 ? learnedMoves : [{ moveId: 1, currentPP: 20 }];

    return {
      broInstanceId: `enemy-${Date.now()}`,
      speciesId: config.speciesId,
      name,
      level,
      currentSTA: maxSTA,
      maxSTA,
      stats: {
        stamina: species?.baseStats.stamina ?? 45,
        hype: species?.baseStats.hype ?? 45,
        clout: species?.baseStats.clout ?? 45,
        chill: species?.baseStats.chill ?? 45,
        drip: species?.baseStats.drip ?? 45,
        vibes: species?.baseStats.vibes ?? 45,
      },
      statStages: {
        stamina: 0, hype: 0, clout: 0, chill: 0, drip: 0, vibes: 0,
      },
      moves,
      statusEffect: null,
      statusTurns: 0,
      isPlayer: false,
      broType: species?.type ?? 'jock',
      expYield: species?.expYield ?? 50,
      currentXP: 0,
    };
  }

  private buildPlayerParticipant(): ExtendedParticipant {
    const activeBro = gameState.party.getFirstNonFainted();

    if (!activeBro) {
      // Fallback if player somehow enters battle without a Bro
      const maxSTA = 40;
      return {
        broInstanceId: 'player-bro-0',
        speciesId: 1,
        name: 'Lil Pledge',
        level: 5,
        currentSTA: maxSTA,
        maxSTA,
        stats: { stamina: 45, hype: 49, clout: 25, chill: 40, drip: 25, vibes: 35 },
        statStages: { stamina: 0, hype: 0, clout: 0, chill: 0, drip: 0, vibes: 0 },
        moves: [{ moveId: 1, currentPP: 20 }],
        statusEffect: null,
        statusTurns: 0,
        isPlayer: true,
        broType: 'jock',
        expYield: 0,
        currentXP: 0,
      };
    }

    const species = BRO_MAP[activeBro.speciesId];
    const displayName = activeBro.nickname ?? species?.name ?? `Bro #${activeBro.speciesId}`;
    const broType = species?.type ?? 'jock';
    const maxSTA = activeBro.stats.stamina;

    return {
      broInstanceId: activeBro.instanceId,
      speciesId: activeBro.speciesId,
      name: displayName,
      level: activeBro.level,
      currentSTA: activeBro.currentSTA,
      maxSTA,
      stats: { ...activeBro.stats },
      statStages: { stamina: 0, hype: 0, clout: 0, chill: 0, drip: 0, vibes: 0 },
      moves: activeBro.moves.length > 0
        ? activeBro.moves.map((m) => ({ moveId: m.moveId, currentPP: Math.max(m.currentPP, 10) }))
        : [{ moveId: 1, currentPP: 20 }],
      statusEffect: activeBro.statusEffect,
      statusTurns: 0,
      isPlayer: true,
      broType,
      expYield: 0,
      currentXP: activeBro.currentXP,
    };
  }

  private createBattleMenu(): Phaser.GameObjects.Container {
    const { width, height } = this.cameras.main;
    const container = this.add.container(width - 200, height - 90);

    const bg = this.add.rectangle(0, 0, 190, 90, 0x000000, 0.85).setOrigin(0);
    bg.setStrokeStyle(2, 0xffffff, 0.6);

    const options: Array<{ label: string; selection: MenuSelection }> = [
      { label: 'FIGHT', selection: 'fight' },
      { label: 'BAG', selection: 'bag' },
      { label: 'BROS', selection: 'bros' },
      { label: 'RUN', selection: 'run' },
    ];

    const texts = options.map((opt, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const text = this.add.text(20 + col * 90, 16 + row * 36, opt.label, {
        fontSize: '16px', color: '#ffffff', fontFamily: 'monospace',
      }).setInteractive({ useHandCursor: true });
      text.on('pointerdown', () => {
        this.menuCallback?.(opt.selection);
      });
      return text;
    });

    container.add([bg, ...texts]);
    container.setVisible(false);
    container.setDepth(20);

    // Keyboard navigation
    this.input.keyboard!.on('keydown-F', () => {
      if (container.visible) this.menuCallback?.('fight');
    });
    this.input.keyboard!.on('keydown-B', () => {
      if (container.visible) this.menuCallback?.('bag');
    });
    this.input.keyboard!.on('keydown-R', () => {
      if (container.visible) this.menuCallback?.('run');
    });

    return container;
  }

  private createMoveSelector(): Phaser.GameObjects.Container {
    const { width, height } = this.cameras.main;
    const container = this.add.container(0, height - 90);

    const bg = this.add.rectangle(0, 0, width - 200, 90, 0x000000, 0.85).setOrigin(0);
    bg.setStrokeStyle(2, 0xffffff, 0.6);

    // Move texts updated on show — we create 4 slots
    const moveSlots = Array.from({ length: 4 }, (_, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const text = this.add.text(20 + col * 150, 16 + row * 36, `Move ${i + 1}`, {
        fontSize: '15px', color: '#ffffff', fontFamily: 'monospace',
      }).setInteractive({ useHandCursor: true });
      text.on('pointerdown', () => {
        this.moveSelectorCallback?.(i);
      });
      return text;
    });

    container.add([bg, ...moveSlots]);
    container.setVisible(false);
    container.setDepth(20);

    // Key shortcuts
    ['ONE', 'TWO', 'THREE', 'FOUR'].forEach((key, i) => {
      this.input.keyboard!.on(`keydown-${key}`, () => {
        if (container.visible) this.moveSelectorCallback?.(i);
      });
    });

    return container;
  }
}
