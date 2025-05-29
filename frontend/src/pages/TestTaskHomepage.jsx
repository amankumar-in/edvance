import React from 'react';
import { Card, Button, Badge, Tabs, Flex, Text, Box } from '@radix-ui/themes';
import { StudentTaskHomepage } from './task';
import { ParentTaskHomepage } from './task';
import { useAuth } from '../Context/AuthContext';

/**
 * Test Component for New Task Homepage Components
 * This component helps test both student and parent task homepages
 */
const TestTaskHomepage = () => {
  const { user } = useAuth();

  // Determine which component to show based on user role
  const isStudent = user?.roles?.includes('student');
  const isParent = user?.roles?.includes('parent');

  return (
    <Box className="p-6">
      {/* Header */}
      <Flex direction="column" gap="4" mb="6">
        <Box>
          <Text size="6" weight="bold">Task Homepage Test</Text>
          <Text size="3" color="gray">
            Testing new task homepage components built from scratch
          </Text>
        </Box>
        
        {/* User Role Info */}
        <Card className="p-3 bg-blue-50">
          <Text size="2" weight="bold" mb="2">User Information:</Text>
          <Text size="2">
            User ID: {user?.id || 'Not loaded'} | 
            Roles: {JSON.stringify(user?.roles)} | 
            Is Student: {isStudent ? 'Yes' : 'No'} | 
            Is Parent: {isParent ? 'Yes' : 'No'}
          </Text>
        </Card>
      </Flex>

      {/* Component Selection */}
      {!user?.id ? (
        <Card className="p-6 text-center">
          <Text size="3" color="red" mb="2">User Not Loaded</Text>
          <Text size="2" color="gray">
            Please make sure you are logged in and the user object is properly loaded.
          </Text>
        </Card>
      ) : isStudent ? (
        <Box>
          <Text size="4" weight="bold" mb="4">🎓 Student Task Homepage</Text>
          <StudentTaskHomepage />
        </Box>
      ) : isParent ? (
        <Box>
          <Text size="4" weight="bold" mb="4">👨‍👩‍👧‍👦 Parent Task Homepage</Text>
          <ParentTaskHomepage />
        </Box>
      ) : (
        <Card className="p-6 text-center">
          <Text size="3" color="orange" mb="2">Role Not Supported</Text>
          <Text size="2" color="gray" mb="4">
            This test component currently supports student and parent roles only.
          </Text>
          <Text size="2" color="gray">
            Your roles: {JSON.stringify(user?.roles)}
          </Text>
        </Card>
      )}
    </Box>
  );
};

export default TestTaskHomepage; 