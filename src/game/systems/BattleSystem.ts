import type { BattleParticipant, BattleAction, DamageResult } from '../../types/battle';
import type { BroStats } from '../../types/bros';
import type { Move } from '../../types/moves';
import { MOVE_MAP } from '../../data/moves';
import { getEffectiveness } from '../utils/typeChart';
import {
  calculateDamage,
  calculateCatchRate,
  calculateXPGain,
  xpForLevel,
  getStatModMultiplier,
  isCriticalHit,
  randomInRange,
} from '../utils/math';
import { MAX_LEVEL } from '../../data/constants';

export interface MoveResult {
  hit: boolean;
  damageResult: DamageResult | null;
  recoilDamage: number;
  statusApplied: boolean;
  statChanges: { stat: keyof BroStats; stages: number; target: 'self' | 'opponent' }[];
  message: string[];
}

export interface TurnResult {
  firstAction: { participant: BattleParticipant; action: BattleAction };
  secondAction: { participant: BattleParticipant; action: BattleAction };
}

export interface StatusResult {
  damage: number;
  skippedTurn: boolean;
  message: string;
}

export interface CatchResult {
  success: boolean;
  shakes: number;
}

export interface XPResult {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  newMoves: number[];
}

export class BattleSystem {
  private playerSide: BattleParticipant;
  private enemySide: BattleParticipant;
  private isWild: boolean;

  constructor(playerSide: BattleParticipant, enemySide: BattleParticipant, isWild: boolean) {
    this.playerSide = playerSide;
    this.enemySide = enemySide;
    this.isWild = isWild;
  }

  executeMove(
    attacker: BattleParticipant,
    defender: BattleParticipant,
    moveIndex: number,
  ): MoveResult {
    const moveEntry = attacker.moves[moveIndex];
    if (!moveEntry) {
      return this.buildMissResult(['No move at that index!']);
    }

    const move = MOVE_MAP[moveEntry.moveId];
    if (!move) {
      return this.buildMissResult(['Unknown move!']);
    }

    const messages: string[] = [];
    const statChanges: MoveResult['statChanges'] = [];

    // Accuracy check
    const accuracyMod = getStatModMultiplier(attacker.statStages.vibes - defender.statStages.vibes);
    const effectiveAccuracy = move.accuracy * accuracyMod;
    if (Math.random() * 100 > effectiveAccuracy) {
      messages.push(`${attacker.name} used ${move.name}!`, `But it missed!`);
      return { hit: false, damageResult: null, recoilDamage: 0, statusApplied: false, statChanges, message: messages };
    }

    messages.push(`${attacker.name} used ${move.name}!`);

    let damageResult: DamageResult | null = null;
    let recoilDamage = 0;

    if (move.category !== 'status' && move.power > 0) {
      const attackStat = move.category === 'hype'
        ? attacker.stats.hype * getStatModMultiplier(attacker.statStages.hype)
        : attacker.stats.clout * getStatModMultiplier(attacker.statStages.clout);
      const defenseStat = move.category === 'hype'
        ? defender.stats.chill * getStatModMultiplier(defender.statStages.chill)
        : defender.stats.drip * getStatModMultiplier(defender.statStages.drip);

      // We need defender's type — look it up by speciesId
      // For effectiveness we pass the move type and defender type
      // Since BattleParticipant doesn't store type directly, we'll resolve via BROS_MAP
      // For now we pass the moveType as both (neutral) — the caller can enrich this
      // Actually, the BattleScene should pass the correct species type.
      // We'll store broType on participant via speciesId lookup at construction time.
      // For now, read it from the extended participant (see BattleScene).
      const effectiveness = getEffectiveness(move.type, defender.broType);
      const stab = attacker.broType === move.type;
      const critical = isCriticalHit();

      damageResult = calculateDamage(
        attacker.level,
        move.power,
        Math.floor(attackStat),
        Math.max(1, Math.floor(defenseStat)),
        effectiveness,
        stab,
        critical,
      );

      defender.currentSTA = Math.max(0, defender.currentSTA - damageResult.damage);

      if (damageResult.effectiveness > 1) messages.push("It's super effective!");
      if (damageResult.effectiveness < 1) messages.push("It's not very effective...");
      if (damageResult.critical) messages.push("Critical hit!");

      if (move.recoilPercent) {
        recoilDamage = Math.max(1, Math.floor(damageResult.damage * move.recoilPercent / 100));
        attacker.currentSTA = Math.max(0, attacker.currentSTA - recoilDamage);
        messages.push(`${attacker.name} was hurt by recoil!`);
      }
    }

    // Status effect
    let statusApplied = false;
    if (move.statusEffect && move.statusChance) {
      if (Math.random() * 100 < move.statusChance && defender.statusEffect === null) {
        defender.statusEffect = move.statusEffect;
        defender.statusTurns = 0;
        statusApplied = true;
        messages.push(`${defender.name} is ${move.statusEffect}!`);
      }
    }

    // Stat modifiers
    if (move.statModifiers) {
      for (const mod of move.statModifiers) {
        const target = mod.target === 'self' ? attacker : defender;
        const current = target.statStages[mod.stat];
        const newStage = Math.max(-6, Math.min(6, current + mod.stages));
        target.statStages[mod.stat] = newStage;
        statChanges.push({ stat: mod.stat, stages: mod.stages, target: mod.target });

        const direction = mod.stages > 0 ? 'rose' : 'fell';
        messages.push(`${target.name}'s ${mod.stat} ${direction}!`);
      }
    }

    // Consume PP
    if (moveEntry.currentPP > 0) {
      moveEntry.currentPP--;
    }

    return { hit: true, damageResult, recoilDamage, statusApplied, statChanges, message: messages };
  }

  processTurnOrder(playerAction: BattleAction, enemyAction: BattleAction): TurnResult {
    const playerSpeed = this.playerSide.stats.vibes * getStatModMultiplier(this.playerSide.statStages.vibes);
    const enemySpeed = this.enemySide.stats.vibes * getStatModMultiplier(this.enemySide.statStages.vibes);

    // Flee always goes first for player, switch too
    const playerPriority = this.getActionPriority(playerAction);
    const enemyPriority = this.getActionPriority(enemyAction);

    let playerFirst: boolean;
    if (playerPriority !== enemyPriority) {
      playerFirst = playerPriority > enemyPriority;
    } else {
      playerFirst = playerSpeed >= enemySpeed;
    }

    if (playerFirst) {
      return {
        firstAction: { participant: this.playerSide, action: playerAction },
        secondAction: { participant: this.enemySide, action: enemyAction },
      };
    }
    return {
      firstAction: { participant: this.enemySide, action: enemyAction },
      secondAction: { participant: this.playerSide, action: playerAction },
    };
  }

  processStatusEffects(participant: BattleParticipant): StatusResult {
    const result: StatusResult = { damage: 0, skippedTurn: false, message: '' };

    if (!participant.statusEffect) return result;

    participant.statusTurns++;

    switch (participant.statusEffect) {
      case 'hungover': {
        const dmg = Math.max(1, Math.floor(participant.maxSTA / 8));
        participant.currentSTA = Math.max(0, participant.currentSTA - dmg);
        result.damage = dmg;
        result.message = `${participant.name} is hungover and took damage!`;
        break;
      }
      case 'passed_out': {
        result.skippedTurn = true;
        result.message = `${participant.name} is passed out!`;
        // Wake up after 1-3 turns
        if (participant.statusTurns >= randomInRange(1, 3)) {
          participant.statusEffect = null;
          participant.statusTurns = 0;
          result.skippedTurn = false;
          result.message = `${participant.name} woke up!`;
        }
        break;
      }
      case 'embarrassed': {
        if (Math.random() < 0.33) {
          const dmg = Math.max(1, Math.floor(participant.stats.hype / 4));
          participant.currentSTA = Math.max(0, participant.currentSTA - dmg);
          result.damage = dmg;
          result.skippedTurn = true;
          result.message = `${participant.name} is embarrassed and hurt themselves!`;
        }
        break;
      }
      case 'cancelled': {
        if (Math.random() < 0.25) {
          result.skippedTurn = true;
          result.message = `${participant.name} is cancelled and can't move!`;
        }
        break;
      }
      case 'hyped': {
        // No per-turn effect; handled via stat stages at application
        break;
      }
    }

    return result;
  }

  checkFainted(participant: BattleParticipant): boolean {
    return participant.currentSTA <= 0;
  }

  attemptCatch(ballModifier: number): CatchResult {
    const catchValue = calculateCatchRate(
      this.enemySide.maxSTA,
      this.enemySide.currentSTA,
      255,
      ballModifier,
      this.enemySide.statusEffect,
    );

    const shakeThreshold = Math.floor(65536 / Math.sqrt(Math.sqrt(255 / catchValue)));
    let shakes = 0;

    for (let i = 0; i < 4; i++) {
      const roll = Math.floor(Math.random() * 65536);
      if (roll < shakeThreshold) {
        shakes++;
      } else {
        break;
      }
    }

    return { success: shakes === 4, shakes };
  }

  attemptCatchWithRate(catchRate: number, ballModifier: number): CatchResult {
    const catchValue = calculateCatchRate(
      this.enemySide.maxSTA,
      this.enemySide.currentSTA,
      catchRate,
      ballModifier,
      this.enemySide.statusEffect,
    );

    const shakeThreshold = Math.floor(65536 / Math.sqrt(Math.sqrt(255 / Math.max(1, catchValue))));
    let shakes = 0;

    for (let i = 0; i < 4; i++) {
      const roll = Math.floor(Math.random() * 65536);
      if (roll < shakeThreshold) {
        shakes++;
      } else {
        break;
      }
    }

    return { success: shakes === 4, shakes };
  }

  attemptFlee(): boolean {
    const playerSpeed = this.playerSide.stats.vibes;
    const enemySpeed = this.enemySide.stats.vibes;
    const fleeChance = Math.min(255, Math.floor((playerSpeed * 128) / Math.max(1, enemySpeed) + 30));
    return Math.floor(Math.random() * 256) < fleeChance;
  }

  getEnemyAction(): BattleAction {
    const availableMoves = this.enemySide.moves
      .map((m, i) => ({ index: i, move: MOVE_MAP[m.moveId], pp: m.currentPP }))
      .filter((m) => m.move && m.pp > 0);

    if (availableMoves.length === 0) {
      // Struggle
      return { type: 'fight', moveIndex: 0 };
    }

    // Weight moves by type advantage
    const weights = availableMoves.map((entry) => {
      if (!entry.move) return 1;
      const effectiveness = getEffectiveness(entry.move.type, this.playerSide.broType);
      return effectiveness * effectiveness; // Square to heavily favor super effective
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * totalWeight;

    for (let i = 0; i < availableMoves.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        return { type: 'fight', moveIndex: availableMoves[i].index };
      }
    }

    return { type: 'fight', moveIndex: availableMoves[0].index };
  }

  awardXP(winner: BattleParticipant, loser: BattleParticipant): XPResult {
    // Look up base yield — caller must have set it on the loser
    const baseYield = loser.expYield;
    const xpGained = calculateXPGain(baseYield, loser.level, this.isWild);

    const currentXP = winner.currentXP;
    const newXP = currentXP + xpGained;

    let level = winner.level;
    const newMoves: number[] = [];

    while (level < MAX_LEVEL) {
      const xpNeeded = xpForLevel(level + 1);
      if (newXP < xpNeeded) break;
      level++;
    }

    const leveledUp = level > winner.level;

    return { xpGained, leveledUp, newLevel: level, newMoves };
  }

  private getActionPriority(action: BattleAction): number {
    if (action.type === 'flee' || action.type === 'switch') return 10;
    if (action.type === 'item') return 5;
    if (action.type === 'fight') {
      const moveEntry = this.playerSide.moves[action.moveIndex];
      if (moveEntry) {
        const move = MOVE_MAP[moveEntry.moveId] as Move | undefined;
        return move?.priority ?? 0;
      }
    }
    return 0;
  }

  private buildMissResult(messages: string[]): MoveResult {
    return {
      hit: false,
      damageResult: null,
      recoilDamage: 0,
      statusApplied: false,
      statChanges: [],
      message: messages,
    };
  }
}
