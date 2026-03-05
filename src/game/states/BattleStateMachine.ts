export interface IBattleState {
  enter(): void;
  update(time: number, delta: number): void;
  exit(): void;
}

export class BattleStateMachine {
  private currentState: IBattleState | null = null;
  private currentStateName: string | null = null;
  private states: Map<string, IBattleState> = new Map();

  addState(name: string, state: IBattleState): void {
    this.states.set(name, state);
  }

  setState(name: string): void {
    const next = this.states.get(name);
    if (!next) {
      console.warn(`BattleStateMachine: unknown state "${name}"`);
      return;
    }

    if (this.currentState) {
      this.currentState.exit();
    }

    this.currentStateName = name;
    this.currentState = next;
    this.currentState.enter();
  }

  update(time: number, delta: number): void {
    this.currentState?.update(time, delta);
  }

  getCurrentStateName(): string | null {
    return this.currentStateName;
  }
}
