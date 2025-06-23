import React from 'react';
import { Github, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 px-4 mt-12 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 transition-colors duration-300 relative z-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} LinkSphere. All rights reserved.
        </p>
        
        <div className="flex gap-4">
          <a 
            href="#" 
            className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
            aria-label="Github"
          >
            <Github size={18} />
          </a>
          <a 
            href="#" 
            className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
            aria-label="Twitter"
          >
            <Twitter size={18} />
          </a>
          <a 
            href="#" 
            className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;