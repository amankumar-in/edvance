import { Box, Button, Callout, Dialog, Flex, IconButton, Text, TextField } from '@radix-ui/themes';
import { AlertCircle, Check, Copy } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useGenerateJoinCode } from '../../../api/school-class/schoolClass.mutations';

const GenerateJoinCodeDialog = ({ open, onOpenChange, schoolClass }) => {
  const [copied, setCopied] = useState(false);
  const generateJoinCodeMutation = useGenerateJoinCode();
  const joinCodeRef = useRef(null);

  const handleGenerateCode = () => {
    if (schoolClass?._id) {
      generateJoinCodeMutation.mutate(schoolClass._id, {
        onSuccess: () => {
          onOpenChange(false);
        }, 
        onError: (error) => {
          toast.error(error?.response?.data?.message || error?.message || 'Failed to generate join code');
        }
      });
    }
  };

  const handleCopyCode = async () => {
    if (schoolClass?.joinCode) {
      try {
        await navigator.clipboard.writeText(schoolClass.joinCode);
        joinCodeRef.current.select();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  };

  const handleClose = () => {
    setCopied(false);
    generateJoinCodeMutation.reset();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>
          Generate Join Code
        </Dialog.Title>

        <Dialog.Description size="2" mb="4">
          Generate a new join code for <strong>{schoolClass?.name}</strong> class.
          Students can use this code to join the class.
        </Dialog.Description>

        <Box className="space-y-4">
          {/* Current Join Code */}
          <Box>
            <Text as="label" size="2" weight="medium" mb="1" htmlFor='joinCode'>
              Current Join Code
            </Text>
            <Flex gap="2">
              <TextField.Root
                id='joinCode'
                ref={joinCodeRef}
                value={schoolClass?.joinCode || ''}
                readOnly
                className="flex-1 font-mono"
              />
              <IconButton
                variant="soft"
                onClick={handleCopyCode}
                disabled={!schoolClass?.joinCode}
                color={copied ? 'green' : 'gray'}
                size="2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </IconButton>
            </Flex>
          </Box>

          {/* Warning */}
          <Callout.Root color="amber" variant="surface">
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>
              Generating a new code will invalidate the current one. Students using the old code won't be able to join.
            </Callout.Text>
          </Callout.Root>

          {/* Error Message */}
          {generateJoinCodeMutation.isError && (
            <Callout.Root color="red" variant="surface">
              <Callout.Icon>
                <AlertCircle size={16} />
              </Callout.Icon>
              <Callout.Text>
                {generateJoinCodeMutation.error?.response?.data?.message ||
                  generateJoinCodeMutation.error?.message ||
                  'Failed to generate join code'}
              </Callout.Text>
            </Callout.Root>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerateCode}
            disabled={generateJoinCodeMutation.isPending}
            className="w-full"
          >
            {generateJoinCodeMutation.isPending ? 'Generating...' : 'Generate New Code'}
          </Button>
        </Box>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default GenerateJoinCodeDialog; 