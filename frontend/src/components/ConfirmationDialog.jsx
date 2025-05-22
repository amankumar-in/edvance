import React from 'react';
import { AlertDialog, Button, Flex, Text, Box } from '@radix-ui/themes';

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
  maxWidth = '450px'
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth={maxWidth}>
        <AlertDialog.Title weight={'medium'}>{title}</AlertDialog.Title>
        <AlertDialog.Description size={'2'}>
          {description}
        </AlertDialog.Description>

        {additionalContent && (
          <Box my="4">
            {additionalContent}
          </Box>
        )}
        
        <Flex gap="3" mt="4" justify="end">
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
              {isLoading ? 'Processing...' : confirmText}
              {!isLoading && confirmIcon}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

export default ConfirmationDialog; 
 