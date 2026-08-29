import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquareText, Send, Search, ArrowLeft } from 'lucide-react';
import {
  getConversations,
  getConversationMessages,
  sendConversationMessage,
  markConversationRead,
} from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from '../utils/toast';

const formatTime = (value) => {
  if (!value) return 'À l’instant';
  try {
    return new Date(value).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'À l’instant';
  }
};

const formatName = (user) => {
  if (!user) return 'Vendeur';
  const first = user.userFirstname || user.firstname || user.firstName || '';
  const last = user.userSurname || user.surname || user.lastName || '';
  const display = `${first} ${last}`.trim();
  return (
    user.vendorName ||
    user.storeName ||
    display ||
    user.userEmail ||
    user.email ||
    'Vendeur'
  );
};

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [search, setSearch] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dangoToken');
    if (!token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const loadThreads = async () => {
      try {
        const response = await getConversations();
        const data = response?.data || [];

        const mapped = data.map((thread) => {
          const me = JSON.parse(localStorage.getItem('dangoUser') || '{}');
          const meId = String(me?._id || me?.id || me?.userId || '');
          const remoteUser = String(thread.buyerId || '') === meId ? (thread.seller || {}) : (thread.buyer || {});
          const buyer = thread.buyer || {};
          const seller = thread.seller || {};
          const contactName = formatName(remoteUser || buyer || seller);
          const lastMessage = thread.lastMessage || 'Aucun message pour l’instant.';
          const unread = Number(thread.unreadCountBuyer || 0) > 0;

          return {
            id: thread._id,
            name: contactName,
            lastMessage,
            time: formatTime(thread.updatedAt),
            avatar: (contactName || 'V').charAt(0).toUpperCase(),
            unread,
            sellerId: thread.sellerId,
            buyerId: thread.buyerId,
            productId: thread.productId,
            messages: [],
          };
        });

        setThreads(mapped);
        if (mapped[0]) {
          setActiveThreadId(mapped[0].id);
        }
      } catch (error) {
        console.error('[Messages] loadThreads error:', error);
        setThreads([]);
      } finally {
        setLoading(false);
      }
    };

    loadThreads();
  }, [location.pathname, navigate]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) || threads[0] || null,
    [threads, activeThreadId]
  );

  const fetchThreadMessages = async (threadId) => {
    if (!threadId) return;

    try {
      const response = await getConversationMessages(threadId);
      const rawMessages = response?.data || [];

      const mappedMessages = rawMessages.map((message) => ({
        id: message._id || `${message.senderId}-${message.createdAt}`,
        sender: message.senderId ? 'me' : 'them',
        text: message.content || '',
        time: formatTime(message.createdAt),
      }));

      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId ? { ...thread, messages: mappedMessages } : thread
        )
      );
    } catch (error) {
      console.error('[Messages] fetchThreadMessages error:', error);
    }
  };

  const selectThread = async (threadId) => {
    setActiveThreadId(threadId);
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, unread: false } : thread
      )
    );

    try {
      await markConversationRead(threadId);
      await fetchThreadMessages(threadId);
    } catch (error) {
      console.error('[Messages] selectThread error:', error);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!inputVal.trim() || !activeThread) return;

    try {
      const response = await sendConversationMessage(activeThread.id, {
        content: inputVal.trim(),
      });

      const message = response?.data || null;
      const newMessage = {
        id: message?._id || `${Date.now()}`,
        sender: 'me',
        text: message?.content || inputVal.trim(),
        time: formatTime(message?.createdAt || Date.now()),
      };

      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id !== activeThread.id) return thread;

          return {
            ...thread,
            lastMessage: newMessage.text,
            time: newMessage.time,
            unread: false,
            messages: [...(thread.messages || []), newMessage],
          };
        })
      );

      setInputVal('');
    } catch (error) {
      console.error('[Messages] send error:', error);
      toast.error(error?.response?.data?.message || 'Impossible d’envoyer le message.');
    }
  };

  const filteredThreads = useMemo(() => {
    const searchQuery = search.trim().toLowerCase();
    if (!searchQuery) return threads;

    return threads.filter(
      (thread) =>
        (thread.name || '').toLowerCase().includes(searchQuery) ||
        (thread.lastMessage || '').toLowerCase().includes(searchQuery)
    );
  }, [threads, search]);

  useEffect(() => {
    if (!activeThread || activeThread.messages?.length) return;
    fetchThreadMessages(activeThread.id);
  }, [activeThread]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <h1 className="text-2xl font-black text-slate-900">Mes messages</h1>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid min-h-[calc(100vh-160px)] lg:grid-cols-[360px_1fr]">
            <aside className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
              <div className="border-b border-slate-200 p-4">
                <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <Search size={16} className="text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher une discussion"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>

              <div className="max-h-[620px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-sm text-slate-500">Chargement des conversations...</div>
                ) : filteredThreads.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">Aucune conversation.</div>
                ) : (
                  filteredThreads.map((thread) => (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => selectThread(thread.id)}
                      className={`flex w-full items-center gap-3 border-b border-slate-200 px-4 py-3 text-left transition ${
                        activeThread?.id === thread.id ? 'bg-white' : 'bg-transparent hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0E1] font-bold text-[#FF6B00]">
                        {thread.avatar}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold text-slate-900">{thread.name}</p>
                          <span className="text-[10px] text-slate-500">{thread.time}</span>
                        </div>
                        <p className="truncate text-xs text-slate-500">{thread.lastMessage}</p>
                      </div>

                      {thread.unread && (
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B00]" aria-label="Nouveau message" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section className="flex min-h-[680px] flex-col">
              {activeThread ? (
                <>
                  <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{activeThread.name}</h2>
                      <p className="text-xs text-slate-500">Discussion active</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <MessageSquareText size={18} />
                    </div>
                  </header>

                  <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50 p-4">
                    {(activeThread.messages || []).length === 0 ? (
                      <div className="m-auto text-center text-sm text-slate-500">
                        Aucun message dans cette discussion.
                      </div>
                    ) : (
                      (activeThread.messages || []).map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                              message.sender === 'me'
                                ? 'bg-[#FF6B00] text-white'
                                : 'bg-white text-slate-800 border border-slate-200'
                            }`}
                          >
                            <p>{message.text}</p>
                            <div className={`mt-1 text-[10px] ${message.sender === 'me' ? 'text-white/80' : 'text-slate-400'}`}>
                              {message.time}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSend} className="border-t border-slate-200 bg-white p-4">
                    <div className="flex gap-3">
                      <input
                        value={inputVal}
                        onChange={(event) => setInputVal(event.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#FF6B00]"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-2xl bg-[#FF6B00] px-4 py-3 text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!inputVal.trim()}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-center text-slate-500">
                  Sélectionnez une discussion pour commencer à parler avec le vendeur.
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
