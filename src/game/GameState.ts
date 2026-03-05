import { PartySystem } from '@/game/systems/PartySystem';
import { InventorySystem } from '@/game/systems/InventorySystem';

// Item IDs from data/items.ts
const ITEM_RED_SOLO_CUP = 1;
const ITEM_RUSH_FLYER = 5;

class GameStateManager {
  public party: PartySystem;
  public inventory: InventorySystem;
  public playerName: string = 'Pledge';
  public money: number = 500;
  public badges: string[] = [];
  public storyFlags: Record<string, boolean> = {};
  public defeatedTrainers: string[] = [];
  public currentZoneId: string = 'freshman-quad';

  private static instance: GameStateManager;

  private constructor() {
    this.party = new PartySystem();
    this.inventory = new InventorySystem();
    this.giveStartingItems();
  }

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  reset(): void {
    this.party = new PartySystem();
    this.inventory = new InventorySystem();
    this.playerName = 'Pledge';
    this.money = 500;
    this.badges = [];
    this.storyFlags = {};
    this.defeatedTrainers = [];
    this.currentZoneId = 'freshman-quad';
    this.giveStartingItems();
  }

  hasStarterBro(): boolean {
    return this.party.getParty().length > 0;
  }

  private giveStartingItems(): void {
    this.inventory.addItem(ITEM_RED_SOLO_CUP, 5);
    this.inventory.addItem(ITEM_RUSH_FLYER, 3);
  }
}

export const gameState = GameStateManager.getInstance();
