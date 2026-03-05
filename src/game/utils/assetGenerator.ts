import * as Phaser from 'phaser';

export function generatePlaceholderAssets(scene: Phaser.Scene): void {
  generatePlayerSprites(scene);
  generateNpcSprites(scene);
  generateBroSprites(scene);
  generateTileTextures(scene);
  generateTilesetStrip(scene);
  generateUiTextures(scene);
}

function makeGraphics(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.make.graphics({ x: 0, y: 0 });
}

function generatePlayerSprites(scene: Phaser.Scene): void {
  const directions: Array<{ key: string; tx: number; ty: number; bx: number; by: number }> = [
    { key: 'player-down',  tx: 16, ty: 26, bx: 8,  by: 6  },
    { key: 'player-up',    tx: 16, ty: 4,  bx: 8,  by: 24 },
    { key: 'player-left',  tx: 4,  ty: 16, bx: 24, by: 8  },
    { key: 'player-right', tx: 26, ty: 16, bx: 6,  by: 8  },
  ];

  for (const dir of directions) {
    const g = makeGraphics(scene);
    g.fillStyle(0x4444ff);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xffffff);
    // Triangle pointing in facing direction
    if (dir.key === 'player-down') {
      g.fillTriangle(16, 28, 6, 10, 26, 10);
    } else if (dir.key === 'player-up') {
      g.fillTriangle(16, 4, 6, 22, 26, 22);
    } else if (dir.key === 'player-left') {
      g.fillTriangle(4, 16, 22, 6, 22, 26);
    } else {
      g.fillTriangle(28, 16, 10, 6, 10, 26);
    }
    g.generateTexture(dir.key, 32, 32);
    g.destroy();
  }

  // Also generate 'player' key for backwards compatibility
  const g = makeGraphics(scene);
  g.fillStyle(0x4444ff);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0xffffff);
  g.fillTriangle(16, 4, 6, 22, 26, 22);
  g.generateTexture('player', 32, 32);
  g.destroy();
}

function generateNpcSprites(scene: Phaser.Scene): void {
  // npc-default: green square
  const gDefault = makeGraphics(scene);
  gDefault.fillStyle(0x44aa44);
  gDefault.fillRect(0, 0, 32, 32);
  gDefault.generateTexture('npc-default', 32, 32);
  gDefault.destroy();

  // 'npc' alias for backwards compatibility
  const gNpc = makeGraphics(scene);
  gNpc.fillStyle(0x44aa44);
  gNpc.fillRect(0, 0, 32, 32);
  gNpc.generateTexture('npc', 32, 32);
  gNpc.destroy();

  // npc-trainer: red square with yellow badge
  const gTrainer = makeGraphics(scene);
  gTrainer.fillStyle(0xaa4444);
  gTrainer.fillRect(0, 0, 32, 32);
  gTrainer.fillStyle(0xffcc00);
  gTrainer.fillCircle(24, 8, 5);
  gTrainer.generateTexture('npc-trainer', 32, 32);
  gTrainer.destroy();
}

function generateBroSprites(scene: Phaser.Scene): void {
  // bro-jock: red circle
  const gJock = makeGraphics(scene);
  gJock.fillStyle(0xcc3333);
  gJock.fillCircle(32, 32, 28);
  gJock.generateTexture('bro-jock', 64, 64);
  gJock.destroy();

  // bro-prep: gold diamond
  const gPrep = makeGraphics(scene);
  gPrep.fillStyle(0xccaa33);
  gPrep.fillTriangle(32, 4, 60, 32, 32, 60);
  gPrep.fillTriangle(32, 4, 4, 32, 32, 60);
  gPrep.generateTexture('bro-prep', 64, 64);
  gPrep.destroy();

  // bro-nerd: blue square with glasses
  const gNerd = makeGraphics(scene);
  gNerd.fillStyle(0x3333cc);
  gNerd.fillRect(4, 4, 56, 56);
  gNerd.fillStyle(0xffffff);
  gNerd.fillRect(10, 20, 16, 12);
  gNerd.fillRect(30, 20, 16, 12);
  gNerd.fillStyle(0x000000);
  gNerd.fillRect(26, 24, 6, 4);
  gNerd.generateTexture('bro-nerd', 64, 64);
  gNerd.destroy();

  // bro-stoner: green wavy circle (approximated with layered circles)
  const gStoner = makeGraphics(scene);
  gStoner.fillStyle(0x33cc33);
  gStoner.fillCircle(32, 32, 28);
  gStoner.fillStyle(0x22aa22);
  gStoner.fillCircle(32, 20, 10);
  gStoner.fillCircle(44, 32, 10);
  gStoner.fillCircle(32, 44, 10);
  gStoner.fillCircle(20, 32, 10);
  gStoner.generateTexture('bro-stoner', 64, 64);
  gStoner.destroy();

  // bro-scene: purple star shape (hexagon approximation)
  const gScene = makeGraphics(scene);
  gScene.fillStyle(0x9933cc);
  gScene.fillCircle(32, 32, 24);
  gScene.fillStyle(0x7711aa);
  const starPoints = 6;
  for (let i = 0; i < starPoints; i++) {
    const angle = (i / starPoints) * Math.PI * 2 - Math.PI / 2;
    const px = 32 + Math.cos(angle) * 30;
    const py = 32 + Math.sin(angle) * 30;
    gScene.fillRect(px - 4, py - 4, 8, 8);
  }
  gScene.generateTexture('bro-scene', 64, 64);
  gScene.destroy();

  // bro-goth: dark gray circle with spikes
  const gGoth = makeGraphics(scene);
  gGoth.fillStyle(0x444444);
  gGoth.fillCircle(32, 32, 22);
  gGoth.fillStyle(0x222222);
  const spikeAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  for (const angle of spikeAngles) {
    const rad = (angle * Math.PI) / 180;
    const sx = 32 + Math.cos(rad) * 22;
    const sy = 32 + Math.sin(rad) * 22;
    const ex = 32 + Math.cos(rad) * 30;
    const ey = 32 + Math.sin(rad) * 30;
    gGoth.fillTriangle(sx - 3, sy - 3, sx + 3, sy + 3, ex, ey);
  }
  gGoth.generateTexture('bro-goth', 64, 64);
  gGoth.destroy();
}

function generateTileTextures(scene: Phaser.Scene): void {
  // tile-grass
  const gGrass = makeGraphics(scene);
  gGrass.fillStyle(0x66aa44);
  gGrass.fillRect(0, 0, 32, 32);
  gGrass.generateTexture('tile-grass', 32, 32);
  gGrass.destroy();

  // tile-path
  const gPath = makeGraphics(scene);
  gPath.fillStyle(0xccaa77);
  gPath.fillRect(0, 0, 32, 32);
  gPath.generateTexture('tile-path', 32, 32);
  gPath.destroy();

  // tile-wall
  const gWall = makeGraphics(scene);
  gWall.fillStyle(0x666666);
  gWall.fillRect(0, 0, 32, 32);
  gWall.lineStyle(1, 0x444444);
  gWall.strokeRect(0, 0, 32, 32);
  gWall.generateTexture('tile-wall', 32, 32);
  gWall.destroy();

  // tile-encounter (darker green with dot pattern)
  const gEncounter = makeGraphics(scene);
  gEncounter.fillStyle(0x448833);
  gEncounter.fillRect(0, 0, 32, 32);
  gEncounter.fillStyle(0x55aa44);
  gEncounter.fillCircle(8, 8, 3);
  gEncounter.fillCircle(20, 14, 3);
  gEncounter.fillCircle(10, 22, 3);
  gEncounter.fillCircle(24, 26, 3);
  gEncounter.generateTexture('tile-encounter', 32, 32);
  gEncounter.destroy();

  // tile-encounter-grass alias (used by OverworldScene)
  const gEncounterGrass = makeGraphics(scene);
  gEncounterGrass.fillStyle(0x448833);
  gEncounterGrass.fillRect(0, 0, 32, 32);
  gEncounterGrass.fillStyle(0x55aa44);
  gEncounterGrass.fillCircle(8, 8, 3);
  gEncounterGrass.fillCircle(20, 14, 3);
  gEncounterGrass.fillCircle(10, 22, 3);
  gEncounterGrass.fillCircle(24, 26, 3);
  gEncounterGrass.generateTexture('tile-encounter-grass', 32, 32);
  gEncounterGrass.destroy();

  // tile-building
  const gBuilding = makeGraphics(scene);
  gBuilding.fillStyle(0x885533);
  gBuilding.fillRect(0, 0, 32, 32);
  gBuilding.fillStyle(0x664422);
  gBuilding.fillRect(2, 2, 28, 28);
  gBuilding.generateTexture('tile-building', 32, 32);
  gBuilding.destroy();

  // tile-water
  const gWater = makeGraphics(scene);
  gWater.fillStyle(0x4477cc);
  gWater.fillRect(0, 0, 32, 32);
  gWater.fillStyle(0x5588dd, 0.5);
  gWater.fillRect(0, 8, 32, 8);
  gWater.fillRect(0, 24, 32, 8);
  gWater.generateTexture('tile-water', 32, 32);
  gWater.destroy();

  // tile-door
  const gDoor = makeGraphics(scene);
  gDoor.fillStyle(0x553311);
  gDoor.fillRect(0, 0, 32, 32);
  gDoor.lineStyle(3, 0x886644);
  gDoor.strokeRect(4, 4, 24, 28);
  gDoor.fillStyle(0x886644);
  gDoor.fillCircle(22, 18, 2);
  gDoor.generateTexture('tile-door', 32, 32);
  gDoor.destroy();
}

function generateTilesetStrip(scene: Phaser.Scene): void {
  if (scene.textures.exists('tileset-campus')) return;

  // Build 7-tile strip (224x32) directly with Graphics — more reliable than RenderTexture compositing
  const g = makeGraphics(scene);
  const colors = [0x66aa44, 0xccaa77, 0x666666, 0x448833, 0x885533, 0x4477cc, 0x553311];

  colors.forEach((color, i) => {
    g.fillStyle(color);
    g.fillRect(i * 32, 0, 32, 32);
  });

  // Add encounter grass dots on tile index 3
  g.fillStyle(0x55aa44);
  g.fillCircle(3 * 32 + 8, 8, 3);
  g.fillCircle(3 * 32 + 20, 14, 3);
  g.fillCircle(3 * 32 + 10, 22, 3);
  g.fillCircle(3 * 32 + 24, 26, 3);

  // Wall border on tile index 2
  g.lineStyle(1, 0x444444);
  g.strokeRect(2 * 32, 0, 32, 32);

  // Building inner on tile index 4
  g.fillStyle(0x664422);
  g.fillRect(4 * 32 + 2, 2, 28, 28);

  // Door frame on tile index 6
  g.lineStyle(3, 0x886644);
  g.strokeRect(6 * 32 + 4, 4, 24, 28);

  g.generateTexture('tileset-campus', 7 * 32, 32);
  g.destroy();
}

function generateUiTextures(scene: Phaser.Scene): void {
  // ui-ball: 16x16 pokeball style
  const gBall = makeGraphics(scene);
  gBall.fillStyle(0xff3333);
  gBall.fillCircle(8, 8, 8);
  gBall.fillStyle(0xffffff);
  gBall.fillRect(0, 8, 16, 8);
  gBall.fillCircle(8, 8, 3);
  gBall.generateTexture('ui-ball', 16, 16);
  gBall.destroy();

  // ui-bag: 16x16 brown square
  const gBag = makeGraphics(scene);
  gBag.fillStyle(0x885522);
  gBag.fillRect(0, 4, 16, 12);
  gBag.fillStyle(0x664411);
  gBag.fillRect(4, 0, 8, 6);
  gBag.generateTexture('ui-bag', 16, 16);
  gBag.destroy();

  // ui-arrow: 8x8 white triangle
  const gArrow = makeGraphics(scene);
  gArrow.fillStyle(0xffffff);
  gArrow.fillTriangle(0, 0, 8, 4, 0, 8);
  gArrow.generateTexture('ui-arrow', 8, 8);
  gArrow.destroy();
}
