import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutGrid, FileText, Link as LinkIcon, Newspaper, Bell, Users, Calendar, Shield, Settings, Search, Upload, Filter, Activity, TrendingUp, Users as UsersIcon, FileCheck } from 'lucide-react';
import LinksManager from './LinksManager';
import PdfsManager from './PdfsManager';
import NewsManager from './NewsManager';
import AlertsManager from './AlertsManager';
import GroupsManager from './GroupsManager';
import ScheduleManager from './ScheduleManager';
import SecuritySettings from './SecuritySettings';
import PinProtection from './PinProtection';
import { useAuth } from '../../hooks/useAuth';
import { useLinks } from '../../hooks/useLinks';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const { isAdmin, isPinVerified, verifyPin } = useAuth();
  const [currentSection, setCurrentSection] = useState(location.pathname.split('/')[2] || 'overview');
  const [showPinModal, setShowPinModal] = useState(!isPinVerified);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { links, pdfs, news, alerts, groups } = useLinks();

  useEffect(() => {
    if (!isPinVerified) {
      setShowPinModal(true);
    }
  }, [isPinVerified]);

  const handlePinVerification = (pin: string) => {
    if (verifyPin(pin)) {
      setShowPinModal(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid, path: '/admin' },
    { id: 'links', label: 'Links', icon: LinkIcon, path: '/admin/links', count: links.length },
    { id: 'pdfs', label: 'PDFs', icon: FileText, path: '/admin/pdfs', count: pdfs.length },
    { id: 'news', label: 'News', icon: Newspaper, path: '/admin/news', count: news.length },
    { id: 'alerts', label: 'Alerts', icon: Bell, path: '/admin/alerts', count: alerts.length },
    { id: 'groups', label: 'Groups', icon: Users, path: '/admin/groups', count: groups.length },
    { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/admin/schedule' },
    { id: 'security', label: 'Security', icon: Shield, path: '/admin/security' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const getStatColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-amber-500 to-amber-600'
    ];
    return colors[index % colors.length];
  };

  const stats = [
    {
      label: 'Total Content',
      value: links.length + pdfs.length + news.length + alerts.length,
      icon: FileCheck,
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'Active Users',
      value: '2.4k',
      icon: UsersIcon,
      change: '+8%',
      trend: 'up'
    },
    {
      label: 'Engagement Rate',
      value: '67%',
      icon: Activity,
      change: '+5%',
      trend: 'up'
    },
    {
      label: 'Growth',
      value: '24%',
      icon: TrendingUp,
      change: '+2%',
      trend: 'up'
    }
  ];

  return (
    <>
      <AnimatePresence>
        {showPinModal && (
          <PinProtection onVerify={handlePinVerification} onClose={() => setShowPinModal(false)} />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <motion.div 
            className="lg:w-64 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      currentSection === item.id
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                    onClick={() => setCurrentSection(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700">
                        {item.count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-grow">
            <div className="flex flex-col gap-6">
              {/* Header Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Manage and secure your content</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    >
                      <option value="all">All Types</option>
                      <option value="links">Links</option>
                      <option value="pdfs">PDFs</option>
                      <option value="news">News</option>
                      <option value="alerts">Alerts</option>
                      <option value="groups">Groups</option>
                    </select>
                    
                    <button
                      onClick={() => setShowPinModal(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                      <Shield size={16} />
                      Security
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              {currentSection === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br rounded-xl p-6 text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, var(--${getStatColor(index)}-start), var(--${getStatColor(index)}-end))` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm">{stat.label}</p>
                          <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                        </div>
                        <div className="p-3 bg-white/10 rounded-lg">
                          <stat.icon size={24} />
                        </div>
                      </div>
                      <div className="flex items-center mt-4 text-sm">
                        <span className={`flex items-center ${
                          stat.trend === 'up' ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="ml-2 text-white/60">vs last month</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Content Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/links" element={<LinksManager searchQuery={searchQuery} />} />
                  <Route path="/pdfs" element={<PdfsManager searchQuery={searchQuery} />} />
                  <Route path="/news" element={<NewsManager searchQuery={searchQuery} />} />
                  <Route path="/alerts" element={<AlertsManager searchQuery={searchQuery} />} />
                  <Route path="/groups" element={<GroupsManager searchQuery={searchQuery} />} />
                  <Route path="/schedule" element={<ScheduleManager />} />
                  <Route path="/security" element={<SecuritySettings />} />
                </Routes>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Overview: React.FC = () => {
  const { links, pdfs, news, alerts, groups } = useLinks();
  
  const stats = [
    { label: 'Active Links', value: links.length, icon: LinkIcon, color: 'primary' },
    { label: 'PDF Resources', value: pdfs.length, icon: FileText, color: 'secondary' },
    { label: 'News Articles', value: news.length, icon: Newspaper, color: 'accent' },
    { label: 'Active Alerts', value: alerts.length, icon: Bell, color: 'warning' },
    { label: 'Discussion Groups', value: groups.length, icon: Users, color: 'success' },
  ];

  const recentActivity = [
    ...alerts.map(alert => ({ ...alert, type: 'alert' })),
    ...news.map(item => ({ ...item, type: 'news' }))
  ].sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
   .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-xl backdrop-blur-md bg-white/70 dark:bg-gray-800/70 shadow-glass border border-white/20 dark:border-gray-700/30"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((item: any, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className={`p-2 rounded-full ${
                  item.type === 'alert' 
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}>
                  {item.type === 'alert' ? <Bell size={16} /> : <Newspaper size={16} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
            >
              <Upload className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Upload Content</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-lg bg-secondary-50 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-900/50 transition-colors"
            >
              <Bell className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">New Alert</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-lg bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-900/50 transition-colors"
            >
              <Users className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Create Group</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-lg bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400 hover:bg-success-100 dark:hover:bg-success-900/50 transition-colors"
            >
              <Calendar className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Schedule Post</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;