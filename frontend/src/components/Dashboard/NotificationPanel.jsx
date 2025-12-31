import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function NotificationPanel({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await api.getNotifications(userId);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await api.markNotificationRead(notification.notif_id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No notifications yet</p>
        ) : (
          notifications.slice(0, 5).map((notif) => (
            <div
              key={notif.notif_id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                notif.is_read
                  ? 'bg-gray-50 hover:bg-gray-100'
                  : 'bg-blue-50 hover:bg-blue-100'
              }`}
            >
              <p className="text-sm">{notif.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notif.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}