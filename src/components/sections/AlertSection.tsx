import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import Card from '../ui/Card';
import { Alert } from '../../types';
import SectionTitle from './SectionTitle';

interface AlertSectionProps {
  alerts: Alert[];
}

const AlertSection: React.FC<AlertSectionProps> = ({ alerts }) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (alerts.length === 0) return null;

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
    <section>
      <SectionTitle 
        title="Important Alerts" 
        icon={<Bell className="w-5 h-5" />}
      />
      
      <div className="grid gap-4 mt-4">
        {alerts.map((alert) => (
          <motion.div key={alert.id} variants={item}>
            <Card variant="default">
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getAlertColor(alert.type)}`}>
                  <Bell size={20} />
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900 dark:text-white">{alert.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{alert.message}</p>
                  {alert.date && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{alert.date}</p>
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

export default AlertSection;