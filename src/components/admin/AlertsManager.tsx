import React, { useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import FileUpload from './FileUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { useLinks } from '../../hooks/useLinks';
import { Alert } from '../../types';

const AlertsManager: React.FC = () => {
  const { alerts, addAlert, removeAlert } = useLinks();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          const alertData = JSON.parse(content) as Omit<Alert, 'id'>;
          await addAlert({
            id: crypto.randomUUID(),
            ...alertData,
            date: new Date().toLocaleDateString()
          });
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Error uploading alerts:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">Upload and manage alerts</p>
        </div>
      </div>

      <FileUpload category="alerts" onUpload={handleUpload} />

      <div className="grid gap-4">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getAlertColor(alert.type)}`}>
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{alert.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{alert.message}</p>
                  {alert.date && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{alert.date}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeAlert(alert.id)}
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

export default AlertsManager;