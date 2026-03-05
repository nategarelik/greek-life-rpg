import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';
import { gameState } from '../../GameState';

export class DefeatState implements IBattleState {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  enter(): void {
    this.scene.getTextBox().showText('You blacked out!').then(() => {
      gameState.party.healAll();
      this.scene.endBattle('defeat');
    });
  }

  update(_time: number, _delta: number): void {
    // Driven by callbacks
  }

  exit(): void {
    // Nothing to clean up
  }
}
