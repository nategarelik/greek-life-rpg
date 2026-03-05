import Phaser from 'phaser';

export function flashSprite(
  sprite: Phaser.GameObjects.GameObject & { setTint: (tint: number) => void; clearTint: () => void },
  times: number,
  duration: number,
): void {
  const scene = sprite.scene;
  let count = 0;
  const halfDuration = duration / (times * 2);

  const timer = scene.time.addEvent({
    delay: halfDuration,
    repeat: times * 2 - 1,
    callback: () => {
      if (count % 2 === 0) {
        sprite.setTint(0xffffff);
      } else {
        sprite.clearTint();
      }
      count++;
    },
    callbackScope: scene,
  });

  scene.time.delayedCall(duration, () => {
    timer.remove();
    sprite.clearTint();
  });
}

export function shakeSprite(
  sprite: Phaser.GameObjects.GameObject & { x: number; y: number },
  intensity: number,
  duration: number,
): void {
  const scene = sprite.scene;
  const originX = sprite.x;
  const originY = sprite.y;
  const steps = Math.floor(duration / 50);
  let count = 0;

  const timer = scene.time.addEvent({
    delay: 50,
    repeat: steps - 1,
    callback: () => {
      sprite.x = originX + (Math.random() * 2 - 1) * intensity;
      sprite.y = originY + (Math.random() * 2 - 1) * intensity;
      count++;
      if (count >= steps) {
        sprite.x = originX;
        sprite.y = originY;
      }
    },
    callbackScope: scene,
  });

  scene.time.delayedCall(duration, () => {
    timer.remove();
    sprite.x = originX;
    sprite.y = originY;
  });
}

export function slideSprite(
  sprite: Phaser.GameObjects.GameObject & { x: number },
  fromX: number,
  toX: number,
  duration: number,
): Phaser.Tweens.Tween {
  sprite.x = fromX;
  return sprite.scene.tweens.add({
    targets: sprite,
    x: toX,
    duration,
    ease: 'Power2',
  });
}

export function fadeSprite(
  sprite: Phaser.GameObjects.GameObject & { alpha: number },
  from: number,
  to: number,
  duration: number,
): Phaser.Tweens.Tween {
  sprite.alpha = from;
  return sprite.scene.tweens.add({
    targets: sprite,
    alpha: to,
    duration,
    ease: 'Linear',
  });
}

export function bounceSprite(
  sprite: Phaser.GameObjects.GameObject & { y: number },
  height: number,
  duration: number,
): Phaser.Tweens.Tween {
  const originY = sprite.y;
  return sprite.scene.tweens.add({
    targets: sprite,
    y: originY - height,
    duration: duration / 2,
    ease: 'Sine.easeOut',
    yoyo: true,
    repeat: 2,
    onComplete: () => {
      sprite.y = originY;
    },
  });
}
