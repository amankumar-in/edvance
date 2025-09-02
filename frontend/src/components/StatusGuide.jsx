import { Badge, Box, Button, Callout, Flex, Text } from '@radix-ui/themes';
import { Info, TreePine } from 'lucide-react';
import React, { useState } from 'react';

const StatusGuide = ({ 
  title = "Status & Badge Guide:",
  showTreeIcon = true,
  customStatuses = []
}) => {
  const [showStatusInfo, setShowStatusInfo] = useState(false);

  const defaultStatuses = [
    {
      type: 'activity',
      items: [
        { badge: <Badge color="green" variant="soft">Active</Badge>, description: "Category is currently available for use" },
        { badge: <Badge color="red" variant="soft">Inactive</Badge>, description: "Category is disabled and not available" }
      ]
    },
    {
      type: 'category',
      items: [
        { badge: <Badge color="orange" variant="surface">System</Badge>, description: "Built-in category that cannot be modified or deleted" },
        { badge: <Badge color="purple" variant="soft" size="1">Sub</Badge>, description: "Subcategory with a parent category" }
      ]
    },
    {
      type: 'visibility',
      items: [
        { badge: <Badge color="green" variant="outline">Public</Badge>, description: "Visible to all users across the platform" },
        { badge: <Badge color="blue" variant="outline">School</Badge>, description: "Visible to users within the same school" }
      ]
    },
    {
      type: 'visibility-extended',
      items: [
        { badge: <Badge color="gray" variant="outline">Private</Badge>, description: "Only visible to the creator" },
        { badge: <Badge color="gray" variant="outline">Family</Badge>, description: "Visible to family members" },
        { badge: <Badge color="gray" variant="outline">Class</Badge>, description: "Visible to class members" }
      ]
    }
  ];

  const statusesToShow = customStatuses.length > 0 ? customStatuses : defaultStatuses;

  return (
    <Box>
      <Flex align="center" gap="2" mb="3">
        <Button 
          variant="ghost" 
          size="1" 
          onClick={() => setShowStatusInfo(!showStatusInfo)}
        >
          <Info size={14} />
          {showStatusInfo ? 'Hide' : 'Show'} Status Guide
        </Button>
      </Flex>
      
      {showStatusInfo && (
        <Callout.Root color="blue" variant='surface' size="1">
          <Callout.Icon>
            <Info size={16} />
          </Callout.Icon>
          <Callout.Text>
            <Box>
              <Text weight="medium" size="2" mb="2" style={{ display: 'block' }}>
                {title}
              </Text>
              <Flex direction="column" gap="2">
                {statusesToShow.map((statusGroup, groupIndex) => (
                  <Flex key={groupIndex} align="center" gap="2" wrap="wrap">
                    {statusGroup.items.map((item, itemIndex) => (
                      <React.Fragment key={itemIndex}>
                        {item.badge}
                        <Text size="1">{item.description}</Text>
                        {itemIndex < statusGroup.items.length - 1 && (
                          <Text size="1" color="gray">•</Text>
                        )}
                      </React.Fragment>
                    ))}
                  </Flex>
                ))}
                
                {showTreeIcon && (
                  <Flex align="center" gap="2">
                    <TreePine size={14} color="var(--gray-8)" />
                    <Text size="1">Indicates a subcategory (has a parent category)</Text>
                  </Flex>
                )}
              </Flex>
            </Box>
          </Callout.Text>
        </Callout.Root>
      )}
    </Box>
  );
};

export default StatusGuide; 