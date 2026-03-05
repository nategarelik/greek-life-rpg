import type { BattleConfig } from '../types/battle';

export interface TrainerData {
  id: string;
  name: string;
  title: string;
  house: string;
  badge: string;
  spriteKey: string;
  battleConfig: BattleConfig;
  preDialogue: string[];
  postDialogue: string[];
}

export const TRAINERS: TrainerData[] = [
  {
    id: 'captain_chad',
    name: 'Captain Chad',
    title: 'Chapter Captain',
    house: 'Alpha Alpha Alpha',
    badge: 'Gainz Badge',
    spriteKey: 'trainer_captain_chad',
    battleConfig: {
      isWild: false,
      trainerName: 'Captain Chad',
      trainerSprite: 'trainer_captain_chad',
      enemyParty: [
        { speciesId: 1, level: 18 },
        { speciesId: 2, level: 20 },
        { speciesId: 2, level: 22 },
      ],
      bgmKey: 'bgm_trainer_battle',
      backgroundKey: 'bg_gym',
    },
    preDialogue: [
      'You want a piece of the Alpha house? You\'ll have to get through my Bros first.',
      'Pledges don\'t just walk in here without proving themselves. Let\'s GO!',
    ],
    postDialogue: [
      'Unreal. You\'ve got the Gainz Badge — but don\'t get comfortable.',
      'The other houses won\'t be as forgiving.',
    ],
  },
  {
    id: 'treasurer_biff',
    name: 'Treasurer Biff',
    title: 'Chapter Treasurer',
    house: 'Beta Bucks',
    badge: 'Trust Badge',
    spriteKey: 'trainer_treasurer_biff',
    battleConfig: {
      isWild: false,
      trainerName: 'Treasurer Biff',
      trainerSprite: 'trainer_treasurer_biff',
      enemyParty: [
        { speciesId: 4, level: 22 },
        { speciesId: 5, level: 24 },
        { speciesId: 5, level: 26 },
      ],
      bgmKey: 'bgm_trainer_battle',
      backgroundKey: 'bg_country_club',
    },
    preDialogue: [
      'Do you know what the initiation fee is? No? Then you can\'t afford to lose.',
      'The Beta Bucks house only accepts the best. Prove your net worth.',
    ],
    postDialogue: [
      'Impressive portfolio. The Trust Badge is yours — for now.',
      'Papa won\'t be happy about this.',
    ],
  },
  {
    id: 'president_newton',
    name: 'President Newton',
    title: 'Chapter President',
    house: 'Gamma Grind',
    badge: 'GPA Badge',
    spriteKey: 'trainer_president_newton',
    battleConfig: {
      isWild: false,
      trainerName: 'President Newton',
      trainerSprite: 'trainer_president_newton',
      enemyParty: [
        { speciesId: 7, level: 26 },
        { speciesId: 8, level: 28 },
        { speciesId: 8, level: 30 },
      ],
      bgmKey: 'bgm_trainer_battle',
      backgroundKey: 'bg_library',
    },
    preDialogue: [
      'Statistically speaking, your odds of winning are quite low.',
      'I\'ve calculated every scenario. Prepare for a comprehensive assessment.',
    ],
    postDialogue: [
      'Fascinating. You have exceeded expected performance parameters.',
      'The GPA Badge is awarded. I\'ll need to revise my models.',
    ],
  },
  {
    id: 'chill_master_blaze',
    name: 'Chill Master Blaze',
    title: 'Chill Master',
    house: 'Delta Daze',
    badge: 'Zen Badge',
    spriteKey: 'trainer_chill_master_blaze',
    battleConfig: {
      isWild: false,
      trainerName: 'Chill Master Blaze',
      trainerSprite: 'trainer_chill_master_blaze',
      enemyParty: [
        { speciesId: 10, level: 30 },
        { speciesId: 11, level: 32 },
        { speciesId: 11, level: 34 },
      ],
      bgmKey: 'bgm_trainer_battle',
      backgroundKey: 'bg_quad',
    },
    preDialogue: [
      'Whoa... you made it this far? That\'s... kind of wild.',
      'Let\'s just see where this goes, man. No pressure.',
    ],
    postDialogue: [
      'Dude... that was actually really good. Here, take the Zen Badge.',
      'Stay chill out there.',
    ],
  },
  {
    id: 'dj_raven',
    name: 'DJ Raven',
    title: 'Headliner',
    house: 'Epsilon Echo',
    badge: 'Encore Badge',
    spriteKey: 'trainer_dj_raven',
    battleConfig: {
      isWild: false,
      trainerName: 'DJ Raven',
      trainerSprite: 'trainer_dj_raven',
      enemyParty: [
        { speciesId: 13, level: 34 },
        { speciesId: 14, level: 36 },
        { speciesId: 14, level: 38 },
      ],
      bgmKey: 'bgm_trainer_battle',
      backgroundKey: 'bg_concert_hall',
    },
    preDialogue: [
      'You think you can match my energy? The crowd is watching.',
      'Let\'s see if you can keep up with the set.',
    ],
    postDialogue: [
      'You dropped the bass harder than expected. Encore Badge — it\'s yours.',
      'Don\'t be a stranger at our next show.',
    ],
  },
  {
    id: 'mistress_mortem',
    name: 'Mistress Mortem',
    title: 'High Priestess',
    house: 'Zeta Zero',
    badge: 'Abyss Badge',
    spriteKey: 'trainer_mistress_mortem',
    battleConfig: {
      isWild: false,
      trainerName: 'Mistress Mortem',
      trainerSprite: 'trainer_mistress_mortem',
      enemyParty: [
        { speciesId: 16, level: 38 },
        { speciesId: 17, level: 40 },
        { speciesId: 18, level: 42 },
      ],
      bgmKey: 'bgm_trainer_battle',
      backgroundKey: 'bg_void',
    },
    preDialogue: [
      'You dare enter the void? Many have tried. None have emerged unchanged.',
      'Face the darkness within and without.',
    ],
    postDialogue: [
      'You looked into the abyss... and the abyss blinked first.',
      'Take the Abyss Badge. You\'ve earned your place among the forsaken.',
    ],
  },
];

export const TRAINER_MAP: Record<string, TrainerData> = Object.fromEntries(
  TRAINERS.map((t) => [t.id, t])
);
