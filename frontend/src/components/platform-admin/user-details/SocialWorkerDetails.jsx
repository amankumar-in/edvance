import { Button, DataList, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useUpdateSocialWorkerProfile } from '../../../api/social-worker/socialWorker.mutations';

const SocialWorkerDetails = ({ data }) => {
  const [isEditing, setIsEditing] = useState(true);
  const { register, handleSubmit, formState: { isDirty }, reset } = useForm({
    defaultValues: {
      caseloadLimit: data?.caseloadLimit,
      organization: data?.organization,
    }
  });
  const queryClient = useQueryClient();

  const { mutate: updateSocialWorkerProfile, isPending: isUpdatingSocialWorkerProfile } = useUpdateSocialWorkerProfile();

  const handleUpdateSocialWorkerProfile = (formData) => {
    updateSocialWorkerProfile(
      {
        id: data?._id,
        data: formData
      },
      {
        onSuccess: ({ data: updatedSocialWorker }) => {
          const { caseloadLimit, organization } = updatedSocialWorker;

          toast.success('Social worker profile updated successfully');
          setIsEditing(false);
          reset({ caseloadLimit, organization });

          // Update the social worker profile in the query cache
          queryClient.setQueryData(['socialWorkers', data?.userId], (prev) => {
            if (!prev) return updatedSocialWorker;
            return {
              ...prev,
              data: {
                ...prev.data,
                caseloadLimit,
                organization,
              }
            }
          });

          queryClient.invalidateQueries({ queryKey: ['socialWorkers', data?.userId] });
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || error?.message || 'Something went wrong while updating social worker profile');
        }
      }
    );
  }
  
  return (
    <form onSubmit={handleSubmit(handleUpdateSocialWorkerProfile)} className='space-y-4 border border-[--gray-a6] rounded-md p-4'>
      <Flex justify='between' align='center'>
        <Heading as='h3' size={'3'} weight={'medium'}>
          Social Worker -
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
          <DataList.Item>
            <DataList.Label color='blue' minWidth="88px">Case Load Limit</DataList.Label>
            <DataList.Value>
              <TextField.Root
                type='number'
                aria-label='Case Load Limit'
                placeholder='Case Load Limit'
                {...register('caseloadLimit', { valueAsNumber: true })}
                className='w-full'
                disabled={isUpdatingSocialWorkerProfile}
              />
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <DataList.Root orientation={{ initial: "vertical", xs: "horizontal" }} className='flex-1 min-w-[240px]'>
          <DataList.Item>
            <DataList.Label color='blue' minWidth="88px">Social Worker _id</DataList.Label>
            <DataList.Value>
              {data?._id}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <DataList.Root orientation={{ initial: "vertical", xs: "horizontal" }} className='flex-1 min-w-[240px]'>
          <DataList.Item>
            <DataList.Label color='blue' minWidth="88px">Organization</DataList.Label>
            <DataList.Value>
              <TextField.Root
                type='text'
                aria-label='Organization'
                placeholder='Organization'
                {...register('organization')}
                className='w-full'
                disabled={isUpdatingSocialWorkerProfile}
              />
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Flex>
      <DataList.Root orientation={{ initial: "vertical", xs: "horizontal" }} className='flex-1 min-w-[240px]'>
        <DataList.Item>
          <DataList.Label color='blue' minWidth="88px">Child IDs</DataList.Label>
          <DataList.Value>
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
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
      <Flex gap='2' justify='end' align='center'>
        <Button type='button' variant='soft' color='gray' onClick={() => reset()} disabled={isUpdatingSocialWorkerProfile || !isDirty}>
          Reset
        </Button>
        <Button type='submit' color='grass' disabled={isUpdatingSocialWorkerProfile || !isDirty}>
          {isUpdatingSocialWorkerProfile ? 'Saving...' : 'Save'}
        </Button>
      </Flex>
    </form>
  )
}

export default SocialWorkerDetails; 