import { Badge, Box, Button, Callout, Dialog, Flex, Text } from '@radix-ui/themes';
import { Clock, Copy, Trophy } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useRedeemReward } from '../../api/rewards/rewards.mutations';
import rewardsPlaceholder from '../../assets/rewardsPlaceholder.webp';
import { formatDate } from '../../utils/helperFunctions';

function RewardsDetailsDialog({
  children = null, 
  openDialog,
  setOpenDialog,
  selectedReward,
  setSelectedReward,
  role,
  userPoints,
  canAfford,
  studentId
}) {
  const { mutate: redeemReward, isPending: isRedeemingReward } = useRedeemReward();

  const handleRedeem = async () => {
    redeemReward({
      id: selectedReward._id,
      studentId
    }, {
      onSuccess: () => {
        toast.success('Reward redeemed successfully');
        handleReset(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to redeem reward');
      }
    });
  }

  const handleReset = (openDialog) => {
    setOpenDialog(openDialog);
    if (!openDialog) {
      setTimeout(() => {
        setSelectedReward(null);
      }, 0)
    }
  }

  return (
    <Dialog.Root
      open={openDialog}
      onOpenChange={handleReset}
    >
      {children && (
        <Dialog.Trigger>
          {children}
        </Dialog.Trigger>
      )}
      <Dialog.Content className='max-w-4xl' aria-describedby={undefined}>
        {selectedReward && (
          <>
            <Dialog.Title>{selectedReward.title}</Dialog.Title>
            <div className='space-y-4'>
              <Flex direction={{ initial: 'column', sm: 'row' }} align={{ sm: 'start' }} gap="4">
                <img
                  loading='lazy'
                  src={selectedReward?.image || rewardsPlaceholder}
                  alt={selectedReward?.title}
                  className="object-cover object-center w-full rounded-lg md:w-1/2 aspect-auto bg-[--accent-contrast]"
                  onError={(e) => {
                    e.currentTarget.src = rewardsPlaceholder;
                  }}
                />
                <div className='flex-1 space-y-3'>
                  <Flex align="center" gap="2">
                    <Text as='p' size="2" color="gray" className="capitalize">
                      {selectedReward.categoryId?.type}
                    </Text>
                    {selectedReward.badge && (
                      <Badge color="red" variant="soft" size="1">
                        {selectedReward.badge}
                      </Badge>
                    )}
                  </Flex>

                  <Text as='p' className="whitespace-pre-wrap">{selectedReward.description}</Text>

                  <Flex justify="between" align="center" className="p-4 bg-[--gray-a2] rounded-lg">
                    <Box>
                      <Text as='p' size="2" color="gray"> Scholarship Points Required</Text>
                      <Flex align="center" gap="1">
                        <Trophy size={16} />
                        <Text as='p' size="4" weight="bold" >
                          {selectedReward.pointsCost.toLocaleString()} SP
                        </Text>
                      </Flex>
                    </Box>
                    {role === 'student' && (
                      <Box className="text-right">
                        <Text as='p' size="2" color="gray">Your Balance</Text>
                        <Text as='p' size="3" weight="bold">
                          {userPoints?.toLocaleString() || 0}
                        </Text>
                      </Box>
                    )}
                  </Flex>

                  {selectedReward.limitedQuantity && (
                    <Callout.Root
                      variant='surface'
                      color={selectedReward.quantity === 0 ? 'gray' : 'orange'}
                    >
                      <Callout.Icon>
                        <Clock size={16} />
                      </Callout.Icon>
                      <Callout.Text>
                        {selectedReward.quantity === 0
                          ? 'This reward is currently out of stock'
                          : `Limited quantity: Only ${selectedReward.quantity} remaining`
                        }
                      </Callout.Text>
                    </Callout.Root>
                  )}

                  {selectedReward.expiryDate && (
                    <Callout.Root variant='surface' color='yellow'>
                      <Callout.Icon>
                        <Clock size={16} />
                      </Callout.Icon>
                      <Callout.Text>
                        Expires on {formatDate(selectedReward.expiryDate)}
                      </Callout.Text>
                    </Callout.Root>
                  )}
                </div>

              </Flex>
              {selectedReward.redemptionInstructions && (
                <div>
                  <Text as='p' size="2" weight="medium" mb="1" color="gray">Redemption Instructions</Text>
                  <Text as='p' className="pl-4 whitespace-pre-wrap">
                    {selectedReward.redemptionInstructions}
                  </Text>
                </div>
              )}

              {selectedReward.restrictions && (
                <div>
                  <Text as='p' size="2" weight="medium" mb="1" color="gray">Restrictions</Text>
                  <Text as='p' className="pl-4 whitespace-pre-wrap">
                    {selectedReward.restrictions}
                  </Text>
                </div>
              )}
            </div>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button disabled={isRedeemingReward} variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              {role === 'parent' && (
                <Button asChild>
                  <Link to={`/parent/rewards/create?cloneId=${selectedReward._id}`}>
                    <Copy size={16} /> Clone Reward
                  </Link>
                </Button>
              )}
              {role === 'student' && <Button
                disabled={
                  !canAfford(selectedReward.pointsCost) ||
                  isRedeemingReward ||
                  (selectedReward.limitedQuantity && selectedReward.quantity === 0)
                }
                onClick={handleRedeem}
                className='disabled:cursor-not-allowed'
              >
                {selectedReward.limitedQuantity && selectedReward.quantity === 0
                  ? 'Out of Stock'
                  : canAfford(selectedReward.pointsCost)
                    ? isRedeemingReward
                      ? 'Processing...'
                      : 'Confirm Redemption'
                    : 'Need More SP'
                }
              </Button>}
            </Flex>
          </>
        )}
      </Dialog.Content>
    </Dialog.Root >
  )
}

export default RewardsDetailsDialog
