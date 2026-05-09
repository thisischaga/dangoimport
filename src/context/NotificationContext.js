import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children, recipientType, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 1. Initialiser le socket
    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);

    // 2. Rejoindre la salle appropriée
    const room = recipientType === 'admin' ? 'admin' : `user_${userId}`;
    if (userId || recipientType === 'admin') {
        newSocket.emit('join', room);
    }

    // 3. Charger les notifications existantes si utilisateur connecté
    const fetchNotifications = async () => {
      try {
        const id = recipientType === 'admin' ? 'admin' : userId;
        if (!id) return;

        const res = await axios.get(`http://localhost:8000/api/notifications?recipient=${id}`);
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      } catch (error) {
        console.error("Erreur chargement notifications", error);
      }
    };
    fetchNotifications();

    // 4. Écouter les nouvelles notifications
    newSocket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Petit feedback sonore ou toast
      toast.info(`🔔 ${notif.title}: ${notif.message}`);
    });

    return () => newSocket.close();
  }, [recipientType, userId]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/notifications/${id}/read`);
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
