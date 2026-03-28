import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { cn } from "../lib/utils";

export function NotificationBell({ externalUserId, projectId, apiKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchFeed = async () => {
    if (!externalUserId || !apiKey) return;
    try {
      setLoading(true);
      // Use the in-app endpoint (auth is handled by x-api-key for this SDK-like component)
      const res = await api.get(`/v1/inapp/${externalUserId}`, {
        headers: { "x-api-key": apiKey }
      });
      const items = res.data.data || [];
      setNotifications(items);
      setUnreadCount(items.filter(n => !n.read_at).length);
    } catch (err) {
      console.error("Failed to fetch notification feed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    // Poll every 30s for new notifications
    const interval = setInterval(fetchFeed, 30000);
    return () => clearInterval(interval);
  }, [externalUserId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/v1/inapp/${externalUserId}/read/${id}`, {}, {
        headers: { "x-api-key": apiKey }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post(`/v1/inapp/${externalUserId}/read`, {}, {
        headers: { "x-api-key": apiKey }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-neutral-100 transition-colors focus:outline-none"
      >
        <Bell className="h-6 w-6 text-neutral-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-neutral-200 bg-white shadow-2xl z-[999] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-4 py-3">
              <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="py-10 text-center text-sm text-neutral-400">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="mx-auto h-8 w-8 text-neutral-200 mb-2" />
                  <p className="text-sm text-neutral-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "group relative flex flex-col p-4 transition-colors hover:bg-neutral-50",
                        !n.read_at && "bg-blue-50/30"
                      )}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-sm font-medium text-neutral-900 leading-tight">
                          {n.subject}
                        </span>
                        {!n.read_at && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="bg-white p-1 rounded-full shadow-sm border border-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-50 hover:text-green-600"
                            title="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                        {n.body}
                      </p>
                      <span className="mt-2 text-[10px] text-neutral-400">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-100 bg-neutral-50/50 p-2 text-center">
              <button className="text-[11px] font-medium text-neutral-400 hover:text-neutral-600">
                View all activity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
