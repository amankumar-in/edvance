import React from 'react';
import { Button, Heading, Text } from '@radix-ui/themes';
import { Link } from 'react-router';

function Dashboard() {
  // In a real app, you would fetch user data from an API or context
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    role: 'STUDENT',
    // More user data would be available here
  };

  return (
    <div className="w-full max-w-6xl p-6 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Heading as="h1" size="8">
            Dashboard
          </Heading>
          <Text as="p" size="3" color="gray">
            Welcome back, {user.firstName}!
          </Text>
        </div>
        <div>
          <Button
            variant="solid"
            onClick={() => {
              // Clear auth in localStorage and redirect to login
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              localStorage.removeItem('isAuthenticated');
              window.location.href = '/login';
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Content Card */}
        <div className="col-span-2 p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
          <Heading as="h2" size="5" className="mb-4">
            Your Progress
          </Heading>
          <div className="flex items-center justify-center p-8 border-2 border-gray-200 border-dashed rounded-lg">
            <Text as="p" size="4" color="gray">
              Your dashboard content will appear here
            </Text>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
            <div className="flex items-center mb-4 space-x-4">
              <div className="flex items-center justify-center w-16 h-16 text-xl font-bold text-white bg-purple-500 rounded-full">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <Text as="p" size="4" weight="medium">
                  {user.firstName} {user.lastName}
                </Text>
                <Text as="p" size="2" color="gray">
                  {user.role.toLowerCase().replace('_', ' ')}
                </Text>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              asChild
            >
              <Link to="/profile">View Profile</Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
            <Heading as="h3" size="3" className="mb-4">
              Quick Links
            </Heading>
            <div className="space-y-2">
              <Button variant="ghost" className="justify-start w-full">
                My Scholarships
              </Button>
              <Button variant="ghost" className="justify-start w-full">
                Messages
              </Button>
              <Button variant="ghost" className="justify-start w-full">
                Settings
              </Button>
              <Button variant="ghost" className="justify-start w-full">
                Help & Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 