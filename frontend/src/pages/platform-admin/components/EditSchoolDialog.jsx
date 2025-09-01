import React, { useEffect } from 'react'
import { Dialog, Button, Flex, Text, TextField, Grid, Box, Separator, Callout, Card } from '@radix-ui/themes'
import { Save, X, Info } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { isValidPhoneNumber } from 'libphonenumber-js'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useUpdateSchoolById } from '../../../api/school-admin/school.mutations'
import { FormFieldErrorMessage } from '../../../components'

function EditSchoolDialog({ open, onOpenChange, school, children = null }) {
  const { mutate: updateSchool, isPending, isError, error } = useUpdateSchoolById()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      logo: '',
    },
  })

  // Load school data when dialog opens
  useEffect(() => {
    if (open && school) {
      reset({
        name: school.name || '',
        address: school.address || '',
        city: school.city || '',
        state: school.state || '',
        zipCode: school.zipCode || '',
        country: school.country || '',
        phone: school.phone || '',
        email: school.email || '',
        website: school.website || '',
        logo: school.logo || '',
      })
    }
  }, [open, school, reset])

  const onSubmit = async (data) => {
    // Remove empty fields
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== '')
    )

    updateSchool(
      { id: school._id, data: cleanData },
      {
        onSuccess: () => {
          toast.success('School updated successfully')
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to update school')
        },
      }
    )
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children && (
        <Dialog.Trigger>
          {children}
        </Dialog.Trigger>
      )}
      <Dialog.Content
        maxWidth="800px"
      >
        <Dialog.Title asChild>
          Edit School Details
        </Dialog.Title>

        <Dialog.Description size="2" mb="4">
          Update the school information and contact details.
        </Dialog.Description>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-2">
          {isError && (
            <Callout.Root color="red" variant="surface">
              <Callout.Icon>
                <Info size={16} />
              </Callout.Icon>
              <Callout.Text>
                {error?.response?.data?.message || 'Failed to update school'}
              </Callout.Text>
            </Callout.Root>
          )}

          {/* School Information */}
          <FormSection title="School Information">
            {/* School Name */}
            <Box>
              <Text as="label" htmlFor="schoolName" size="2" weight="medium" mb="1" className="block">
                School Name *
              </Text>
              <TextField.Root
                id="schoolName"
                size="3"
                placeholder="Enter school name"
                {...register('name', {
                  required: 'School name is required',
                  minLength: {
                    value: 2,
                    message: 'School name must be at least 2 characters'
                  }
                })}
              />
              <FormFieldErrorMessage errors={errors} field="name" />
            </Box>

            {/* School Logo */}
            <Box>
              <Text as="label" htmlFor="schoolLogo" size="2" weight="medium" mb="1" className="block">
                School Logo URL
              </Text>
              <TextField.Root
                id="schoolLogo"
                size="3"
                placeholder="Enter logo URL"
                {...register('logo', {
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                    message: 'Please enter a valid URL'
                  }
                })}
              />
              <FormFieldErrorMessage errors={errors} field="logo" />
            </Box>
          </FormSection>

          {/* Address Information */}
          <FormSection title="Address Information">
            <Grid columns={{ initial: '1', xs: '2' }} gap="4">
              {/* Street Address */}
              <Box gridColumn={{ xs: '1 / -1' }}>
                <Text as="label" htmlFor="streetAddress" size="2" weight="medium" mb="1" className="block">
                  Street Address
                </Text>
                <TextField.Root
                  id="streetAddress"
                  size="3"
                  placeholder="Enter street address"
                  {...register('address')}
                />
              </Box>

              {/* City */}
              <Box>
                <Text as="label" htmlFor="city" size="2" weight="medium" mb="1" className="block">
                  City
                </Text>
                <TextField.Root
                  id="city"
                  size="3"
                  placeholder="Enter city"
                  {...register('city')}
                />
              </Box>

              {/* State */}
              <Box>
                <Text as="label" htmlFor="state" size="2" weight="medium" mb="1" className="block">
                  State
                </Text>
                <TextField.Root
                  id="state"
                  size="3"
                  placeholder="Enter state"
                  {...register('state')}
                />
              </Box>

              {/* ZIP Code */}
              <Box>
                <Text as="label" htmlFor="zipCode" size="2" weight="medium" mb="1" className="block">
                  ZIP Code
                </Text>
                <TextField.Root
                  id="zipCode"
                  size="3"
                  placeholder="Enter ZIP code"
                  {...register('zipCode', {
                    pattern: {
                      value: /^[A-Z0-9\s-]{2,12}$/i,
                      message: 'Please enter a valid ZIP code'
                    }
                  })}
                />
                <FormFieldErrorMessage errors={errors} field="zipCode" />
              </Box>

              {/* Country */}
              <Box>
                <Text as="label" htmlFor="country" size="2" weight="medium" mb="1" className="block">
                  Country
                </Text>
                <TextField.Root
                  id="country"
                  size="3"
                  placeholder="Enter country"
                  {...register('country')}
                />
              </Box>
            </Grid>
          </FormSection>

          {/* Contact Information */}
          <FormSection title="Contact Information">
            <Grid columns={{ initial: '1', xs: '2' }} gap="4">
              {/* Phone */}
              <Box>
                <Text as="label" htmlFor="phone" size="2" weight="medium" mb="1" className="block">
                  Phone Number
                </Text>
                <Controller
                  control={control}
                  name="phone"
                  rules={{
                    validate: (value) => {
                      if (value) {
                        return isValidPhoneNumber(value) || 'Invalid phone number'
                      }
                    }
                  }}
                  render={({ field }) => (
                    <PhoneInput
                      id="phone"
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
                <FormFieldErrorMessage errors={errors} field="phone" />
              </Box>

              {/* Email */}
              <Box>
                <Text as="label" htmlFor="email" size="2" weight="medium" mb="1" className="block">
                  Email Address
                </Text>
                <TextField.Root
                  id="email"
                  size="3"
                  type="email"
                  placeholder="Enter email address"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                />
                <FormFieldErrorMessage errors={errors} field="email" />
              </Box>

              {/* Website */}
              <Box gridColumn={{ xs: '1 / -1' }}>
                <Text as="label" htmlFor="website" size="2" weight="medium" mb="1" className="block">
                  Website
                </Text>
                <TextField.Root
                  id="website"
                  size="3"
                  type="url"
                  placeholder="Enter website URL"
                  {...register('website', {
                    pattern: {
                      value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                      message: 'Please enter a valid website URL'
                    }
                  })}
                />
                <FormFieldErrorMessage errors={errors} field="website" />
              </Box>
            </Grid>
          </FormSection>

          {/* Action Buttons */}
          <Flex gap="3" justify="end">
            <Button
              type="button"
              variant="soft"
              color="gray"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
            >
              <Save size={16} />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default EditSchoolDialog

const FormSection = ({ title, children }) => {
  return (
    <Card size="2" className="space-y-4 shadow-md">
      <Flex direction="column" gap="3" mb="4">
        <Text as='p' weight="bold">
          {title}
        </Text>
        <Separator size="4" />
      </Flex>
      <div className="space-y-4">
        {children}
      </div>
    </Card>
  )
}
