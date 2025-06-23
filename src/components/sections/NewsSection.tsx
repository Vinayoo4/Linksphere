import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import Card from '../ui/Card';
import { News } from '../../types';
import SectionTitle from './SectionTitle';

interface NewsSectionProps {
  news: News[];
}

const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (news.length === 0) return null;

  return (
    <section>
      <SectionTitle 
        title="Latest News" 
        icon={<Newspaper className="w-5 h-5" />}
      />
      
      <div className="grid gap-4 mt-4">
        {news.map((item) => (
          <motion.div key={item.id} variants={item}>
            <Card 
              variant="glass" 
              className="hover:bg-gray-50 dark:hover:bg-gray-800/90"
              onClick={() => window.open(item.url, '_blank')}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {item.image && (
                  <div className="flex-shrink-0 w-full sm:w-24 h-24 rounded-lg overflow-hidden mb-2 sm:mb-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.excerpt}</p>
                  {item.date && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{item.date}</p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default NewsSection;