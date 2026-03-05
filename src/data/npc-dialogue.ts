/**
 * NPC dialogue organized by dialogue ID.
 * Keys map to NPCSpawn.dialogueId in the map zone data.
 */
export const NPC_DIALOGUE: Record<string, string[]> = {
  // ── Tutorial NPCs ────────────────────────────────────────────────
  tutorial_guide_intro: [
    'Welcome to Greek Row! I\'m your RA — Resident Advisor, not Rush Advisor.',
    'This campus is crawling with Bros. You\'ll need to recruit your own crew.',
    'Talk to Bros in the wild to start a battle. If you win, they might join your party!',
  ],
  tutorial_guide_battle: [
    'Each Bro has Stamina (STA) — their HP. When it hits zero, they\'re out.',
    'Use moves wisely. Each type has strengths and weaknesses.',
    'You can carry up to 6 Bros in your party at a time.',
  ],
  tutorial_guide_catch: [
    'Want to catch a wild Bro? Weaken them first, then throw a Rush Flyer!',
    'Rarer Bros need better catch items — VIP Wristbands or Legacy Invites.',
    'Bros with lower STA are easier to catch. Don\'t knock them out!',
  ],
  tutorial_guide_items: [
    'Stop by the Student Union for supplies.',
    'Red Solo Cups restore a little STA. Energy Drinks do more.',
    'Meal Swipes are rare, but they fully restore your Bro\'s Stamina.',
  ],
  tutorial_guide_evolution: [
    'Your Bros grow stronger as they level up — and some even evolve!',
    'When a Bro glows up, their stats improve dramatically.',
    'Stick with your crew and they\'ll reach their full potential.',
  ],

  // ── Heal station ─────────────────────────────────────────────────
  heal_station_default: [
    'Yo, need your Bros patched up?',
    'I\'ve got connections at the campus clinic. I can restore your whole party.',
    '...',
    'Your Bros have been fully healed!',
  ],
  heal_station_no_party: [
    'You don\'t have any Bros with you.',
    'Go find some — the freshman quad is a good place to start.',
  ],

  // ── Shop keeper ──────────────────────────────────────────────────
  shopkeeper_greeting: [
    'Hey! Welcome to the Student Union shop.',
    'We\'ve got Rush Flyers, healing supplies, and more.',
    'What can I get you?',
  ],
  shopkeeper_farewell: [
    'Come back anytime!',
    'Stay hydrated out there.',
  ],
  shopkeeper_no_money: [
    'Oof. You\'re broke, bro.',
    'Hit up your parents or go win some battles first.',
  ],

  // ── Random campus NPCs ───────────────────────────────────────────
  npc_generic_1: [
    'I heard the Alpha house has a super strong Chapter President.',
    'You\'ll need at least three badges before he\'ll face you.',
  ],
  npc_generic_2: [
    'The Gamma Grind nerds are terrifying in battle.',
    'Don\'t let the cardigans fool you.',
  ],
  npc_generic_3: [
    'Some Bros only appear at certain times of day.',
    'Try exploring at night for rarer encounters.',
  ],
  npc_generic_4: [
    'I once saw a Zen Master take on four Bros at once and not even flinch.',
    'True story.',
  ],
  npc_generic_5: [
    'The Void Walker from Zeta Zero gave me nightmares.',
    'And I wasn\'t even in the battle.',
  ],

  // ── Post-defeat trainer dialogue ─────────────────────────────────
  trainer_chad_defeated: [
    'Bro...',
    'I can\'t believe I lost on my own turf.',
    'You\'ve got what it takes. Don\'t waste it.',
  ],
  trainer_biff_defeated: [
    'My portfolio... decimated.',
    'I\'ll need to call my financial advisor.',
  ],
  trainer_newton_defeated: [
    'Fascinating. My models were incorrect.',
    'I will be publishing a correction.',
  ],
  trainer_blaze_defeated: [
    'Whoa...',
    'That was... a journey, man.',
  ],
  trainer_raven_defeated: [
    'You dropped the set.',
    'Respect.',
  ],
  trainer_mortem_defeated: [
    'The void shifts...',
    'You are... unexpected.',
  ],
};
