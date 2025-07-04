import { Badge, Box, Button, Callout, Card, Dialog, Flex, Grid, Heading, Separator, Spinner, Text, TextArea } from '@radix-ui/themes';
import { AlertCircleIcon, CheckCircle, Clock, Gift, Trophy, X } from 'lucide-react';
import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { useCancelRedemption, useFulfillRedemption } from '../../api/rewards/rewards.mutations';
import { useGetPendingRedemptions } from '../../api/rewards/rewards.queries';
import { EmptyStateCard, Loader } from '../../components';
import { useDebounce } from '../../hooks/useDebounce';
import { FALLBACK_IMAGES } from '../../utils/constants';
import { formatDate } from '../../utils/helperFunctions';

function PendingRedemptions() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [statusFilter, setStatusFilter] = useState('pending');

  // Modal states
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [fulfillmentModal, setFulfillmentModal] = useState(false);
  const [cancellationModal, setCancellationModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const { ref, inView } = useInView();

  // Data fetching
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching
  } = useGetPendingRedemptions({
    search: debouncedSearchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 20
  });

  const allRedemptions = data?.pages?.flatMap(page => page.data.redemptions) || [];

  // Mutations
  const { mutate: fulfillRedemption, isPending: isFulfilling } = useFulfillRedemption();
  const { mutate: cancelRedemption, isPending: isCancelling } = useCancelRedemption();

  // Handlers
  const handleFulfill = () => {
    if (!selectedRedemption) return;

    fulfillRedemption({
      id: selectedRedemption._id,
      feedback: feedback.trim(),
      role: 'parent'
    }, {
      onSuccess: () => {
        toast.success('Redemption fulfilled successfully');
        setFulfillmentModal(false);
        setSelectedRedemption(null);
        setFeedback('');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to fulfill redemption');
      }
    });
  };

  const handleCancel = () => {
    if (!selectedRedemption || !cancelReason.trim()) return;

    cancelRedemption({
      id: selectedRedemption._id,
      reason: cancelReason.trim(),
      role: 'parent'
    }, {
      onSuccess: () => {
        toast.success('Redemption cancelled successfully');
        setCancellationModal(false);
        setSelectedRedemption(null);
        setCancelReason('');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to cancel redemption');
      }
    });
  };

  const openFulfillmentModal = (redemption) => {
    setSelectedRedemption(redemption);
    setFulfillmentModal(true);
    setFeedback('');
  };

  const openCancellationModal = (redemption) => {
    setSelectedRedemption(redemption);
    setCancellationModal(true);
    setCancelReason('');
  };

  // Auto-fetch next page when in view
  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

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
        {error?.response?.data?.message || error?.message || 'Failed to load pending redemptions'}
      </Callout.Text>
    </Callout.Root>
  );

  return (
    <Box className='space-y-6'>
      {/* Header Section */}
      <Box>
        <Flex justify="between" align="center" wrap={'wrap'} gap={'4'}>
          <div>
            <Heading size='6' mb='2'>
              Pending Redemptions
            </Heading>

            {/* General helper text */}
            <Text as='p' size='3' color='gray' mb='4'>
              Review and manage reward redemptions from your children.
            </Text>
          </div>
          <Flex align="center" gap="2">
            <Badge color="orange" variant="soft" size="2">
              <Clock size={12} />
              {allRedemptions.length} pending
            </Badge>
          </Flex>
        </Flex>
        <Separator size={'4'} />
      </Box>


      {/* Redemptions Grid */}
      {allRedemptions.length > 0 ? (
        <>
          <Grid columns={{ initial: '1', xs: '2', lg: '3' }} gap="4">
            {allRedemptions.map((redemption) => (
              <Card
                size='2'
                key={redemption._id}
                className="flex flex-col shadow-md"
              >
                <Box className="space-y-4">
                  {/* Header with status */}
                  <Flex justify="between" align="start">
                    <Badge
                      color={
                        redemption.status === 'pending' ? 'orange' :
                          redemption.status === 'fulfilled' ? 'green' :
                            redemption.status === 'canceled' ? 'red' : 'gray'
                      }
                      variant="soft"
                      size="2"
                    >
                      {redemption.status === 'pending' && <Clock size={12} />}
                      {redemption.status === 'fulfilled' && <CheckCircle size={12} />}
                      {redemption.status === 'canceled' && <X size={12} />}
                      {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                    </Badge>
                    <Text as='p' size="1" color="gray">
                      {formatDate(redemption.redemptionDate)}
                    </Text>
                  </Flex>

                  {/* Reward Info */}
                  <Flex gap="3" align="start">
                    <img
                      src={redemption.rewardId?.image || FALLBACK_IMAGES.product}
                      alt={redemption.rewardId?.title || 'Reward'}
                      className="object-cover w-16 h-16 rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGES.product;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <Text as='p' weight="medium" className="mb-1 line-clamp-2">
                        {redemption.rewardId?.title || 'Unknown Reward'}
                      </Text>
                      <Flex align="center" gap="1" className="mb-2">
                        <Trophy size={14} />
                        <Text as='p' size="2" weight="bold">
                          {redemption.pointsSpent?.toLocaleString() || 0} points
                        </Text>
                      </Flex>
                      <Text as='p' size="1" color="gray" className="capitalize">
                        {redemption.rewardId?.category || 'Uncategorized'}
                      </Text>
                    </div>
                  </Flex>

                  {/* Student Info */}
                  <Box className='space-y-1'>
                    <Text as='p' size="2">
                      {redemption.studentInfo ?
                        `${redemption.studentInfo.firstName} ${redemption.studentInfo.lastName}` :
                        'Unknown Student'
                      }
                    </Text>
                    {redemption.studentInfo?.email && (
                      <Text as='p' size="1" color="gray">
                        {redemption.studentInfo.email}
                      </Text>
                    )}
                  </Box>

                  {/* Redemption Code */}
                  <Box className="p-3 bg-[--accent-a2] rounded-lg">
                    <Text as='p' size="1" color="gray" className="block mb-1">Redemption Code</Text>
                    <Text as='p' size="2" className="font-mono">
                      {redemption.redemptionCode}
                    </Text>
                  </Box>

                  {/* Action Buttons - Only show for pending redemptions */}
                  {redemption.status === 'pending' && (
                    <Flex gap="2">
                      <Button
                        size="2"
                        className="flex-1"
                        onClick={() => openFulfillmentModal(redemption)}
                        disabled={isFulfilling || isCancelling}
                      >
                        <CheckCircle size={16} />
                        Fulfill
                      </Button>
                      <Button
                        size="2"
                        color="red"
                        variant="soft"
                        className="flex-1"
                        onClick={() => openCancellationModal(redemption)}
                        disabled={isFulfilling || isCancelling}
                      >
                        <X size={16} />
                        Cancel
                      </Button>
                    </Flex>
                  )}

                  {/* Fulfillment/Cancellation Info */}
                  {redemption.status === 'fulfilled' && redemption.feedback && (
                    <Box className="p-3 bg-[--green-a2] rounded-lg">
                      <Text size="1" color="gray" className="block mb-1">Fulfillment Feedback</Text>
                      <Text size="2">{redemption.feedback}</Text>
                    </Box>
                  )}

                  {redemption.status === 'canceled' && redemption.cancelReason && (
                    <Box className="p-3 bg-[--red-a2] rounded-lg">
                      <Text size="1" color="gray" className="block mb-1">Cancellation Reason</Text>
                      <Text size="2">{redemption.cancelReason}</Text>
                    </Box>
                  )}
                </Box>
              </Card>
            ))}
          </Grid>

          {/* Loading indicator for pagination */}
          {isFetchingNextPage && (
            <Flex justify='center' align='center'>
              <Loader />
            </Flex>
          )}

          {/* Infinite scroll trigger */}
          {(hasNextPage && !isFetchingNextPage) && <div ref={ref}></div>}

          {/* End of results */}
          {!hasNextPage && !isFetchingNextPage && allRedemptions.length > 0 && (
            <Flex justify='center' align='center'>
              <Text as='p' size="1" color="gray">No more redemptions to show</Text>
            </Flex>
          )}
        </>
      ) : (
        <EmptyStateCard
          title="No redemptions found"
          description="There are no redemptions to show"
          icon={<Gift />}
        />
      )}

      {/* Fulfillment Modal */}
      <Dialog.Root open={fulfillmentModal} onOpenChange={setFulfillmentModal}>
        <Dialog.Content className='max-w-lg'>
          <Dialog.Title>Fulfill Redemption</Dialog.Title>
          <Dialog.Description size={'2'} className='mb-4'>
            Fulfill the redemption for {selectedRedemption?.rewardId?.title}
          </Dialog.Description>
          <div className='space-y-4'>
            {selectedRedemption && (
              <>
                <Box className="p-3 bg-[--gray-a2] rounded-lg">
                  <Text as='div' size="1" color="gray">
                    Code: <Text as='span' size="2" className='font-mono select-all'> {selectedRedemption.redemptionCode}</Text>
                  </Text>
                </Box>

                <Box>
                  <Text as="label" htmlFor="feedback" size="2" weight="medium" className="block mb-2">
                    Fulfillment Feedback (Optional)
                  </Text>
                  <TextArea
                    id="feedback"
                    placeholder="Add any notes about the fulfillment..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    resize={'vertical'}
                  />
                </Box>
              </>
            )}
          </div>
          <Flex gap="3" mt="4" justify="end" wrap={'wrap-reverse'}>
            <Dialog.Close>
              <Button variant="soft" color="gray" disabled={isFulfilling}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleFulfill} disabled={isFulfilling}>
              {isFulfilling ? 'Processing...' : 'Fulfill Redemption'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Cancellation Modal */}
      <Dialog.Root open={cancellationModal} onOpenChange={setCancellationModal}>
        <Dialog.Content className='max-w-lg' >
          <Dialog.Title>Cancel Redemption</Dialog.Title>
          <Dialog.Description size={'2'} className='mb-4'>
            Cancel the redemption for {selectedRedemption?.rewardId?.title}
          </Dialog.Description>
          <div className='space-y-4'>
            {selectedRedemption && (
              <>
                <Box className="p-3 bg-[--gray-a2] rounded-lg">
                  <Text size="1" color="gray">
                    Code: {selectedRedemption.redemptionCode}
                  </Text>
                </Box>

                <Callout.Root color="red" variant="surface">
                  <Callout.Icon>
                    <AlertCircleIcon size={16} />
                  </Callout.Icon>
                  <Callout.Text>
                    This will refund the scholarship points to the child and cannot be undone.
                  </Callout.Text>
                </Callout.Root>

                <Box>
                  <Text as="label" htmlFor="cancelReason" size="2" weight="medium" className="block mb-2">
                    Cancellation Reason *
                  </Text>
                  <TextArea
                    id="cancelReason"
                    placeholder="Please provide a reason for cancellation..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    resize={'vertical'}
                  />
                </Box>
              </>
            )}
          </div>
          <Flex gap="3" mt="4" justify="end" wrap={'wrap-reverse'}>
            <Dialog.Close>
              <Button variant="soft" color="gray" disabled={isCancelling}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              color="red"
              onClick={handleCancel}
              disabled={!cancelReason.trim() || isCancelling}
            >
              {isCancelling ? 'Processing...' : 'Cancel Redemption'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}

export default PendingRedemptions; 