import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';
import type { BattleParticipant } from '../../../types/battle';
import { flashSprite, shakeSprite } from '../../utils/animationHelper';

export class AttackState implements IBattleState {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  enter(): void {
    const playerAction = this.scene.getPlayerAction();
    const enemyAction = this.scene.getEnemyAction();

    const turnResult = this.scene.getBattleSystem().processTurnOrder(playerAction, enemyAction);

    this.executeAction(
      turnResult.firstAction.participant,
      turnResult.firstAction.action,
      () => {
        if (this.scene.getBattleSystem().checkFainted(turnResult.secondAction.participant)) {
          this.goToFaintCheck();
          return;
        }

        this.executeAction(
          turnResult.secondAction.participant,
          turnResult.secondAction.action,
          () => {
            this.goToFaintCheck();
          },
        );
      },
    );
  }

  private executeAction(
    participant: BattleParticipant,
    action: import('../../../types/battle').BattleAction,
    onComplete: () => void,
  ): void {
    if (action.type !== 'fight') {
      onComplete();
      return;
    }

    const defender = participant.isPlayer ? this.scene.getEnemySide() : this.scene.getPlayerSide();

    // Process status (may skip turn)
    const statusResult = this.scene.getBattleSystem().processStatusEffects(participant);

    if (statusResult.message) {
      this.scene.getTextBox().showText(statusResult.message).then(() => {
        if (statusResult.skippedTurn) {
          this.scene.updateHealthBars();
          onComplete();
          return;
        }
        this.doMoveExecution(participant, defender, action.moveIndex, onComplete);
      });
    } else {
      this.doMoveExecution(participant, defender, action.moveIndex, onComplete);
    }
  }

  private doMoveExecution(
    attacker: BattleParticipant,
    defender: BattleParticipant,
    moveIndex: number,
    onComplete: () => void,
  ): void {
    const result = this.scene.getBattleSystem().executeMove(attacker, defender, moveIndex);

    const messages = result.message;
    let messageIndex = 0;

    const showNextMessage = (): void => {
      if (messageIndex >= messages.length) {
        this.scene.updateHealthBars();
        onComplete();
        return;
      }

      const msg = messages[messageIndex++];
      this.scene.getTextBox().showText(msg).then(() => {
        showNextMessage();
      });
    };

    if (result.hit && result.damageResult && result.damageResult.damage > 0) {
      const defenderSprite = defender.isPlayer
        ? this.scene.getPlayerSprite()
        : this.scene.getEnemySprite();
      flashSprite(defenderSprite, 3, 400);
      shakeSprite(defenderSprite, 4, 300);
    }

    showNextMessage();
  }

  private goToFaintCheck(): void {
    const playerFainted = this.scene.getBattleSystem().checkFainted(this.scene.getPlayerSide());
    const enemyFainted = this.scene.getBattleSystem().checkFainted(this.scene.getEnemySide());

    if (playerFainted || enemyFainted) {
      this.scene.getBattleStateMachine().setState('faint');
    } else {
      this.scene.getBattleStateMachine().setState('player_turn');
    }
  }

  update(_time: number, _delta: number): void {
    // Driven by callbacks
  }

  exit(): void {
    // Nothing to clean up
  }
}
