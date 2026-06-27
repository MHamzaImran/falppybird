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
  SFX_WING,
  SFX_POINT,
  SFX_HIT,
  SFX_DIE,
  SFX_SWOOSH,
  PARTICLE_COUNT,
  PARTICLE_GRAVITY,
  PARTICLE_FADE_RATE,
  PARTICLE_BASE_SPEED,
  THEMES,
  BIRD_FRAME_COUNT,
  BIRD_ANIM_SPEED,
} from '../constants';

const HIGH_SCORE_KEY = 'flappybox_highscore';

const getHighScore = (): number => {
  const score = localStorage.getItem(HIGH_SCORE_KEY);
  return score ? parseInt(score, 10) : 0;
};

const setHighScore = (score: number) => {
  localStorage.setItem(HIGH_SCORE_KEY, score.toString());
};

interface LoadedThemeAssets {
  background: HTMLImageElement;
  birdSpriteSheet: HTMLImageElement; // single image with 4 horizontal frames
  pipe: HTMLImageElement;
  ground: HTMLImageElement;
}

const drawPipe = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  colIndex: number,
  rowIndex: number
) => {
  const colWidth = img.width / 4;
  const rowHeight = img.height / 2;

  const sx = colIndex * colWidth;
  const sy = rowIndex * rowHeight;

  // The cap (rim) is about 20% of the rowHeight in the sprite
  const capSourceHeight = Math.floor(rowHeight * 0.2);
  const capDestHeight = 28;

  // Draw Cap
  ctx.drawImage(
    img,
    sx, sy, colWidth, capSourceHeight,
    x, y, width, capDestHeight
  );

  // Draw Body
  ctx.drawImage(
    img,
    sx, sy + capSourceHeight, colWidth, rowHeight - capSourceHeight,
    x, y + capDestHeight, width, height - capDestHeight
  );
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
  
  // Ref tracking for scrolling, preloaded assets, and active theme index
  const themeIndexRef = useRef(Math.floor(Math.random() * THEMES.length));
  const loadedThemesRef = useRef<LoadedThemeAssets[]>([]);
  const bgScrollXRef = useRef(0);
  const groundScrollXRef = useRef(0);

  // Sound effect refs
  const sfxWingRef = useRef<HTMLAudioElement | null>(null);
  const sfxPointRef = useRef<HTMLAudioElement | null>(null);
  const sfxHitRef = useRef<HTMLAudioElement | null>(null);
  const sfxDieRef = useRef<HTMLAudioElement | null>(null);
  const sfxSwooshRef = useRef<HTMLAudioElement | null>(null);

  const isMutedRef = useRef(false);

  const playSound = useCallback((audioRef: React.RefObject<HTMLAudioElement | null>) => {
    if (!isMutedRef.current && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error('Sound error:', e));
    }
  }, []);
  
  const birdRef = useRef<Bird>({
    x: 50,
    y: GAME_HEIGHT / 2,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
    velocityY: 0,
    frameIndex: 0,
  });

  const pipesRef = useRef<Pipe[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const resetGame = useCallback(() => {
    // Cycle theme on every restart
    themeIndexRef.current = (themeIndexRef.current + 1) % THEMES.length;

    birdRef.current = {
      x: 50,
      y: GAME_HEIGHT / 2,
      width: BIRD_WIDTH,
      height: BIRD_HEIGHT,
      velocityY: 0,
      frameIndex: 0,
    };
    pipesRef.current = [];
    particlesRef.current = [];
    setScore(0);
    frameCountRef.current = 0;
    bgScrollXRef.current = 0;
    groundScrollXRef.current = 0;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const themeIdx = themeIndexRef.current;
    const loadedTheme = loadedThemesRef.current[themeIdx];

    if (isImageLoaded && loadedTheme) {
      // 1. Draw Parallax Background
      let bgX = bgScrollXRef.current % GAME_WIDTH;
      if (bgX > 0) bgX -= GAME_WIDTH;
      ctx.drawImage(loadedTheme.background, bgX, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.drawImage(loadedTheme.background, bgX + GAME_WIDTH, 0, GAME_WIDTH, GAME_HEIGHT);

      // 2. Draw Pipes
      pipesRef.current.forEach(pipe => {
        // Selection of matching color column/row index based on theme
        // Theme 0: Orange pipe
        // Theme 1: Blue pipe
        // Theme 2: Green pipe
        // Theme 3: Purple pipe
        // Theme 4: Silver pipe
        const colIndices = [1, 3, 0, 1, 0];
        const rowIndices = [0, 0, 0, 1, 1];
        const colIdx = colIndices[themeIdx];
        const rowIdx = rowIndices[themeIdx];

        // Top pipe - drawn flipped vertically
        ctx.save();
        ctx.translate(pipe.x, pipe.gapY);
        ctx.scale(1, -1);
        drawPipe(ctx, loadedTheme.pipe, 0, 0, pipe.width, pipe.gapY, colIdx, rowIdx);
        ctx.restore();

        // Bottom pipe - drawn normally
        const bottomPipeHeight = GAME_HEIGHT - pipe.gapY - PIPE_GAP - GROUND_HEIGHT;
        drawPipe(
          ctx,
          loadedTheme.pipe,
          pipe.x,
          pipe.gapY + PIPE_GAP,
          pipe.width,
          bottomPipeHeight,
          colIdx,
          rowIdx
        );
      });

      // 3. Draw Ground
      const groundImg = loadedTheme.ground;
      const sw = groundImg.width / 2;
      const sh = groundImg.height / 2;
      // Alternate ground texture style for cyan day, night stars, and night windows
      const sx = (themeIdx === 1 || themeIdx === 3 || themeIdx === 4) ? sw : 0;
      const sy = groundImg.height - sh;
      const tileWidth = 96;
      let groundX = groundScrollXRef.current % tileWidth;
      if (groundX > 0) groundX -= tileWidth;

      while (groundX < GAME_WIDTH) {
        ctx.drawImage(
          groundImg,
          sx, sy, sw, sh,
          groundX, GAME_HEIGHT - GROUND_HEIGHT, tileWidth, GROUND_HEIGHT
        );
        groundX += tileWidth;
      }
      
      // 4. Draw Bird (unless Game Over)
      // Each birdSpriteSheet is a horizontal strip of 4 animation frames.
      // We slice out one frame based on bird.frameIndex.
      if (gameState !== GameState.GameOver) {
        const bird = birdRef.current;
        const sheet = loadedTheme.birdSpriteSheet;
        if (sheet && sheet.complete && sheet.naturalWidth > 0) {
          const frameW = sheet.naturalWidth / BIRD_FRAME_COUNT; // width of one frame in the source image
          const frameH = sheet.naturalHeight;
          const sx = (bird.frameIndex % BIRD_FRAME_COUNT) * frameW; // source x offset

          const rotation = Math.min(Math.max(bird.velocityY * 0.08, -0.4), 0.7);
          ctx.save();
          ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
          ctx.rotate(rotation);
          ctx.drawImage(
            sheet,
            sx, 0, frameW, frameH,          // source rectangle (one frame)
            -bird.width / 2, -bird.height / 2,
            bird.width, bird.height           // destination rectangle
          );
          ctx.restore();
        } else {
          ctx.fillStyle = '#facc15';
          ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
        }
      }

    } else {
      // Fallback plain vector drawing if assets are not preloaded
      const bgGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      bgGradient.addColorStop(0, '#38bdf8');
      bgGradient.addColorStop(1, '#7dd3fc');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = '#16a34a';
      pipesRef.current.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
        ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, pipe.width, GAME_HEIGHT - pipe.gapY - PIPE_GAP - GROUND_HEIGHT);
      });

      const groundGradient = ctx.createLinearGradient(0, GAME_HEIGHT - GROUND_HEIGHT, 0, GAME_HEIGHT);
      groundGradient.addColorStop(0, '#f59e0b');
      groundGradient.addColorStop(1, '#b45309');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT);

      if (gameState !== GameState.GameOver) {
        const bird = birdRef.current;
        ctx.fillStyle = '#facc15';
        ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
      }
    }

    // 5. Draw Particles
    if (particlesRef.current.length > 0) {
      const particleColors = ['#f97316', '#eab308', '#f97316', '#eab308', '#f59e0b'];
      ctx.fillStyle = particleColors[themeIdx] || '#facc15';
      particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      });
      ctx.globalAlpha = 1.0;
    }

  }, [canvasRef, isImageLoaded, gameState]);

  const gameOver = useCallback(() => {
    setGameState(GameState.GameOver);
    if (score > highScore) {
      setHighScore(score);
      setLocalHighScore(score);
    }

    // Play hit sound immediately, then die sound after a short delay
    playSound(sfxHitRef);
    setTimeout(() => playSound(sfxDieRef), 300);
    
    // Particle explosion
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
            size: Math.random() * 4 + 2,
            alpha: 1,
        });
    }
    particlesRef.current = newParticles;

  }, [score, highScore, playSound]);
  
  const gameLoop = useCallback(() => {
    if (gameState === GameState.Playing) {
      // Bird physics
      birdRef.current.velocityY += GRAVITY;
      if (birdRef.current.velocityY > TERMINAL_VELOCITY) {
        birdRef.current.velocityY = TERMINAL_VELOCITY;
      }
      birdRef.current.y += birdRef.current.velocityY;

      // Wing animation cycle
      frameCountRef.current++;
      if (frameCountRef.current % BIRD_ANIM_SPEED === 0) {
        birdRef.current.frameIndex = (birdRef.current.frameIndex + 1) % BIRD_FRAME_COUNT;
      }

      // Parallax scrolling movements
      bgScrollXRef.current = (bgScrollXRef.current + PIPE_SPEED * 0.3) % GAME_WIDTH;
      groundScrollXRef.current = (groundScrollXRef.current + PIPE_SPEED) % 96;

      // Pipe management
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
          playSound(sfxPointRef);
        }
      }
    }

    // Particle decay physics
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
    playSound(sfxSwooshRef);
    setCountdown(3);
    setGameState(GameState.Countdown);
  }, [resetGame, playSound]);

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
      playSound(sfxWingRef);
    }
  }, [gameState, playSound]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newVal = !prev;
      isMutedRef.current = newVal;
      return newVal;
    });
  }, []);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);
  
  // Asset preloading effect
  useEffect(() => {
    let active = true;
    const promises: Promise<void>[] = [];
    const loadedThemes: LoadedThemeAssets[] = [];

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
      });
    };

    THEMES.forEach((theme, index) => {
      const themeAssets: Partial<LoadedThemeAssets> = {};
      
      const pBg = loadImage(theme.background).then(img => {
        themeAssets.background = img;
      });
      promises.push(pBg);

      const pPipe = loadImage(theme.pipe).then(img => {
        themeAssets.pipe = img;
      });
      promises.push(pPipe);

      const pGround = loadImage(theme.ground).then(img => {
        themeAssets.ground = img;
      });
      promises.push(pGround);

      // Load one sprite sheet per theme (contains 4 horizontal frames for one bird color)
      const pBird = loadImage(theme.birdSpriteSheet).then(img => {
        themeAssets.birdSpriteSheet = img;
      });
      promises.push(pBird);

      loadedThemes[index] = themeAssets as LoadedThemeAssets;
    });

    // Preload all sound effects
    const loadAudio = (src: string, volume = 0.3): HTMLAudioElement => {
      const audio = new Audio(src);
      audio.volume = volume;
      return audio;
    };
    sfxWingRef.current = loadAudio(SFX_WING, 0.3);
    sfxPointRef.current = loadAudio(SFX_POINT, 0.4);
    sfxHitRef.current = loadAudio(SFX_HIT, 0.5);
    sfxDieRef.current = loadAudio(SFX_DIE, 0.5);
    sfxSwooshRef.current = loadAudio(SFX_SWOOSH, 0.3);

    Promise.all(promises).then(() => {
      if (active) {
        loadedThemesRef.current = loadedThemes;
        setIsImageLoaded(true);
      }
    }).catch(err => {
      console.error("Failed to preload assets:", err);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isImageLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (gameState === GameState.Idle) {
      resetGame();
      draw();
    }
  }, [isImageLoaded, canvasRef]);
  
  return { gameState, score, highScore, startGame, pauseGame, resumeGame, flap, isMuted, toggleMute, countdown };
};