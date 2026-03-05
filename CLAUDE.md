# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Next.js dev server with Turbopack (http://localhost:3000)
pnpm build        # Production build (includes typecheck)
pnpm typecheck    # TypeScript type checking only (tsc --noEmit)
pnpm lint         # ESLint (next lint — may require initial setup)
```

## Architecture

This is **BRO-MON**, a Pokemon-inspired turn-based RPG built with **Phaser 3** inside **Next.js 15**. The game runs client-side in a canvas element; Next.js serves as the shell.

### Phaser + Next.js Integration

`PhaserGame.tsx` is a client component that dynamically imports (SSR disabled) and manages the Phaser.Game lifecycle via refs. The game canvas must be focused for keyboard input — this is handled automatically. The game factory is `StartGame()` in `game/main.ts`.

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json). Use `@/` for all imports outside relative siblings.

### Scene Flow

```
BootScene → PreloaderScene → TitleScene → IntroScene → OverworldScene
                                                          ↕
                                              BattleScene + BattleUIScene
                                              PauseMenuScene (overlay)
                                              DialogScene / TransitionScene
```

- **OverworldScene** uses **Grid-Engine** plugin for tile-based movement (32px tiles, 1.5x camera zoom)
- Scenes communicate via `EventBus` (Phaser.Events.EventEmitter) and the `gameState` singleton
- Battle config is passed via `scene.launch('BattleScene', { targetData: BattleConfig })`

### Battle State Machine

`BattleStateMachine` implements the FSM pattern with `IBattleState` (enter/update/exit). States live in `states/battle-states/`:

IntroState → PlayerTurnState ↔ EnemyTurnState → AttackState → FaintState → VictoryState/DefeatState

Also: CatchState, FleeState. Each state holds a reference to BattleScene and transitions via `setState()`.

### Global State (Singleton)

`GameState.ts` exports `gameState = GameStateManager.getInstance()`. It owns:
- `party: PartySystem` (max 6 Bros, storage for extras)
- `inventory: InventorySystem` (slots with itemId + quantity)
- Player metadata: name, money, badges, storyFlags, defeatedTrainers, currentZoneId

### Entity Pattern

`BroInstance.ts` uses **pure functions** (not classes):
- `createBroInstance(species, level, ivs?)` → `SavedBro`
- `createStarterBro(speciesId)` / `createWildBro(speciesId, level)`
- `calculateStatsForLevel(species, level, ivs)` — stat formula with IVs (0-31)
- `addXP(bro, amount)` → `LevelUpResult | null`

Player, NPC, and Trainer are thin wrappers around sprites.

### Data Layer Convention

Data files export a typed array and a `Record<number, T>` map for O(1) lookup:

```typescript
export const BRO_SPECIES: BroSpecies[] = [...];
export const BRO_MAP: Record<number, BroSpecies> = Object.fromEntries(BRO_SPECIES.map(b => [b.id, b]));
```

Same pattern for `MOVES/MOVE_MAP`, `ITEMS/ITEM_MAP`. Always use the `_MAP` variant for ID lookups.

### Type System

Six Bro types: `'jock' | 'prep' | 'nerd' | 'stoner' | 'scene' | 'goth'`

Six stats: `stamina` (HP), `hype` (phys atk), `clout` (sp atk), `chill` (phys def), `drip` (sp def), `vibes` (speed)

Move categories: `'hype' | 'clout' | 'status'` — hype uses attack/defense, clout uses clout/drip.

Type effectiveness is a 6x6 matrix in `utils/typeChart.ts` (2.0 / 1.0 / 0.5).

### Systems

Systems are stateful managers instantiated by GameState or BattleScene:
- **BattleSystem**: damage calc, turn ordering, AI, catch/flee logic
- **PartySystem**: party/storage management, healing
- **InventorySystem**: item add/remove/check
- **EncounterSystem**: wild encounter triggers (15% per encounter tile, 3-step minimum)
- **SaveSystem**: slot-based save/load (3 slots)

### Damage Formula

Located in `utils/math.ts`:
- Base: `((2*level/5 + 2) * power * atk/def) / 50 + 2`
- Multiplied by: type effectiveness, STAB (1.5x), critical (1.5x, 1/16 rate), random (0.85-1.0)

## Conventions

- **Phaser imports**: `import * as Phaser from 'phaser'` (namespace import, not default)
- **Grid-Engine**: `import { GridEngine } from 'grid-engine'` — accessed via cast: `(this as unknown as { gridEngine: GridEngine }).gridEngine`
- **Type imports**: use `import type { ... }` for type-only imports
- **Constants**: defined in `data/constants.ts` — TILE_SIZE, MAX_PARTY_SIZE, MAX_LEVEL, damage multipliers
- **Assets**: procedurally generated as placeholders in BootScene via `assetGenerator.ts`
- **Maps**: procedurally generated via `mapGenerator.ts` (no Tiled files yet)
