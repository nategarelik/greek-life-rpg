import * as Phaser from 'phaser';
import { GridEngine } from 'grid-engine';
import { BootScene } from './scenes/BootScene';
import { PreloaderScene } from './scenes/PreloaderScene';
import { TitleScene } from './scenes/TitleScene';
import { OverworldScene } from './scenes/OverworldScene';
import { BattleScene } from './scenes/BattleScene';
import { BattleUIScene } from './scenes/BattleUIScene';
import { DialogScene } from './scenes/DialogScene';
import { TransitionScene } from './scenes/TransitionScene';

export { EventBus } from './EventBus';

export const StartGame = (parent: string): Phaser.Game => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent,
    pixelArt: true,
    backgroundColor: '#0a0a0a',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      keyboard: {
        target: window,
      },
    },
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    plugins: {
      scene: [
        {
          key: 'gridEngine',
          plugin: GridEngine,
          mapping: 'gridEngine',
        },
      ],
    },
    scene: [
      BootScene,
      PreloaderScene,
      TitleScene,
      OverworldScene,
      BattleScene,
      BattleUIScene,
      DialogScene,
      TransitionScene,
    ],
  });
};
