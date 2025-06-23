import { useState, useEffect } from 'react';
import { useLinks } from './useLinks';

export const useAnalytics = () => {
  const { links, pdfs, news, alerts, groups } = useLinks();
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    engagement: 0,
    popularContent: [],
    contentGrowth: [],
    userActivity: []
  });

  useEffect(() => {
    // Calculate analytics based on content
    const totalContent = links.length + pdfs.length + news.length + alerts.length + groups.length;
    const engagement = calculateEngagement();
    const popular = findPopularContent();
    const growth = calculateContentGrowth();
    const activity = calculateUserActivity();

    setAnalytics({
      totalViews: totalContent * 100, // Simulated views
      engagement,
      popularContent: popular,
      contentGrowth: growth,
      userActivity: activity
    });
  }, [links, pdfs, news, alerts, groups]);

  const calculateEngagement = () => {
    // Simulated engagement calculation
    const totalInteractions = Math.floor(Math.random() * 1000);
    const totalContent = links.length + pdfs.length + news.length + alerts.length + groups.length;
    return totalContent > 0 ? (totalInteractions / totalContent) : 0;
  };

  const findPopularContent = () => {
    // Combine all content and sort by simulated views
    const allContent = [
      ...links.map(l => ({ ...l, type: 'link', views: Math.floor(Math.random() * 1000) })),
      ...pdfs.map(p => ({ ...p, type: 'pdf', views: Math.floor(Math.random() * 1000) })),
      ...news.map(n => ({ ...n, type: 'news', views: Math.floor(Math.random() * 1000) })),
    ];

    return allContent.sort((a, b) => b.views - a.views).slice(0, 5);
  };

  const calculateContentGrowth = () => {
    // Simulated weekly growth data
    return Array.from({ length: 12 }, (_, i) => ({
      week: i + 1,
      content: Math.floor(Math.random() * 50)
    }));
  };

  const calculateUserActivity = () => {
    // Simulated daily user activity
    return Array.from({ length: 7 }, (_, i) => ({
      day: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      active: Math.floor(Math.random() * 1000)
    }));
  };

  return analytics;
};