// Backgrounds
import bg1 from './assets/Background/Background1.png';
import bg2 from './assets/Background/Background2.png';
import bg3 from './assets/Background/Background3.png';
import bg4 from './assets/Background/Background4.png';
import bg5 from './assets/Background/Background5.png';

// Birds - each file is a sprite strip of 4 animation frames for ONE color
// StyleBird1: Bird1-1=orange, Bird1-2=blue, Bird1-3=red, Bird1-4=green, Bird1-5=teal, Bird1-6=gray, Bird1-7=brown
import bird1_1 from './assets/Player/StyleBird1/Bird1-1.png';
import bird1_2 from './assets/Player/StyleBird1/Bird1-2.png';
import bird1_3 from './assets/Player/StyleBird1/Bird1-3.png';

// StyleBird2: Bird2-1=yellow, Bird2-2=blue, Bird2-3=cyan, Bird2-4=pink, Bird2-5=green, Bird2-6=purple, Bird2-7=brown
import bird2_1 from './assets/Player/StyleBird2/Bird2-1.png';
import bird2_4 from './assets/Player/StyleBird2/Bird2-4.png';

// Pipes & Grounds
import pipeStyle1 from './assets/Tiles/Style 1/PipeStyle1.png';
import simpleStyle1 from './assets/Tiles/Style 1/SimpleStyle1.png';

import pipeStyle2 from './assets/Tiles/Style 2/PipeStyle2.png';
import simpleStyle2 from './assets/Tiles/Style 2/SimpleStyle2.png';

import pipeStyle3 from './assets/Tiles/Style 3/PipeStyle3.png';
import simpleStyle3 from './assets/Tiles/Style 3/SimpleStyle3.png';

import pipeStyle4 from './assets/Tiles/Style 4/PipeStyle4.png';
import simpleStyle4 from './assets/Tiles/Style 4/SimpleStyle4.png';

import pipeStyle5 from './assets/Tiles/Style 5/PipeStyle5.png';
import simpleStyle5 from './assets/Tiles/Style 5/SimpleStyle5.png';

// Game dimensions
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 640;

// Bird physics
export const GRAVITY = 0.3; // Reduced from 0.5 for a lighter feel
export const JUMP_STRENGTH = -6.5; // Adjusted from -8 to balance with new gravity
export const TERMINAL_VELOCITY = 8; // Caps maximum fall speed for better control
export const BIRD_WIDTH = 34; // Display size on canvas
export const BIRD_HEIGHT = 24; // Display size on canvas

// Animation settings
// Each bird image is a horizontal sprite strip containing 4 animation frames
export const BIRD_FRAME_COUNT = 4;
export const BIRD_ANIM_SPEED = 6; // advance frame every 6 game ticks

// Sound effects (using .ogg — 5-20x smaller than .wav with near-identical quality)
import sfxWing from './assets/Sound Efects/wing.ogg';
import sfxPoint from './assets/Sound Efects/point.ogg';
import sfxHit from './assets/Sound Efects/hit.ogg';
import sfxDie from './assets/Sound Efects/die.ogg';
import sfxSwoosh from './assets/Sound Efects/swoosh.ogg';

export const SFX_WING = sfxWing;       // bird flap
export const SFX_POINT = sfxPoint;     // score a point passing a pipe
export const SFX_HIT = sfxHit;         // collision with pipe
export const SFX_DIE = sfxDie;         // death after collision
export const SFX_SWOOSH = sfxSwoosh;   // game start / transition swoosh

// Pipe settings
export const PIPE_WIDTH = 60;
export const PIPE_GAP = 180;
export const PIPE_SPEED = -3;
export const PIPE_SPAWN_INTERVAL = 100; // in frames

// Ground settings
export const GROUND_HEIGHT = 80;

// Particle settings
export const PARTICLE_COUNT = 30;
export const PARTICLE_GRAVITY = 0.05;
export const PARTICLE_FADE_RATE = 0.015;
export const PARTICLE_BASE_SPEED = 2;

// Theme: each birdSpriteSheet is a SINGLE image containing 4 horizontal frames
export interface Theme {
  background: string;
  birdSpriteSheet: string; // one sprite strip image with 4 animation frames
  pipe: string;
  ground: string;
}

export const THEMES: Theme[] = [
  {
    background: bg1,
    birdSpriteSheet: bird1_1, // orange bird
    pipe: pipeStyle1,
    ground: simpleStyle1,
  },
  {
    background: bg2,
    birdSpriteSheet: bird2_1, // yellow bird
    pipe: pipeStyle2,
    ground: simpleStyle2,
  },
  {
    background: bg3,
    birdSpriteSheet: bird1_2, // blue bird
    pipe: pipeStyle3,
    ground: simpleStyle3,
  },
  {
    background: bg4,
    birdSpriteSheet: bird2_4, // pink bird
    pipe: pipeStyle4,
    ground: simpleStyle4,
  },
  {
    background: bg5,
    birdSpriteSheet: bird1_3, // red bird
    pipe: pipeStyle5,
    ground: simpleStyle5,
  },
];
