import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';
import { gameState } from '../../GameState';
import { addXP, type LevelUpResult } from '../../entities/BroInstance';
import { calculateXPGain } from '../../utils/math';
import { MOVE_MAP } from '@/data/moves';
import { TRAINER_MAP } from '@/data/trainers';

export class VictoryState implements IBattleState {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  enter(): void {
    const config = this.scene.getConfig();
    const trainerId = config.trainerId;

    if (trainerId && !config.isWild) {
      this.handleTrainerVictory(trainerId);
    } else {
      this.awardXP();
    }
  }

  private handleTrainerVictory(trainerId: string): void {
    if (!gameState.defeatedTrainers.includes(trainerId)) {
      gameState.defeatedTrainers.push(trainerId);
    }

    const trainer = TRAINER_MAP[trainerId];
    if (trainer && !gameState.badges.includes(trainer.badge)) {
      gameState.badges.push(trainer.badge);
    }

    const postDialogue = trainer?.postDialogue[0] ?? 'You won!';
    const badgeMessage = trainer ? `You received the ${trainer.badge}!` : '';

    this.scene.getTextBox().showText(postDialogue).then(() => {
      if (badgeMessage) {
        this.scene.getTextBox().showText(badgeMessage).then(() => {
          this.awardXP();
        });
      } else {
        this.awardXP();
      }
    });
  }

  private awardXP(): void {
    const enemy = this.scene.getEnemySide();
    const playerSide = this.scene.getPlayerSide();
    const activeBro = gameState.party.getFirstNonFainted();

    const xpGained = calculateXPGain(enemy.expYield, enemy.level, true);
    const playerName = playerSide.name;

    this.scene.getTextBox().showText(`${playerName} gained ${xpGained} XP!`).then(() => {
      if (!activeBro) {
        this.endBattle();
        return;
      }

      const levelUpResult = addXP(activeBro, xpGained);

      // Sync party bro state back to battle participant
      playerSide.currentXP = activeBro.currentXP;
      playerSide.level = activeBro.level;
      playerSide.stats = { ...activeBro.stats };
      playerSide.maxSTA = activeBro.stats.stamina;

      if (levelUpResult) {
        this.handleLevelUp(activeBro, levelUpResult);
      } else {
        this.endBattle();
      }
    });
  }

  private handleLevelUp(activeBro: import('@/types/save').SavedBro, result: LevelUpResult): void {
    const playerName = this.scene.getPlayerSide().name;

    this.scene.getTextBox().showText(
      `${playerName} grew to level ${result.newLevel}!`
    ).then(() => {
      this.scene.updateHealthBars();

      // Learn new moves
      if (result.movesLearned.length > 0) {
        this.learnNewMoves(activeBro, result.movesLearned, () => {
          this.checkEvolution(activeBro, result);
        });
      } else {
        this.checkEvolution(activeBro, result);
      }
    });
  }

  private learnNewMoves(activeBro: import('@/types/save').SavedBro, moveIds: number[], onComplete: () => void): void {
    if (moveIds.length === 0) {
      onComplete();
      return;
    }

    const [moveId, ...rest] = moveIds;
    const moveName = MOVE_MAP[moveId]?.name ?? `Move #${moveId}`;

    // Add move if we have room
    if (activeBro.moves.length < 4) {
      activeBro.moves.push({ moveId, currentPP: MOVE_MAP[moveId]?.pp ?? 10 });
      this.scene.getTextBox().showText(`${this.scene.getPlayerSide().name} learned ${moveName}!`).then(() => {
        this.learnNewMoves(activeBro, rest, onComplete);
      });
    } else {
      // For now, skip learning if moves are full (move replacement UI comes in Phase 5)
      this.scene.getTextBox().showText(`${this.scene.getPlayerSide().name} can't learn ${moveName} — move slots full!`).then(() => {
        this.learnNewMoves(activeBro, rest, onComplete);
      });
    }
  }

  private checkEvolution(activeBro: import('@/types/save').SavedBro, result: LevelUpResult): void {
    if (result.canEvolve && result.evolvesToSpeciesId != null) {
      // Evolution will be handled by GlowUpState (Phase 2)
      // For now, just store the info and end battle
      this.scene.setEvolveTarget?.({ bro: activeBro, toSpeciesId: result.evolvesToSpeciesId });
      const glowUpState = this.scene.getBattleStateMachine().getCurrentStateName();
      // Check if glow_up state is registered
      if (this.scene.hasState?.('glow_up')) {
        this.scene.getBattleStateMachine().setState('glow_up');
      } else {
        this.endBattle();
      }
    } else {
      this.endBattle();
    }
  }

  private endBattle(): void {
    this.scene.time.delayedCall(500, () => {
      this.scene.endBattle('victory');
    });
  }

  update(_time: number, _delta: number): void {
    // Driven by callbacks
  }

  exit(): void {
    // Nothing to clean up
  }
}
