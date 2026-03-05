import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';
import { slideSprite, fadeSprite } from '../../utils/animationHelper';

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
