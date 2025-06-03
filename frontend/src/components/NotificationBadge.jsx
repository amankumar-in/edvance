import React from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router';

const NotificationBadge = ({ 
  unreadCount = 0, 
  to = '/student/notifications', 
  size = 'md',
  showBell = true 
}) => {
  const sizes = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  };

  const badgeSizes = {
    sm: 'w-4 h-4 text-xs min-w-4',
    md: 'w-5 h-5 text-xs min-w-5',
    lg: 'w-6 h-6 text-sm min-w-6'
  };

  return (
    <Link 
      to={to}
      className="relative p-2 transition-colors rounded-lg hover:bg-gray-100"
      title={`${unreadCount} unread notifications`}
    >
      {showBell && (
        <Bell className={`${sizes[size]} text-gray-600 hover:text-gray-900`} />
      )}
      
      {unreadCount > 0 && (
        <span className={`absolute -top-1 -right-1 ${badgeSizes[size]} bg-red-500 text-white rounded-full flex items-center justify-center font-medium`}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBadge; 