import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';
import { slideSprite } from '../../utils/animationHelper';

export class IntroState implements IBattleState {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  enter(): void {
    const enemyName = this.scene.getEnemySide().name;
    const enemySprite = this.scene.getEnemySprite();

    // Slide in from right
    slideSprite(enemySprite, this.scene.cameras.main.width + 64, enemySprite.x, 600);

    this.scene.time.delayedCall(700, () => {
      this.scene.getTextBox().showText(`A wild ${enemyName} appeared!`).then(() => {
        this.scene.getBattleStateMachine().setState('player_turn');
      });
    });
  }

  update(_time: number, _delta: number): void {
    // No per-frame logic needed
  }

  exit(): void {
    // Nothing to clean up
  }
}
