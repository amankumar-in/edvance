import { AlertDialog, Badge, Box, Button, Callout, Card, Code, Dialog, Flex, Grid, Heading, Select, Spinner, Text, TextArea } from '@radix-ui/themes';
import { AlertCircleIcon, Calendar, Clock, Filter, History, Package, Receipt, RefreshCw, TicketPercent, Trophy, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { useCancelRedemption } from '../../api/rewards/rewards.mutations';
import { useGetRedemptionHistoryInfinite } from '../../api/rewards/rewards.queries';
import { EmptyStateCard, Loader } from '../../components';
import { FALLBACK_IMAGES } from '../../utils/constants';
import { formatDate } from '../../utils/helperFunctions';

function StudentRedemptionHistory() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('redemptionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { ref, inView } = useInView();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  // Build query params
  const queryParams = {
    sort: sortBy,
    order: sortOrder,
  };

  // Add filters only if they have values
  if (statusFilter !== 'all') queryParams.status = statusFilter;

  // Queries
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    refetch
  } = useGetRedemptionHistoryInfinite(queryParams);

  // Data - All Redemptions
  const allRedemptions = data?.pages?.flatMap(page => page.data.redemptions) || [];

  // Mutations
  const { mutate: cancelRedemption, isPending: isCancellingRedemption } = useCancelRedemption();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'fulfilled': return 'green';
      case 'canceled': return 'red';
      case 'expired': return 'gray';
      default: return 'gray';
    }
  };

  // Status icon mapping
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={12} />;
      case 'fulfilled': return <Package size={12} />;
      case 'canceled': return <X size={12} />;
      case 'expired': return <Calendar size={12} />;
      default: return <Receipt size={12} />;
    }
  };

  // Handle cancel redemption
  const handleCancelRedemption = () => {
    if (!selectedRedemption || !cancelReason.trim()) return;

    cancelRedemption({
      id: selectedRedemption._id,
      reason: cancelReason.trim()
    }, {
      onSuccess: () => {
        toast.success('Redemption cancelled successfully. Points will be refunded.');
        setShowCancelDialog(false);
        setSelectedRedemption(null);
        setCancelReason('');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to cancel redemption');
      }
    });
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
        {error?.response?.data?.message || error?.message || 'Something went wrong while fetching redemption history'}
      </Callout.Text>
    </Callout.Root>
  );

  return (
    <Box className='space-y-6'>
      {/* Header Section */}
      <Box>
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center" wrap={'wrap'} gap={'4'}>
            <div>
              <Text as='p' size="7" weight="bold">
                Redemption History
              </Text>
              <Text as='p' size="3" color="gray" className="block mt-2">
                Track all your reward redemptions and their status
              </Text>
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Filters and Search */}
      <Card size="2" className='card_no_border'>
        <Flex gap="4" align="center" wrap="wrap">
          <Flex align="center" gap="2">
            <Filter size={14} />
            <Text as='p' weight="medium" size="2">Filters</Text>
          </Flex>

          <Flex gap="2" wrap="wrap">

            {/* Status Filter */}
            <Select.Root size="2" value={statusFilter} onValueChange={setStatusFilter}>
              <Select.Trigger className='capitalize'>
                Status: {statusFilter === 'all' ? 'All' : statusFilter}
              </Select.Trigger>
              <Select.Content variant='soft' position='popper'>
                <Select.Item value="all">All Status</Select.Item>
                <Select.Item value="pending">Pending</Select.Item>
                <Select.Item value="fulfilled">Fulfilled</Select.Item>
                <Select.Item value="canceled">Canceled</Select.Item>
                <Select.Item value="expired">Expired</Select.Item>
              </Select.Content>
            </Select.Root>

            {/* Sort */}
            <Select.Root size="2" value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}>
              <Select.Trigger>
                Sort by
              </Select.Trigger>
              <Select.Content variant='soft' position='popper'>
                <Select.Item value="redemptionDate-desc">Newest First</Select.Item>
                <Select.Item value="redemptionDate-asc">Oldest First</Select.Item>
                <Select.Item value="pointsSpent-desc">Points: High to Low</Select.Item>
                <Select.Item value="pointsSpent-asc">Points: Low to High</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>

        </Flex>
      </Card>

      {/* Results Summary */}
      <Flex justify="between" align="center" wrap={'wrap'} gap={'2'}>
        <Text as='p' size="2" color="gray" className='flex gap-2 items-center'>
          <History size={16} />
          Showing {allRedemptions.length} redemptions <Spinner loading={isFetching} />
        </Text>
        {/* {allRedemptions.length > 0 && (
          <Text size="2" color="gray">
            Total Points Spent: {allRedemptions.reduce((sum, r) => sum + r.pointsSpent, 0).toLocaleString()}
          </Text>
        )} */}
      </Flex>

      {/* Redemptions List */}
      {allRedemptions.length > 0 ? (
        <>
          <div className="space-y-3">
            {allRedemptions.map((redemption) => (
              <Card
                key={redemption._id}
                className='card_no_border'
              >
                <Flex gap="4" align="start">
                  {/* Reward Image */}
                  <Box className="flex-shrink-0">
                    <img
                      src={redemption.rewardId?.image || FALLBACK_IMAGES.product}
                      alt={redemption.rewardId?.title || 'Reward'}
                      loading='lazy'
                      className="object-cover w-20 h-20 rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGES.product;
                      }}
                    />
                  </Box>

                  {/* Main Content */}
                  <Flex direction="column" gap="2" className="flex-1 min-w-0">
                    {/* Header */}
                    <Flex justify="between" align="start" gap="2" wrap="wrap">
                      <div className="flex-1 min-w-0">
                        <Heading size="3" className="line-clamp-1" weight={'medium'}>
                          {redemption.rewardId?.title || 'Deleted Reward'}
                        </Heading>
                        <Text as='p' size="2" color="gray" className="capitalize">
                          {redemption.rewardId?.category}
                        </Text>
                      </div>

                      <Flex direction="column" align="end" gap="1">
                        <Badge
                          color={getStatusColor(redemption.status)}
                          variant="soft"
                          className="capitalize"
                        >
                          {getStatusIcon(redemption.status)}
                          {redemption.status}
                        </Badge>
                        <Text as='p' size="1" color="gray">
                          {formatDate(redemption.redemptionDate, { dateStyle: 'medium' })}
                        </Text>
                      </Flex>
                    </Flex>

                    {/* Details */}
                    <Flex justify="between" align="center" wrap="wrap" gap="2">
                      <Flex align="center" gap="4" wrap="wrap">
                        <Flex align="center" gap="1">
                          <Trophy size={14} />
                          <Text as='p' size="2" weight="medium">
                            {redemption.pointsSpent.toLocaleString()} points
                          </Text>
                        </Flex>

                        <Flex align="center" gap="1">
                          <TicketPercent size={14} />
                          <Code size='2' variant='soft' className='select-all'>
                            {redemption.redemptionCode}
                          </Code>
                        </Flex>
                      </Flex>

                      {/* Action Buttons */}
                      <Flex gap="2">
                        {redemption.status === 'pending' && <Button size="1" variant="soft" color="red" onClick={() => setShowCancelDialog(true)}>
                          Cancel
                        </Button>}
                        <Button size="1" variant="outline" onClick={() => {
                          setSelectedRedemption(null);
                          setSelectedRedemption(redemption);
                          setOpenDetailsDialog(true);
                        }}>
                          View Details
                        </Button>
                      </Flex>
                    </Flex>

                    {/* Additional Info */}
                    {redemption.fulfillmentDate && (
                      <Text as='p' size="1" color="green">
                        Fulfilled on {formatDate(redemption.fulfillmentDate, { dateStyle: 'medium' })}
                      </Text>
                    )}
                    {redemption.cancelledAt && (
                      <Text as='p' size="1" color="red">
                        Cancelled on {formatDate(redemption.cancelledAt, { dateStyle: 'medium' })}
                      </Text>
                    )}
                  </Flex>
                </Flex>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {isFetchingNextPage && (
            <Flex justify='center' align='center'>
              <Loader />
            </Flex>
          )}
          {(hasNextPage && !isFetchingNextPage) && <div ref={ref}></div>}
          {!hasNextPage && !isFetchingNextPage && allRedemptions.length > 0 && (
            <Flex justify='center' align='center'>
              <Text as='p' size="1" color="gray" className='text-nowrap'>No more redemptions to show</Text>
            </Flex>
          )}
        </>
      ) : (
        <EmptyStateCard
          title='No redemptions found'
          description={
            statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : "You haven't redeemed any rewards yet. Visit the rewards store to start redeeming!"
          }
          icon={<History />}
        />
      )}

      {/* Redemption Detail Modal */}
      <Dialog.Root
        open={openDetailsDialog}
        onOpenChange={(open) => {
          setOpenDetailsDialog(open);
        }}
      >
        <Dialog.Content className='max-w-2xl'>
          {selectedRedemption && (
            <>
              <Dialog.Title>Redemption Details</Dialog.Title>
              <Dialog.Description mb="4" weight={'medium'}>
                {selectedRedemption.rewardId?.title || 'Deleted Reward'}
              </Dialog.Description>

              <Flex direction="column" gap="4">
                {/* Basic Info */}
                <Flex gap="4" align="start">
                  <img
                    src={selectedRedemption.rewardId?.image || FALLBACK_IMAGES.product}
                    alt={selectedRedemption.rewardId?.title || 'Reward'}
                    loading='lazy'
                    className="object-cover w-24 h-24 rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGES.product;
                    }}
                  />
                  <Flex direction="column" gap="2" className="flex-1">
                    <Text as='p' size="2" color="gray" className="capitalize">
                      {selectedRedemption.rewardId?.category} {selectedRedemption.rewardId?.subcategory}
                    </Text>
                    <Badge
                      color={getStatusColor(selectedRedemption.status)}
                      variant="soft"
                      className="capitalize w-fit"
                    >
                      {getStatusIcon(selectedRedemption.status)}
                      {selectedRedemption.status}
                    </Badge>
                  </Flex>
                </Flex>

                {/* Details Grid */}
                <Grid columns={{ initial: '1', xs: '2' }} gap="4">
                  <Box>
                    <Text as='p' size="2" color="gray">Points Spent</Text>
                    <Flex align="center" gap="1">
                      <Trophy size={16} />
                      <Text as='p' size="3" weight="medium">
                        {selectedRedemption.pointsSpent.toLocaleString()}
                      </Text>
                    </Flex>
                  </Box>

                  <Box>
                    <Text as='p' size="2" color="gray">Redemption Code</Text>
                    <Code size='3' variant='soft' className='select-all'>
                      {selectedRedemption.redemptionCode}
                    </Code>
                  </Box>

                  <Box>
                    <Text as='p' size="2" color="gray">Redemption Date</Text>
                    <Text as='p' size="3">
                      {formatDate(selectedRedemption.redemptionDate, { dateStyle: 'medium', timeStyle: 'short' })}
                    </Text>
                  </Box>

                  {selectedRedemption.fulfillmentDate && (
                    <Box>
                      <Text as='p' size="2" color="gray">Fulfillment Date</Text>
                      <Text as='p' size="3">
                        {formatDate(selectedRedemption.fulfillmentDate, { dateStyle: 'medium', timeStyle: 'short' })}
                      </Text>
                    </Box>
                  )}

                  {selectedRedemption.cancelledAt && (
                    <Box>
                      <Text as='p' size="2" color="gray">Cancelled Date</Text>
                      <Text as='p' size="3">
                        {formatDate(selectedRedemption.cancelledAt, { dateStyle: 'medium', timeStyle: 'short' })}
                      </Text>
                    </Box>
                  )}
                </Grid>

                {/* Feedback */}
                {selectedRedemption.feedback && (
                  <Box>
                    <Text as='p' size="2" color="gray" weight="medium">Feedback from Provider:</Text>
                    <Box className="mt-2 p-3 bg-[--gray-a2] rounded-md">
                      <Text as='p' size="2" className='whitespace-pre-wrap'>{selectedRedemption.feedback}</Text>
                    </Box>
                  </Box>
                )}

                {/* Cancel Reason */}
                {selectedRedemption.cancelReason && (
                  <Box>
                    <Text as='p' size="2" color="gray" weight="medium">Cancellation Reason:</Text>
                    <Box className="mt-2 p-3 bg-[--red-a2] rounded-md">
                      <Text as='p' size="2" color="red" className='whitespace-pre-wrap'>{selectedRedemption.cancelReason}</Text>
                    </Box>
                  </Box>
                )}
              </Flex>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Close
                  </Button>
                </Dialog.Close>
                {selectedRedemption.status === 'pending' && (
                  <Dialog.Close>
                    <Button
                      color="red"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      Cancel Redemption
                    </Button>
                  </Dialog.Close>
                )}
              </Flex>
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>

      {/* Cancel Redemption Alert Dialog */}
      <AlertDialog.Root open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialog.Content className='max-w-md'>
          <AlertDialog.Title>Cancel Redemption</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure you want to cancel this redemption? Your points will be refunded. This action cannot be undone.
          </AlertDialog.Description>

          <Flex direction='column' gap='2' mt='3'>
            <label>
              <Text as='p' size={'2'} mb={'2'} weight={'medium'}>
                Reason for cancellation (required):
              </Text>
              <TextArea
                placeholder='Please provide a reason...'
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                resize='vertical'
              />
            </label>
          </Flex>

          <Flex gap="3" mt="4" justify="end" className='flex-wrap'>
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" disabled={isCancellingRedemption}>
                Keep Redemption
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                color="red"
                onClick={handleCancelRedemption}
                disabled={!cancelReason.trim() || isCancellingRedemption}
              >
                {isCancellingRedemption ? 'Cancelling...' : 'Cancel Redemption'}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}

export default StudentRedemptionHistory; 