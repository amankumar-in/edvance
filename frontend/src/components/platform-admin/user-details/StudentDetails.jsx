import { Button, DataList, Flex, Heading, IconButton, Select, Text, TextField, Tooltip } from '@radix-ui/themes';
import { useQueryClient } from '@tanstack/react-query';
import { PencilIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useGetBalance } from '../../../api/point-account/pointAccount.queries';
import { useUpdateStudentProfile } from '../../../api/student/student.mutations';
import { gradeOptions } from '../../../utils/constants';

const StudentDetails = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      grade: data?.grade,
      level: data?.level,
    }
  });
  const queryClient = useQueryClient();

  // Update Student Profile
  const { mutate: updateStudentProfile, isPending: isUpdatingStudentProfile } = useUpdateStudentProfile();

  // Function to handle Update Student Profile  
  const handleUpdateStudentProfile = (formData) => {
    updateStudentProfile(
      {
        id: data?._id,
        data: {
          ...formData,
          level: Number(formData.level)
        }
      },
      {
        onSuccess: ({ data: updatedStudent }) => {
          const { grade, level } = updatedStudent;

          setIsEditing(false);
          toast.success('Student profile updated successfully');

          // Update the student profile in the query cache
          queryClient.setQueryData(['students', data?.userId?._id], prev => {
            if (!prev) return updatedStudent;
            return {
              ...prev,
              data: {
                ...prev.data,
                grade,
                level,
              }
            }
          });

          queryClient.invalidateQueries({ queryKey: ['students', data?.userId?._id] });
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message ||
            error?.message ||
            'Something went wrong while updating student profile'
          );
        }
      }
    );
  }

  const {
    data: balance,
    isLoading: balanceLoading,
    isError: isBalanceError,
    error: balanceError
  } = useGetBalance(data?._id)
  const { currentBalance = 0, totalEarned = 0, totalSpent = 0 } = balance?.data ?? {};

  useEffect(() => {
    if (isBalanceError) {
      toast.error(balanceError?.response?.data?.message || balanceError?.message || 'Something went wrong while fetching balance details')
    }
  }, [isBalanceError, balanceError])

  return (
    <form onSubmit={handleSubmit(handleUpdateStudentProfile)} className='space-y-4 border border-[--gray-a6] rounded-md p-4'>
      <Flex justify='between' align='center'>
        <Heading as='h3' size={'3'} weight={'medium'}>
          Student -
        </Heading>

        <Tooltip content='Edit Student Details'>
          <IconButton
            type='button'
            size='1'
            variant='soft'
            color='gray'
            onClick={() => setIsEditing(!isEditing)}
          >
            <PencilIcon size={14} />
          </IconButton>
        </Tooltip>
      </Flex>
      <Flex gap='1' align='center' direction={'column'} className='shadow-md p-2 rounded-md text-sm font-medium bg-[--accent-9] text-[--accent-contrast] max-w-xs'>
        <Text as='span'>
          Lifetime SP: {totalEarned}
        </Text>
        <Text as='span'>
          Available SP: {currentBalance}
        </Text>
      </Flex>
      <Flex gap='4' justify='between' wrap='wrap'>
        <div className='flex-1 min-w-[240px]'>
          <DataList.Root> 
            <DataList.Item>
              <DataList.Label color='blue' minWidth="88px">Points Account ID</DataList.Label>
              <DataList.Value>{data?.pointsAccountId}</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label color='blue' minWidth="88px">Created At</DataList.Label>
              <DataList.Value>
                {data?.createdAt ? new Date(data?.createdAt).toLocaleString("en-IN", {
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  dateStyle: "medium",
                  timeStyle: "long",
                }) : '-'}
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label color='blue' minWidth="88px">Attendance Streak</DataList.Label>
              <DataList.Value>{data?.attendanceStreak}</DataList.Value>
            </DataList.Item>
          </DataList.Root>
        </div>


        <div className='flex-1 min-w-[240px]'>
          <DataList.Root>
            <DataList.Item>
              <DataList.Label color='blue' minWidth="88px">Grade</DataList.Label>
              <DataList.Value>
                {isEditing ? (
                  <Controller
                    control={control}
                    name="grade"
                    render={({ field }) => (
                      <Select.Root
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <Select.Trigger
                          disabled={isUpdatingStudentProfile}
                          autoFocus placeholder='Select Grade' radius="large" className='w-full' />
                        <Select.Content position="popper">
                          {gradeOptions.map((g) => (
                            <Select.Item key={g} value={g} className='capitalize'>
                              {g}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    )}
                  />
                ) : (
                  data?.grade
                )}
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label color='blue' minWidth="88px">Level</DataList.Label>
              <DataList.Value>
                {isEditing ? (
                  <TextField.Root
                    type='number'
                    autoFocus
                    aria-label='Level'
                    placeholder='Level'
                    {...register('level')}
                    className='w-full'
                    disabled={isUpdatingStudentProfile}
                  />
                ) : (
                  data?.level
                )}
              </DataList.Value>
            </DataList.Item>
          </DataList.Root>
        </div>

      </Flex>
      <Flex gap='4' wrap='wrap'>
        <DataList.Root className='flex-1 min-w-[300px]'>
          <DataList.Item>
            <DataList.Label color='blue' minWidth="88px">Parents</DataList.Label>
            <DataList.Value>
              <Flex gap='2' direction={'column'} className='w-full'>
                {data?.parentIds?.length > 0 ? (
                  data?.parentIds?.map(({ _id, userId }) => (
                    <Flex key={_id} gap='2' direction={'column'} className='border border-[--gray-a6] rounded-md p-2 flex-1'>
                      <Text as='div' className='flex items-center gap-1'>
                        <div className='font-medium w-14'>_id:</div> {_id}
                      </Text>
                      <Text as='div' className='flex items-center gap-1'>
                        <div className='font-medium w-14'>userId:</div> {userId}
                      </Text>
                    </Flex>
                  ))
                ) : (
                  '-'
                )}
              </Flex>
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <DataList.Root className='flex-1 min-w-[300px]'>
          <DataList.Item>
            <DataList.Label color='blue' minWidth="88px">Teachers</DataList.Label>
            <DataList.Value>
              <Flex>
                {data?.teacherIds?.length > 0 ? (
                  data?.teacherIds?.map((teacher) => (
                    <Text as='span' key={teacher}>{teacher}</Text>
                  ))
                ) : (
                  '-'
                )}
              </Flex>
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Flex>
      {isEditing && (
        <Flex gap='2' justify='end' align='center'>
          <Button
            type='button'
            variant='soft'
            color='gray'
            onClick={() => setIsEditing(false)}
            disabled={isUpdatingStudentProfile}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            color='grass'
            disabled={isUpdatingStudentProfile}
          >
            {isUpdatingStudentProfile ? 'Saving...' : 'Save'}
          </Button>
        </Flex>
      )}
    </form>
  )
}

export default StudentDetails; 