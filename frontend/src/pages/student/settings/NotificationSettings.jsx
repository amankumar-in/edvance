import { Box, Button, Callout, Flex, Separator, Switch, Tabs, Text, TextField } from '@radix-ui/themes';
import { Bell, BellOff, CheckCircle, Clock, Info, Mail, MessageSquare, Monitor, Phone, Smartphone, Volume2, VolumeX } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { SectionHeader } from '../../../components';

function NotificationSettings() {
  // State for notification preferences
  const [preferences, setPreferences] = useState({
    enabled: true,
    channels: {
      inApp: true,
      email: true,
      push: true,
      sms: false,
    },
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
      timezone: "UTC",
    },
    preferences: {
      taskAssignment: {
        enabled: true,
        channels: {
          inApp: true,
          email: true,
          push: true,
          sms: false,
        },
      },
      taskReminder: {
        enabled: true,
        channels: {
          inApp: true,
          email: true,
          push: true,
          sms: false,
        },
      },
      taskApproval: {
        enabled: true,
        channels: {
          inApp: true,
          email: true,
          push: true,
          sms: false,
        },
      },
      pointsEarned: {
        enabled: true,
        channels: {
          inApp: true,
          email: false,
          push: true,
          sms: false,
        },
      },
      levelUp: {
        enabled: true,
        channels: {
          inApp: true,
          email: true,
          push: true,
          sms: false,
        },
      },
      badgeEarned: {
        enabled: true,
        channels: {
          inApp: true,
          email: true,
          push: true,
          sms: false,
        },
      },
      rewardRedemption: {
        enabled: true,
        channels: {
          inApp: true,
          email: true,
          push: true,
          sms: false,
        },
      },
      newReward: {
        enabled: true,
        channels: {
          inApp: true,
          email: false,
          push: false,
          sms: false,
        },
      },
      linkRequest: {
        enabled: true,
        channels: {
          inApp: true,
          email: true,
          push: true,
          sms: false,
        },
      },
      accountUpdate: {
        enabled: true,
        channels: {
          inApp: true,
          email: true,
          push: false,
          sms: false,
        },
      },
      attendanceReminder: {
        enabled: true,
        channels: {
          inApp: true,
          email: false,
          push: true,
          sms: false,
        },
      },
      attendanceStreak: {
        enabled: true,
        channels: {
          inApp: true,
          email: false,
          push: true,
          sms: false,
        },
      },
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle master notification toggle
  const handleMasterToggle = (enabled) => {
    setPreferences(prev => ({
      ...prev,
      enabled
    }));
  };

  // Handle channel toggle
  const handleChannelToggle = (channel, enabled) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: enabled
      }
    }));
  };

  // Handle quiet hours toggle
  const handleQuietHoursToggle = (enabled) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled
      }
    }));
  };

  // Handle quiet hours time change
  const handleQuietHoursTimeChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
  };

  // Handle notification type toggle
  const handleNotificationTypeToggle = (type, enabled) => {
    setPreferences(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: {
          ...prev.preferences[type],
          enabled
        }
      }
    }));
  };

  // Handle notification type channel toggle
  const handleNotificationChannelToggle = (type, channel, enabled) => {
    setPreferences(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: {
          ...prev.preferences[type],
          channels: {
            ...prev.preferences[type].channels,
            [channel]: enabled
          }
        }
      }
    }));
  };

  // Handle save preferences
  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      // This would be an API call to update preferences
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Notification preferences updated successfully");
    } catch (error) {
      toast.error("Failed to update notification preferences");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset to defaults
  const handleResetDefaults = async () => {
    setIsLoading(true);
    try {
      // This would be an API call to reset preferences
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Notification preferences reset to defaults");
    } catch (error) {
      toast.error("Failed to reset notification preferences");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get channel icon
  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'inApp':
        return <Monitor size={16} />;
      case 'email':
        return <Mail size={16} />;
      case 'push':
        return <Smartphone size={16} />;
      case 'sms':
        return <Phone size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  // Helper function to get channel label
  const getChannelLabel = (channel) => {
    switch (channel) {
      case 'inApp':
        return 'In-App';
      case 'email':
        return 'Email';
      case 'push':
        return 'Push';
      case 'sms':
        return 'SMS';
      default:
        return channel;
    }
  };

  // Notification type configurations
  const notificationTypes = {
    taskAssignment: {
      title: 'Task Assignment',
      description: 'When new tasks are assigned to you',
      category: 'Tasks'
    },
    taskReminder: {
      title: 'Task Reminders',
      description: 'Reminders for upcoming task deadlines',
      category: 'Tasks'
    },
    taskApproval: {
      title: 'Task Approval',
      description: 'When your submitted tasks are approved or rejected',
      category: 'Tasks'
    },
    pointsEarned: {
      title: 'Points Earned',
      description: 'When you earn points from completed tasks',
      category: 'Rewards'
    },
    levelUp: {
      title: 'Level Up',
      description: 'When you advance to a new level',
      category: 'Rewards'
    },
    badgeEarned: {
      title: 'Badge Earned',
      description: 'When you earn new badges or achievements',
      category: 'Rewards'
    },
    rewardRedemption: {
      title: 'Reward Redemption',
      description: 'Updates on your reward redemption status',
      category: 'Rewards'
    },
    newReward: {
      title: 'New Rewards',
      description: 'When new rewards become available',
      category: 'Rewards'
    },
    linkRequest: {
      title: 'Link Requests',
      description: 'When someone requests to link with your account',
      category: 'Account'
    },
    accountUpdate: {
      title: 'Account Updates',
      description: 'Important updates about your account',
      category: 'Account'
    },
    attendanceReminder: {
      title: 'Attendance Reminders',
      description: 'Reminders to mark your attendance',
      category: 'Attendance'
    },
    attendanceStreak: {
      title: 'Attendance Streaks',
      description: 'When you achieve attendance milestones',
      category: 'Attendance'
    }
  };

  // Group notification types by category
  const groupedNotifications = Object.entries(notificationTypes).reduce((acc, [key, config]) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push({ key, ...config });
    return acc;
  }, {});

  return (
    <div>
      <Box className="max-w-4xl">
        {/* HEADER */}
        <Flex direction="column" className="mb-6">
          <Flex align="center" gap="2" mb="1">
            <Bell size={22} className="text-[--accent-9]" />
            <Text as="h1" size="6" weight="medium">
              Notification Settings
            </Text>
          </Flex>
          <Text as="p" size="2" color="gray">
            Control how and when you receive notifications about your activities, achievements, and important updates.
          </Text>
        </Flex>

        {/* TABS INTERFACE */}
        <Tabs.Root defaultValue="general">
          <Tabs.List wrap={'wrap'}>
            <Tabs.Trigger value="general">
              <Flex align="center" gap="1">
                <Bell size={16} />
                <span>General</span>
              </Flex>
            </Tabs.Trigger>
            <Tabs.Trigger value="types">
              <Flex align="center" gap="1">
                <MessageSquare size={16} />
                <span>Notification Types</span>
              </Flex>
            </Tabs.Trigger>
            <Tabs.Trigger value="schedule">
              <Flex align="center" gap="1">
                <Clock size={16} />
                <span>Schedule</span>
              </Flex>
            </Tabs.Trigger>
          </Tabs.List>

          {/* GENERAL SETTINGS TAB */}
          <Tabs.Content value="general" className="mt-6">
            <Flex direction="column" gap="6">
              {/* MASTER CONTROL */}
              <Box className="rounded-lg border border-[--gray-a6] overflow-hidden">
                <SectionHeader
                  icon={preferences.enabled ? <Bell /> : <BellOff />}
                  title="Master Control"
                />

                <Box className="p-4 md:p-6">
                  <Flex align="center" justify="between" className="mb-4">
                    <Box>
                      <Text as='p' size="3" weight="medium">Enable Notifications</Text>
                      <Text as='p' size="2" color="gray">Turn all notifications on or off</Text>
                    </Box>
                    <Switch
                      checked={preferences.enabled}
                      onCheckedChange={handleMasterToggle}
                      size="3"
                    />
                  </Flex>

                  {!preferences.enabled && (
                    <Callout.Root variant='surface' color="orange" size="2">
                      <Callout.Icon>
                        <Info size={16} />
                      </Callout.Icon>
                      <Callout.Text>
                        All notifications are currently disabled. You won't receive any alerts or updates.
                      </Callout.Text>
                    </Callout.Root>
                  )}
                </Box>
              </Box>

              {/* NOTIFICATION CHANNELS */}
              <Box className="rounded-lg border border-[--gray-a6] overflow-hidden">
                <SectionHeader
                  icon={<Smartphone />}
                  title="Notification Channels"
                />

                <Box className="p-4 md:p-6">
                  <Text as='p' size="2" color="gray" className="mb-4">
                    Choose how you want to receive notifications
                  </Text>

                  <Flex direction="column" gap="4">
                    {Object.entries(preferences.channels).map(([channel, enabled]) => (
                      <Flex
                        key={channel}
                        align="center"
                        justify="between"
                        className="p-4 bg-[--gray-a2] rounded-lg border border-[--gray-a5] hover:border-[--focus-8] transition-all"
                      >
                        <Flex align="center" gap="3">
                          <Box className="text-[--accent-9]">
                            {getChannelIcon(channel)}
                          </Box>
                          <Box>
                            <Text as='p' size="2" weight="medium">
                              {getChannelLabel(channel)}
                            </Text>
                            <Text as='p' size="1" color="gray">
                              {channel === 'inApp' && 'Notifications within the application'}
                              {channel === 'email' && 'Email notifications to your registered email'}
                              {channel === 'push' && 'Push notifications to your device'}
                              {channel === 'sms' && 'Text messages to your phone number'}
                            </Text>
                          </Box>
                        </Flex>
                        <Switch
                          checked={enabled && preferences.enabled}
                          onCheckedChange={(checked) => handleChannelToggle(channel, checked)}
                          disabled={!preferences.enabled}
                          size="2"
                        />
                      </Flex>
                    ))}
                  </Flex>
                </Box>
              </Box>
            </Flex>
          </Tabs.Content>

          {/* NOTIFICATION TYPES TAB */}
          <Tabs.Content value="types" className="mt-6">
            <Flex direction="column" gap="6">
              {Object.entries(groupedNotifications).map(([category, notifications]) => (
                <Box key={category} className="rounded-lg border border-[--gray-a6] overflow-hidden">
                  <SectionHeader
                    icon={<MessageSquare />}
                    title={`${category} Notifications`}
                  />

                  <Box className="p-4 md:p-6">
                    <Flex direction="column" gap="4">
                      {notifications.map((notification) => (
                        <Box
                          key={notification.key}
                          className="p-4 bg-[--gray-a2] rounded-lg border border-[--gray-a5] hover:border-[--focus-8] transition-all"
                        >
                          <Flex align="center" justify="between" className="mb-3">
                            <Box className="flex-1">
                              <Text as='p' size="2" weight="medium" mb={'1'}>
                                {notification.title}
                              </Text>
                              <Text as='p' size="1" color="gray">
                                {notification.description}
                              </Text>
                            </Box>
                            <Switch
                              checked={preferences.preferences[notification.key]?.enabled && preferences.enabled}
                              onCheckedChange={(checked) => handleNotificationTypeToggle(notification.key, checked)}
                              disabled={!preferences.enabled}
                              size="2"
                            />
                          </Flex>

                          {preferences.preferences[notification.key]?.enabled && preferences.enabled && (
                            <Box className="pl-2 border-l-2 border-[--gray-a6]">
                              <Text as='p' size="1" weight="medium" color="gray" className="block mb-2">
                                Delivery Channels:
                              </Text>
                              <Flex gap="3" wrap="wrap" >
                                {Object.entries(preferences.preferences[notification.key].channels).map(([channel, channelEnabled]) => (
                                  <Flex
                                    key={channel}
                                    align="center"
                                    gap="1"
                                    className="text-xs"
                                  >
                                    <Switch
                                      checked={channelEnabled && preferences.channels[channel]}
                                      onCheckedChange={(checked) => handleNotificationChannelToggle(notification.key, channel, checked)}
                                      disabled={!preferences.channels[channel]}
                                      size="1"
                                    />
                                    <Text as='p' size="1" color={preferences.channels[channel] ? "default" : "gray"}>
                                      {getChannelLabel(channel)}
                                    </Text>
                                  </Flex>
                                ))}
                              </Flex>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                </Box>
              ))}
            </Flex>
          </Tabs.Content>

          {/* SCHEDULE TAB */}
          <Tabs.Content value="schedule" className="mt-6">
            <Flex direction="column" gap="6">
              {/* QUIET HOURS */}
              <Box className="rounded-lg border border-[--gray-a6] overflow-hidden">
                <SectionHeader
                  icon={preferences.quietHours.enabled ? <VolumeX /> : <Volume2 />}
                  title="Quiet Hours"
                />

                <Box className="p-4 md:p-6">
                  <Flex align="center" justify="between" className="mb-4">
                    <Box>
                      <Text as='p' size="3" weight="medium">Enable Quiet Hours</Text>
                      <Text as='p' size="2" color="gray">Suppress notifications during specified hours</Text>
                    </Box>
                    <Switch
                      checked={preferences.quietHours.enabled && preferences.enabled}
                      onCheckedChange={handleQuietHoursToggle}
                      disabled={!preferences.enabled}
                      size="3"
                    />
                  </Flex>

                  {preferences.quietHours.enabled && preferences.enabled && (
                    <Box className="space-y-4">
                      <Separator size="4" />
                      
                      <Flex gap="4" wrap="wrap">
                        <Box className="flex-1 min-w-32">
                          <Text as='p' size="2" weight="medium" className="block mb-2">
                            Start Time
                          </Text>
                          <TextField.Root
                            type="time"
                            value={preferences.quietHours.start}
                            onChange={(e) => handleQuietHoursTimeChange('start', e.target.value)}
                            size="2"
                          />
                        </Box>
                        <Box className="flex-1 min-w-32">
                          <Text as='p' size="2" weight="medium" className="block mb-2">
                            End Time
                          </Text>
                          <TextField.Root
                            type="time"
                            value={preferences.quietHours.end}
                            onChange={(e) => handleQuietHoursTimeChange('end', e.target.value)}
                            size="2"
                          />
                        </Box>
                      </Flex>

                      <Callout.Root variant='surface' color="blue" size="2">
                        <Callout.Icon>
                          <Info size={16} />
                        </Callout.Icon>
                        <Callout.Text>
                          During quiet hours ({preferences.quietHours.start} - {preferences.quietHours.end}), 
                          you'll only receive critical notifications.
                        </Callout.Text>
                      </Callout.Root>
                    </Box>
                  )}
                </Box>
              </Box>
            </Flex>
          </Tabs.Content>
        </Tabs.Root>

        {/* ACTION BUTTONS */}
        <Flex gap="3" mt="6" justify="end" wrap="wrap">
          <Button
            variant="soft"
            color="gray"
            size="2"
            onClick={handleResetDefaults}
            disabled={isLoading || isSaving}
          >
            {isLoading ? "Resetting..." : "Reset to Defaults"}
          </Button>
          <Button
            size="2"
            onClick={handleSavePreferences}
            disabled={isLoading || isSaving}
          >
            <CheckCircle size={16} />
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </Flex>
      </Box>
    </div>
  );
}

export default NotificationSettings; 