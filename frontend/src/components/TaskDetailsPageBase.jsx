import { Badge, Box, Button, Callout, Card, Flex, Grid, Heading, Separator, Text } from '@radix-ui/themes';
import { AlertCircle, AlertCircleIcon, ArrowLeft, Calendar, CheckCircle, Clock, CopyPlus, Eye, FileImage, FileText, Link as LinkIcon, MessageSquare, Pencil, Target, Trash, Upload, User, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ConfirmationDialog, Loader, TaskSubmissionDialog } from '../components';
import { taskCategoryOptions, taskDifficultyOptions } from '../utils/constants';
import { formatDate } from '../utils/helperFunctions';
import AttachmentCard from './AttachmentCard';
import { useDeleteTask } from '../api/task/task.mutations';
import { toast } from 'sonner';


function TaskDetailsPageBase({
  role = 'student',
  task,
  isLoading,
  isError,
  error,
  isSubmitting,
  isSubmissionError,
  submissionError,
  handleTaskSubmission,
  isSubmissionOpen,
  setIsSubmissionOpen,
  isCreator = false,
}) {
  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  // Delete task mutation
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask(role);

  const handleDeleteTask = () => {
    deleteTask(id, {
      onSuccess: () => {
        toast.success('Task deleted successfully');
        setShowDeleteDialog(false);
        // Hardcoded navigation - consider making this dynamic based on role
        navigate('/parent/tasks');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to delete task');
      }
    });
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'blue';
      case 'completed': return 'yellow';
      case 'pending_approval': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const categoryOption = taskCategoryOptions.find(option => option.value === category);
    return categoryOption?.color;
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty) => {
    const difficultyOption = taskDifficultyOptions.find(option => option.value === difficulty);
    return difficultyOption ? <Badge color={difficultyOption?.color} variant="outline">{difficultyOption?.label}</Badge> : null;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'completed': return <AlertCircle size={16} />;
      case 'pending_approval': return <Eye size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  // Get submit button text based on status
  const getSubmitButtonText = (status) => {
    switch (status) {
      case 'pending': return 'Submit Task';
      case 'rejected': return 'Resubmit Task';
      default: return 'Submit Task';
    }
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
        {error?.response?.data?.message || error?.message || 'Something went wrong while fetching task details'}
      </Callout.Text>
    </Callout.Root>
  );

  return (
    <Box>
      {/* Back and Actions Buttons */}
      <Flex justify={'between'} align={'center'} gap="4" wrap={'wrap'} mb={'5'}>
        <Button
          asChild
          variant="ghost"
          size="2"
          color="gray"
          highContrast
        >
          <Link to={role === 'student' ? "/student/tasks" : "/parent/tasks"}>
            <ArrowLeft size={18} /> Back to Tasks
          </Link>
        </Button>
        {role === 'parent' && (
          <Flex gap="2" wrap="wrap" justify={'end'}>
            <Button className='text-nowrap'>
              <CopyPlus size={16} />
              Clone
            </Button>
            {isCreator && (
              <>
                <Button className='text-nowrap'
                  variant='outline'
                  asChild
                >
                  <Link to={`/parent/tasks/edit/${task?._id}`}>
                    <Pencil size={16} /> Edit
                  </Link>
                </Button>
                <Button className='text-nowrap'
                  variant='soft'
                  color='red'
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash size={16} />Delete
                </Button>
              </>
            )}
          </Flex>
        )}
      </Flex>

      {/* Success Message */}
      {task?.completionStatus?.status === 'approved' && (
        <Card size="2" mb="5">
          <Flex direction="column" gap="4">
            <Heading size="4">🎉 Well Done!</Heading>

            <Callout.Root variant='surface' color="green" size="1">
              <Callout.Icon>
                <CheckCircle size={16} />
              </Callout.Icon>
              <Callout.Text>
                <Text size="2">
                  Congratulations! You've earned <strong>{task?.pointValue} points</strong> for completing this task.
                  Keep up the great work!
                </Text>
              </Callout.Text>
            </Callout.Root>
          </Flex>
        </Card>
      )}

      {/* Approval Status Info */}
      {task?.completionStatus?.status === 'pending_approval' && (
        <Card size="2" mb="5">
          <Flex direction="column" gap="4">
            <Heading size="4">⏳ Under Review</Heading>

            <Callout.Root variant='surface' color="blue" size="1">
              <Callout.Icon>
                <Eye size={16} />
              </Callout.Icon>
              <Callout.Text>
                <Text size="2">
                  Your submission is being reviewed by {task?.approverType === 'parent' ? 'your parent' : task?.approverType === 'teacher' ? 'your teacher' : 'an authorized person'}.
                  You'll be notified once it's approved or if changes are needed.
                </Text>
              </Callout.Text>
            </Callout.Root>
          </Flex>
        </Card>
      )}

      {/* Rejection Help */}
      {task?.completionStatus?.status === 'rejected' && (
        <Card size="2" mb="5">
          <Flex direction="column" gap="4">
            <Heading size="4">🔄 Resubmission Needed</Heading>

            <Callout.Root variant='surface' color="red" size="1">
              <Callout.Icon>
                <XCircle size={16} />
              </Callout.Icon>
              <Callout.Text className='flex flex-col gap-1'>
                <Text as='span' size="2">
                  Your submission needs revision. Check the feedback, make the necessary changes, and resubmit when ready.
                </Text>
                {task?.completionStatus?.feedback &&
                  <>
                    <Text as='span'>
                      <strong>Feedback: </strong>
                    </Text>
                    <Text as='span' className='whitespace-pre-wrap'>
                      {task?.completionStatus?.feedback}
                    </Text>
                  </>
                }
              </Callout.Text>
            </Callout.Root>
          </Flex>
        </Card>
      )}

      <Grid columns={{ initial: '1', lg: '3' }} gap="5">
        {/* Main Content */}
        <Box gridColumn={{ lg: '1 / 3' }}>



          {/* Task Header */}
          <Card size="2" mb="5">
            <Flex direction="column" gap="4">
              <Flex justify="between" align="start" gap="4">
                <Flex direction="column" gap="2" style={{ flex: 1 }}>
                  <Flex gap="2" align="center" justify={'between'} wrap="wrap">
                    <Flex align="center" gap="2">
                      <Badge color={getCategoryColor(task?.category)} variant="surface" className='capitalize'>
                        {taskCategoryOptions.find(option => option.value === task?.category)?.label || task?.category}
                      </Badge>
                      <Text as='span' size="2" color="gray" className='capitalize'>
                        {task?.subCategory}
                      </Text>
                    </Flex>
                    <Flex align="center" gap="2">
                      {role === 'student' && (
                        <Badge
                          color={getStatusColor(task?.completionStatus?.status)}
                          variant="soft"
                          size="3"
                          className="capitalize"
                        >
                          <Flex align="center" gap="1">
                            {getStatusIcon(task?.completionStatus?.status)}
                            {task?.completionStatus?.status}
                          </Flex>
                        </Badge>
                      )}
                      {role === 'parent' && (
                        task?.difficulty && (
                          getDifficultyBadge(task?.difficulty)
                        )
                      )}
                      <Flex align="center" gap="2" className="bg-[--accent-a3] px-3 py-1 rounded-full">
                        <Target size={16} className="text-[--accent-9]" />
                        <Text as="p" weight="bold" size="4">
                          {task?.pointValue}
                        </Text>
                        <Text as="p" size="2">points</Text>
                      </Flex>
                    </Flex>

                  </Flex>
                  <Heading size={{ initial: '4', sm: '5' }} weight="bold">
                    {task?.title}
                  </Heading>
                </Flex>
              </Flex>

              {task?.description && (
                <>
                  <Separator size="4" />

                  <Text as="p" size="3" className='whitespace-pre-wrap'>
                    {task.description}
                  </Text>
                </>
              )}
            </Flex>
          </Card>

          {/* Task Details */}
          <Card size="2" mb="5">
            <Flex direction="column" gap="4">
              <Heading size="4">Task Details</Heading>

              <Grid columns={{ initial: '1', xs: '2' }} gap="4">
                <Flex direction="column" gap="2">
                  <Text size="1" weight="medium" color="gray">CREATED ON</Text>
                  <Flex align="center" gap="2">
                    <Calendar size={16} className="text-[--gray-9]" />
                    <Text size="2">{formatDate(task?.createdAt, {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    })}</Text>
                  </Flex>
                </Flex>

                <Flex direction="column" gap="2">
                  <Text size="1" weight="medium" color="gray">DUE BY</Text>
                  <Flex align="center" gap="2">
                    <Clock size={16} className="text-[--gray-9]" />
                    <Text size="2">{formatDate(task?.dueDate, {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    })}</Text>
                  </Flex>
                </Flex>

                <Flex direction="column" gap="2">
                  <Text size="1" weight="medium" color="gray">ASSIGNED BY</Text>
                  <Flex align="center" gap="2">
                    <User size={16} className="text-[--gray-9]" />
                    <Text size="2">{task?.creatorRole}</Text>
                  </Flex>
                </Flex>

                <Flex direction="column" gap="2" >
                  <Text size="1" weight="medium" color="gray">REQUIRES APPROVAL</Text>
                  <Text size="2">{task?.requiresApproval ? 'Yes' : 'No'}</Text>
                </Flex>
              </Grid>

              {/* Approval Explanation */}
              {role === 'student' && task?.requiresApproval && (
                <>
                  <Separator size="4" />
                  <Callout.Root variant='surface' color="blue" size="1">
                    <Callout.Icon>
                      <CheckCircle size={16} />
                    </Callout.Icon>
                    <Callout.Text>
                      <Text size="2">
                        <strong>About Approval:</strong> After you submit this task, it will be reviewed by{' '}
                        {task?.approverType === 'parent' ? 'your parent' :
                          task?.approverType === 'teacher' ? 'your teacher' :
                            'an authorized person'}.
                        Once approved, you'll earn <strong>{task?.pointValue} points</strong> and the task will be marked as complete.
                      </Text>
                    </Callout.Text>
                  </Callout.Root>
                </>
              )}

              {role === 'student' && !task?.requiresApproval && (
                <>
                  <Separator size="4" />
                  <Callout.Root variant='surface' color="green" size="1">
                    <Callout.Icon>
                      <CheckCircle size={16} />
                    </Callout.Icon>
                    <Callout.Text>
                      <Text size="2">
                        <strong>Auto-Approved:</strong> This task doesn't require manual approval.
                        When you submit it, you'll automatically earn <strong>{task?.pointValue} points</strong> and the task will be marked as complete.
                      </Text>
                    </Callout.Text>
                  </Callout.Root>
                </>
              )}

              {/* Attachments */}
              {task?.attachments && task?.attachments?.length > 0 && (
                <>
                  <Separator size="4" />
                  <Flex direction="column" gap="3">
                    <Text size="2" weight="medium">Attachments ({task?.attachments?.length})</Text>
                    {task?.attachments?.map((attachment, index) => (
                      <AttachmentCard
                        key={index}
                        attachment={attachment}
                        showDownload={true}
                      />
                    ))}
                  </Flex>
                </>
              )}

              {/* External Resource */}
              {task?.externalResource && task?.externalResource?.url && task?.externalResource?.platform && (
                <>
                  <Separator size="4" />
                  <Flex direction="column" gap="3">
                    <Text size="2" weight="medium">External Resource</Text>
                    <ExternalResourcePreview
                      url={task.externalResource.url}
                      resource={task.externalResource}
                    />
                  </Flex>
                </>
              )}
            </Flex>
          </Card>

          {/* Your Submission - Show after task is submitted */}
          {task?.completionStatus?.hasSubmitted && (
            <Card size="2">
              <Flex direction="column" gap="4">
                <Heading size="4">Your Submission</Heading>

                {/* Submission Note */}
                {task?.completionStatus?.note && (
                  <Flex direction="column" gap="2">
                    <Text size="2" weight="medium">Notes</Text>
                    <Card variant="surface" size="1">
                      <Text as="p" size="2" className="whitespace-pre-wrap">
                        {task.completionStatus.note}
                      </Text>
                    </Card>
                  </Flex>
                )}

                {/* Evidence */}
                {task?.completionStatus?.evidence && task.completionStatus.evidence.length > 0 && (
                  <Flex direction="column" gap="3">
                    <Text size="2" weight="medium">Evidence ({task.completionStatus.evidence.length})</Text>
                    <Flex direction="column" gap="3">
                      {task.completionStatus.evidence.map((evidence, index) => (
                        <Card key={index} variant="surface" size="1">
                          <Flex align="start" gap="3">
                            {evidence.type === 'image' && <FileImage size={14} />}
                            {evidence.type === 'document' && <FileText size={14} />}
                            {evidence.type === 'link' && <LinkIcon size={14} />}
                            {evidence.type === 'text' && <MessageSquare size={14} />}

                            <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
                              <Text as='p' size="1" weight="medium" className="leading-none capitalize">
                                {evidence.type}
                              </Text>

                              {evidence.type === 'text' && evidence.content && (
                                <Text as="p" size="2" className="whitespace-pre-wrap break-words">
                                  {evidence.content}
                                </Text>
                              )}

                              {evidence.type === 'link' && evidence.url && (
                                <Text as="p" size="2" color="blue" className="break-all line-clamp-1 hover:underline" asChild>
                                  <a href={evidence.url} target="_blank" rel="noopener noreferrer">
                                    {evidence.url}
                                  </a>
                                </Text>
                              )}

                              {(evidence.type === 'image' || evidence.type === 'document') && evidence.url && (
                                <Flex direction="column" gap="1">
                                  <Text as="p" size="2" color="blue" className="break-all line-clamp-1 hover:underline" asChild>
                                    <a href={evidence.url} target="_blank" rel="noopener noreferrer">
                                      {evidence.fileName || 'View File'}
                                    </a>
                                  </Text>
                                  {evidence.contentType && (
                                    <Text as='p' size="1" color="gray">
                                      {evidence.contentType}
                                    </Text>
                                  )}
                                </Flex>
                              )}
                            </Flex>
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
                  </Flex>
                )}

                {/* If no notes or evidence */}
                {(!task?.completionStatus?.note && (!task?.completionStatus?.evidence || task.completionStatus.evidence.length === 0)) && (
                  <Text as="p" size="2" color="gray" style={{ fontStyle: 'italic' }}>
                    No additional notes or evidence provided with this submission.
                  </Text>
                )}
              </Flex>
            </Card>
          )}
        </Box>

        {/* Sidebar */}
        <Box>
          {/* Action Panel */}
          {role === 'student' && <Card size="2" mb="5" className='xl:sticky xl:top-[72px] z-10 bg-[--color-background]'>
            <Flex direction="column" gap="3">
              <Heading size="4">Actions</Heading>


              {(task?.completionStatus?.status === 'pending' || task?.completionStatus?.status === 'rejected') && (
                <Button
                  onClick={() => setIsSubmissionOpen(true)}
                >
                  <CheckCircle size={16} />
                  {getSubmitButtonText(task?.completionStatus?.status)}
                </Button>
              )}

              {task?.completionStatus?.status === 'completed' && (
                <Button variant="outline">
                  <Upload size={16} />
                  Submit for Approval
                </Button>
              )}

              {task?.completionStatus?.status !== 'pending' && task?.completionStatus?.status !== 'rejected' && (
                <Text as='p' size="2" weight="medium" color="gray">
                  No further action required.
                </Text>
              )}
            </Flex>
          </Card>}

          {/* Task Progress */}
          {role === 'student' && <Card size="2" mb="5">
            <Flex direction="column" gap="4">
              <Heading size="4">Progress</Heading>

              <Flex direction="column" gap="3">
                <Flex justify="between" align="center">
                  <Text size="2">Status</Text>
                  <Badge color={getStatusColor(task?.completionStatus?.status)} className="capitalize">
                    {task?.completionStatus?.status}
                  </Badge>
                </Flex>

                {task?.completionStatus?.status !== 'pending' && task?.completionStatus?.completedAt && <Flex align="center" gap="2" justify="between" wrap="wrap">
                  <Text as='p' size="2">
                    Submitted on:
                  </Text>
                  <Text as='p' size="2" weight="medium">
                    {formatDate(task?.completionStatus?.completedAt, {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    })}
                  </Text>
                </Flex>}

                {task?.completionStatus?.status === 'approved' && task?.completionStatus?.approvalDate && <Flex align="center" gap="2" justify="between" wrap="wrap">
                  <Text as='p' size="2">
                    Approved on:
                  </Text>
                  <Text as='p' size="2" weight="medium">
                    {formatDate(task?.completionStatus?.approvalDate, {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    })}
                  </Text>
                </Flex>}

                {task?.completionStatus?.status === 'rejected' && task?.completionStatus?.approvalDate && <Flex align="center" gap="2" justify="between" wrap="wrap">
                  <Text as='p' size="2">
                    Rejected on:
                  </Text>
                  <Text as='p' size="2" weight="medium">
                    {formatDate(task?.completionStatus?.approvalDate, {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    })}
                  </Text>
                </Flex>}

                <Separator size="4" />

                <Flex justify="between" align="center">
                  <Text as='p' size="2">Points Value</Text>
                  <Text as='p' size="2" weight="medium">{task?.pointValue}</Text>
                </Flex>

                <Flex justify="between" align="center">
                  <Text as='p' size="2">Difficulty</Text>
                  {getDifficultyBadge(task?.difficulty) || '-'}
                </Flex>
              </Flex>
            </Flex>
          </Card>}

          {/* Status Guide */}
          {role === 'student' && <Card size="2" mb="5">
            <Flex direction="column" gap="4">
              <Heading size="4">Status Guide</Heading>

              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <Clock size={16} className="text-blue-500" />
                  <Text size="2"><strong>Pending:</strong> Ready to work on</Text>
                </Flex>
                <Flex align="center" gap="2">
                  <Eye size={16} className="text-orange-500" />
                  <Text size="2"><strong>Pending Approval:</strong> Submitted, awaiting review</Text>
                </Flex>
                <Flex align="center" gap="2">
                  <CheckCircle size={16} className="text-green-500" />
                  <Text size="2"><strong>Approved:</strong> Complete! Points earned</Text>
                </Flex>
                <Flex align="center" gap="2">
                  <XCircle size={16} className="text-red-500" />
                  <Text size="2"><strong>Rejected:</strong> Needs revision</Text>
                </Flex>
              </Flex>
            </Flex>
          </Card>}

          {/* Completion Tips */}
          {task?.completionStatus?.status === 'pending' && (
            <Card size="2" mb="5">
              <Flex direction="column" gap="4">
                <Heading size="4">Completion Tips</Heading>

                <Flex direction="column" gap="2">
                  <Text size="2">• <strong>Read carefully:</strong> Make sure you understand all requirements</Text>
                  <Text size="2">• <strong>Show your work:</strong> Especially for academic tasks</Text>
                  <Text size="2">• <strong>Add evidence:</strong> Photos, documents, or detailed descriptions help</Text>
                  <Text size="2">• <strong>Ask questions:</strong> Use comments if you need clarification</Text>
                  {task?.dueDate && (
                    <Text size="2">• <strong>Due date:</strong> Complete before {formatDate(new Date(task.dueDate))}</Text>
                  )}
                </Flex>
              </Flex>
            </Card>
          )}

          {/* Submission Help */}
          {(task?.completionStatus?.status === 'pending' || task?.completionStatus?.status === 'rejected') && (
            <Card size="2" mb="5">
              <Flex direction="column" gap="4">
                <Heading size="4">Submission Help</Heading>

                <Callout.Root variant='surface' color="amber" size="1">
                  <Callout.Icon>
                    <Upload size={16} />
                  </Callout.Icon>
                  <Callout.Text>
                    <Text size="2">
                      <strong>Before submitting:</strong> Double-check your work and add evidence to show completion.
                      {task?.requiresApproval ? ' Your submission will be reviewed for approval.' : ' You\'ll receive points immediately upon submission.'}
                    </Text>
                  </Callout.Text>
                </Callout.Root>
              </Flex>
            </Card>
          )}

          {/* Evidence Guide */}
          {task?.completionStatus?.status === 'pending' && (
            <Card size="2" mb="5">
              <Flex direction="column" gap="4">
                <Heading size="4">Evidence Types</Heading>

                <Flex direction="column" gap="2">
                  <Flex align="center" gap="2">
                    <FileImage size={16} className="text-purple-500" />
                    <Text size="2"><strong>Images:</strong> Photos of completed work, projects</Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <FileText size={16} className="text-blue-500" />
                    <Text size="2"><strong>Documents:</strong> PDFs, worksheets, reports</Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <LinkIcon size={16} className="text-green-500" />
                    <Text size="2"><strong>Links:</strong> Online projects, presentations</Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <MessageSquare size={16} className="text-orange-500" />
                    <Text size="2"><strong>Text:</strong> Detailed descriptions, answers</Text>
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          )}
        </Box>
      </Grid>

      {/* Task Submission Dialog */}
      <TaskSubmissionDialog
        isOpen={isSubmissionOpen}
        onOpenChange={setIsSubmissionOpen}
        onSubmit={handleTaskSubmission}
        task={task}
        submitButtonText={getSubmitButtonText(task?.completionStatus?.status)}
        isSubmitting={isSubmitting}
        isSubmissionError={isSubmissionError}
        submissionError={submissionError}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Task"
        description={`Are you sure you want to delete "${task?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteTask}
        confirmText="Delete Task"
        cancelText="Cancel"
        isLoading={isDeleting}
        confirmColor="red"
      />
    </Box>
  );
}

export default TaskDetailsPageBase;

// Smart External Resource Preview Component
const ExternalResourcePreview = ({ url, resource }) => {
  return (
    <Card variant="surface" size="2">
      <Flex direction="column" gap="2">
        <Flex align="center" gap="3">
          <div className="flex items-center justify-center size-12 bg-[--blue-a2] rounded-lg">
            <LinkIcon size={24} className="text-[--blue-11]" />
          </div>
          <div className="flex-1">
            <Text as='p' size="3" weight="medium" className="block">
              {resource?.platform || 'External Link'}
            </Text>
            <Text as='p' size="2" color="gray" className="block">
              {resource?.resourceId || 'Click to open resource'}
            </Text>
          </div>
        </Flex>

        <Text size="2" color="gray" className="break-all line-clamp-1">
          {url}
        </Text>

        <Flex justify="between" align="center" gap="2" wrap="wrap">
          <Button asChild className={"ml-auto"}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkIcon size={16} />
              Open Resource
            </a>
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};
