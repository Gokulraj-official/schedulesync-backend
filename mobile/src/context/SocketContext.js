import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../config/api';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

const getSocketUrl = () => {
  const baseUrl = api.defaults.baseURL || '';
  return baseUrl.replace(/\/?api\/?$/, '');
};

const getUserId = (user) => user?.id || user?._id;

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const socketUrl = getSocketUrl();

  useEffect(() => {
    // If no token or user, disconnect socket (logout case)
    if (!token || !getUserId(user)) {
      if (socket) {
        console.log('📡 Disconnecting socket due to logout');
        socket.disconnect();
        setSocket(null);
      }
      setConnected(false);
      return;
    }

    // Only create new socket if we don't have one or it's disconnected
    if (socket && socket.connected) {
      return;
    }

    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    s.on('connect', () => {
      console.log('✅ Socket connected');
      setConnected(true);
      s.emit('join', getUserId(user));
    });

    // Listen for user coming online
    s.on('user_online', (data) => {
      console.log(`🟢 User ${data.userId} came online`);
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    // Listen for user going offline
    s.on('user_offline', (data) => {
      console.log(`🔴 User ${data.userId} went offline`);
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
    });

    // Listen for reminder events
    s.on('reminder', (data) => {
      console.log(`🔔 Reminder received:`, data);
    });

    // Listen for status updates
    s.on('status_updated', (data) => {
      console.log(`📝 Status updated for ${data.userId}`);
    });

    s.on('error', (error) => {
      console.error('Socket error:', error);
    });

    s.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    setSocket(s);

    return () => {
      console.log('🧹 Cleaning up socket connection');
      s.disconnect();
    };
  }, [token, user, socketUrl]);

  return (
    <SocketContext.Provider value={{ socket, connected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
