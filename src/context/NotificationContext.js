import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { toast } from '../utils/toast';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children, recipientType, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const shouldConnect = Boolean(userId) || recipientType === 'admin';

    // Charger les notifications existantes (HTTP) — indépendant du socket
    const fetchNotifications = async () => {
      try {
        const id = recipientType === 'admin' ? 'admin' : userId;
        if (!id) return;

        const res = await axios.get(`${API_BASE_URL}/api/notifications?recipient=${id}`);
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      } catch (error) {
        // Silencieux : pas critique pour la navigation
      }
    };
    fetchNotifications();

    if (!shouldConnect) return undefined;

    // Polling d'abord : plus fiable derrière le proxy Render que le websocket pur
    const newSocket = io(API_BASE_URL, {
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 10000,
      withCredentials: true,
    });
    setSocket(newSocket);

    const room = recipientType === 'admin' ? 'admin' : `user_${userId}`;
    newSocket.on('connect', () => {
      newSocket.emit('join', room);
    });

    newSocket.on('connect_error', () => {
      // Évite le spam console : Render free coupe souvent le WS
    });

    newSocket.on('new_notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.info(`${notif.title}: ${notif.message}`);
    });

    return () => {
      newSocket.removeAllListeners();
      newSocket.close();
      setSocket(null);
    };
  }, [recipientType, userId]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur marquage notification", error);
    }
  };

  const markAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.isRead) markAsRead(n._id);
    });
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
