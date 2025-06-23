import React, { useState } from 'react';
import { Users, Trash2, ExternalLink } from 'lucide-react';
import FileUpload from './FileUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { useLinks } from '../../hooks/useLinks';
import { Group } from '../../types';

const GroupsManager: React.FC = () => {
  const { groups, addGroup, removeGroup } = useLinks();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          const groupData = JSON.parse(content) as Omit<Group, 'id'>;
          await addGroup({
            id: crypto.randomUUID(),
            ...groupData
          });
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Error uploading groups:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Groups Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">Upload and manage discussion groups</p>
        </div>
      </div>

      <FileUpload category="groups" onUpload={handleUpload} />

      <div className="grid gap-4">
        <AnimatePresence>
          {groups.map((group) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{group.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
                  {group.resources && group.resources.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Resources:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                          >
                            {resource.title}
                            <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {group.joinLink && (
                    <a
                      href={group.joinLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-2"
                    >
                      Join Group <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeGroup(group.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GroupsManager;