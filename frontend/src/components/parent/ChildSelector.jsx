import React from 'react';
import { Box, Card, Flex, Text, Button, Select, Avatar } from '@radix-ui/themes';
import { User, ChevronDown } from 'lucide-react';

const ChildSelector = ({ children, selectedChild, onChildSelect, compact = false }) => {
  if (compact) {
    return (
      <Select.Root
        value={selectedChild?.id || ''}
        onValueChange={(value) => {
          const child = children.find(c => c.id === value);
          onChildSelect(child);
        }}
      >
        <Select.Trigger className="min-w-[200px]">
          <Flex align="center" gap="2">
            <User size={16} />
            <Select.Value placeholder="Select child" />
          </Flex>
        </Select.Trigger>
        <Select.Content>
          {children.map((child) => (
            <Select.Item key={child.id} value={child.id}>
              <Flex align="center" gap="2">
                <Avatar size="1" fallback={child.name.charAt(0)} />
                <Box>
                  <Text size="2" weight="medium">{child.name}</Text>
                  <Text size="1" color="gray">{child.grade}</Text>
                </Box>
              </Flex>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    );
  }

  return (
    <Box>
      <Text size="4" weight="medium" className="mb-4 text-gray-900">
        Select a Child
      </Text>
      
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child) => (
          <Card
            key={child.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
              selectedChild?.id === child.id 
                ? 'border-purple-300 bg-purple-50 shadow-md' 
                : 'border-gray-200 hover:border-purple-200'
            }`}
            onClick={() => onChildSelect(child)}
          >
            <Box className="p-4">
              <Flex direction="column" align="center" gap="3">
                <Avatar 
                  size="5" 
                  fallback={child.name.charAt(0)}
                  className={selectedChild?.id === child.id ? 'ring-2 ring-purple-300' : ''}
                />
                
                <Box className="text-center">
                  <Text size="3" weight="medium" className="text-gray-900">
                    {child.name}
                  </Text>
                  <Text size="2" className="text-gray-600 mt-1">
                    {child.grade}
                  </Text>
                </Box>

                {selectedChild?.id === child.id && (
                  <Box className="w-full">
                    <Button size="2" className="w-full" variant="soft">
                      Selected
                    </Button>
                  </Box>
                )}
              </Flex>
            </Box>
          </Card>
        ))}
      </Box>

      {selectedChild && (
        <Card className="mt-6 bg-purple-50 border-purple-200">
          <Box className="p-4">
            <Flex align="center" gap="3">
              <Avatar size="3" fallback={selectedChild.name.charAt(0)} />
              <Box>
                <Text size="3" weight="medium" className="text-purple-900">
                  Managing tasks for {selectedChild.name}
                </Text>
                <Text size="2" className="text-purple-700">
                  {selectedChild.grade} • You can control task visibility
                </Text>
              </Box>
            </Flex>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default ChildSelector; 