import React, { useRef, useEffect, useCallback } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { GameState } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import Button from '../components/Button';

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const RestartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 11M20 20l-1.5-1.5A9 9 0 003.5 13" /></svg>
);

const SoundOnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-.464a5 5 0 000-7.072M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const SoundOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2" /></svg>
);


const GamePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, score, highScore, startGame, pauseGame, resumeGame, flap, isMuted, toggleMute, countdown } = useGameEngine(canvasRef);

  const handleUserAction = useCallback(() => {
    if (gameState === GameState.Idle) {
      startGame();
    } else if (gameState === GameState.Playing) {
      flap();
    } else if (gameState === GameState.GameOver) {
      startGame();
    }
  }, [gameState, startGame, flap]);

  const handlePauseToggle = useCallback((e: React.MouseEvent) => {
     e.stopPropagation();
     if(gameState === GameState.Playing) {
         pauseGame();
     } else if(gameState === GameState.Paused) {
         resumeGame();
     }
  }, [gameState, pauseGame, resumeGame]);
  
  const handleMuteToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleMute();
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleUserAction();
      }
      if (e.code === 'KeyP') {
        e.preventDefault();
        if (gameState === GameState.Playing) pauseGame();
        else if (gameState === GameState.Paused) resumeGame();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleUserAction, pauseGame, resumeGame, gameState]);

  const renderOverlay = () => {
    switch (gameState) {
      case GameState.Idle:
        return (
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-4 animate-pulse">FlappyBox</h2>
            <p className="text-xl mb-8">Click or Press Space to Start</p>
            <Button onClick={handleUserAction} variant="primary">
                <PlayIcon/> Start Game
            </Button>
          </div>
        );
      case GameState.Countdown:
        return (
          <div className="text-8xl font-bold text-white animate-pulse" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.7)'}}>
            {countdown}
          </div>
        );
      case GameState.GameOver:
        return (
          <div className="text-center bg-black/50 p-8 rounded-xl shadow-2xl backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-2 text-red-500">Game Over</h2>
            <p className="text-2xl mb-4">Your Score: <span className="font-bold text-yellow-300">{score}</span></p>
            <p className="text-xl mb-6">High Score: <span className="font-bold text-yellow-300">{highScore}</span></p>
            <Button onClick={handleUserAction} variant="primary">
                <RestartIcon/> Play Again
            </Button>
          </div>
        );
      case GameState.Paused:
        return (
           <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Paused</h2>
            <Button onClick={resumeGame} variant="secondary">
                <PlayIcon/> Resume
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden shadow-2xl" 
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      onClick={handleUserAction}
    >
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="block"
      />
      
      {/* Game UI Overlay */}
      {(gameState === GameState.Idle || gameState === GameState.GameOver || gameState === GameState.Paused || gameState === GameState.Countdown) && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
          {renderOverlay()}
        </div>
      )}

      {/* In-Game UI */}
      {(gameState === GameState.Playing || gameState === GameState.Paused) && (
        <div className="absolute top-0 left-0 right-0 p-4 text-white flex justify-between items-center">
           <div className="text-4xl font-bold text-shadow" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>{score}</div>
           <div className="flex items-center gap-2">
             <button onClick={handleMuteToggle} className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition" aria-label={isMuted ? "Unmute sound" : "Mute sound"}>
                {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
             </button>
             <button onClick={handlePauseToggle} className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition" aria-label={gameState === GameState.Playing ? "Pause game" : "Resume game"}>
               {gameState === GameState.Playing ? <PauseIcon/> : <PlayIcon/>}
             </button>
           </div>
        </div>
      )}
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-lg font-bold text-shadow text-white/80" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
        High Score: {highScore}
      </div>
    </div>
  );
};

export default GamePage;