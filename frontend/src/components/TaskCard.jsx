import { Badge, Button, Card, DropdownMenu, Flex, Grid, Heading, IconButton, Inset, Separator, Text } from '@radix-ui/themes';
import { MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../Context/AuthContext';
import { useDeleteTask } from '../api/task/task.mutations';
import { FALLBACK_IMAGES } from '../utils/constants';
import ConfirmationDialog from './ConfirmationDialog';
import { statusOptions } from './TaskPageBase';
import ManageTaskVisibilityModal from './parent/ManageTaskVisibilityModal';

const TaskCard = ({
  task,
  taskCategoryOptions,
  role,
}) => {
  const { profiles } = useAuth();
  const createdByProfileId = profiles[role]?._id;

  // State for delete confirmation dialog
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openVisibilityModal, setOpenVisibilityModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [visibleToChildren, setVisibleToChildren] = useState([]);

  // Delete task mutation
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask(role);

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

  // Cache lookups to avoid multiple find() calls
  const categoryOption = taskCategoryOptions?.find(option => option.value === task.category);
  const imageAttachment = task.attachments?.find(attachment => attachment.type === 'image');

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || 'gray';
  };

  // Helper function to check if current user created the task
  const isTaskCreatedByCurrentUser = (task) => task.createdBy === createdByProfileId;


  const handleManageVisibility = (task) => {
    if (!task) return;
    setSelectedTask(task);
    setOpenVisibilityModal(true);
    // Ensure visibleToChildren is always an array
    setVisibleToChildren(Array.isArray(task.visibleToChildren) ? task.visibleToChildren : []);
  };

  return (
    <>
      <Card size="1" asChild className={`shadow-md transition-shadow hover:shadow-lg`}>
        <Link to={`/${role}/tasks/${task._id}`}>
          <Flex direction="column" gap="3" justify="between" className='h-full'>
            <Grid columns={{ initial: "3", xs: "1" }} gap="3">
              <div className='col-span-1'>
                {/* Show first image attachment if available, with fallback handling */}
                <img
                  loading='lazy'
                  decoding='async'
                  src={imageAttachment?.url || FALLBACK_IMAGES.landscape}
                  alt={imageAttachment?.name || 'Task attachment'}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGES.landscape;
                  }}
                  className="object-cover object-center w-full rounded-md aspect-square xs:aspect-video"
                />

              </div>
              <Flex direction="column" gap="3" className='col-span-2 xs:col-span-1'>
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
                <Heading size="2" className='line-clamp-2'>{task.title}</Heading>

                <Badge variant='solid' className='self-start'>
                  {task?.pointValue || 0} Scholarship points
                </Badge>
              </Flex>
            </Grid>
            <Flex justify="between" align="center" gap="2">
              <Text size="1" color='gray'>Assigned by: {task?.creatorRole}</Text>
              {task.completionStatus && (
                <Badge className='capitalize' color={getStatusColor(task.completionStatus.status)} >
                  {task.completionStatus.status}
                </Badge>
              )}
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
    </>
  );
};
export default TaskCard
