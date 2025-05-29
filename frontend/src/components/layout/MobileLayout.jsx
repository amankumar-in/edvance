import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { 
  Home, 
  CheckSquare, 
  Gift, 
  User, 
  Settings,
  Bell
} from 'lucide-react';

const MobileLayout = ({ userType = 'student', children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Home',
        icon: Home,
        path: `/${userType}/dashboard`,
        active: location.pathname === `/${userType}/dashboard`
      },
      {
        id: 'tasks',
        label: 'Tasks',
        icon: CheckSquare,
        path: `/${userType}/tasks`,
        active: location.pathname.startsWith(`/${userType}/tasks`)
      },
      {
        id: 'rewards',
        label: 'Rewards',
        icon: Gift,
        path: `/${userType}/rewards`,
        active: location.pathname.startsWith(`/${userType}/rewards`)
      }
    ];

    if (userType === 'parent') {
      baseItems.push({
        id: 'children',
        label: 'Children',
        icon: User,
        path: '/parent/children',
        active: location.pathname.startsWith('/parent/children')
      });
    }

    baseItems.push({
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: `/${userType}/settings`,
      active: location.pathname.startsWith(`/${userType}/settings`)
    });

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <Box className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Box className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white lg:border-r lg:border-gray-200">
        <Box className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
          <Text size="5" weight="bold" color="purple">
            Univance
          </Text>
        </Box>
        
        <nav className="mt-8">
          <Box className="space-y-1 px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={item.active ? "solid" : "ghost"}
                  size="3"
                  className={`w-full justify-start ${
                    item.active 
                      ? 'bg-purple-100 text-purple-700 border-purple-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon size={20} />
                  <Text size="3" className="ml-3">
                    {item.label}
                  </Text>
                </Button>
              );
            })}
          </Box>
        </nav>

        {/* Notifications Section */}
        <Box className="mt-8 px-3">
          <Box className="bg-purple-50 rounded-lg p-4">
            <Flex align="center" gap="2" className="mb-2">
              <Bell size={16} className="text-purple-600" />
              <Text size="2" weight="medium" className="text-purple-700">
                Notifications
              </Text>
            </Flex>
            <Text size="1" className="text-purple-600">
              You have 3 new updates
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="lg:pl-64">
        {/* Mobile Header */}
        <Box className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <Flex align="center" justify="between">
            <Text size="4" weight="bold" color="purple">
              Univance
            </Text>
            <Button variant="ghost" size="2">
              <Bell size={20} />
            </Button>
          </Flex>
        </Box>

        {/* Page Content */}
        <main className="pb-20 lg:pb-0">
          {children}
        </main>
      </Box>

      {/* Mobile Bottom Navigation */}
      <Box className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <Flex className="grid grid-cols-4 gap-1 py-2 px-1">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="2"
                className={`flex-col h-16 ${
                  item.active 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-500'
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={20} />
                <Text size="1" className="mt-1">
                  {item.label}
                </Text>
              </Button>
            );
          })}
        </Flex>
      </Box>
    </Box>
  );
};

export default MobileLayout; 