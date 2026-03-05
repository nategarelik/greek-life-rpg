import type { Item } from '../types/items';

export const ITEMS: Item[] = [
  // ── Healing items ────────────────────────────────────────────────
  {
    id: 1,
    name: 'Red Solo Cup',
    category: 'healing',
    description: 'A classic. Restores 20 STA to one Bro.',
    price: 100,
    healAmount: 20,
  },
  {
    id: 2,
    name: 'Energy Drink',
    category: 'healing',
    description: 'Slams the system awake. Restores 50 STA to one Bro.',
    price: 300,
    healAmount: 50,
  },
  {
    id: 3,
    name: 'Meal Swipe',
    category: 'healing',
    description: 'Full dining hall access. Fully restores one Bro\'s STA.',
    price: 800,
    healAmount: 9999,
  },

  // ── Key items ────────────────────────────────────────────────────
  {
    id: 4,
    name: 'Fake ID',
    category: 'key',
    description: 'Gets you in anywhere — and grants one Bro an instant level-up.',
    price: 2000,
    levelBoost: 1,
  },

  // ── Catch balls ──────────────────────────────────────────────────
  {
    id: 5,
    name: 'Rush Flyer',
    category: 'ball',
    description: 'A standard recruitment flyer. Catches Bros at normal rate.',
    price: 200,
    catchModifier: 1.0,
  },
  {
    id: 6,
    name: 'VIP Wristband',
    category: 'ball',
    description: 'The premium treatment. Boosts catch rate by 1.5×.',
    price: 600,
    catchModifier: 1.5,
  },
  {
    id: 7,
    name: 'Legacy Invite',
    category: 'ball',
    description: 'Reserved for the elite. Doubles the base catch rate.',
    price: 1200,
    catchModifier: 2.0,
  },

  // ── Status cures ─────────────────────────────────────────────────
  {
    id: 8,
    name: 'Hangover Cure',
    category: 'battle',
    description: 'A greasy breakfast and Gatorade. Cures the hungover status.',
    price: 150,
    curesStatus: false,
  },
  {
    id: 9,
    name: 'Clout Restorer',
    category: 'battle',
    description: 'A PR package delivered overnight. Cures any status condition.',
    price: 500,
    curesStatus: true,
  },
] as const satisfies Item[];

export const ITEM_MAP: Record<number, Item> = Object.fromEntries(
  ITEMS.map((i) => [i.id, i])
);
