
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const HIGH_SCORE_KEY = 'flappybox_highscore';

const LeaderboardPage: React.FC = () => {
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const score = localStorage.getItem(HIGH_SCORE_KEY);
    setHighScore(score ? parseInt(score, 10) : 0);
  }, []);

  const resetHighScore = () => {
    localStorage.removeItem(HIGH_SCORE_KEY);
    setHighScore(0);
  };

  return (
    <div className="w-full max-w-md bg-sky-800/70 p-8 rounded-lg shadow-xl text-center backdrop-blur-sm text-sky-100">
      <h1 className="text-4xl font-bold mb-6 text-yellow-300">Leaderboard</h1>
      
      <div className="bg-sky-900/50 p-6 rounded-lg">
        <p className="text-xl mb-2">Your High Score</p>
        <p className="text-6xl font-bold text-yellow-300 tracking-tight">{highScore}</p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/">
          <Button variant="primary" className="w-full">
            Play Game
          </Button>
        </Link>
        <Button variant="secondary" onClick={resetHighScore} className="w-full bg-red-600 hover:bg-red-500 focus:ring-red-500">
          Reset Score
        </Button>
      </div>
    </div>
  );
};

export default LeaderboardPage;
