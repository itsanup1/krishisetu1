with open('frontend/src/components/common/Navbar.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update imports
old_import = '''  PhoneCall,
  UserCheck,
} from 'lucide-react';'''

new_import = '''  PhoneCall,
  UserCheck,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { Notification } from '../../types';
import { api } from '../../services/api';'''
assert old_import in text, "old_import not found"
text = text.replace(old_import, new_import, 1)

# 2. Add notifications state & effect
old_state = '''  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickSwitchOpen, setQuickSwitchOpen] = useState(false);'''

new_state = '''  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickSwitchOpen, setQuickSwitchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const [list, countRes] = await Promise.all([
        api.getNotifications(10),
        api.getUnreadNotificationCount(),
      ]);
      setNotifications(list);
      setUnreadCount(countRes.unread_count);
    } catch {
      // silent fallback
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // silent
    }
  };'''
assert old_state in text, "old_state not found"
text = text.replace(old_state, new_state, 1)

# 3. Add Bell button and dropdown right before Authenticated User Menu
old_btn = '''            {/* Authenticated User Menu */}'''

new_btn = '''            {/* In-App Notifications Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    if (!notificationsOpen) fetchNotifications();
                  }}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full text-xs font-semibold flex items-center justify-center shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 divide-y divide-slate-100 text-slate-800"
                  >
                    <div className="px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs transition hover:bg-slate-50 ${
                              !n.is_read ? 'bg-emerald-50/40 font-medium' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-slate-900 truncate">{n.title}</span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
                            {n.link && (
                              <Link
                                to={n.link}
                                onClick={() => setNotificationsOpen(false)}
                                className="inline-block mt-1.5 text-[11px] font-semibold text-emerald-600 hover:underline"
                              >
                                View Details →
                              </Link>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated User Menu */}'''

assert old_btn in text, "old_btn not found"
text = text.replace(old_btn, new_btn, 1)

with open('frontend/src/components/common/Navbar.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: frontend/src/components/common/Navbar.tsx updated")

