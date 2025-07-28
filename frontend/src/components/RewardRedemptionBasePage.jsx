import { Badge, Button, Dialog, DropdownMenu, Flex, IconButton, Table, Text, TextArea } from '@radix-ui/themes';
import { Check, Code, Eye, Mail, MoreHorizontal, Receipt, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import { useCancelRedemption, useFulfillRedemption } from '../api/rewards/rewards.mutations';
import { useGetRedemptions } from '../api/rewards/rewards.queries';
import { formatDate } from '../utils/helperFunctions';
import EmptyStateCard from './EmptyStateCard';
import ErrorCallout from './ErrorCallout';
import Loader from './Loader';
import PageHeader from './PageHeader';
import Pagination from './Pagination';
import { SortIcon } from './platform-admin/UserTable';

const RewardRedemptionBasePage = ({ activeRole }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('redemptionDate');
  const [order, setOrder] = useState('desc');

  // API Queries
  const {
    data: redemptionsData,
    isLoading,
    isFetching,
    isError,
    error
  } = useGetRedemptions({ activeRole, page, limit, sort, order });
  const redemptions = redemptionsData?.data?.redemptions || [];
  const pagination = redemptionsData?.data?.pagination || {};

  // Mutations
  const { mutate: fulfillRedemption, isPending: isFulfillingRedemption } = useFulfillRedemption();
  const { mutate: cancelRedemption, isPending: isCancellingRedemption } = useCancelRedemption();

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'fulfilled': return 'green';
      case 'canceled': return 'red';
      case 'expired': return 'gray';
      default: return 'gray';
    }
  };

  // Column definitions
  const columns = [
    {
      header: 'Student',
      id: 'studentInfo.firstName',
      sortable: true,
    },
    {
      header: 'Reward',
      id: 'rewardId.title',
      sortable: true,
    },
    {
      header: 'Points',
      id: 'pointsSpent',
      sortable: true,
    },
    {
      header: 'Status',
      id: 'status',
    },
    {
      header: 'Redeemed',
      id: 'redemptionDate',
      sortable: true,
    },
    {
      header: 'Code',
      id: 'redemptionCode',
    },
    {
      header: 'Actions',
      id: 'actions',
    }
  ]
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

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit, newPage) => {
    setLimit(newLimit);
    setPage(1);
  };

  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [fulfillmentFeedback, setFulfillmentFeedback] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const handleViewDetails = (redemption) => {
    setSelectedRedemption(redemption);
    setShowDetailsDialog(true);
  };

  const handleFulfillRedemption = (redemption) => {
    setSelectedRedemption(redemption);
    setFulfillmentFeedback('');
    setShowFulfillDialog(true);
  };

  const handleCancelRedemption = (redemption) => {
    setSelectedRedemption(redemption);
    setCancellationReason('');
    setShowCancelDialog(true);
  };

  const confirmFulfillment = () => {
    if (!selectedRedemption) return;

    fulfillRedemption(
      {
        id: selectedRedemption._id,
        feedback: fulfillmentFeedback,
        role: activeRole
      },
      {
        onSuccess: () => {
          toast.success('Redemption fulfilled successfully');
          setShowFulfillDialog(false);
          setSelectedRedemption(null);
          setFulfillmentFeedback('');
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to fulfill redemption');
        }
      }
    );
  };

  const confirmCancellation = () => {
    if (!selectedRedemption || !cancellationReason.trim()) return;

    cancelRedemption(
      {
        id: selectedRedemption._id,
        reason: cancellationReason,
        role: activeRole
      },
      {
        onSuccess: () => {
          toast.success('Redemption cancelled successfully');
          setShowCancelDialog(false);
          setSelectedRedemption(null);
          setCancellationReason('');
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to cancel redemption');
        }
      }
    );
  };


  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <RedemptionPageHeader />
        <Flex justify="center" align="center">
          <Loader />
        </Flex>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className='space-y-6'>
        <RedemptionPageHeader />
        <ErrorCallout errorMessage={error?.response?.data?.message || error?.message || 'Failed to load redemptions'} />
      </div>
    );
  }

  const currentSort = { field: sort, order: order };

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
        <RedemptionPageHeader activeRole={activeRole} />

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
            {redemptions.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length + 1}>
                  <EmptyStateCard
                    icon={<Receipt size={48} />}
                    description='No redemptions found'
                  />
                </Table.Cell>
              </Table.Row>
            ) : (
              redemptions.map((redemption) => (
                <Table.Row key={redemption._id} className='hover:bg-[--gray-a2]'>
                  <Table.Cell className='text-nowrap'>
                    <Flex direction='column' gap='1'>
                      <Text as='p' size='2'>{redemption?.studentInfo?.firstName} {redemption?.studentInfo?.lastName}</Text>
                      <Text as='p' size='1' color='gray'>{redemption?.studentInfo?.email}</Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    <Flex direction='column' gap='1'>
                      <Text as='p'>{redemption?.rewardId?.title || '-'}</Text>
                      <Badge className='self-start'>
                        {redemption?.rewardId?.category || '- '}
                      </Badge>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    {redemption?.pointsSpent || 0}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge className='self-start' color={getStatusBadgeColor(redemption?.status)}>
                      {redemption?.status || '-'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    {formatDate(redemption?.redemptionDate) || '-'}
                  </Table.Cell>
                  <Table.Cell className='font-mono select-all text-nowrap'>
                    {redemption?.redemptionCode || '-'}
                  </Table.Cell>
                  <Table.Cell>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <IconButton
                          variant="ghost"
                          color="gray"
                          highContrast
                        >
                          <MoreHorizontal size={18} />
                        </IconButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content variant='soft'>
                        <DropdownMenu.Group >
                          <DropdownMenu.Label>Actions</DropdownMenu.Label>
                          <DropdownMenu.Item
                            onClick={() => handleViewDetails(redemption)}
                          >
                            <Eye size={14} /> View Details
                          </DropdownMenu.Item>
                          {redemption.status === 'pending' && (
                            <>
                              <DropdownMenu.Separator />
                              <DropdownMenu.Item
                                onClick={() => handleFulfillRedemption(redemption)}
                              >
                                <Check size={14} /> Fulfill
                              </DropdownMenu.Item>
                              <DropdownMenu.Item color='red'
                                onClick={() => handleCancelRedemption(redemption)}
                              >
                                <X size={14} /> Cancel
                              </DropdownMenu.Item>
                            </>
                          )}
                        </DropdownMenu.Group>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>

        <Pagination
          currentPage={page}
          totalPages={pagination?.pages ?? 1}
          totalItems={pagination?.total ?? 0}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPage={true}
          showPageInfo={true}
          showFirstLast={true}
          showPrevNext={true}
          itemsPerPageOptions={[5, 10, 20, 50, 100]}
          disabled={isLoading || isFetching}
          itemLabel='Redemption'
        />

      </div>


      {/* Details Dialog */}
      <Dialog.Root open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <Dialog.Content className="max-w-2xl" aria-describedby={undefined}>
          <Dialog.Title>Redemption Details</Dialog.Title>
          {selectedRedemption && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Text as='p' size="1" weight="medium" color="gray" mb={'1'}>Student</Text>
                  <Text as='p' size="2" mb={'1'} className='flex gap-2 items-center'>
                    <User size={14} /> {selectedRedemption?.studentInfo?.firstName || 'N/A'} {selectedRedemption?.studentInfo?.lastName || 'N/A'}
                  </Text>
                  <Text as='p' size="2" className='flex gap-2 items-center'>
                    <Mail size={14} /> {selectedRedemption?.studentInfo?.email || 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text as='p' size="1" weight="medium" color="gray" mb={'1'}>Reward</Text>
                  <Text as='p' size="2">{selectedRedemption.rewardId.title}</Text>
                  <Text as='p' size="2">({selectedRedemption.pointsSpent} points)</Text>
                </div>
                <div>
                  <Text as='p' size="1" weight="medium" color="gray" mb={'1'}>Status</Text>
                  <Badge color={getStatusBadgeColor(selectedRedemption.status)} variant="soft">
                    {selectedRedemption.status}
                  </Badge>
                </div>
                <div>
                  <Text as='p' size="1" weight="medium" color="gray" mb={'1'}>Redemption Code</Text>
                  <Code size='2' variant='soft' className='select-all'>{selectedRedemption.redemptionCode}</Code>
                </div>
                <div>
                  <Text as='p' size="1" weight="medium" color="gray" mb={'1'}>Redeemed On</Text>
                  <Text as='p' size="2">{formatDate(selectedRedemption.redemptionDate, { dateStyle: 'medium', timeStyle: 'short' })}</Text>
                </div>
                {selectedRedemption.fulfillmentDate && (
                  <div>
                    <Text as='p' size="1" weight="medium" color="gray" mb={'1'}>Fulfilled On</Text>
                    <Text as='p' size="2">{formatDate(selectedRedemption.fulfillmentDate, { dateStyle: 'medium', timeStyle: 'short' })}</Text>
                  </div>
                )}
                {selectedRedemption.cancelledAt && (
                  <div>
                    <Text as='p' size="1" weight="medium" color="gray" mb={'1'}>Cancelled On</Text>
                    <Text as='p' size="2">{formatDate(selectedRedemption.cancelledAt, { dateStyle: 'medium', timeStyle: 'short' })}</Text>
                  </div>
                )}
              </div>
              {selectedRedemption.feedback && (
                <div>
                  <Text as='p' size="1" weight="medium" color="gray" className='whitespace-pre-wrap' mb={'1'}>Feedback</Text>
                  <Text as='p' size="2" className='whitespace-pre-wrap bg-[--gray-a2] p-2 rounded-md'>{selectedRedemption.feedback}</Text>
                </div>
              )}
              {selectedRedemption.cancelReason && (
                <div>
                  <Text as='p' size="1" weight="medium" color="gray" mb={'1'}>Cancellation Reason</Text>
                  <Text as='p' size="2" className='whitespace-pre-wrap bg-[--gray-a2] p-2 rounded-md'>{selectedRedemption.cancelReason}</Text>
                </div>
              )}
            </div>
          )}
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">Close</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Fulfill Dialog */}
      <Dialog.Root open={showFulfillDialog} onOpenChange={setShowFulfillDialog}>
        <Dialog.Content className="max-w-lg">
          <Dialog.Title>Fulfill Redemption</Dialog.Title>
          <div className="space-y-4">
            <Text as='p' size="2">
              Mark this redemption as fulfilled and optionally add feedback for the student.
            </Text>
            <div>
              <Text as="label" size="2" weight="medium">
                Feedback (Optional)
              </Text>
              <TextArea
                placeholder="Add feedback for the student..."
                value={fulfillmentFeedback}
                onChange={(e) => setFulfillmentFeedback(e.target.value)}
                className="mt-2"
                rows={3}
                resize='vertical'
              />
            </div>
          </div>
          <Flex gap="3" mt="4" justify="end" wrap='wrap'>
            <Dialog.Close>
              <Button variant="soft" color="gray">Cancel</Button>
            </Dialog.Close>
            <Button
              color="green"
              onClick={confirmFulfillment}
              disabled={isFulfillingRedemption}
            >
              <Check size={16} /> {isFulfillingRedemption ? 'Fulfilling...' : 'Fulfill'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Cancel Dialog */}
      <Dialog.Root open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <Dialog.Content className="max-w-lg">
          <Dialog.Title>Cancel Redemption</Dialog.Title>
          <div className="space-y-4">
            <Text as='p' size="2">
              Cancel this redemption and refund the points to the student. Please provide a reason.
            </Text>
            <div>
              <Text as="label" size="2" weight="medium">
                Cancellation Reason *
              </Text>
              <TextArea
                placeholder="Why is this redemption being cancelled?"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="mt-2"
                rows={3}
                resize='vertical'
              />
            </div>
          </div>
          <Flex gap="3" mt="4" justify="end" wrap='wrap'>
            <Dialog.Close>
              <Button variant="soft" color="gray">Cancel</Button>
            </Dialog.Close>
            <Button
              color="red"
              onClick={confirmCancellation}
              disabled={!cancellationReason.trim() || isCancellingRedemption}
            >
              <X size={16} /> {isCancellingRedemption ? 'Cancelling...' : 'Cancel Redemption'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}

export default RewardRedemptionBasePage

function RedemptionPageHeader({ activeRole }) {
  return (
    <PageHeader title={`Reward Redemptions`} />
  )
}