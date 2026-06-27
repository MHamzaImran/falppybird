
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const HowToPlayPage: React.FC = () => {
  return (
    <div className="w-full max-w-2xl bg-sky-800/70 p-8 rounded-lg shadow-xl text-center backdrop-blur-sm text-sky-100">
      <h1 className="text-4xl font-bold mb-6 text-yellow-300">How to Play FlappyBird</h1>
      
      <div className="space-y-6 text-lg text-left">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-white">Objective</h2>
          <p>
            The goal is simple: guide your retro pixel-art bird through the pipes without hitting them. Each pipe you successfully pass earns you one point.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2 text-white">Controls</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Flap:</strong> Press the <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Spacebar</kbd> on your keyboard, or simply <strong>click/tap</strong> anywhere on the game screen.
            </li>
            <li>
              <strong>Pause/Resume:</strong> Press the <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">P</kbd> key or use the pause/play button at the top of the screen during gameplay.
            </li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-white">Game Over</h2>
          <p>
            Your game ends if the bird hits a pipe or touches the ground or the top of the screen. Try to beat your high score!
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Link to="/">
          <Button variant="primary">
            <PlayIcon /> Let's Play!
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HowToPlayPage;
