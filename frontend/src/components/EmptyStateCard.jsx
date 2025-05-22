import React from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';

function EmptyStateCard({ icon, title, description, action, className = '' }) {
  return (
    <Box className={`text-center p-10 bg-[--gray-a2] rounded-lg border border-[--gray-a5] ${className}`}>
      <Flex direction="column" align="center" gap="3">
        {icon && React.cloneElement(icon, { 
          size: 40, 
          className: "text-[--accent-9] opacity-90" 
        })}
        
        {title && (
          <Text size="3" weight="medium">{title}</Text>
        )}
        
        {description && (
          <Text size="2" color="gray" className="max-w-md">
            {description}
          </Text>
        )}
        
        {action && (
          <Box className="mt-2">
            {action}
          </Box>
        )}
      </Flex>
    </Box>
  );
}

export default EmptyStateCard; 