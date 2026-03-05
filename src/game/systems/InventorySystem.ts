import type { InventorySlot } from '@/types/items';

export class InventorySystem {
  private inventory: InventorySlot[] = [];

  addItem(itemId: number, quantity: number = 1): void {
    const existing = this.inventory.find((slot) => slot.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.inventory.push({ itemId, quantity });
    }
  }

  removeItem(itemId: number, quantity: number = 1): boolean {
    const slot = this.inventory.find((s) => s.itemId === itemId);
    if (!slot || slot.quantity < quantity) return false;

    slot.quantity -= quantity;
    if (slot.quantity === 0) {
      this.inventory = this.inventory.filter((s) => s.itemId !== itemId);
    }
    return true;
  }

  getQuantity(itemId: number): number {
    return this.inventory.find((s) => s.itemId === itemId)?.quantity ?? 0;
  }

  hasItem(itemId: number): boolean {
    return this.getQuantity(itemId) > 0;
  }

  getItemsByCategory(_category: string): InventorySlot[] {
    // Category filtering requires item data lookup; callers provide item definitions.
    // This returns all slots — category filtering happens at the call site with item data.
    return [...this.inventory];
  }

  getAllItems(): readonly InventorySlot[] {
    return this.inventory;
  }

  setInventory(inventory: InventorySlot[]): void {
    this.inventory = [...inventory];
  }
}
