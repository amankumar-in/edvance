import { Button, Callout, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { AlertCircleIcon, UserPlus } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAddAdministrator } from '../../../api/school-admin/school.mutations';
import { FormFieldErrorMessage } from '../../../components';

function AddAdministratorDialog({ open, onOpenChange, schoolId }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Mutation
  const addAdministratorMutation = useAddAdministrator();

 // Form submission
  const onSubmit = async (data) => {
    const { userEmail } = data;
    console.log(data);
    addAdministratorMutation.mutate({
      schoolId,
      userEmail: userEmail
    }, {
      onSuccess: () => {
        toast.success('Administrator added successfully');
        console.log('Administrator added successfully');
        handleClose(); 
      },
      onError: (error) => {
        console.log(error);
        toast.error(error?.response?.data?.message || 'Failed to add administrator');
      }
    })
  };

  const handleClose = () => {
    // Reset form when closing
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Add Administrator</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Add a new administrator to your school by entering their email address.
        </Dialog.Description>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            {/* Error display */}
            {addAdministratorMutation.isError && (
              <Callout.Root color="red" variant="surface">
                <Callout.Icon>
                  <AlertCircleIcon size={16} />
                </Callout.Icon>
                <Callout.Text>
                  {addAdministratorMutation.error?.response?.data?.message || 'Failed to add administrator'}
                </Callout.Text>
              </Callout.Root>
            )}

            <div>
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Email Address
                </Text>
                <TextField.Root
                  {...register('userEmail', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  color={errors?.userEmail ? 'red' : undefined}
                  placeholder="Enter user email address"
                />
              </label>
              <FormFieldErrorMessage errors={errors} field='userEmail' />
            </div>

            {/* Action buttons */}
            <Flex gap="3" mt="4" justify="end" wrap={'wrap-reverse'}>
              <Dialog.Close asChild>
                <Button
                  variant="soft"
                  color="gray"
                  onClick={handleClose}
                  disabled={addAdministratorMutation.isPending}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={addAdministratorMutation.isPending}
              >
                <UserPlus size={16} />
                {addAdministratorMutation.isPending ? 'Processing...' : 'Add Administrator'}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default AddAdministratorDialog;

