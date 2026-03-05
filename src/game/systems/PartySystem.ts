import type { SavedBro } from '@/types/save';
import { healBro } from '@/game/entities/BroInstance';

const MAX_PARTY_SIZE = 6;

export class PartySystem {
  private party: SavedBro[] = [];
  private storage: SavedBro[] = [];

  addToParty(bro: SavedBro): boolean {
    if (this.party.length >= MAX_PARTY_SIZE) return false;
    this.party.push(bro);
    return true;
  }

  removeFromParty(index: number): SavedBro | null {
    if (index < 0 || index >= this.party.length) return null;
    const [removed] = this.party.splice(index, 1);
    return removed;
  }

  swapPartyPositions(indexA: number, indexB: number): void {
    if (
      indexA < 0 || indexA >= this.party.length ||
      indexB < 0 || indexB >= this.party.length
    ) return;

    const temp = this.party[indexA];
    this.party[indexA] = this.party[indexB];
    this.party[indexB] = temp;
  }

  getParty(): readonly SavedBro[] {
    return this.party;
  }

  getFirstNonFainted(): SavedBro | null {
    return this.party.find((bro) => bro.currentSTA > 0) ?? null;
  }

  getFirstNonFaintedIndex(): number {
    return this.party.findIndex((bro) => bro.currentSTA > 0);
  }

  moveToStorage(partyIndex: number): void {
    const bro = this.removeFromParty(partyIndex);
    if (bro) this.storage.push(bro);
  }

  moveFromStorage(storageIndex: number): boolean {
    if (storageIndex < 0 || storageIndex >= this.storage.length) return false;
    if (this.party.length >= MAX_PARTY_SIZE) return false;

    const [bro] = this.storage.splice(storageIndex, 1);
    this.party.push(bro);
    return true;
  }

  healAll(): void {
    this.party = this.party.map(healBro);
  }

  getStorage(): readonly SavedBro[] {
    return this.storage;
  }

  isPartyFull(): boolean {
    return this.party.length >= MAX_PARTY_SIZE;
  }

  isPartyWiped(): boolean {
    return this.party.length > 0 && this.party.every((bro) => bro.currentSTA <= 0);
  }

  setParty(party: SavedBro[]): void {
    this.party = [...party];
  }

  setStorage(storage: SavedBro[]): void {
    this.storage = [...storage];
  }
}
