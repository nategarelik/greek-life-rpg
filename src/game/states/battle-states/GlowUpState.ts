import type { IBattleState } from '../BattleStateMachine';
import type { BattleScene } from '../../scenes/BattleScene';
import { evolveBro } from '../../entities/BroInstance';
import { BRO_MAP } from '@/data/bros';

export class GlowUpState implements IBattleState {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  enter(): void {
    const target = this.scene.getEvolveTarget();
    if (!target) {
      this.scene.endBattle('victory');
      return;
    }

    const { bro, toSpeciesId } = target;
    const oldName = BRO_MAP[bro.speciesId]?.name ?? bro.nickname ?? 'Bro';
    const newSpecies = BRO_MAP[toSpeciesId];
    const newName = newSpecies?.name ?? `Bro #${toSpeciesId}`;

    this.scene.getTextBox().showText(`What? ${oldName} is having a GLOW UP!`).then(() => {
      const playerSprite = this.scene.getPlayerSprite();
      this.scene.tweens.add({
        targets: playerSprite,
        alpha: { from: 1, to: 0 },
        duration: 200,
        repeat: 5,
        yoyo: true,
        onComplete: () => {
          evolveBro(bro, toSpeciesId);

          const newTypeKey = `bro-${newSpecies?.type ?? 'jock'}`;
          playerSprite.setTexture(newTypeKey);

          const playerSide = this.scene.getPlayerSide();
          playerSide.speciesId = bro.speciesId;
          playerSide.name = bro.nickname ?? newName;
          playerSide.stats = { ...bro.stats };
          playerSide.maxSTA = bro.stats.stamina;
          playerSide.currentSTA = bro.currentSTA;
          playerSide.broType = newSpecies?.type ?? 'jock';

          this.scene.updateHealthBars();

          this.scene.getTextBox().showText(`${oldName} evolved into ${newName}!`).then(() => {
            this.scene.time.delayedCall(500, () => {
              this.scene.endBattle('victory');
            });
          });
        },
      });
    });
  }

  update(_time: number, _delta: number): void {}
  exit(): void {}
}
