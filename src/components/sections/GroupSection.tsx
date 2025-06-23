import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../ui/Card';
import { Group } from '../../types';
import SectionTitle from './SectionTitle';

interface GroupSectionProps {
  groups: Group[];
}

const GroupSection: React.FC<GroupSectionProps> = ({ groups }) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => 
      prev.includes(id) 
        ? prev.filter(groupId => groupId !== id) 
        : [...prev, id]
    );
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (groups.length === 0) return null;

  return (
    <section>
      <SectionTitle 
        title="Discussion Groups" 
        icon={<Users className="w-5 h-5" />}
      />
      
      <div className="grid gap-4 mt-4">
        {groups.map((group) => {
          const isExpanded = expandedGroups.includes(group.id);
          
          return (
            <motion.div key={group.id} variants={item}>
              <Card 
                variant="glass" 
                className="hover:bg-gray-50 dark:hover:bg-gray-800/90 transition-all duration-300"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleGroup(group.id)}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400">
                    <Users size={20} />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900 dark:text-white">{group.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
                  </div>
                  
                  <div className="flex-shrink-0 text-gray-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Resources</h4>
                        <div className="space-y-2">
                          {group.resources?.map((resource, idx) => (
                            <a 
                              key={idx}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm block p-2 rounded-md bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              {resource.title}
                            </a>
                          ))}
                        </div>
                        
                        {group.joinLink && (
                          <div className="mt-4">
                            <a 
                              href={group.joinLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 rounded-md transition-colors"
                            >
                              Join Discussion
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default GroupSection;