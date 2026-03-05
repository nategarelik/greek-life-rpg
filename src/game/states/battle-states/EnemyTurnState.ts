import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';

export class EnemyTurnState implements IBattleState {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  enter(): void {
    const enemyAction = this.scene.getBattleSystem().getEnemyAction();
    this.scene.setEnemyAction(enemyAction);
    this.scene.setPlayerAction({ type: 'fight', moveIndex: 0 }); // Placeholder; not used in attack
    this.scene.getBattleStateMachine().setState('attack');
  }

  update(_time: number, _delta: number): void {
    // Transition happens immediately in enter()
  }

  exit(): void {
    // Nothing to clean up
  }
}
