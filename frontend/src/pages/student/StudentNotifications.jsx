import { Badge, Button, IconButton, Text } from '@radix-ui/themes';
import { AlertCircle, Award, Bell, CheckCircle, Clock, Filter, MessageCircle, MoreVertical } from 'lucide-react';
import React, { useState } from 'react';
import { EmptyStateCard } from '../../components';

const StudentNotifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'task_assigned',
      title: 'New Math Assignment',
      message: 'Complete Chapter 5 exercises - Due tomorrow',
      time: '2 hours ago',
      read: false,
      priority: 'high',
      actionRequired: true,
      data: { taskId: '123', pointValue: 50 }
    },
    {
      id: 2,
      type: 'task_approved',
      title: 'Essay Approved!',
      message: 'Great work on your history essay! You earned 75 points.',
      time: '1 day ago',
      read: false,
      priority: 'medium',
      actionRequired: false,
      data: { pointValue: 75 }
    },
    {
      id: 3,
      type: 'comment_added',
      title: 'Teacher Comment',
      message: 'Ms. Johnson left feedback on your science project.',
      time: '2 days ago',
      read: true,
      priority: 'low',
      actionRequired: false,
      data: { taskId: '456' }
    },
    {
      id: 4,
      type: 'task_rejected',
      title: 'Assignment Needs Revision',
      message: 'Please revise your English essay and resubmit.',
      time: '3 days ago',
      read: false,
      priority: 'high',
      actionRequired: true,
      data: { taskId: '789' }
    },
    {
      id: 5,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You earned the "Math Whiz" badge for completing 10 math tasks!',
      time: '1 week ago',
      read: true,
      priority: 'medium',
      actionRequired: false,
      data: { badgeId: 'math_whiz' }
    }
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <Bell className="w-5 h-5" style={{ color: 'var(--blue-9)' }} />;
      case 'task_approved':
        return <CheckCircle className="w-5 h-5" style={{ color: 'var(--green-9)' }} />;
      case 'task_rejected':
        return <AlertCircle className="w-5 h-5" style={{ color: 'var(--red-9)' }} />;
      case 'comment_added':
        return <MessageCircle className="w-5 h-5" style={{ color: 'var(--purple-9)' }} />;
      case 'achievement':
        return <Award className="w-5 h-5" style={{ color: 'var(--amber-9)' }} />;
      default:
        return <Bell className="w-5 h-5" style={{ color: 'var(--gray-9)' }} />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'red',
      medium: 'amber',
      low: 'gray'
    };
    return colors[priority] || colors.low;
  };

  const filterNotifications = () => {
    switch (activeTab) {
      case 'action':
        return notifications.filter(n => n.actionRequired);
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'tasks':
        return notifications.filter(n => n.type.includes('task'));
      case 'achievements':
        return notifications.filter(n => n.type === 'achievement');
      default:
        return notifications;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = filterNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <Text as='p' size='2' color='gray'>{unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}</Text>
        </div>
        <div className="flex items-center gap-3">
          <Button variant='surface' onClick={markAllAsRead} disabled={unreadCount === 0}>Mark all read</Button>
          <IconButton variant='ghost' color='gray' onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Filter size={16} />
          </IconButton>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex p-1 mb-6 space-x-1 rounded-lg bg-[--gray-a2]"
      >
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'action', label: 'Action Required', count: notifications.filter(n => n.actionRequired).length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'tasks', label: 'Tasks', count: notifications.filter(n => n.type.includes('task')).length },
          { key: 'achievements', label: 'Achievements', count: notifications.filter(n => n.type === 'achievement').length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 text-sm font-medium transition-colors rounded-md"
            style={{
              ...(activeTab === tab.key
                ? {
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--accent-11)',
                  boxShadow: 'var(--shadow-2)'
                }
                : {
                  color: 'var(--gray-11)'
                }
              )
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                e.target.style.color = 'var(--gray-12)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                e.target.style.color = 'var(--gray-11)';
              }
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs"
                style={{
                  ...(activeTab === tab.key
                    ? { backgroundColor: 'var(--accent-a3)', color: 'var(--accent-11)' }
                    : { backgroundColor: 'var(--gray-a4)', color: 'var(--gray-11)' }
                  )
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <EmptyStateCard
            title='No notifications'
            description='You are all caught up! Check back later for updates.'
            icon={<Bell />}
          />
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className="p-4 transition-shadow border rounded-lg cursor-pointer"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: !notification.read ? 'var(--accent-6)' : 'var(--gray-6)',
                borderLeftWidth: !notification.read ? '4px' : '1px',
                borderLeftColor: !notification.read ? 'var(--accent-9)' : 'var(--gray-6)',
                ...((!notification.read) && { backgroundColor: 'var(--accent-a2)' })
              }}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1 space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="text-sm font-medium"
                      >
                        {notification.title}
                      </h3>
                      <Badge color={getPriorityBadge(notification.priority)}>
                        {notification.priority}
                      </Badge>
                      {notification.actionRequired && (
                        <Badge color='orange' variant='surface'>
                          Action Required
                        </Badge>
                      )}
                    </div>
                    <Text
                      as='p'
                      size='2'
                      color='gray'
                    >
                      {notification.message}
                    </Text>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-xs" style={{ color: 'var(--gray-10)' }}>
                        <Clock className="w-3 h-3 mr-1" />
                        {notification.time}
                      </div>
                      {notification.data?.pointValue && (
                        <Text as='p' size='1' color='green' className='font-medium'>
                          +{notification.data.pointValue} points
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
                <IconButton  variant='ghost' color='gray'>
                  <MoreVertical className="w-4 h-4" />
                </IconButton>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentNotifications; 