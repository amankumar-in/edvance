import { Button, DataList, Flex, Heading, IconButton, Text, TextField, Tooltip } from '@radix-ui/themes';
import { useQueryClient } from '@tanstack/react-query';
import { PencilIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useUpdateParentProfile } from '../../../api/parent/parent.mutations';

const ParentDetails = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      tuitPoints: data?.tuitPoints,
    }
  });
  const queryClient = useQueryClient();

  const { mutate: updateParentProfile, isPending: isUpdatingParentProfile } = useUpdateParentProfile();

  const handleUpdateParentProfile = (formData) => {
    updateParentProfile({ id: data?._id, data: { tuitPoints: Number(formData.tuitPoints) } },
      {
        onSuccess: ({ data: updatedParent }) => {
          setIsEditing(false);
          toast.success('Parent profile updated successfully');

          // Update the parent profile in the query cache
          queryClient.setQueryData(['parents', data?.userId], (prev) => {
            if (!prev) return updatedParent;
            return {
              ...prev,
              data: {
                ...prev.data,
                tuitPoints: updatedParent.tuitPoints,
              }
            }
          });

          queryClient.invalidateQueries({ queryKey: ['parents', data?.userId] });
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || error?.message || 'Something went wrong while updating parent profile');
        }
      }
    );
  }

  return (
    <form onSubmit={handleSubmit(handleUpdateParentProfile)} className='space-y-4 border border-[--gray-a6] rounded-md p-4'>
      <Flex justify='between' align='center'>
        <Heading as='h3' size={'3'} weight={'medium'}>
          Parent -
        </Heading>
        <Tooltip content='Edit Parent Details'>
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
            <DataList.Label color='blue' minWidth="88px">Tuit Points</DataList.Label>
            <DataList.Value>
              {isEditing ? (
                <TextField.Root
                  type='number'
                  autoFocus
                  aria-label='Tuit Points'
                  placeholder='Tuit Points'
                  {...register('tuitPoints')}
                  className='w-full'
                  disabled={isUpdatingParentProfile}
                />
              ) : (
                data?.tuitPoints ?? 0
              )}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <DataList.Root orientation={{ initial: "vertical", xs: "horizontal" }} className='flex-1 min-w-[240px]'>
          <DataList.Item>
            <DataList.Label color='blue' minWidth="88px">Parent _id</DataList.Label>
            <DataList.Value>
              {data?._id}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Flex>
      <DataList.Root orientation={{ initial: "vertical", xs: "horizontal" }} className='w-max'>
        <DataList.Item>
          <DataList.Label color='blue' minWidth="88px">Child IDs</DataList.Label>
          <DataList.Value>
            <Flex gap='2' direction={'column'} className='w-full'>
              {data?.childIds?.length > 0 ? (
                data?.childIds?.map(({ _id, userId }) => (
                  <Flex key={_id} gap='2' direction={'column'} className='border border-[--gray-a6] rounded-md p-2 flex-1'>
                    <Text as='div' className='flex items-center gap-1'>
                      <div className='font-medium w-14'>_id:</div> {_id}
                    </Text>
                    <Text as='div' className='flex items-center gap-1'>
                      <div className='font-medium w-14'>userId:</div> {userId}
                    </Text>
                  </Flex>
                ))
              ) : '-'}
            </Flex>
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
      {isEditing && (
        <Flex gap='2' justify='end' align='center'>
          <Button
            type='button'
            variant='soft'
            color='gray'
            onClick={() => setIsEditing(false)}
            disabled={isUpdatingParentProfile}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            color='grass'
            disabled={isUpdatingParentProfile}
          >
            {isUpdatingParentProfile ? 'Saving...' : 'Save'}
          </Button>
        </Flex>
      )}
    </form>
  )
}

export default ParentDetails; 