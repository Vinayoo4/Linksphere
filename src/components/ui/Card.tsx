import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  variant = 'default',
  onClick
}) => {
  const baseClasses = "rounded-xl p-4 overflow-hidden transition-all duration-300";
  
  const variantClasses = {
    default: "bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/30",
    glass: "backdrop-blur-md bg-white/70 dark:bg-gray-800/70 shadow-glass border border-white/20 dark:border-gray-700/30"
  };

  return (
    <motion.div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        onClick && "cursor-pointer hover:shadow-lg transform hover:-translate-y-1",
        className
      )}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
    >
      {children}
    </motion.div>
  );
};

export default Card;