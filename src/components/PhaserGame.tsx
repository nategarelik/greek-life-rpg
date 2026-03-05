'use client';

import { forwardRef, useLayoutEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { StartGame } from '@/game/main';

export interface PhaserGameRef {
  game: Phaser.Game | null;
}

export const PhaserGame = forwardRef<PhaserGameRef>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    if (gameRef.current || !containerRef.current) return;

    gameRef.current = StartGame('game-container');

    // Ensure the canvas gets focus so keyboard input works
    const canvas = containerRef.current.querySelector('canvas');
    if (canvas) {
      canvas.setAttribute('tabindex', '0');
      canvas.style.outline = 'none';
      canvas.focus();
    }

    if (ref) {
      if (typeof ref === 'function') {
        ref({ game: gameRef.current });
      } else {
        ref.current = { game: gameRef.current };
      }
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      if (ref) {
        if (typeof ref === 'function') {
          ref({ game: null });
        } else {
          ref.current = { game: null };
        }
      }
    };
  }, [ref]);

  return (
    <div
      id="game-container"
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
});

PhaserGame.displayName = 'PhaserGame';
