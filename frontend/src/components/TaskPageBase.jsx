import { Badge, Box, Button, Callout, Card, DropdownMenu, Flex, Grid, Heading, IconButton, Select, Separator, Tabs, Text, Tooltip } from '@radix-ui/themes';
import { AlertCircleIcon, Filter, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useDeleteTask } from '../api/task/task.mutations';
import { ConfirmationDialog, EmptyStateCard, Loader } from '../components';
import { useAuth } from '../Context/AuthContext';
import { FALLBACK_IMAGES, taskCategoryOptions, taskDifficultyOptions } from '../utils/constants';
import ManageTaskVisibilityModal from './parent/ManageTaskVisibilityModal';

// Status filter options - 'all' is used instead of null for Radix UI Select compatibility
const statusOptions = [
  { value: 'all', label: 'All Tasks', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'blue' },
  { value: 'pending_approval', label: 'Pending Approval', color: 'orange' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
]

/**
 * Shared task page component for both student and parent views
 * Handles role-based rendering: students see status filters, parents see visibility controls
 */
function TaskPageBase({
  tasks,
  isLoading,
  isError,
  error,
  isFetching,
  refetch,
  role = 'student',
  // Parent-only props - undefined for student role
  openVisibilityModal,
  setOpenVisibilityModal,
  selectedTask,
  visibleToChildren,
  setVisibleToChildren,
  handleManageVisibility,
  // Filter props used by both roles
  filter,
  setFilter,
  category,
  setCategory,
}) {
  const { user, profiles } = useAuth();
  const createdByProfileId = profiles[role]?._id;

  // State for delete confirmation dialog
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Delete task mutation
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask(role);
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || 'gray';
  };

  const getDifficultyBadge = (difficulty) => {
    const difficultyOption = taskDifficultyOptions.find(option => option.value === difficulty);
    return <Badge color={difficultyOption?.color} variant="outline">{difficultyOption?.label}</Badge>;
  };

  // Helper function to check if current user created the task
  const isTaskCreatedByCurrentUser = (task) => task.createdBy === createdByProfileId;

  // Handle delete confirmation
  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteTaskId(task._id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTaskId) {
      deleteTask(deleteTaskId, {
        onSuccess: () => {
          toast.success('Task deleted successfully');
          setDeleteTaskId(null);
          setTaskToDelete(null);
          setShowDeleteDialog(false);
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || error?.message || 'Failed to delete task');
        }
      });
    }
  };

  const TaskCard = ({ task }) => {
    // Cache lookups to avoid multiple find() calls
    const categoryOption = taskCategoryOptions?.find(option => option.value === task.category);
    const imageAttachment = task.attachments?.find(attachment => attachment.type === 'image');

    return (
      <Card size="1" asChild className={`shadow-md transition-shadow hover:shadow-lg`}>
        <Link to={`/${role}/tasks/${task._id}`}>
          <Flex direction="column" gap="3" justify="between" className='h-full'>
            <Flex direction="column" gap="3">
              <Flex direction="column" gap="3">
                <Flex gap="2" align="center">
                  <Badge
                    color={categoryOption?.color || 'gray'}
                    variant="surface"
                  >
                    {categoryOption?.label || task.category || 'Other'}
                  </Badge>
                  {task.subCategory && (
                    <Text as='span' size="1" color="gray" className='capitalize'>
                      {task.subCategory}
                    </Text>
                  )}
                </Flex>
                {/* Show first image attachment if available, with fallback handling */}
                  <img
                    src={imageAttachment?.url || FALLBACK_IMAGES.landscape}
                    alt={imageAttachment?.name || 'Task attachment'}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGES.landscape;
                    }}
                    className="object-cover object-center w-full aspect-video"
                  />

                <Heading size="2" className='line-clamp-2'>{task.title}</Heading>
              </Flex>
{/* 
              {task.description && (
                <Text as='p' size="1" className="line-clamp-2" color="gray">{task.description}</Text>
              )}
 */}
              <Separator size="4" />

              <Flex justify="between" align="center" gap="2" wrap="wrap" >
                <Flex gap="2" align="center">
                  <Text weight="bold" size="4">{task.pointValue}</Text>
                  <Text size="1">points</Text>
                </Flex>

                {/* <Flex gap="3" align="center">
                  <Flex gap="1" align="center">
                    <Clock size={14} color='var(--gray-10)' />
                    <Text size="1">
                      {formatDate(task.dueDate)}
                    </Text>
                  </Flex>
                  {task.difficulty && getDifficultyBadge(task.difficulty)}
                </Flex> */}
              </Flex>

              <Flex justify="between" align="center" mt="1">
                <Text size="1" color='gray'>Assigned by: {task?.creatorRole}</Text>
                {task.completionStatus && (
                  <Badge className='capitalize' color={getStatusColor(task.completionStatus.status)} >
                    {task.completionStatus.status}
                  </Badge>
                )}
              </Flex>
            </Flex>
            {/* Parent-only: Show visibility management button and menu */}
            {role === 'parent' && (
              <Flex justify="between" align="center">
                {handleManageVisibility && (
                  <Button
                    size="1"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent Link navigation
                      handleManageVisibility(task);
                    }}
                  >
                    <Users size={14} />
                    Manage Visibility
                  </Button>
                )}

                {/* Menu for parent-created tasks */}
                {isTaskCreatedByCurrentUser(task) && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <IconButton
                        variant="ghost"
                        color="gray"
                        onClick={(e) => e.preventDefault()} // Prevent Link navigation
                      >
                        <MoreHorizontal size={16} />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content variant="soft">
                      <DropdownMenu.Group>
                        <DropdownMenu.Label className="text-xs">Actions</DropdownMenu.Label>
                        <DropdownMenu.Item asChild>
                          <Link to={`/parent/tasks/edit/${task._id}`}>
                            <Pencil size={14} />
                            Edit Task
                          </Link>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          color="red"
                          disabled={isDeleting && deleteTaskId === task._id}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteClick(task);
                          }}
                        >
                          <Trash2 size={14} />
                          Delete Task
                        </DropdownMenu.Item>
                      </DropdownMenu.Group>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                )}
              </Flex>
            )}
          </Flex>
        </Link>
      </Card>
    );
  };

  if (isLoading) return (
    <Flex justify='center' align='center'>
      <Loader />
    </Flex>
  );

  if (isError) return (
    <Callout.Root color='red'>
      <Callout.Icon>
        <AlertCircleIcon size={16} />
      </Callout.Icon>
      <Callout.Text>
        {error?.response?.data?.message || error?.message || 'Something went wrong while fetching user details'}
      </Callout.Text>
    </Callout.Root>
  );


  return (
    <Box>
      <Flex justify="between" align="center" mb="5">
        <Heading as="h1" size="6" weight="bold">
          {role === 'parent' ? 'Family Tasks' : 'My Tasks'}
        </Heading>
        {role === 'parent' && (
          <Button asChild>
            <Link to="/parent/tasks/create">
              <Plus size={16} />
              Create Task
            </Link>
          </Button>
        )}
      </Flex>

      {/* Student-only: Status guide for task completion states */}
      {role === 'student' && (
        <Callout.Root variant='surface' mb="5" color="blue">
          <Callout.Icon>
            <AlertCircleIcon size={16} />
          </Callout.Icon>
          <Callout.Text className='space-y-2'>
            <Text weight="medium">Task Status Guide:</Text>
          </Callout.Text>
          <Flex direction="column" gap="2">
            <Text as='p' size="1"><Badge color="blue" size="1">Pending</Badge> - Task is waiting to be started</Text>
            <Text as='p' size="1"><Badge color="yellow" size="1">Completed</Badge> - Task completed but not yet submitted for approval</Text>
            <Text as='p' size="1"><Badge color="orange" size="1">Pending Approval</Badge> - Task submitted and awaiting approval</Text>
            <Text as='p' size="1"><Badge color="green" size="1">Approved</Badge> - Task approved and points awarded</Text>
            <Text as='p' size="1"><Badge color="red" size="1">Rejected</Badge> - Task needs to be redone</Text>
          </Flex>
        </Callout.Root>
      )}

      <Card mb="5" size="2">
        <Flex justify="between" align="center" wrap="wrap" gap="4" >
          <Tabs.Root defaultValue="all">
            <Tabs.List>
              <Tabs.Trigger value="all">All Tasks ({tasks.length})</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
          <Flex gap="4" align="center" wrap="wrap">
            <Tooltip content="Refresh tasks">
              <IconButton
                variant='ghost'
                color='gray'
                onClick={refetch}
                disabled={isFetching}
                aria-label="Refresh tasks"
              >
                <span className={`${isFetching ? 'animate-spin' : ''}`}>
                  <RefreshCw size={16} />
                </span>
              </IconButton>
            </Tooltip>

            <Filter size={16} />

            {/* Student-only: Status filter for task completion states */}
            {role === 'student' && (
              <Flex gap="2" align="center">
                <Text as='span' size="2">Status</Text>
                <Select.Root disabled={isFetching} value={filter} onValueChange={setFilter}>
                  <Select.Trigger placeholder='Filter by status' />
                  <Select.Content position="popper" variant='soft'>
                    {statusOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Flex>
            )}

            {/* Category filter available for both roles */}
            <Flex gap="2" align="center">
              <Text as='span' size="2">Category</Text>
              <Select.Root disabled={isFetching} value={category} onValueChange={setCategory}>
                <Select.Trigger placeholder='Filter by category' />
                <Select.Content position="popper" variant='soft'>
                  <Select.Item value='all' key='all'>
                    All
                  </Select.Item>
                  {taskCategoryOptions && taskCategoryOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value} className='capitalize'>{option.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
        </Flex>
      </Card>

      {tasks.length === 0 ? (
        <EmptyStateCard
          title="No Tasks Found"
          description="You don't have any tasks right now."
          icon={<Filter size={32} className="text-[--accent-9]" />}
        />
      ) : (
        <Grid columns={{ initial: '1', xs: '2', md: '3', lg: '4', xl: '5' }} gap="4">
          {tasks.map(task => (
            <TaskCard key={task._id} task={task} />
          ))}
        </Grid>
      )}

      {/* Parent-only: Modal for managing task visibility to children */}
      {role === 'parent' && openVisibilityModal !== undefined && (
        <ManageTaskVisibilityModal
          openVisibilityModal={openVisibilityModal}
          setOpenVisibilityModal={setOpenVisibilityModal}
          selectedTask={selectedTask}
          visibleToChildren={visibleToChildren}
          setVisibleToChildren={setVisibleToChildren}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Task"
        description={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete Task"
        cancelText="Cancel"
        isLoading={isDeleting}
        confirmColor="red"
      />
    </Box>
  );
}

export default TaskPageBase;
