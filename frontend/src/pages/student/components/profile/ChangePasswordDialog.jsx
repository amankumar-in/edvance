import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes"
import { Lock } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useChangePassword } from "../../../../api/user/user.mutations"
import ErrorCallout from "../../../../components/ErrorCallout"
import { FormFieldErrorMessage } from "../../../../components/FormFieldErrorMessage"

// Change Password Dialog
function ChangePasswordDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const changePasswordMutation = useChangePassword()

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const newPassword = watch('newPassword')

  const onSubmit = async (data) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      toast.success('Password changed successfully')
      reset()
      setIsOpen(false)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to change password')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => {
      setIsOpen(o);
      reset();
    }}>
      <Dialog.Trigger>
        <Button variant="outline" size="2" color="gray">
          <Lock size={16} />
          Change Password
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Change Password</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Enter your current password and choose a new one
        </Dialog.Description>


        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            {/* Error Callout */}
            {changePasswordMutation.isError && (
              <ErrorCallout
                errorMessage={changePasswordMutation.error?.response?.data?.message || 'Failed to change password'}
              />
            )}
            <label>
              <Text as="div" size="2" weight="medium" mb="1">
                Current Password *
              </Text>
              <TextField.Root
                size={'3'}
                {...register('currentPassword', { required: 'Current password is required' })}
                type="password"
                placeholder="Enter current password"
              />
              <FormFieldErrorMessage errors={errors} field="currentPassword" />
            </label>

            <label>
              <Text as="div" size="2" weight="medium" mb="1">
                New Password *
              </Text>
              <TextField.Root
                size={'3'}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
                type="password"
                placeholder="Enter new password"
              />
              <FormFieldErrorMessage errors={errors} field="newPassword" />
            </label>

            <label>
              <Text as="div" size="2" weight="medium" mb="1">
                Confirm New Password *
              </Text>
              <TextField.Root
                size={'3'}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })}
                type="password"
                placeholder="Confirm new password"
              />
              <FormFieldErrorMessage errors={errors} field="confirmPassword" />
            </label>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default ChangePasswordDialog