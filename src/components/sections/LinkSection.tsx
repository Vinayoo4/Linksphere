import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import Card from '../ui/Card';
import { Link } from '../../types';
import SectionTitle from './SectionTitle';

interface LinkSectionProps {
  links: Link[];
}

const LinkSection: React.FC<LinkSectionProps> = ({ links }) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (links.length === 0) return null;

  return (
    <section>
      <SectionTitle 
        title="Useful Links" 
        icon={<ExternalLink className="w-5 h-5" />}
      />
      
      <div className="grid gap-4 mt-4">
        {links.map((link) => (
          <motion.div key={link.id} variants={item}>
            <Card 
              variant="glass" 
              className="hover:bg-gray-50 dark:hover:bg-gray-800/90"
              onClick={() => window.open(link.url, '_blank')}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <ExternalLink size={20} />
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900 dark:text-white">{link.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{link.description}</p>
                </div>
                
                <div className="flex-shrink-0 text-gray-400">
                  <ExternalLink size={16} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LinkSection;