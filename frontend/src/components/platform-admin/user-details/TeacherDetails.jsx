import { Button, DataList, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useUpdateTeacherProfile } from '../../../api/teacher/teacher.mutations';

const TeacherDetails = ({ data }) => {
  const [isEditing, setIsEditing] = useState(true);
  const { register, handleSubmit, formState: { isDirty }, reset } = useForm({
    defaultValues: {
      subjectsTaught: data?.subjectsTaught?.join(', '),
    }
  });
  const queryClient = useQueryClient();

  const { mutate: updateTeacherProfile, isPending: isUpdatingTeacherProfile } = useUpdateTeacherProfile();

  const handleUpdateTeacherProfile = (formData) => {
    const subjectsTaught = formData.subjectsTaught.split(',').map(subject => subject.trim());

    updateTeacherProfile({ id: data?._id, data: { subjectsTaught } },
      {
        onSuccess: ({ data: updatedTeacher }) => {
          setIsEditing(false);
          toast.success('Teacher profile updated successfully');

          // Update the teacher profile in the query cache
          queryClient.setQueryData(['teachers', data?.userId?._id], (prev) => {
            if (!prev) return updatedTeacher;
            return {
              ...prev,
              data: {
                ...prev.data,
                subjectsTaught: updatedTeacher.subjectsTaught,
              }
            }
          });

          queryClient.invalidateQueries({ queryKey: ['teachers', data?.userId?._id] });
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || error?.message || 'Something went wrong while updating teacher profile');
        }
      }
    );
  }


  return (
    <form onSubmit={handleSubmit(handleUpdateTeacherProfile)} className='space-y-4 border border-[--gray-a6] rounded-md p-4'>
      <Flex justify='between' align='center'>
        <Heading as='h3' size={'3'} weight={'medium'}>
          Teacher -
        </Heading>
      </Flex>
      <Flex gap='4' wrap='wrap'>
        <DataList.Root orientation={{ initial: "vertical", xs: "horizontal" }} className='flex-1 min-w-[240px]'>
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
        </DataList.Root>
        <DataList.Root orientation={{ initial: "vertical", xs: "horizontal" }} className='flex-1 min-w-[240px]'>
          <DataList.Item>
            <DataList.Label color='blue' minWidth="88px">Teacher _id</DataList.Label>
            <DataList.Value>
              {data?._id}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <DataList.Root orientation={{ initial: "vertical", xs: "horizontal" }} className='flex-1 min-w-[240px]'>
          <DataList.Item>
            <DataList.Label color='blue' minWidth="88px">Subjects Taught</DataList.Label>
            <DataList.Value>
              <Flex gap='1' wrap='wrap'>
                <TextField.Root
                  type='text'
                  aria-label='Subjects Taught'
                  placeholder='Subjects Taught'
                  {...register('subjectsTaught')}
                  className='w-full'
                  disabled={isUpdatingTeacherProfile}
                />
                <Text as='p' size='1' color='gray'>
                  Enter subjects taught separated by commas
                </Text>
              </Flex>
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Flex>
      <Flex gap='2' justify='end' align='center'>
        <Button type='button' variant='soft' color='gray' onClick={() => reset()} disabled={isUpdatingTeacherProfile || !isDirty}>
          Reset
        </Button>
        <Button type='submit' color='grass' disabled={isUpdatingTeacherProfile || !isDirty}>
          {isUpdatingTeacherProfile ? 'Saving...' : 'Save'}
        </Button>
      </Flex>
    </form>
  )
}

export default TeacherDetails; 