import React from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';

function SectionHeader({ 
  icon, 
  title, 
  rightContent, 
  className = '',
  size = 'large' 
}) {
  // Determine styling based on size
  const styles = {
    large: {
      container: 'bg-[--gray-a2] px-6 py-4 border-b border-[--gray-a6]',
      icon: 18,
      text: { as: 'h2', size: '4', weight: 'medium' }
    },
    medium: {
      container: 'bg-[--gray-a3] px-4 py-3',
      icon: 16,
      text: { as: 'h3', size: '3', weight: 'medium' }
    }
  }[size];

  return (
    <Box className={`${styles.container} ${className}`}>
      <Flex align="center" justify="between">
        <Flex align="center" gap="2">
          {icon && React.cloneElement(icon, { 
            size: styles.icon, 
            className: "text-[--accent-9]" 
          })}
          
          <Text 
            as={styles.text.as} 
            size={styles.text.size} 
            weight={styles.text.weight}
          >
            {title}
          </Text>
        </Flex>
        
        {rightContent && rightContent}
      </Flex>
    </Box>
  );
}

export default SectionHeader; 