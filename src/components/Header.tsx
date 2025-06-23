import React from 'react';
import { Link } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            <span className="text-primary-600 dark:text-primary-400">Link</span>Sphere
          </h1>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Header;