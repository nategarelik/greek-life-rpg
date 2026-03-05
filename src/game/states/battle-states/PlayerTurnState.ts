import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';
import { gameState } from '../../GameState';
import { ITEM_MAP } from '../../../data/items';
import { BRO_MAP } from '../../../data/bros';
import type { InventorySlot } from '../../../types/items';
import type { SavedBro } from '../../../types/save';

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

        case 'bag': {
          const items = gameState.inventory.getAllItems();
          const battleItems = items.filter((slot) => {
            if (slot.quantity <= 0) return false;
            const item = ITEM_MAP[slot.itemId];
            return item && (item.category === 'healing' || item.category === 'ball' || item.category === 'battle');
          });

          if (battleItems.length === 0) {
            this.scene.getTextBox().showText('Bag is empty!').then(() => {
              this.scene.getBattleStateMachine().setState('player_turn');
            });
            break;
          }

          this.scene.hideBattleMenu();
          this.scene.showItemSelector((itemId) => {
            if (itemId === -1) {
              this.scene.getBattleStateMachine().setState('player_turn');
              return;
            }
            const slot = battleItems.find((s) => s.itemId === itemId);
            if (slot) this.useItem(slot);
          });
          break;
        }

        case 'bros': {
          const party = gameState.party.getParty();
          const activeBroId = this.scene.getPlayerSide().broInstanceId;
          const hasAvailable = party.some(
            (bro) => bro.currentSTA > 0 && bro.instanceId !== activeBroId
          );

          if (!hasAvailable) {
            this.scene.getTextBox().showText('No other Bros available!').then(() => {
              this.scene.getBattleStateMachine().setState('player_turn');
            });
            break;
          }

          this.scene.hideBattleMenu();
          this.scene.showPartySelector((partyIndex) => {
            if (partyIndex === -1) {
              this.scene.getBattleStateMachine().setState('player_turn');
              return;
            }
            const selectedBro = party[partyIndex];
            if (selectedBro) this.switchBro(selectedBro);
          });
          break;
        }

        case 'run':
          this.scene.setPlayerAction({ type: 'flee' });
          this.scene.getBattleStateMachine().setState('flee');
          break;
      }
    });
  }

  private useItem(slot: InventorySlot): void {
    const item = ITEM_MAP[slot.itemId];
    if (!item) return;

    if (item.category === 'ball') {
      gameState.inventory.removeItem(slot.itemId);
      const catchState = this.scene.getCatchState();
      catchState.setBallModifier(item.catchModifier ?? 1.0);
      this.scene.getBattleStateMachine().setState('catch');
      return;
    }

    if (item.category === 'healing' && item.healAmount) {
      const player = this.scene.getPlayerSide();
      const healAmt = Math.min(item.healAmount, player.maxSTA - player.currentSTA);
      player.currentSTA = Math.min(player.maxSTA, player.currentSTA + item.healAmount);
      gameState.inventory.removeItem(slot.itemId);
      this.scene.updateHealthBars();

      this.scene.getTextBox().showText(`Used ${item.name}! Restored ${healAmt} STA.`).then(() => {
        const enemyAction = this.scene.getBattleSystem().getEnemyAction();
        this.scene.setEnemyAction(enemyAction);
        this.scene.setPlayerAction({ type: 'item', itemId: slot.itemId });
        this.scene.getBattleStateMachine().setState('attack');
      });
      return;
    }

    if (item.category === 'battle' && item.curesStatus) {
      const player = this.scene.getPlayerSide();
      player.statusEffect = null;
      player.statusTurns = 0;
      gameState.inventory.removeItem(slot.itemId);

      this.scene.getTextBox().showText(`Used ${item.name}! Status cleared.`).then(() => {
        const enemyAction = this.scene.getBattleSystem().getEnemyAction();
        this.scene.setEnemyAction(enemyAction);
        this.scene.setPlayerAction({ type: 'item', itemId: slot.itemId });
        this.scene.getBattleStateMachine().setState('attack');
      });
      return;
    }

    this.scene.getTextBox().showText("Can't use that here!").then(() => {
      this.scene.getBattleStateMachine().setState('player_turn');
    });
  }

  private switchBro(targetBro: SavedBro): void {
    const currentPlayer = this.scene.getPlayerSide();
    const partyBro = gameState.party.getParty().find(
      (b) => b.instanceId === currentPlayer.broInstanceId
    );
    if (partyBro) {
      partyBro.currentSTA = currentPlayer.currentSTA;
      partyBro.statusEffect = currentPlayer.statusEffect;
    }

    this.scene.switchActiveBro(targetBro);

    const species = BRO_MAP[targetBro.speciesId];
    const name = targetBro.nickname ?? species?.name ?? 'Unknown';

    this.scene.getTextBox().showText(`Go, ${name}!`).then(() => {
      const enemyAction = this.scene.getBattleSystem().getEnemyAction();
      this.scene.setEnemyAction(enemyAction);
      this.scene.setPlayerAction({ type: 'switch', partyIndex: 0 });
      this.scene.getBattleStateMachine().setState('attack');
    });
  }

  update(_time: number, _delta: number): void {
    // Handled by menu callbacks
  }

  exit(): void {
    this.scene.hideBattleMenu();
    this.scene.hideMoveSelector();
    this.scene.hideItemSelector();
    this.scene.hidePartySelector();
  }
}
