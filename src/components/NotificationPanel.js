import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { FaBell, FaCheckDouble, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PANEL_WIDTH = 320;

const NotificationPanel = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const margin = 12;
    let left = rect.right - PANEL_WIDTH;
    left = Math.max(margin, Math.min(left, window.innerWidth - PANEL_WIDTH - margin));
    setPanelStyle({
      top: rect.bottom + 8,
      left,
    });
  }, []);

  const openPanel = () => {
    updatePosition();
    setIsOpen(true);
  };

  const closePanel = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closePanel();
    };
    const onScrollOrResize = () => updatePosition();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onPointerDown = (e) => {
      if (
        panelRef.current?.contains(e.target) ||
        buttonRef.current?.contains(e.target)
      ) {
        return;
      }
      closePanel();
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isOpen]);

  const handleNotifClick = (notif) => {
    if (!notif.isRead) markAsRead(notif._id);
    if (notif.link && notif.link !== '#') {
      navigate(notif.link);
      closePanel();
    }
  };

  const panel = isOpen ? (
    <>
      <div
        className="fixed inset-0 z-[300] bg-black/25 backdrop-blur-[1px]"
        onClick={closePanel}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        className="fixed z-[301] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in-up"
        style={{
          top: panelStyle.top,
          left: panelStyle.left,
          width: PANEL_WIDTH,
          maxWidth: 'calc(100vw - 24px)',
        }}
      >
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-[#fffbeb]">
          <div>
            <h3 className="text-sm font-black text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                title="Tout marquer comme lu"
              >
                <FaCheckDouble size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={closePanel}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Fermer"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        <div className="max-h-[min(360px,50vh)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <FaBell className="mx-auto text-gray-300 mb-3" size={28} />
              <p className="text-sm font-medium text-gray-500">Aucune notification</p>
              <p className="text-xs text-gray-400 mt-1">Vous serez alerté ici des mises à jour de commande.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif._id}
                type="button"
                onClick={() => handleNotifClick(notif)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  !notif.isRead ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div
                    className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      notif.isRead ? 'bg-transparent' : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-3 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-2 font-medium">
                      {format(new Date(notif.createdAt), 'dd MMM yyyy, HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? closePanel() : openPanel())}
        className="relative w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:text-[#2d3748] hover:border-[#e6c600]/40 hover:bg-[#fffbeb] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#ffdc2b]/40"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <FaBell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {panel && createPortal(panel, document.body)}
    </>
  );
};

export default NotificationPanel;
