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
import { MOVE_MAP } from '@/data/moves';
import { ITEM_MAP } from '@/data/items';
import { TYPE_COLORS } from '@/data/constants';
import { gameState } from '@/game/GameState';
import { createWildBro, calculateStatsForLevel, generateRandomIVs } from '@/game/entities/BroInstance';
import { DefeatState } from '@/game/states/battle-states/DefeatState';
import { GlowUpState } from '@/game/states/battle-states/GlowUpState';
import type { SavedBro } from '@/types/save';

type MenuSelection = 'fight' | 'bag' | 'bros' | 'run';

export class BattleScene extends Phaser.Scene {
  private playerSide!: BattleParticipant;
  private enemySide!: BattleParticipant;
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
  private moveSlotTexts: Phaser.GameObjects.Text[] = [];
  private itemSelector!: Phaser.GameObjects.Container;
  private partySelector!: Phaser.GameObjects.Container;
  private itemSelectorCallback?: (itemId: number) => void;
  private partySelectorCallback?: (partyIndex: number) => void;
  private catchState!: CatchState;
  private menuCallback?: (selection: MenuSelection) => void;
  private moveSelectorCallback?: (index: number) => void;
  private config!: BattleConfig;
  private currentEnemyIndex = 0;

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
    this.itemSelector = this.createItemSelectorContainer();
    this.partySelector = this.createPartySelectorContainer();

    // Initialize systems
    this.battleSystem = new BattleSystem(this.playerSide, this.enemySide, data.isWild);
    this.stateMachine = new BattleStateMachine();

    this.stateMachine.addState('intro', new IntroState(this));
    this.stateMachine.addState('player_turn', new PlayerTurnState(this));
    this.stateMachine.addState('enemy_turn', new EnemyTurnState(this));
    this.stateMachine.addState('attack', new AttackState(this));
    this.stateMachine.addState('faint', new FaintState(this));
    this.stateMachine.addState('victory', new VictoryState(this));
    this.catchState = new CatchState(this);
    this.stateMachine.addState('catch', this.catchState);
    this.stateMachine.addState('flee', new FleeState(this));
    this.stateMachine.addState('defeat', new DefeatState(this));
    this.stateMachine.addState('glow_up', new GlowUpState(this));

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

  getPlayerSide(): BattleParticipant {
    return this.playerSide;
  }

  getEnemySide(): BattleParticipant {
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
    for (let i = 0; i < 4; i++) {
      const moveEntry = this.playerSide.moves[i];
      if (moveEntry) {
        const move = MOVE_MAP[moveEntry.moveId];
        if (move) {
          const ppText = `${moveEntry.currentPP}/${move.pp}`;
          this.moveSlotTexts[i].setText(`${move.name} ${ppText}`);
          const typeColor = TYPE_COLORS[move.type] ?? '#ffffff';
          if (moveEntry.currentPP <= 0) {
            this.moveSlotTexts[i].setColor('#666666');
            this.moveSlotTexts[i].disableInteractive();
          } else {
            this.moveSlotTexts[i].setColor(typeColor);
            this.moveSlotTexts[i].setInteractive({ useHandCursor: true });
          }
        } else {
          this.moveSlotTexts[i].setText('--');
          this.moveSlotTexts[i].setColor('#666666');
          this.moveSlotTexts[i].disableInteractive();
        }
      } else {
        this.moveSlotTexts[i].setText('--');
        this.moveSlotTexts[i].setColor('#666666');
        this.moveSlotTexts[i].disableInteractive();
      }
    }
    this.moveSelector.setVisible(true);
  }

  hideMoveSelector(): void {
    this.moveSelector.setVisible(false);
    this.moveSelectorCallback = undefined;
  }

  syncPlayerXpToParty(): void {
    const activeBro = gameState.party.getFirstNonFainted();
    if (!activeBro) return;

    activeBro.currentSTA = this.playerSide.currentSTA;
    activeBro.level = this.playerSide.level;
    activeBro.statusEffect = this.playerSide.statusEffect;
  }

  onCatchSuccess(): void {
    const caught = createWildBro(this.enemySide.speciesId, this.enemySide.level);
    const added = gameState.party.addToParty(caught);
    if (!added) {
      const currentStorage = [...gameState.party.getStorage(), caught];
      gameState.party.setStorage(currentStorage);
    }
  }

  getCatchState(): CatchState {
    return this.catchState;
  }

  switchActiveBro(bro: SavedBro): void {
    const species = BRO_MAP[bro.speciesId];
    const displayName = bro.nickname ?? species?.name ?? `Bro #${bro.speciesId}`;
    const broType = species?.type ?? 'jock';

    this.playerSide = {
      broInstanceId: bro.instanceId,
      speciesId: bro.speciesId,
      name: displayName,
      level: bro.level,
      currentSTA: bro.currentSTA,
      maxSTA: bro.stats.stamina,
      stats: { ...bro.stats },
      statStages: { stamina: 0, hype: 0, clout: 0, chill: 0, drip: 0, vibes: 0 },
      moves: bro.moves.length > 0
        ? bro.moves.map((m) => ({ moveId: m.moveId, currentPP: m.currentPP }))
        : [{ moveId: 1, currentPP: 20 }],
      statusEffect: bro.statusEffect,
      statusTurns: 0,
      isPlayer: true,
      broType,
      expYield: 0,
      currentXP: bro.currentXP,
    };

    const playerTypeKey = `bro-${broType}`;
    this.playerSprite.setTexture(playerTypeKey);
    this.updateHealthBars();
    this.battleSystem = new BattleSystem(this.playerSide, this.enemySide, this.config.isWild);
  }

  // Evolution support — will be populated by GlowUpState (Phase 2)
  private evolveTargetData?: { bro: SavedBro; toSpeciesId: number };

  setEvolveTarget(data: { bro: SavedBro; toSpeciesId: number }): void {
    this.evolveTargetData = data;
  }

  getEvolveTarget(): { bro: SavedBro; toSpeciesId: number } | undefined {
    return this.evolveTargetData;
  }

  hasState(name: string): boolean {
    return this.stateMachine.hasState(name);
  }

  getConfig(): BattleConfig {
    return this.config;
  }

  advanceEnemyBro(): boolean {
    this.currentEnemyIndex++;
    if (this.currentEnemyIndex >= this.config.enemyParty.length) return false;

    this.enemySide = this.buildEnemyParticipant(this.config.enemyParty[this.currentEnemyIndex]);
    this.battleSystem = new BattleSystem(this.playerSide, this.enemySide, this.config.isWild);

    const enemyTypeKey = `bro-${this.enemySide.broType}`;
    this.enemySprite.setTexture(enemyTypeKey);
    this.updateHealthBars();
    return true;
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

  showItemSelector(callback: (itemId: number) => void): void {
    this.itemSelectorCallback = callback;
    this.itemSelector.removeAll(true);
    const { width } = this.cameras.main;
    const panelW = 260;
    const panelX = (width - panelW) / 2;

    const allItems = gameState.inventory.getAllItems().filter((slot) => {
      if (slot.quantity <= 0) return false;
      const item = ITEM_MAP[slot.itemId];
      return item && (item.category === 'healing' || item.category === 'battle' || item.category === 'ball');
    });

    const rowH = 32;
    const rows = allItems.length + 1; // +1 for Cancel
    const panelH = 40 + rows * rowH;

    const bg = this.add.rectangle(0, 0, panelW, panelH, 0x000000, 0.92).setOrigin(0);
    bg.setStrokeStyle(2, 0xffffff, 0.7);
    this.itemSelector.add(bg);
    this.itemSelector.setPosition(panelX, 60);

    const title = this.add.text(10, 8, 'BAG', { fontSize: '16px', color: '#ffdd44', fontFamily: 'monospace' });
    this.itemSelector.add(title);

    allItems.forEach((slot, idx) => {
      const item = ITEM_MAP[slot.itemId];
      const label = `${item?.name ?? 'Unknown'}  x${slot.quantity}`;
      const txt = this.add.text(14, 36 + idx * rowH, label, {
        fontSize: '14px', color: '#ffffff', fontFamily: 'monospace',
      }).setInteractive({ useHandCursor: true });
      txt.on('pointerover', () => txt.setColor('#ffdd44'));
      txt.on('pointerout', () => txt.setColor('#ffffff'));
      txt.on('pointerdown', () => {
        this.hideItemSelector();
        this.itemSelectorCallback?.(slot.itemId);
      });
      this.itemSelector.add(txt);
    });

    const cancelTxt = this.add.text(14, 36 + allItems.length * rowH, '[Cancel]', {
      fontSize: '14px', color: '#aaaaaa', fontFamily: 'monospace',
    }).setInteractive({ useHandCursor: true });
    cancelTxt.on('pointerover', () => cancelTxt.setColor('#ffdd44'));
    cancelTxt.on('pointerout', () => cancelTxt.setColor('#aaaaaa'));
    cancelTxt.on('pointerdown', () => {
      this.hideItemSelector();
      this.itemSelectorCallback?.(-1);
    });
    this.itemSelector.add(cancelTxt);

    this.itemSelector.setVisible(true);
  }

  hideItemSelector(): void {
    this.itemSelector.setVisible(false);
    this.itemSelectorCallback = undefined;
  }

  showPartySelector(callback: (partyIndex: number) => void): void {
    this.partySelectorCallback = callback;
    this.partySelector.removeAll(true);
    const { width } = this.cameras.main;
    const panelW = 300;
    const panelX = (width - panelW) / 2;

    const party = gameState.party.getParty();
    const activeBroId = this.playerSide.broInstanceId;

    const rowH = 36;
    const rows = party.length + 1; // +1 for Cancel
    const panelH = 44 + rows * rowH;

    const bg = this.add.rectangle(0, 0, panelW, panelH, 0x000000, 0.92).setOrigin(0);
    bg.setStrokeStyle(2, 0xffffff, 0.7);
    this.partySelector.add(bg);
    this.partySelector.setPosition(panelX, 40);

    const title = this.add.text(10, 8, 'PARTY', { fontSize: '16px', color: '#ffdd44', fontFamily: 'monospace' });
    this.partySelector.add(title);

    party.forEach((bro, idx) => {
      const species = BRO_MAP[bro.speciesId];
      const name = bro.nickname ?? species?.name ?? 'Unknown';
      const isActive = bro.instanceId === activeBroId;
      const isFainted = bro.currentSTA <= 0;
      const hpPct = Math.max(0, bro.currentSTA / bro.stats.stamina);
      const hpBars = Math.round(hpPct * 8);
      const hpBar = '█'.repeat(hpBars) + '░'.repeat(8 - hpBars);
      const prefix = isActive ? '► ' : '  ';
      const label = `${prefix}${name} Lv.${bro.level}  ${hpBar}`;

      let color = '#ffffff';
      if (isActive) color = '#aaffaa';
      if (isFainted) color = '#666666';

      const txt = this.add.text(10, 36 + idx * rowH, label, {
        fontSize: '13px', color, fontFamily: 'monospace',
      });

      if (!isActive && !isFainted) {
        txt.setInteractive({ useHandCursor: true });
        txt.on('pointerover', () => txt.setColor('#ffdd44'));
        txt.on('pointerout', () => txt.setColor(color));
        txt.on('pointerdown', () => {
          this.hidePartySelector();
          this.partySelectorCallback?.(idx);
        });
      }
      this.partySelector.add(txt);
    });

    const cancelTxt = this.add.text(10, 36 + party.length * rowH, '[Cancel]', {
      fontSize: '13px', color: '#aaaaaa', fontFamily: 'monospace',
    }).setInteractive({ useHandCursor: true });
    cancelTxt.on('pointerover', () => cancelTxt.setColor('#ffdd44'));
    cancelTxt.on('pointerout', () => cancelTxt.setColor('#aaaaaa'));
    cancelTxt.on('pointerdown', () => {
      this.hidePartySelector();
      this.partySelectorCallback?.(-1);
    });
    this.partySelector.add(cancelTxt);

    this.partySelector.setVisible(true);
  }

  hidePartySelector(): void {
    this.partySelector.setVisible(false);
    this.partySelectorCallback = undefined;
  }

  // --- Private builders ---

  private buildEnemyParticipant(config: { speciesId: number; level: number }): BattleParticipant {
    const species = BRO_MAP[config.speciesId];
    const name = species?.name ?? `Bro #${config.speciesId}`;
    const level = config.level;

    const ivs = generateRandomIVs();
    const baseStats = species?.baseStats ?? { stamina: 45, hype: 45, clout: 45, chill: 45, drip: 45, vibes: 45 };
    const stats = species
      ? calculateStatsForLevel(species, level, ivs)
      : calculateStatsForLevel({ id: config.speciesId, name, type: 'jock', baseStats, description: '', learnset: [], catchRate: 128, expYield: 64, spriteKey: 'bro-jock' }, level, ivs);

    const learnedMoves = (species?.learnset ?? [])
      .filter((entry) => entry.level <= level)
      .slice(-4)
      .map((entry) => ({ moveId: entry.moveId, currentPP: MOVE_MAP[entry.moveId]?.pp ?? 20 }));

    const moves = learnedMoves.length > 0 ? learnedMoves : [{ moveId: 1, currentPP: MOVE_MAP[1]?.pp ?? 20 }];

    return {
      broInstanceId: `enemy-${Date.now()}`,
      speciesId: config.speciesId,
      name,
      level,
      currentSTA: stats.stamina,
      maxSTA: stats.stamina,
      stats,
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

  private buildPlayerParticipant(): BattleParticipant {
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
        ? activeBro.moves.map((m) => ({ moveId: m.moveId, currentPP: m.currentPP }))
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

  private createItemSelectorContainer(): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    container.setVisible(false);
    container.setDepth(30);
    return container;
  }

  private createPartySelectorContainer(): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    container.setVisible(false);
    container.setDepth(30);
    return container;
  }

  private createMoveSelector(): Phaser.GameObjects.Container {
    const { width, height } = this.cameras.main;
    const container = this.add.container(0, height - 90);

    const bg = this.add.rectangle(0, 0, width - 200, 90, 0x000000, 0.85).setOrigin(0);
    bg.setStrokeStyle(2, 0xffffff, 0.6);

    // Move texts updated on show — we create 4 slots
    this.moveSlotTexts = Array.from({ length: 4 }, (_, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const text = this.add.text(20 + col * 150, 16 + row * 36, '--', {
        fontSize: '15px', color: '#ffffff', fontFamily: 'monospace',
      }).setInteractive({ useHandCursor: true });
      text.on('pointerdown', () => {
        const moveEntry = this.playerSide.moves[i];
        if (moveEntry && moveEntry.currentPP <= 0) return;
        this.moveSelectorCallback?.(i);
      });
      return text;
    });

    container.add([bg, ...this.moveSlotTexts]);
    container.setVisible(false);
    container.setDepth(20);

    // Key shortcuts — skip 0-PP moves
    ['ONE', 'TWO', 'THREE', 'FOUR'].forEach((key, i) => {
      this.input.keyboard!.on(`keydown-${key}`, () => {
        if (!container.visible) return;
        const moveEntry = this.playerSide.moves[i];
        if (moveEntry && moveEntry.currentPP <= 0) return;
        this.moveSelectorCallback?.(i);
      });
    });

    return container;
  }
}
