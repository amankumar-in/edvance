import { Button, Dialog, Flex, Grid, Text, TextField } from "@radix-ui/themes"
import { isValidPhoneNumber } from "libphonenumber-js"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { toast } from "sonner"
import { useUpdateUserProfile } from "../../../../api/user/user.mutations"
import ErrorCallout from "../../../../components/ErrorCallout"
import { FormFieldErrorMessage } from "../../../../components/FormFieldErrorMessage"
import { useAuth } from "../../../../Context/AuthContext"

// Edit Profile Dialog
function EditProfileDialog({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const updateProfileMutation = useUpdateUserProfile()
  const { setUser, user: userDetails } = useAuth()

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
    }
  })

  const onSubmit = async (data) => {
    updateProfileMutation.mutate(data, {
      onSuccess: (response) => {
        setUser({ ...userDetails, ...response.data })
        toast.success('Profile updated successfully')
        setIsOpen(false)
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to update profile')
      }
    })
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => {
      setIsOpen(o);
      reset();
    }}>
      <Dialog.Trigger>
        <Button variant="outline" size="2">
          <Pencil size={16} />
          Edit Profile
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="500px">
        <Dialog.Title>Edit Profile</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Update your profile information
        </Dialog.Description>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            {/* Error Callout */}
            {updateProfileMutation.isError && (
              <ErrorCallout
                errorMessage={updateProfileMutation.error?.response?.data?.message || 'Failed to update profile'}
              />
            )}
            <Grid columns={{ initial: '1', xs: '2' }} gap="3">
              <label>
                <Text as="div" size="2" weight="medium" mb="1">
                  First Name *
                </Text>
                <TextField.Root
                  size={'3'}
                  {...register('firstName', { required: 'First name is required' })}
                  placeholder="Enter first name"
                />
                <FormFieldErrorMessage errors={errors} field={'firstName'} />
              </label>
              <label>
                <Text as="div" size="2" weight="medium" mb="1">
                  Last Name *
                </Text>
                <TextField.Root
                  size={'3'}
                  {...register('lastName', { required: 'Last name is required' })}
                  placeholder="Enter last name"
                />
                <FormFieldErrorMessage errors={errors} field={'lastName'} />
              </label>
            </Grid>

            <label>
              <Text as="div" size="2" weight="medium" mb="1">
                Phone Number
              </Text>
              <Controller
                control={control}
                name="phoneNumber"
                rules={{
                  validate: (value) => {
                    if (value) {
                      return isValidPhoneNumber(value) || 'Invalid phone number'
                    }
                  }
                }}
                render={({ field }) => (
                  <PhoneInput
                    placeholder="Enter phone number"
                    value={field.value || ''}
                    onChange={field.onChange}
                    defaultCountry=""
                    className="flex px-4 w-full bg-[--color-surface] ring-1 ring-[--gray-a7] focus-within:ring-[1.5px] focus-within:outline-none focus-within:ring-[--focus-8] rounded-md h-[38px]"
                    numberInputProps={{
                      className: "flex-1 border-0 bg-transparent outline-none placeholder:text-[--gray-a9] placeholder:text-[16px]"
                    }}
                  />
                )}
              />
              <FormFieldErrorMessage errors={errors} field={'phoneNumber'} />
            </label>

            <label>
              <Text as="div" size="2" weight="medium" mb="1">
                Date of Birth
              </Text>
              <TextField.Root
                size={'3'}
                {...register('dateOfBirth', {
                  validate: {
                    notFuture: (value) => {
                      if (!value) return true;
                      const selectedDate = new Date(value);
                      const today = new Date();
                      return selectedDate <= today || 'Date cannot be in the future';
                    },
                    reasonableDate: (value) => {
                      if (!value) return true;
                      const selectedDate = new Date(value);
                      const today = new Date();
                      const age = today.getFullYear() - selectedDate.getFullYear();

                      return age <= 120 || 'Please enter a valid date';
                    }
                  }
                })}
                type="date"
                max={new Date().toISOString().split('T')[0]}
              />
              <FormFieldErrorMessage errors={errors} field={'dateOfBirth'} />
            </label>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default EditProfileDialog