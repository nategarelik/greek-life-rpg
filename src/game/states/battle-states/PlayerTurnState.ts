import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';

export class PlayerTurnState implements IBattleState {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  enter(): void {
    this.scene.showBattleMenu((selection) => {
      switch (selection) {
        case 'fight':
          this.scene.showMoveSelector((moveIndex) => {
            this.scene.setPlayerAction({ type: 'fight', moveIndex });
            const enemyAction = this.scene.getBattleSystem().getEnemyAction();
            this.scene.setEnemyAction(enemyAction);
            this.scene.getBattleStateMachine().setState('attack');
          });
          break;
        case 'bag':
          // Simplified: no item UI yet, just close menu
          this.scene.getTextBox().showText("You don't have any useful items!").then(() => {
            this.scene.getBattleStateMachine().setState('player_turn');
          });
          break;
        case 'bros':
          // No switch UI yet
          this.scene.getTextBox().showText("No Bros to switch to!").then(() => {
            this.scene.getBattleStateMachine().setState('player_turn');
          });
          break;
        case 'run':
          this.scene.setPlayerAction({ type: 'flee' });
          this.scene.getBattleStateMachine().setState('flee');
          break;
      }
    });
  }

  update(_time: number, _delta: number): void {
    // Handled by menu callbacks
  }

  exit(): void {
    this.scene.hideBattleMenu();
    this.scene.hideMoveSelector();
  }
}
