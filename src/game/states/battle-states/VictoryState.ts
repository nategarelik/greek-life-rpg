import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';

export class VictoryState implements IBattleState {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  enter(): void {
    const xpResult = this.scene.getBattleSystem().awardXP(
      this.scene.getPlayerSide(),
      this.scene.getEnemySide(),
    );

    const playerName = this.scene.getPlayerSide().name;

    this.scene.getTextBox().showText(`${playerName} gained ${xpResult.xpGained} XP!`).then(() => {
      if (xpResult.leveledUp) {
        this.scene.getTextBox().showText(
          `${playerName} grew to level ${xpResult.newLevel}!`
        ).then(() => {
          this.scene.applyLevelUp(xpResult.newLevel);
          if (xpResult.newMoves.length > 0) {
            this.showNewMoves(xpResult.newMoves, () => this.endBattle());
          } else {
            this.endBattle();
          }
        });
      } else {
        this.endBattle();
      }
    });
  }

  private showNewMoves(moveIds: number[], onComplete: () => void): void {
    if (moveIds.length === 0) {
      onComplete();
      return;
    }

    const [first, ...rest] = moveIds;
    this.scene.getTextBox().showText(`${this.scene.getPlayerSide().name} learned a new move!`).then(() => {
      this.showNewMoves(rest, onComplete);
    });
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
