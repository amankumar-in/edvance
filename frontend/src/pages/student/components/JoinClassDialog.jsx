import { Button, Dialog, Flex, IconButton, Text, TextField, Tooltip } from '@radix-ui/themes'
import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useJoinClass } from '../../../api/student/student.mutations'
import ErrorCallout from '../../../components/ErrorCallout'
import { FormFieldErrorMessage } from '../../../components/FormFieldErrorMessage'

function JoinClassDialog() {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm({
    defaultValues: {
      classCode: ''
    }
  })

  const joinClassMutation = useJoinClass()

  const handleJoinClass = (data) => {
    const { classCode } = data
    joinClassMutation.mutate({ classCode }, {
      onSuccess: () => {
        toast.success('Class joined successfully')
        handleOpenChange(false)
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to join class')
      }
    })
  }

  const handleOpenChange = (open) => {
    setOpen(open)
    reset()
    joinClassMutation.reset()
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Tooltip content='Join Class'>
        <Dialog.Trigger>
          <IconButton
            className='my-auto shadow-lg'
            size='3'
            radius='full'
            aria-label='Join Class'
          >
            <Plus size={20} />
          </IconButton>
        </Dialog.Trigger>
      </Tooltip>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Join Class</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Enter the class code to join the class
        </Dialog.Description>


        <form onSubmit={handleSubmit(handleJoinClass)}>
          <Flex direction="column" gap="3">

            {/* Error Callout */}
            {joinClassMutation.isError && (
              <ErrorCallout
                errorMessage={joinClassMutation.error?.response?.data?.message || 'Failed to join class'}
              />
            )}

            <div>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Class Code
                </Text>
                <TextField.Root
                  size={'3'}
                  placeholder="Enter class code"
                  {...register('classCode', {
                    required: 'Class code is required',
                    minLength: { value: 3, message: 'Class code must be at least 3 characters' },
                    pattern: { value: /^[A-Z0-9]+$/i, message: 'Invalid class code format' }
                  })}
                />
              </label>
              <Text as='p' mt="1" size="1" color="gray">
                Ask your teacher for the class code, then enter it here.
              </Text>
              <FormFieldErrorMessage errors={errors} field="classCode" />
            </div>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button
                type='button'
                disabled={joinClassMutation.isPending}
                variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              type='submit'
              disabled={!isValid || joinClassMutation.isPending}
            >
              {joinClassMutation.isPending ? 'Joining...' : 'Join'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default JoinClassDialog
