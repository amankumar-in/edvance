import { Button, Callout, Card, Dialog, Flex, IconButton, ScrollArea, Select, Text, TextField } from '@radix-ui/themes'
import { AlertCircleIcon, Plus, Trash2 } from 'lucide-react'
import React, { useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { useSchoolProfile } from '../../../api/school-admin/school.queries'
import { useCreateClass, useUpdateClass } from '../../../api/school-class/schoolClass.mutations'
import { FormFieldErrorMessage } from '../../../components'
import { gradeOptions } from '../../../utils/constants'
import { toast } from 'sonner'

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function CreateClassDialog({ open, onOpenChange, isEdit = false, selectedClass = null }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      name: '',
      grade: '',
      academicYear: new Date().getFullYear().toString(),
      academicTerm: '',
      schedule: [{ dayOfWeek: '', startTime: '', endTime: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'schedule'
  })

  const { data: schoolProfile, isLoading: isLoadingSchool } = useSchoolProfile()
  const createClassMutation = useCreateClass()
  const updateClassMutation = useUpdateClass()

  // Set form values when editing
  useEffect(() => {
    if (isEdit && selectedClass && open) {
      setValue('name', selectedClass.name || '')
      setValue('grade', selectedClass.grade || '')
      setValue('academicYear', selectedClass.academicYear || new Date().getFullYear().toString())
      setValue('academicTerm', selectedClass.academicTerm || '')

      // Set schedule data
      if (selectedClass.schedule && selectedClass.schedule.length > 0) {
        setValue('schedule', selectedClass.schedule)
      } else {
        setValue('schedule', [{ dayOfWeek: '', startTime: '', endTime: '' }])
      }
    } else if (!isEdit && open) {
      reset({
        name: '',
        grade: '',
        academicYear: new Date().getFullYear().toString(),
        academicTerm: '',
        schedule: [{ dayOfWeek: '', startTime: '', endTime: '' }]
      })
    }
  }, [isEdit, selectedClass, setValue, reset, open])

  const onSubmit = (data) => {
    const schoolId = schoolProfile?.data?._id

    if (!schoolId && !isEdit) {
      toast.error('School ID not found')
      return
    }

    // Filter out empty schedule entries
    const validSchedule = data.schedule.filter(
      item => item.dayOfWeek && item.startTime && item.endTime
    )

    // Validate that schedule is not empty
    if (validSchedule.length === 0) {
      toast.error('At least one complete schedule entry is required')
      return
    }

    // Validate schedule times
    for (const scheduleItem of validSchedule) {
      if (scheduleItem.startTime >= scheduleItem.endTime) {
        toast.error('Start time must be before end time')
        return
      }
    }

    const formData = {
      name: data.name,
      grade: data.grade,
      academicYear: data.academicYear,
      academicTerm: data.academicTerm,
      schedule: validSchedule
    }

    if (isEdit && selectedClass) {
      // Update existing class
      updateClassMutation.mutate({
        classId: selectedClass._id,
        data: formData
      }, {
        onSuccess: () => {
          onClose(false)
          toast.success('Class updated successfully')
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to update class')
        }
      })
    } else {
      // Create new class
      createClassMutation.mutate({
        ...formData,
        schoolId: schoolId
      }, {
        onSuccess: () => {
          onClose(false)
          toast.success('Class created successfully')
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to create class')
        }
      })
    }
  }

  const currentMutation = isEdit ? updateClassMutation : createClassMutation

  const onClose = (open) => {
    onOpenChange(open)
    if (!open) {
      setTimeout(() => {
        reset();
        currentMutation.reset();
      }, 100);
    }
  }

  const addScheduleItem = () => {
    append({ dayOfWeek: '', startTime: '', endTime: '' })
  }

  const removeScheduleItem = (index) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: 600 }}>
        <Dialog.Title>{isEdit ? 'Edit Class' : 'Create Class'}</Dialog.Title>
        <Dialog.Description size="2">
          {isEdit ? 'Edit the class details and schedule.' : 'Create a new class with schedule for your school.'}
        </Dialog.Description>

        <ScrollArea type='auto' className='max-h-[70vh]'>
          <form onSubmit={handleSubmit(onSubmit)} className='p-4'>
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

              {/* Basic Information */}
              <Flex gap="4" direction={{initial: 'column', xs: 'row'}}>
                <div className='flex-1'>
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

                <div className='flex-1'>
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
                          <Select.Trigger placeholder='Select Grade' radius="large" className='w-full' />
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
              </Flex>

              {/* Academic Information */}
              <Flex gap="4" direction={{initial: 'column', xs: 'row'}}>
                <div style={{ flex: 1 }}>
                  <label>
                    <Text as="div" size="2" mb="1" weight="medium">
                      Academic Year *
                    </Text>
                    <TextField.Root
                      {...register('academicYear', {
                        required: 'Academic year is required',
                      })}
                      color={errors?.academicYear ? 'red' : undefined}
                      placeholder="e.g., 2024"
                    />
                  </label>
                  <FormFieldErrorMessage errors={errors} field='academicYear' />
                </div>
                <div style={{ flex: 1 }}>
                  <label>
                    <Text as="div" size="2" mb="1" weight="medium">
                      Academic Term
                    </Text>
                    <TextField.Root
                      {...register('academicTerm')}
                      placeholder="e.g., Fall, Spring, Semester 1"
                    />
                  </label>
                </div>
              </Flex>

              {/* Schedule Section */}
              <div className='space-y-4'>
                <Flex align="center" justify="between" mb="3">
                  <Text as="div" size="2" weight="medium">
                    Class Schedule *
                  </Text>
                  <Button
                    type="button"
                    variant="outline"
                    size="1"
                    onClick={addScheduleItem}
                  >
                    <Plus size={14} />
                    Add Schedule
                  </Button>
                </Flex>

                {fields.map((field, index) => (
                  <Card key={field.id} size={'2'} className='shadow-md'>
                    <Flex align="center" justify="between" mb="4">
                      <Text as='p' size="1" weight="medium">
                        Schedule {index + 1}
                      </Text>
                      {fields.length > 1 && (
                        <IconButton
                          type="button"
                          variant="ghost"
                          size="1"
                          color="red"
                          onClick={() => removeScheduleItem(index)}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      )}
                    </Flex>

                    <Flex gap="2" wrap="wrap">
                      <div style={{ minWidth: '140px', flex: 1 }}>
                        <Controller
                          control={control}
                          name={`schedule.${index}.dayOfWeek`}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={(value) => field.onChange(value)}
                            >
                              <Select.Trigger placeholder='Day' radius="large" className='w-full' />
                              <Select.Content position="popper" variant='soft'>
                                {daysOfWeek.map((day) => (
                                  <Select.Item key={day} value={day}>
                                    {day}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          )}
                        />
                      </div>
                      <div style={{ minWidth: '100px', flex: 1 }}>
                        <TextField.Root
                          {...register(`schedule.${index}.startTime`)}
                          type="time"
                          placeholder="Start time"
                        />
                      </div>
                      <div style={{ minWidth: '100px', flex: 1 }}>
                        <TextField.Root
                          {...register(`schedule.${index}.endTime`)}
                          type="time"
                          placeholder="End time"
                        />
                      </div>
                    </Flex>
                  </Card>
                ))}
              </div>

              <Text as="p" size="1" color='gray' className='italic'>
                * indicates required fields. At least one complete schedule entry is required.
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
        </ScrollArea>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default CreateClassDialog

