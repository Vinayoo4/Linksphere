import React from 'react';
import { motion } from 'framer-motion';

interface ProfileProps {
  name: string;
  bio: string;
  avatar: string;
}

const Profile: React.FC<ProfileProps> = ({ name, bio, avatar }) => {
  return (
    <motion.div 
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-32 h-32 mb-4 overflow-hidden rounded-full shadow-lg animate-pulse-slow">
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-primary-500 via-secondary-500 to-accent-500"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-1 rounded-full overflow-hidden shadow-inner">
          <img 
            src={avatar} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <motion.h1 
        className="text-2xl font-bold mt-2 text-gray-900 dark:text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {name}
      </motion.h1>
      
      <motion.p 
        className="text-gray-600 dark:text-gray-300 max-w-md mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {bio}
      </motion.p>
    </motion.div>
  );
};

export default Profile;