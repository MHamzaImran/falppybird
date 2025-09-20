export enum GameState {
  Idle,
  Countdown,
  Playing,
  Paused,
  GameOver,
}

export interface Bird {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
}

export interface Pipe {
  x: number;
  gapY: number;
  width: number;
  passed: boolean;
}

export interface GameEngineState {
  gameState: GameState;
  score: number;
  highScore: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}