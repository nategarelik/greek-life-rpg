import Phaser from 'phaser';
import { generatePlaceholderAssets } from '@/game/utils/assetGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    generatePlaceholderAssets(this);
    this.scene.start('PreloaderScene');
  }
}
