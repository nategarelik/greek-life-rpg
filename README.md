# BRO-MON: Greek Life RPG

A Pokemon-inspired turn-based RPG set in Greek life, built with Phaser 3 and Next.js. Pledge a fraternity, recruit Bros, and battle your way through Greek Row to challenge the Dean of Greek Life.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Game engine | [Phaser 3](https://phaser.io/) (v3.90) |
| Movement | [Grid-Engine](https://github.com/Annoraaq/grid-engine) (v2.44) |
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript 5.7 (strict) |
| Package manager | pnpm |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Install & Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and select **New Game** to start.

### Controls

| Key | Action |
|-----|--------|
| Arrow keys | Move / navigate menus |
| Enter / Z | Confirm / interact |
| Space | Talk to NPCs / dismiss dialogue |
| Esc | Open pause menu |

## Game Overview

### The Pitch

You're a freshman pledging **Sigma Sigma Sigma**. Explore the campus, recruit Bros (creature-like college archetypes), and battle rival houses in turn-based combat. Each Bro has a type, stats, and moves themed around Greek life culture.

### Bro Types

Six types with rock-paper-scissors-style effectiveness:

| Type | Color | Flavor |
|------|-------|--------|
| **Jock** | Red | Physical powerhouses — keg stands and body slams |
| **Prep** | Gold | Social elites — trust funds and networking |
| **Nerd** | Blue | Intellectual fighters — roasts and pop quizzes |
| **Stoner** | Green | Defensive walls — vibe checks and hotboxing |
| **Scene** | Purple | Speed demons — crowd surfs and mosh pits |
| **Goth** | Gray | Special attackers — hexes and dark poetry |

### Evolution Chains

Each type has a 3-stage evolution line:

| Type | Stage 1 | Stage 2 | Stage 3 |
|------|---------|---------|---------|
| Jock | Lil Pledge | Frat Bro | Chapter President |
| Prep | Trust Fund Baby | Country Club Kid | CEO |
| Nerd | Shy Nerd | Lab Rat | Professor |
| Stoner | Chill Dude | Stoner Bro | Zen Master |
| Scene | Skater Kid | Scene Lord | Festival God |
| Goth | Emo Kid | Dark Lord | Void Walker |

### Stats

Every Bro has six stats:

| Stat | Abbr | Role |
|------|------|------|
| Stamina | STA | Hit points |
| Hype | HYP | Physical attack power |
| Clout | CLT | Special/social attack power |
| Chill | CHL | Physical defense |
| Drip | DRP | Special/social defense |
| Vibes | VBS | Speed (turn order) |

### Battle Mechanics

- Turn-based combat with up to 4 moves per Bro
- Type effectiveness multipliers (super effective / not very effective / immune)
- STAB (Same-Type Attack Bonus): 1.5x when move type matches Bro type
- Critical hits: 1/16 base rate, 1.5x damage
- Status effects: cancelled, passed out, embarrassed, hungover
- Stat modifiers: moves can raise/lower stats in stages
- Recoil moves: some attacks deal self-damage
- PP system: each move has limited uses
- Wild Bro catching with catch-rate formula
- XP and leveling (max level 50)

### Party & Inventory

- Carry up to 6 Bros in your party
- Items: Red Solo Cup (healing), Rush Flyer (recruitment), and more
- 10% encounter rate on wild tiles

## Project Structure

```
src/
├── app/                    # Next.js pages (/, /play)
├── components/             # React components (PhaserGame wrapper)
├── game/
│   ├── main.ts             # Phaser config and bootstrap
│   ├── GameState.ts        # Singleton global state
│   ├── EventBus.ts         # Scene-to-scene communication
│   ├── scenes/             # Phaser scenes (game phases)
│   │   ├── BootScene.ts
│   │   ├── PreloaderScene.ts
│   │   ├── TitleScene.ts
│   │   ├── IntroScene.ts
│   │   ├── OverworldScene.ts
│   │   ├── BattleScene.ts
│   │   ├── BattleUIScene.ts
│   │   ├── PauseMenuScene.ts
│   │   ├── DialogScene.ts
│   │   └── TransitionScene.ts
│   ├── entities/           # Player, NPC, Trainer, BroInstance
│   ├── systems/            # Battle, Party, Inventory, Encounter, Dialog, Audio, Save
│   ├── states/             # Battle state machine (FSM)
│   ├── ui/                 # In-game UI (menus, health bars, text boxes)
│   └── utils/              # Damage calc, type chart, map/asset generation
├── data/                   # Bros, moves, items, encounters, trainers, constants
└── types/                  # TypeScript type definitions
```

### Architecture

- **Scenes** handle rendering, input, and lifecycle
- **Systems** contain game rules and business logic
- **Entities** represent game objects (player, NPCs, individual Bros)
- **States** manage battle flow via a finite state machine
- **EventBus** enables decoupled scene communication

## Scripts

<!-- AUTO-GENERATED -->
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | TypeScript type checking (no emit) |
<!-- /AUTO-GENERATED -->

## Development Status

**Current version:** 0.1.0 (Phases 1-2)

### Implemented

- Scene flow: boot, preload, title, intro, overworld, battle, pause menu
- Grid-based overworld exploration with Grid-Engine
- Turn-based battle system with full damage calculation
- Defeat handling when all party Bros faint
- 18 Bro species across 6 types with 3-stage evolution chains
- 24 moves with type effectiveness, status effects, stat modifiers, and recoil
- Party management (6-Bro limit) with real party integration in battles
- Inventory system
- Wild encounter system
- Catch mechanics
- NPC dialogue system (face NPC + Space to talk)
- Pause menu with party viewer, bag, and save placeholder
- Overworld HUD with zone labels and tutorial overlay
- Stat recalculation on level up

### Planned

- Trainer battles
- Story progression and quest system
- Evolution triggers
- Full save/load persistence
- Audio (BGM + SFX)
- Full item usage in battle
- Gym leaders and badge system

## License

Private project.
