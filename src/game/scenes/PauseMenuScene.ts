import * as Phaser from 'phaser';
import { gameState } from '@/game/GameState';
import { BRO_MAP } from '@/data/bros';
import { ITEM_MAP } from '@/data/items';
import { SaveSystem } from '@/game/systems/SaveSystem';
import type { SaveData } from '@/types/save';

type MenuOption = 'PARTY' | 'BAG' | 'SAVE' | 'QUIT';

const MENU_OPTIONS: MenuOption[] = ['PARTY', 'BAG', 'SAVE', 'QUIT'];

export class PauseMenuScene extends Phaser.Scene {
  private selectedIndex = 0;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private detailContainer!: Phaser.GameObjects.Container;
  private currentView: 'menu' | 'party' | 'bag' = 'menu';

  constructor() {
    super({ key: 'PauseMenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Semi-transparent background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.75).setOrigin(0);

    // Title
    this.add.text(width / 2, 30, 'PAUSE', {
      fontSize: '28px',
      color: '#ffd700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Menu options on the right side
    const menuX = width - 140;
    const menuBg = this.add.rectangle(menuX - 40, 80, 160, MENU_OPTIONS.length * 40 + 20, 0x111111, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffffff, 0.4);

    MENU_OPTIONS.forEach((opt, i) => {
      const text = this.add.text(menuX, 100 + i * 40, opt, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'monospace',
      }).setOrigin(0, 0);
      this.menuTexts.push(text);
    });

    // Detail panel on the left
    this.detailContainer = this.add.container(0, 0);

    this.updateSelection();

    // Input
    this.input.keyboard!.on('keydown-UP', () => this.navigate(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.navigate(1));
    this.input.keyboard!.on('keydown-ENTER', () => this.select());
    this.input.keyboard!.on('keydown-Z', () => this.select());
    this.input.keyboard!.on('keydown-ESC', () => this.close());
    this.input.keyboard!.on('keydown-X', () => this.back());

    void menuBg;
  }

  private navigate(dir: number): void {
    if (this.currentView !== 'menu') return;
    this.selectedIndex = (this.selectedIndex + dir + MENU_OPTIONS.length) % MENU_OPTIONS.length;
    this.updateSelection();
  }

  private updateSelection(): void {
    this.menuTexts.forEach((text, i) => {
      text.setColor(i === this.selectedIndex ? '#ffd700' : '#ffffff');
    });
  }

  private select(): void {
    if (this.currentView !== 'menu') {
      this.back();
      return;
    }

    const option = MENU_OPTIONS[this.selectedIndex];
    switch (option) {
      case 'PARTY':
        this.showParty();
        break;
      case 'BAG':
        this.showBag();
        break;
      case 'SAVE':
        this.saveGame();
        break;
      case 'QUIT':
        this.quitToTitle();
        break;
    }
  }

  private back(): void {
    if (this.currentView !== 'menu') {
      this.currentView = 'menu';
      this.detailContainer.removeAll(true);
      return;
    }
    this.close();
  }

  private showParty(): void {
    this.currentView = 'party';
    this.detailContainer.removeAll(true);

    const party = gameState.party.getParty();
    if (party.length === 0) {
      const empty = this.add.text(40, 100, 'No Bros in party.', {
        fontSize: '16px', color: '#888888', fontFamily: 'monospace',
      });
      this.detailContainer.add(empty);
      return;
    }

    const title = this.add.text(40, 80, 'PARTY', {
      fontSize: '20px', color: '#ffd700', fontFamily: 'monospace', fontStyle: 'bold',
    });
    this.detailContainer.add(title);

    party.forEach((bro, i) => {
      const species = BRO_MAP[bro.speciesId];
      const name = bro.nickname ?? species?.name ?? 'Unknown';
      const type = species?.type?.toUpperCase() ?? '???';
      const staPercent = Math.round((bro.currentSTA / bro.stats.stamina) * 100);
      const yPos = 115 + i * 55;

      const bg = this.add.rectangle(40, yPos, 400, 45, 0x222222, 0.8)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x444444);

      const nameText = this.add.text(55, yPos + 6, `${name}`, {
        fontSize: '14px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
      });

      const levelText = this.add.text(200, yPos + 6, `Lv${bro.level}`, {
        fontSize: '14px', color: '#aaaaaa', fontFamily: 'monospace',
      });

      const typeText = this.add.text(260, yPos + 6, type, {
        fontSize: '12px', color: '#888888', fontFamily: 'monospace',
      });

      const staText = this.add.text(55, yPos + 24, `STA: ${bro.currentSTA}/${bro.stats.stamina} (${staPercent}%)`, {
        fontSize: '12px', color: staPercent > 50 ? '#66ff66' : staPercent > 25 ? '#ffff66' : '#ff6666', fontFamily: 'monospace',
      });

      const statusText = bro.statusEffect
        ? this.add.text(300, yPos + 24, bro.statusEffect.toUpperCase(), {
            fontSize: '11px', color: '#ff4444', fontFamily: 'monospace',
          })
        : null;

      const items: Phaser.GameObjects.GameObject[] = [bg, nameText, levelText, typeText, staText];
      if (statusText) items.push(statusText);
      this.detailContainer.add(items);
    });
  }

  private showBag(): void {
    this.currentView = 'bag';
    this.detailContainer.removeAll(true);

    const items = gameState.inventory.getAllItems();
    if (items.length === 0) {
      const empty = this.add.text(40, 100, 'Bag is empty.', {
        fontSize: '16px', color: '#888888', fontFamily: 'monospace',
      });
      this.detailContainer.add(empty);
      return;
    }

    const title = this.add.text(40, 80, 'BAG', {
      fontSize: '20px', color: '#ffd700', fontFamily: 'monospace', fontStyle: 'bold',
    });
    this.detailContainer.add(title);

    items.forEach((slot, i) => {
      const item = ITEM_MAP[slot.itemId];
      const yPos = 115 + i * 36;

      const nameText = this.add.text(55, yPos, `${item?.name ?? 'Unknown'} x${slot.quantity}`, {
        fontSize: '14px', color: '#ffffff', fontFamily: 'monospace',
      });

      const descText = this.add.text(55, yPos + 16, item?.description ?? '', {
        fontSize: '11px', color: '#888888', fontFamily: 'monospace',
      });

      this.detailContainer.add([nameText, descText]);
    });
  }

  private saveGame(): void {
    const saveData: SaveData = {
      version: 1,
      timestamp: Date.now(),
      playerName: gameState.playerName,
      playtime: 0,
      position: {
        zoneId: gameState.currentZoneId,
        x: 15,
        y: 15,
        facing: 'down',
      },
      party: [...gameState.party.getParty()] as import('@/types/save').SavedBro[],
      storage: [...gameState.party.getStorage()] as import('@/types/save').SavedBro[],
      inventory: [...gameState.inventory.getAllItems()] as import('@/types/items').InventorySlot[],
      badges: [...gameState.badges],
      storyFlags: { ...gameState.storyFlags },
      defeatedTrainers: [...gameState.defeatedTrainers],
      money: gameState.money,
    };

    const success = SaveSystem.save(0, saveData);

    this.detailContainer.removeAll(true);
    const msg = this.add.text(40, 150, success ? 'Game saved!' : 'Save failed!', {
      fontSize: '20px',
      color: success ? '#66ff66' : '#ff6666',
      fontFamily: 'monospace',
    });
    this.detailContainer.add(msg);

    this.time.delayedCall(1500, () => {
      this.detailContainer.removeAll(true);
    });
  }

  private quitToTitle(): void {
    this.scene.stop('OverworldScene');
    this.scene.stop('PauseMenuScene');
    this.scene.start('TitleScene');
  }

  private close(): void {
    this.scene.stop('PauseMenuScene');
    this.scene.resume('OverworldScene');
  }
}
