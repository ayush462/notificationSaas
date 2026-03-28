import React, { useState, useEffect } from "react";

/**
 * 🔔 NotifyStack In-App Notification Hook
 */
export function useNotifyStack(apiKey, userId, options = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const baseUrl = options.baseUrl || "https://api.notifystack.com";

  const fetchFeed = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/v1/inapp/${userId}`, {
        headers: { "x-api-key": apiKey }
      });
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.items);
        setUnreadCount(json.data.unreadCount);
      }
    } catch (err) {
      console.error("NotifyStack fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    // Use SSE or poll
    const interval = setInterval(fetchFeed, options.pollingInterval || 15000);
    return () => clearInterval(interval);
  }, [userId, apiKey, baseUrl]);

  const markAsRead = async (notificationId) => {
    try {
      setUnreadCount(Math.max(0, unreadCount - 1));
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n));
      
      await fetch(`${baseUrl}/v1/inapp/${userId}/read/${notificationId}`, {
        method: "PATCH",
        headers: { "x-api-key": apiKey }
      });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      
      await fetch(`${baseUrl}/v1/inapp/${userId}/read`, {
        method: "POST",
        headers: { "x-api-key": apiKey }
      });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh: fetchFeed };
}

/**
 * 🔔 NotifyStack In-App Bell UI Component (Tailwind required)
 */
export function NotificationBell({ apiKey, userId, baseUrl }) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifyStack(apiKey, userId, { baseUrl });

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-700">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-50 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                You have no notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read_at && 'bg-blue-50/50'}`}
                    onClick={() => !n.read_at && markAsRead(n.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm ${!n.read_at ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {n.subject}
                      </p>
                      {!n.read_at && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{n.body}</p>
                    <p className="text-[11px] text-gray-400 mt-2">
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
