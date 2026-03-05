import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';

export class FleeState implements IBattleState {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  enter(): void {
    const success = this.scene.getBattleSystem().attemptFlee();

    if (success) {
      this.scene.getTextBox().showText("Got away safely!").then(() => {
        this.scene.endBattle('flee');
      });
    } else {
      this.scene.getTextBox().showText("Couldn't get away!").then(() => {
        this.scene.getBattleStateMachine().setState('enemy_turn');
      });
    }
  }

  update(_time: number, _delta: number): void {
    // Driven by callbacks
  }

  exit(): void {
    // Nothing to clean up
  }
}
