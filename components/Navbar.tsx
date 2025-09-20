
import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const linkStyles = "text-lg text-sky-100 hover:text-white transition-colors duration-200 px-3 py-2 rounded-md";
  const activeLinkStyles = "bg-sky-800/50 text-white font-semibold";

  return (
    <header className="bg-sky-900/50 shadow-lg backdrop-blur-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <NavLink to="/" className="text-2xl font-bold text-white tracking-wider">
          Flappy<span className="text-yellow-300">Box</span>
        </NavLink>
        <div className="flex items-center space-x-2 md:space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}
          >
            Game
          </NavLink>
          <NavLink
            to="/how-to-play"
            className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}
          >
            How to Play
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}
          >
            Leaderboard
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
