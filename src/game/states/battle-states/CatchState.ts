import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';
import { bounceSprite, fadeSprite } from '../../utils/animationHelper';

export class CatchState implements IBattleState {
  private scene: BattleScene;
  private ballModifier: number;

  constructor(scene: BattleScene, ballModifier = 1.0) {
    this.scene = scene;
    this.ballModifier = ballModifier;
  }

  setBallModifier(modifier: number): void {
    this.ballModifier = modifier;
  }

  enter(): void {
    const catchResult = this.scene.getBattleSystem().attemptCatchWithRate(
      this.scene.getEnemyCatchRate(),
      this.ballModifier,
    );

    const enemySprite = this.scene.getEnemySprite();
    fadeSprite(enemySprite, 1, 0.3, 300);

    this.scene.time.delayedCall(400, () => {
      this.animateShakes(catchResult.shakes, catchResult.success);
    });
  }

  private animateShakes(shakes: number, success: boolean): void {
    const enemySprite = this.scene.getEnemySprite();
    let shakesRemaining = shakes;

    const doShake = (): void => {
      if (shakesRemaining <= 0) {
        if (success) {
          this.onCatchSuccess();
        } else {
          this.onCatchFail();
        }
        return;
      }

      bounceSprite(enemySprite, 10, 400);
      shakesRemaining--;

      this.scene.time.delayedCall(500, doShake);
    };

    doShake();
  }

  private onCatchSuccess(): void {
    const enemyName = this.scene.getEnemySide().name;
    const enemySprite = this.scene.getEnemySprite();
    fadeSprite(enemySprite, 0.3, 0, 400);

    this.scene.time.delayedCall(500, () => {
      this.scene.getTextBox().showText(`Gotcha! ${enemyName} was caught!`).then(() => {
        this.scene.onCatchSuccess();
        this.scene.getBattleStateMachine().setState('victory');
      });
    });
  }

  private onCatchFail(): void {
    const enemyName = this.scene.getEnemySide().name;
    const enemySprite = this.scene.getEnemySprite();
    fadeSprite(enemySprite, 0.3, 1, 300);

    this.scene.getTextBox().showText(`${enemyName} broke free!`).then(() => {
      this.scene.getBattleStateMachine().setState('enemy_turn');
    });
  }

  update(_time: number, _delta: number): void {
    // Driven by callbacks
  }

  exit(): void {
    // Nothing to clean up
  }
}
