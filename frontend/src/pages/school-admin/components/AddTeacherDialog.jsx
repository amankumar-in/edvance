import { Button, Callout, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { AlertCircleIcon, UserPlus } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAddTeacher } from '../../../api/school-admin/school.mutations';
import { FormFieldErrorMessage } from '../../../components';

function AddTeacherDialog({ open, onOpenChange }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Mutation
  const addTeacherMutation = useAddTeacher();

  // Form submission
  const onSubmit = async (data) => {
    const { teacherEmail, subjectsTaught } = data;
    console.log(data);
    
    // Convert comma-separated subjects to array
    const subjectsArray = subjectsTaught 
      ? subjectsTaught.split(',').map(subject => subject.trim()).filter(subject => subject !== '')
      : [];

    addTeacherMutation.mutate({
      teacherEmail,
      subjectsTaught: subjectsArray
    }, {
      onSuccess: () => {
        toast.success('Teacher added successfully');
        console.log('Teacher added successfully');
        handleClose(); 
      },
      onError: (error) => {
        console.log(error);
        toast.error(error?.response?.data?.message || 'Failed to add teacher');
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
        <Dialog.Title>Add Teacher</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Add a new teacher to your school by entering their email address and subjects they teach.
        </Dialog.Description>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            {/* Error display */}
            {addTeacherMutation.isError && (
              <Callout.Root color="red" variant="surface">
                <Callout.Icon>
                  <AlertCircleIcon size={16} />
                </Callout.Icon>
                <Callout.Text>
                  {addTeacherMutation.error?.response?.data?.message || 'Failed to add teacher'}
                </Callout.Text>
              </Callout.Root>
            )}

            <div>
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Email Address
                </Text>
                <TextField.Root
                  {...register('teacherEmail', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  color={errors?.teacherEmail ? 'red' : undefined}
                  placeholder="Enter teacher email address"
                />
              </label>
              <FormFieldErrorMessage errors={errors} field='teacherEmail' />
            </div>

            <div>
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Subjects Taught
                </Text>
                <TextField.Root
                  {...register('subjectsTaught')}
                  placeholder="e.g., Math, Science, English"
                />
              </label>
              <Text size="1" color="gray" mt="1">
                Optional: Enter subjects separated by commas
              </Text>
            </div>

            {/* Action buttons */}
            <Flex gap="3" mt="4" justify="end" wrap={'wrap-reverse'}>
              <Dialog.Close asChild>
                <Button
                  variant="soft"
                  color="gray"
                  onClick={handleClose}
                  disabled={addTeacherMutation.isPending}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={addTeacherMutation.isPending}
              >
                <UserPlus size={16} />
                {addTeacherMutation.isPending ? 'Processing...' : 'Add Teacher'}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default AddTeacherDialog; 