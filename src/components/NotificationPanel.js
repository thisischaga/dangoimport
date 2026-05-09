import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { FaBell, FaCheckDouble, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationPanel = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-yellow-500 transition-colors focus:outline-none"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[100] bg-black/5" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 z-[101] w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Mes Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-blue-500 hover:text-blue-700"
                    title="Tout marquer comme lu"
                  >
                    <FaCheckDouble />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={12} />
                </button>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase italic">Rien à signaler</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif._id}
                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notif.isRead ? 'bg-blue-50/20' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <p className={`text-[11px] ${notif.isRead ? 'text-gray-700 font-medium' : 'text-gray-900 font-bold'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[8px] text-gray-400 mt-2 font-black uppercase">
                          {format(new Date(notif.createdAt), 'dd MMM, HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPanel;
