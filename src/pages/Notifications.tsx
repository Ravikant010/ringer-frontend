import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Heart, MessageCircle, UserPlus, Loader2 } from 'lucide-react';

interface Actor {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface Notification {
  id: string;
  userId: string;
  actorId: string;
  postId?: string;
  commentId?: string;
  type: 'comment_on_post' | 'reply_on_comment' | 'post_liked' | 'comment_liked' | 'new_follower';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  actor?: Actor; // Enriched by backend
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate unread notification count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('http://localhost:3007/api/v1/notifications?limit=50', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // prevent cached empty results
        },
      });

      if (!response.ok) throw new Error(`Failed to load notifications: ${response.status}`);

      const data = await response.json();
      console.log('Notifications response:', data);

      if (data?.success && Array.isArray(data.data)) {
        setNotifications(data.data);
      } else {
        console.error('Unexpected notifications format:', data);
      }
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
      alert(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`http://localhost:3007/api/v1/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('http://localhost:3007/api/v1/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'post_liked':
      case 'comment_liked':
        return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      case 'comment_on_post':
      case 'reply_on_comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'new_follower':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor
      ? `${notification.actor.firstName || ''} ${notification.actor.lastName || ''}`.trim() ||
      notification.actor.username
      : 'Someone';

    switch (notification.type) {
      case 'comment_on_post':
        return `${actorName} commented on your post`;
      case 'reply_on_comment':
        return `${actorName} replied to your comment`;
      case 'post_liked':
        return `${actorName} liked your post`;
      case 'comment_liked':
        return `${actorName} liked your comment`;
      case 'new_follower':
        return `${actorName} started following you`;
      default:
        return notification.body;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Notifications {unreadCount > 0 && (
                  <span className="ml-2 text-blue-600">({unreadCount})</span>
                )}
              </h1>
              <p className="text-gray-600">Stay updated with your activity</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const actorUsername = notification.actor?.username || 'unknown';
                  const actorAvatar =
                    notification.actor?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${actorUsername}`;

                  return (
                    <div
                      key={notification.id}
                      onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                      className={`flex items-start gap-4 p-4 border rounded-2xl transition cursor-pointer ${notification.isRead
                        ? 'bg-white border-gray-200'
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        }`}
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={actorAvatar}
                              alt={actorUsername}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="text-gray-900">
                                {getNotificationText(notification)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
