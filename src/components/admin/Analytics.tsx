import React from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Activity, Eye } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

const Analytics: React.FC = () => {
  const analytics = useAnalytics();

  const contentGrowthData = {
    labels: analytics.contentGrowth.map(item => `Week ${item.week}`),
    datasets: [
      {
        label: 'Content Growth',
        data: analytics.contentGrowth.map(item => item.content),
        fill: true,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4
      }
    ]
  };

  const userActivityData = {
    labels: analytics.userActivity.map(item => item.day),
    datasets: [
      {
        label: 'Active Users',
        data: analytics.userActivity.map(item => item.active),
        fill: true,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Eye className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.totalViews.toLocaleString()}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Engagement Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {(analytics.engagement * 100).toFixed(1)}%
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.userActivity[0]?.active.toLocaleString()}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Growth Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                +{((analytics.contentGrowth[11]?.content || 0) / 50 * 100).toFixed(1)}%
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Content Growth
          </h3>
          <div className="h-64">
            <Line data={contentGrowthData} options={{ maintainAspectRatio: false }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Activity
          </h3>
          <div className="h-64">
            <Line data={userActivityData} options={{ maintainAspectRatio: false }} />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Popular Content
        </h3>
        <div className="space-y-4">
          {analytics.popularContent.map((content: any, index) => (
            <div
              key={content.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                  #{index + 1}
                </span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{content.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">{content.views}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;