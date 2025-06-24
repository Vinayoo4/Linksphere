import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLinks } from './useLinks';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

interface ContentUpdate {
  type: 'links' | 'pdfs' | 'news' | 'alerts' | 'groups';
  action: 'add' | 'update' | 'delete';
  content: any;
}

export const useRealtime = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  
  const { 
    setLinks, 
    setPdfs, 
    setNews, 
    setAlerts, 
    setGroups,
    addLink,
    updateLink,
    removeLink,
    addPdf,
    removePdf,
    addNews,
    updateNews,
    removeNews,
    addAlert,
    updateAlert,
    removeAlert,
    addGroup,
    updateGroup,
    removeGroup
  } = useLinks();

  useEffect(() => {
    console.log('🔌 Connecting to Socket.IO server...');
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
      toast.success('Connected to real-time server');
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      setIsConnected(false);
      toast.error('Disconnected from server');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      toast.error('Failed to connect to server');
    });

    // Handle initial data load
    socketInstance.on('initial-data', (data) => {
      console.log('📦 Received initial data:', data);
      setLinks(data.links || []);
      setPdfs(data.pdfs || []);
      setNews(data.news || []);
      setAlerts(data.alerts || []);
      setGroups(data.groups || []);
    });

    // Handle real-time content updates
    socketInstance.on('content-updated', (update: ContentUpdate) => {
      console.log('🔄 Content updated:', update);
      
      const { type, action, content } = update;
      
      switch (type) {
        case 'links':
          if (action === 'add') {
            addLink(content);
            toast.success(`New link added: ${content.title}`);
          } else if (action === 'update') {
            updateLink(content);
            toast.success(`Link updated: ${content.title}`);
          } else if (action === 'delete') {
            removeLink(content.id);
            toast.success('Link deleted');
          }
          break;
          
        case 'pdfs':
          if (action === 'add') {
            addPdf(content);
            toast.success(`New PDF added: ${content.title}`);
          } else if (action === 'delete') {
            removePdf(content.id);
            toast.success('PDF deleted');
          }
          break;
          
        case 'news':
          if (action === 'add') {
            addNews(content);
            toast.success(`News article added: ${content.title}`);
          } else if (action === 'update') {
            updateNews(content);
            toast.success(`News updated: ${content.title}`);
          } else if (action === 'delete') {
            removeNews(content.id);
            toast.success('News article deleted');
          }
          break;
          
        case 'alerts':
          if (action === 'add') {
            addAlert(content);
            toast.success(`New alert: ${content.title}`, {
              icon: content.type === 'error' ? '🚨' : content.type === 'warning' ? '⚠️' : 'ℹ️'
            });
          } else if (action === 'update') {
            updateAlert(content);
            toast.success(`Alert updated: ${content.title}`);
          } else if (action === 'delete') {
            removeAlert(content.id);
            toast.success('Alert deleted');
          }
          break;
          
        case 'groups':
          if (action === 'add') {
            addGroup(content);
            toast.success(`New group created: ${content.name}`);
          } else if (action === 'update') {
            updateGroup(content);
            toast.success(`Group updated: ${content.name}`);
          } else if (action === 'delete') {
            removeGroup(content.id);
            toast.success('Group deleted');
          }
          break;
      }
    });

    // Handle analytics updates
    socketInstance.on('analytics-updated', (analytics) => {
      console.log('📊 Analytics updated:', analytics);
      // You can add analytics state management here
    });

    // Handle settings updates
    socketInstance.on('settings-updated', (settings) => {
      console.log('⚙️ Settings updated:', settings);
      toast.success('Settings updated');
    });

    // Handle user count updates
    socketInstance.on('user-count', (count) => {
      setOnlineUsers(count);
    });

    setSocket(socketInstance);

    return () => {
      console.log('🔌 Disconnecting from server...');
      socketInstance.disconnect();
    };
  }, []);

  // Emit content updates
  const emitContentUpdate = useCallback((type: string, action: string, content: any) => {
    if (socket && isConnected) {
      console.log('📤 Emitting content update:', { type, action, content });
      socket.emit('update-content', { type, action, content });
    }
  }, [socket, isConnected]);

  // Emit analytics updates
  const emitAnalyticsUpdate = useCallback((analytics: any) => {
    if (socket && isConnected) {
      socket.emit('update-analytics', analytics);
    }
  }, [socket, isConnected]);

  // Emit settings updates
  const emitSettingsUpdate = useCallback((settings: any) => {
    if (socket && isConnected) {
      socket.emit('update-settings', settings);
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    onlineUsers,
    emitContentUpdate,
    emitAnalyticsUpdate,
    emitSettingsUpdate
  };
};