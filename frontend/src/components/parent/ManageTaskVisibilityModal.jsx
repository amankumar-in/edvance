import { Box, Dialog, Flex, Heading, Separator, Switch, Text } from '@radix-ui/themes'
import React from 'react'
import { toast } from 'sonner'
import { useChildren } from '../../api/parent/parent.queries'
import { useToggleTaskVisibility } from '../../api/task/task.mutations'
import Loader from '../Loader'

function ManageTaskVisibilityModal({
  openVisibilityModal = false,
  setOpenVisibilityModal = () => {},
  selectedTask = null,
  visibleToChildren = [],
  setVisibleToChildren = () => {}
}) {
  const toggleTaskVisibility = useToggleTaskVisibility()

  const { data: children, isLoading, isError, error } = useChildren()

  const handleToggleVisibility = (childId) => {
    if (!selectedTask || !childId) return

    toggleTaskVisibility.mutate({
      taskId: selectedTask._id,
      studentId: childId,
      isVisible: !visibleToChildren.includes(childId)
    }, {
      onSuccess: () => {
        if (visibleToChildren.includes(childId)) {
          setVisibleToChildren(prev => (prev || []).filter(id => id !== childId))
        } else {
          setVisibleToChildren(prev => [...(prev || []), childId])
        }
      },
      onError: (error) => {
        console.error(error)
        toast.error(error?.response?.data?.message || error?.message || 'Failed to toggle task visibility')
      }
    })
  }

  return (
    <Dialog.Root open={!!openVisibilityModal} onOpenChange={setOpenVisibilityModal}>
      <Dialog.Content style={{ maxWidth: 600 }} aria-describedby={undefined}>
        <Dialog.Title size={'6'}>Manage Task Visibility</Dialog.Title>
        {selectedTask ? (
          <Box>
            <Heading size="3">{selectedTask.title}</Heading>
            <Text size="2" color="gray" mt="1">{selectedTask.description}</Text>

            <Separator my="3" size="4" />

            <Heading size="2" mb="2">Children</Heading>
            <Text size="2" color="gray">Select which children can see this task.</Text>
            <div className='mt-2 space-y-2'>
              {isLoading ? (
                <Flex justify='center' align='center'>
                  <Loader className='size-6 animate-spin' borderColor='var(--accent-9)' borderWidth='2' />
                </Flex>
              ) : isError ? (
                <Text size="2" color="red">{error?.response?.data?.message || error?.message || 'Error loading children'}</Text>
              ) : children?.data?.length > 0 ? (
                children?.data?.map((child) => {
                  return (
                    <Flex key={child?._id} align="center" justify="between" gap="2" wrap="wrap">
                      <Flex align="center" gap="2">
                        <Text size="2">{child?.userId?.firstName || ''} {child?.userId?.lastName || ''}</Text>
                        <Text size="2">({child?.userId?.email || 'No email'})</Text>
                      </Flex>
                      <Switch
                        checked={Array.isArray(visibleToChildren) && visibleToChildren.includes(child?._id)}
                        onCheckedChange={() => handleToggleVisibility(child?._id)}
                        disabled={toggleTaskVisibility.isPending && toggleTaskVisibility.variables?.studentId === child?._id}
                      />
                    </Flex>
                  )
                })
              ) : (
                <Text size="2" color="gray">
                  No children linked to your account.
                </Text>
              )}
            </div>
          </Box>
        ) : (
          <Text size="2" color="gray">No task selected.</Text>
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default ManageTaskVisibilityModal
