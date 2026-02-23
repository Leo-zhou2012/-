/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Point {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Point;
}

export interface EnemyRocket extends Entity {
  start: Point;
  target: Point;
  speed: number;
  progress: number; // 0 to 1
}

export interface InterceptorMissile extends Entity {
  start: Point;
  target: Point;
  speed: number;
  progress: number; // 0 to 1
}

export interface Explosion extends Entity {
  radius: number;
  maxRadius: number;
  growing: boolean;
  alpha: number;
}

export interface City extends Entity {
  active: boolean;
}

export interface Battery extends Entity {
  active: boolean;
  missiles: number;
  maxMissiles: number;
}

export type GameStatus = 'START' | 'PLAYING' | 'WON' | 'LOST';

export const GAME_CONFIG = {
  WIN_SCORE: 1000,
  ROCKET_SCORE: 20,
  EXPLOSION_SPEED: 2,
  EXPLOSION_MAX_RADIUS: 40,
  MISSILE_SPEED: 0.02,
  ROCKET_SPEED_MIN: 0.0004,
  ROCKET_SPEED_MAX: 0.0008,
  MAX_ROCKETS: 75,
  SPAWN_RATE: 0.01, // Probability per frame
};
