import { AlertDialog, Box, Button, Flex } from '@radix-ui/themes';
import React from 'react';

function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  additionalContent,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'blue',
  isLoading = false,
  onConfirm,
  confirmIcon, 
  maxWidth = '450px', 
  children
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {children && <AlertDialog.Trigger>{children}</AlertDialog.Trigger>}
      <AlertDialog.Content maxWidth={maxWidth}>
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description size={'2'}>
          {description}
        </AlertDialog.Description>

        {additionalContent && (
          <Box my="4">
            {additionalContent}
          </Box>
        )}
        
        <Flex gap="3" mt="4" justify="end" wrap={'wrap-reverse'}>
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray" disabled={isLoading}>
              {cancelText}
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action onClick={e => e.preventDefault()}>
            <Button 
              onClick={onConfirm}
              color={confirmColor}
              disabled={isLoading}
            >
              {!isLoading && confirmIcon}
              {isLoading ? 'Processing...' : confirmText}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

export default ConfirmationDialog; 
 