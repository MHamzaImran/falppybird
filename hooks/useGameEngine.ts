import { useState, useRef, useCallback, useEffect } from 'react';
import type { Bird, Pipe, GameState as GameStateType, Particle } from '../types';
import { GameState } from '../types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRAVITY,
  JUMP_STRENGTH,
  TERMINAL_VELOCITY,
  BIRD_WIDTH,
  BIRD_HEIGHT,
  PIPE_WIDTH,
  PIPE_GAP,
  PIPE_SPEED,
  PIPE_SPAWN_INTERVAL,
  GROUND_HEIGHT,
  BIRD_SPRITE_SRC,
  FLAP_SOUND_SRC,
  PARTICLE_COUNT,
  PARTICLE_GRAVITY,
  PARTICLE_FADE_RATE,
  PARTICLE_BASE_SPEED,
} from '../constants';

const HIGH_SCORE_KEY = 'flappybox_highscore';

const getHighScore = (): number => {
  const score = localStorage.getItem(HIGH_SCORE_KEY);
  return score ? parseInt(score, 10) : 0;
};

const setHighScore = (score: number) => {
  localStorage.setItem(HIGH_SCORE_KEY, score.toString());
};


export const useGameEngine = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [gameState, setGameState] = useState<GameStateType>(GameState.Idle);
  const [score, setScore] = useState(0);
  const [highScore, setLocalHighScore] = useState(getHighScore());
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const gameLoopRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const birdImageRef = useRef<HTMLImageElement | null>(null);
  const flapSoundRef = useRef<HTMLAudioElement | null>(null);
  
  const birdRef = useRef<Bird>({
    x: 50,
    y: GAME_HEIGHT / 2,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
    velocityY: 0,
  });

  const pipesRef = useRef<Pipe[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const resetGame = useCallback(() => {
    birdRef.current = {
      x: 50,
      y: GAME_HEIGHT / 2,
      width: BIRD_WIDTH,
      height: BIRD_HEIGHT,
      velocityY: 0,
    };
    pipesRef.current = [];
    particlesRef.current = [];
    setScore(0);
    frameCountRef.current = 0;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    bgGradient.addColorStop(0, '#38bdf8'); // sky-400
    bgGradient.addColorStop(1, '#7dd3fc'); // sky-300
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw pipes
    ctx.fillStyle = '#16a34a'; // green-600
    pipesRef.current.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, pipe.width, GAME_HEIGHT - pipe.gapY - PIPE_GAP - GROUND_HEIGHT);
    });

    // Draw ground
    const groundGradient = ctx.createLinearGradient(0, GAME_HEIGHT - GROUND_HEIGHT, 0, GAME_HEIGHT);
    groundGradient.addColorStop(0, '#f59e0b'); // amber-500
    groundGradient.addColorStop(1, '#b45309'); // amber-700
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT);
    
    // Draw bird, unless it's game over (it exploded)
    if (gameState !== GameState.GameOver) {
      const bird = birdRef.current;
      const birdImage = birdImageRef.current;
      if (birdImage && isImageLoaded) {
          ctx.drawImage(
              birdImage,
              bird.x, bird.y,
              BIRD_WIDTH, BIRD_HEIGHT
          );
      } else {
          // Fallback drawing if image is not ready
          ctx.fillStyle = '#facc15'; // yellow-400
          ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
      }
    }

    // Draw particles
    if (particlesRef.current.length > 0) {
        ctx.fillStyle = '#facc15'; // yellow-400
        particlesRef.current.forEach(p => {
            ctx.globalAlpha = p.alpha;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        });
        ctx.globalAlpha = 1.0; // Reset alpha
    }

  }, [canvasRef, isImageLoaded, gameState]);

  const gameOver = useCallback(() => {
    setGameState(GameState.GameOver);
    if (score > highScore) {
      setHighScore(score);
      setLocalHighScore(score);
    }
    
    // Create particle explosion
    const bird = birdRef.current;
    const newParticles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * PARTICLE_BASE_SPEED + 1;
        newParticles.push({
            x: bird.x + bird.width / 2,
            y: bird.y + bird.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2, // squares can be a bit bigger
            alpha: 1,
        });
    }
    particlesRef.current = newParticles;

  }, [score, highScore]);
  
  const gameLoop = useCallback(() => {
    // Game logic only runs when playing
    if (gameState === GameState.Playing) {
      // Bird physics
      birdRef.current.velocityY += GRAVITY;
      if (birdRef.current.velocityY > TERMINAL_VELOCITY) {
        birdRef.current.velocityY = TERMINAL_VELOCITY;
      }
      birdRef.current.y += birdRef.current.velocityY;

      // Pipe management
      frameCountRef.current++;
      if (frameCountRef.current % PIPE_SPAWN_INTERVAL === 0) {
        const gapY = Math.floor(Math.random() * (GAME_HEIGHT - GROUND_HEIGHT - PIPE_GAP - 100)) + 50;
        pipesRef.current.push({ x: GAME_WIDTH, gapY, width: PIPE_WIDTH, passed: false });
      }

      pipesRef.current.forEach(pipe => {
        pipe.x += PIPE_SPEED;
      });

      // Remove off-screen pipes
      pipesRef.current = pipesRef.current.filter(pipe => pipe.x + PIPE_WIDTH > 0);

      // Collision detection
      const bird = birdRef.current;
      if (bird.y + bird.height > GAME_HEIGHT - GROUND_HEIGHT || bird.y < 0) {
        gameOver();
      }

      for (const pipe of pipesRef.current) {
        const birdRight = bird.x + bird.width;
        const birdBottom = bird.y + bird.height;
        const pipeRight = pipe.x + pipe.width;

        if (birdRight > pipe.x && bird.x < pipeRight) {
          if (bird.y < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP) {
            gameOver();
            break;
          }
        }
        
        if (!pipe.passed && bird.x > pipeRight) {
          pipe.passed = true;
          setScore(prev => prev + 1);
        }
      }
    }

    // Particle physics runs regardless of game state for fade-out effect
    if (particlesRef.current.length > 0) {
        particlesRef.current.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += PARTICLE_GRAVITY;
            p.alpha -= PARTICLE_FADE_RATE;
        });
        particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);
    }

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, draw, gameOver]);

  const startGame = useCallback(() => {
    resetGame();
    setCountdown(3);
    setGameState(GameState.Countdown);
  }, [resetGame]);

  useEffect(() => {
    if (gameState !== GameState.Countdown) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setGameState(GameState.Playing);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);
  
  const pauseGame = useCallback(() => {
    if (gameState === GameState.Playing) {
      setGameState(GameState.Paused);
    }
  }, [gameState]);

  const resumeGame = useCallback(() => {
    if (gameState === GameState.Paused) {
      setGameState(GameState.Playing);
    }
  }, [gameState]);

  const flap = useCallback(() => {
    if (gameState === GameState.Playing) {
      birdRef.current.velocityY = JUMP_STRENGTH;
      if (!isMuted && flapSoundRef.current) {
        flapSoundRef.current.currentTime = 0;
        flapSoundRef.current.play().catch(error => console.error("Error playing sound:", error));
      }
    }
  }, [gameState, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  useEffect(() => {
    // The main animation loop. It runs continuously.
    // The logic inside gameLoop() is gated by gameState.
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);
  
  // Asset loading effect
  useEffect(() => {
    // Image
    const img = new Image();
    img.onload = () => {
      birdImageRef.current = img;
      setIsImageLoaded(true);
    };
    img.src = BIRD_SPRITE_SRC;

    // Sound
    const audio = new Audio(FLAP_SOUND_SRC);
    audio.volume = 0.3;
    flapSoundRef.current = audio;
  }, []);

  useEffect(() => {
    if (!isImageLoaded) return; // Wait for image
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Initial draw when assets are ready
    if (gameState === GameState.Idle) {
      resetGame();
      draw();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isImageLoaded, canvasRef]);
  
  return { gameState, score, highScore, startGame, pauseGame, resumeGame, flap, isMuted, toggleMute, countdown };
};