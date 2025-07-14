import { Button, Callout, Dialog, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { AlertCircleIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useSchoolProfile } from '../../../api/school-admin/school.queries'
import { useCreateClass, useUpdateClass } from '../../../api/school-class/schoolClass.mutations'
import { FormFieldErrorMessage } from '../../../components'
import { gradeOptions } from '../../../utils/constants'
import { toast } from 'sonner'

function CreateClassDialog({ open, onOpenChange, isEdit = false, selectedClass = null }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue
  } = useForm()

  const { data: schoolProfile, isLoading: isLoadingSchool } = useSchoolProfile()
  const createClassMutation = useCreateClass()
  const updateClassMutation = useUpdateClass()

  // Set form values when editing
  useEffect(() => {
    if (isEdit && selectedClass && open) {
      setValue('name', selectedClass.name || '')
      setValue('grade', selectedClass.grade || '')
    } else if (!isEdit && open) {
      reset()
    }
  }, [isEdit, selectedClass, setValue, reset, open])

  const onSubmit = (data) => {
    const schoolId = schoolProfile?.data?._id
    
    if (!schoolId && !isEdit) {
      toast.error('School ID not found')
      return
    }

    if (isEdit && selectedClass) {
      // Update existing class
      updateClassMutation.mutate({
        classId: selectedClass._id,
        data: {
          name: data.name,
          grade: data.grade
        }
      }, {
        onSuccess: () => {
          onOpenChange(false)
          reset()
        }, 
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to update class')
        }
      })
    } else {
      // Create new class
      createClassMutation.mutate({
        name: data.name,
        grade: data.grade,
        schoolId: schoolId
      }, {
        onSuccess: () => {
          onOpenChange(false)
          reset()
        }, 
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to create class')
        }
      })
    }
  }

  const currentMutation = isEdit ? updateClassMutation : createClassMutation
  console.log(currentMutation)

  const onClose = (open) => {
    onOpenChange(open)
    if (!open) {
      setTimeout(() => {
        reset();
        currentMutation.reset();
      }, 0);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>{isEdit ? 'Edit Class' : 'Create Class'}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {isEdit ? 'Edit the class details.' : 'Create a new class for your school.'}
        </Dialog.Description>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            {/* Error display */}
            {currentMutation.isError && (
              <Callout.Root color="red" variant="surface">
                <Callout.Icon>
                  <AlertCircleIcon size={16} />
                </Callout.Icon>
                <Callout.Text>
                  {currentMutation.error?.response?.data?.message || 
                   currentMutation.error?.message || 
                   `Failed to ${isEdit ? 'update' : 'create'} class`}
                </Callout.Text>
              </Callout.Root>
            )}

            {/* School loading warning */}
            {isLoadingSchool && !isEdit && (
              <Callout.Root color="blue" variant="surface">
                <Callout.Icon>
                  <AlertCircleIcon size={16} />
                </Callout.Icon>
                <Callout.Text>
                  Loading school information...
                </Callout.Text>
              </Callout.Root>
            )}

            <div>
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Class name *
                </Text>
                <TextField.Root
                  {...register('name', {
                    required: 'Class name is required',
                  })}
                  color={errors?.name ? 'red' : undefined}
                  placeholder="Enter class name"
                />
              </label>
              <FormFieldErrorMessage errors={errors} field='name' />
            </div>
            <div>
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Grade *
                </Text>
                <Controller
                  control={control}
                  name="grade"
                  rules={{ required: 'Grade is required' }}
                  render={({ field }) => (
                    <Select.Root
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <Select.Trigger placeholder='Select Grade' radius="large" className='w-full'/>
                      <Select.Content position="popper" variant='soft'>
                        {gradeOptions.map((g) => (
                          <Select.Item key={g} value={g} className='capitalize'>
                            {g}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                <FormFieldErrorMessage errors={errors} field='grade' /> 
              </label>
            </div>

            <Text as="p" size="1" color='gray' className='italic'>
              * indicates required fields.
            </Text>

            {/* Action buttons */}
            <Flex gap="3" justify="end" wrap={'wrap-reverse'} mt="1">
              <Dialog.Close asChild>
                <Button
                  variant="soft"
                  color="gray"
                  disabled={currentMutation.isPending}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={currentMutation.isPending || (isLoadingSchool && !isEdit)}
              >
                {currentMutation.isPending 
                  ? (isEdit ? 'Updating...' : 'Creating...') 
                  : (isEdit ? 'Update Class' : 'Create Class')
                }
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>

  )
}

export default CreateClassDialog

