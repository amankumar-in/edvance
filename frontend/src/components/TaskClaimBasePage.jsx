import { AlertDialog, Badge, Button, Flex, IconButton, Select, Table, Text, TextArea, Tooltip } from '@radix-ui/themes';
import { CheckIcon, EyeIcon, FileIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import { useReviewTask } from '../api/task/task.mutations';
import { useGetTaskClaimsPaginated } from '../api/task/task.queries';
import { EmptyStateCard, ErrorCallout, Loader, Pagination } from '../components';
import { SortIcon } from '../components/platform-admin/UserTable';
import TaskClaimDetailsDialog from '../components/TaskClaimDetailsDialog';
import { formatDate } from '../utils/helperFunctions';
import { PageHeader } from '../components';

// Determines the color of the status badge
const getStatusColor = (status) => {
  switch (status) {
    case 'pending_approval':
      return 'orange';
    case 'approved':
      return 'green';
    case 'rejected':
      return 'red';
    case 'pending':
      return 'blue';
    case 'expired':
      return 'gray';
    default:
      return 'gray';
  }
};

function TaskClaimBasePage({ role }) {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [claimToReject, setClaimToReject] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('updatedAt');
  const [order, setOrder] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, isError, error, isFetching } = useGetTaskClaimsPaginated({
    role: role,
    sortBy: sort,
    order: order,
    status: statusFilter,
    page: page,
    limit: limit,
  });
  const claims = data?.data?.docs || [];

  const reviewTask = useReviewTask();

  // Column definitions
  const columns = [
    {
      id: '_id',
      header: 'ID',
    },
    {
      id: 'task.title',
      header: 'Task',
    },
    {
      id: 'childDetails.firstName',
      header: 'Student',
    },
    {
      id: 'childDetails.grade',
      header: 'Grade',
    },
    {
      id: 'updatedAt',
      header: 'Date',
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
    },
    {
      id: 'actions',
      header: 'Actions',
    }
  ];

  if (isLoading) return (
    <div className="space-y-6">
      <ClaimPageHeader />
      <Flex justify='center' align='center' className='h-full'>
        <Loader />
      </Flex>
    </div>
  )

  if (isError) return (
    <div className="space-y-6">
      <ClaimPageHeader />
      <ErrorCallout
        className={'mx-auto max-w-2xl'}
        errorMessage={error?.response?.data?.message || 'Something went wrong while fetching task claims'}
      />
    </div>
  )

  const pagination = data?.data || {};
  const currentSort = { field: sort, order: order };
  console.log(pagination)


  // Sort functionality
  const handleSort = (field) => {
    if (sort === field) {
      // Toggle order if clicking the same field
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSort(field);
      setOrder('asc');
    }
    // setPage(1); // Reset to first page when sorting
  };

  // Handler to open the reject feedback modal
  const handleRejectClick = (claim) => {
    setClaimToReject(claim);
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!claimToReject) return;

    reviewTask.mutate({
      id: claimToReject._id,
      data: { role: role, action: 'reject', feedback: rejectFeedback }
    }, {
      onSuccess: () => {
        toast.success('Task claim rejected successfully')
        setIsRejectModalOpen(false);
        setRejectFeedback(''); // Clear feedback after submission
        setClaimToReject(null); // Clear claimToReject
      },
      onError: (error) => {
        console.log(error);
        toast.error(error?.response?.data?.message || error?.message || 'Failed to reject the claim.')
      }
    });

  };

  const handleApprove = (claimId) => {
    reviewTask.mutate({
      id: claimId,
      data: { role: role, action: 'approve' }
    }, {
      onSuccess: () => {
        toast.success('Task approved successfully')
      },
      onError: (error) => {
        console.log(error);
        toast.error(error?.response?.data?.message || error?.message || 'Failed to approve this task.')
      }
    });
  };

  const handleItemsPerPageChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <>
      {/* Top bar loader */}
      {isFetching && (
        <div className='flex fixed top-0 right-0 left-0 z-50'>
          <BarLoader
            color='#00a2c7'
            width={'100%'}
            height={'4px'}
          />
        </div>
      )}
      <div className='space-y-6'>
        <ClaimPageHeader />

        <Flex align={'center'} gap={'2'}>
          {/* Status Filter */}
          <label htmlFor='statusFilter' className='text-sm'>Status:</label>
          <Select.Root disabled={isFetching} size={'2'} value={statusFilter} onValueChange={setStatusFilter} id='statusFilter'>
            <Select.Trigger variant='classic' />
            <Select.Content variant='soft' position='popper'>
              <Select.Item value='all'>All</Select.Item>
              <Select.Item value='pending_approval'>Pending Approval</Select.Item>
              <Select.Item value='approved'>Approved</Select.Item>
              <Select.Item value='rejected'>Rejected</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Table.Root variant='surface' layout={'auto'} className='shadow-md'>
          <Table.Header>
            <Table.Row >
              {columns.map((column) => (
                <Table.ColumnHeaderCell
                  key={column.id}
                  onClick={column.sortable ? () => handleSort(column.id) : undefined}
                  style={column.sortable ? { cursor: 'pointer' } : undefined}
                  className='font-medium text-nowrap'
                >
                  {column.sortable ? (
                    <Button variant='ghost' color='gray' className='font-medium' highContrast>
                      {column.header} <SortIcon currentSort={currentSort} columnName={column.id} />

                    </Button>
                  ) : (
                    column.header
                  )}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {claims?.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length + 1}>
                  <EmptyStateCard
                    icon={<FileIcon />}
                    title='No task claims found'
                    description='No task claims found for the selected status.'
                  />
                </Table.Cell>
              </Table.Row>
            ) : (
              claims.map((claim) => (
                <Table.Row key={claim._id} className='hover:bg-[--gray-a2]'>
                  <Table.Cell className='font-mono text-nowrap'>
                    {claim._id?.slice(-8)}
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    {claim?.task?.title}
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    <Flex direction='column'>
                      <Text>{claim?.childDetails?.firstName} {claim?.childDetails?.lastName}</Text>
                      <Text as='p' size='1' color='gray'>{claim?.childDetails?.email}</Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    {claim?.childDetails?.grade}
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    {formatDate(claim?.completedAt)}
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    <Badge color={getStatusColor(claim?.status)}>{claim?.status}</Badge>
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    <Flex gap='4' align='center' >
                      <Tooltip content='View claim'>
                        <IconButton variant='ghost' color='gray'
                          onClick={() => {
                            setSelectedClaim(claim);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          <EyeIcon size={16} />
                        </IconButton>
                      </Tooltip>
                      {claim?.status === 'pending_approval' && (
                        <>
                          <Tooltip content='Approve claim'>
                            <IconButton variant='ghost' color='green'
                              disabled={reviewTask.isPending && reviewTask.variables.id === claim._id}
                              onClick={() => handleApprove(claim._id)}
                            >
                              <CheckIcon size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content='Reject claim'>
                            <IconButton variant='ghost' color='red'
                              disabled={reviewTask.isPending && reviewTask.variables.id === claim._id}
                              onClick={() => handleRejectClick(claim)}
                            >
                              <XIcon size={16} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={pagination?.totalPages ?? 1}
          totalItems={pagination?.totalDocs ?? 0}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPage={true}
          showPageInfo={true}
          showFirstLast={true}
          showPrevNext={true}
          itemsPerPageOptions={[5, 10, 20, 50, 100]}
          itemLabel="task claims"
          disabled={isLoading || isFetching}
        />

        {/* Details Modal */}
        <TaskClaimDetailsDialog
          isDetailsModalOpen={isDetailsModalOpen}
          setIsDetailsModalOpen={setIsDetailsModalOpen}
          selectedClaim={selectedClaim}
          getStatusColor={getStatusColor}
        />

        {/* Reject Confirmation Modal */}
        <AlertDialog.Root open={isRejectModalOpen} onOpenChange={(open) => {
          if (!open) {
            setClaimToReject(null);
            setRejectFeedback('');
          }
          setIsRejectModalOpen(open);
        }}>
          <AlertDialog.Content maxWidth='450px'>
            <AlertDialog.Title>Provide Rejection Feedback</AlertDialog.Title>
            <AlertDialog.Description size='2'>
              Optionally provide feedback for the student regarding this task completion. This feedback will be visible to the student.
            </AlertDialog.Description>

            <Flex direction='column' gap='2' mt='3'>
              <label htmlFor='rejectFeedback'>
                <Text as='p' size={'2'} mb={'2'} weight={'medium'}>
                  Feedback (Optional):
                </Text>
                <TextArea
                  id='rejectFeedback'
                  placeholder='Enter feedback here...'
                  value={rejectFeedback}
                  onChange={(e) => setRejectFeedback(e.target.value)}
                  rows={3}
                  resize='vertical'
                />
              </label>
            </Flex>

            <Flex gap='3' mt='4' justify='end'>
              <AlertDialog.Cancel>
                <Button variant='soft' color='gray'>
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <Button
                disabled={reviewTask.isPending}
                variant='solid'
                color='red'
                onClick={handleRejectConfirm}
              >
                {reviewTask.isPending ? "Processing..." : "Confirm Rejection"}
              </Button>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </div>
    </>
  )
}

export default TaskClaimBasePage

function ClaimPageHeader() {
  return (
    <PageHeader
      title='Task Claims'
      description='Review and manage task completion requests submitted by your students.'
    />
  )
}
