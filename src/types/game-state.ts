import type { SavedBro } from './save';
import type { InventorySlot } from './items';

export interface GameState {
  playerName: string;
  party: SavedBro[];
  storage: SavedBro[];
  inventory: InventorySlot[];
  money: number;
  badges: string[];
  storyFlags: Record<string, boolean>;
  defeatedTrainers: string[];
  currentZoneId: string;
  playtime: number;
}
