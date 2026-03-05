import type { SaveData } from '@/types/save';
import type { GameState } from '@/types/game-state';
import { SAVE_VERSION, MAX_SAVE_SLOTS } from '@/types/save';

export interface SaveSlotInfo {
  slot: number;
  exists: boolean;
  playerName?: string;
  playtime?: number;
  badges?: number;
  timestamp?: number;
}

export class SaveSystem {
  private static readonly SAVE_PREFIX = 'bromon_save_';

  static save(slot: number, data: SaveData): boolean {
    if (slot < 0 || slot >= MAX_SAVE_SLOTS) return false;
    try {
      localStorage.setItem(`${SaveSystem.SAVE_PREFIX}${slot}`, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  static load(slot: number): SaveData | null {
    if (slot < 0 || slot >= MAX_SAVE_SLOTS) return null;
    try {
      const raw = localStorage.getItem(`${SaveSystem.SAVE_PREFIX}${slot}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SaveData;
      if (parsed.version !== SAVE_VERSION) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  static getSaveSlotInfo(): SaveSlotInfo[] {
    const slots: SaveSlotInfo[] = [];

    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
      const data = SaveSystem.load(i);
      if (!data) {
        slots.push({ slot: i, exists: false });
      } else {
        slots.push({
          slot: i,
          exists: true,
          playerName: data.playerName,
          playtime: data.playtime,
          badges: data.badges.length,
          timestamp: data.timestamp,
        });
      }
    }

    return slots;
  }

  static deleteSave(slot: number): void {
    localStorage.removeItem(`${SaveSystem.SAVE_PREFIX}${slot}`);
  }

  static createSaveData(gameState: GameState, position: SaveData['position']): SaveData {
    return {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      playerName: gameState.playerName,
      playtime: gameState.playtime,
      position,
      party: gameState.party,
      storage: gameState.storage,
      inventory: gameState.inventory,
      badges: gameState.badges,
      storyFlags: gameState.storyFlags,
      defeatedTrainers: gameState.defeatedTrainers,
      money: gameState.money,
    };
  }
}
