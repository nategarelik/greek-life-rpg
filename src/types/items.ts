export type ItemCategory = 'healing' | 'ball' | 'battle' | 'key';

export interface Item {
  id: number;
  name: string;
  category: ItemCategory;
  description: string;
  price: number;
  healAmount?: number;        // for healing items
  catchModifier?: number;     // for balls (1.0 = Rush Flyer, 1.5 = VIP, 2.0 = Legacy)
  levelBoost?: number;        // for Fake ID
  curesStatus?: boolean;      // full restore
}

export interface InventorySlot {
  itemId: number;
  quantity: number;
}
