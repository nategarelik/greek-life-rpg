import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';

export class FaintState implements IBattleState {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  enter(): void {
    const enemyFainted = this.scene.getBattleSystem().checkFainted(this.scene.getEnemySide());
    const playerFainted = this.scene.getBattleSystem().checkFainted(this.scene.getPlayerSide());

    if (enemyFainted) {
      this.handleEnemyFaint();
    } else if (playerFainted) {
      this.handlePlayerFaint();
    } else {
      // No one fainted — shouldn't happen but recover gracefully
      this.scene.getBattleStateMachine().setState('player_turn');
    }
  }

  private handleEnemyFaint(): void {
    const enemyName = this.scene.getEnemySide().name;
    const enemySprite = this.scene.getEnemySprite();

    // Sink sprite down
    this.scene.tweens.add({
      targets: enemySprite,
      y: enemySprite.y + 60,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
    });

    this.scene.time.delayedCall(700, () => {
      this.scene.getTextBox().showText(`${enemyName} fainted!`).then(() => {
        const config = this.scene.getConfig();
        const isTrainerBattle = !config.isWild;

        if (isTrainerBattle) {
          const hasMore = this.scene.advanceEnemyBro();
          if (hasMore) {
            const nextName = this.scene.getEnemySide().name;
            const trainerName = config.trainerName ?? 'Trainer';
            this.scene.getEnemySprite().setAlpha(1);
            this.scene.getTextBox().showText(`${trainerName} sent out ${nextName}!`).then(() => {
              this.scene.getBattleStateMachine().setState('player_turn');
            });
            return;
          }
        }

        this.scene.getBattleStateMachine().setState('victory');
      });
    });
  }

  private handlePlayerFaint(): void {
    const playerName = this.scene.getPlayerSide().name;
    const playerSprite = this.scene.getPlayerSprite();

    this.scene.tweens.add({
      targets: playerSprite,
      y: playerSprite.y + 60,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
    });

    this.scene.time.delayedCall(700, () => {
      this.scene.getTextBox().showText(`${playerName} fainted!`).then(() => {
        this.scene.getBattleStateMachine().setState('defeat');
      });
    });
  }

  update(_time: number, _delta: number): void {
    // Driven by callbacks
  }

  exit(): void {
    // Nothing to clean up
  }
}
