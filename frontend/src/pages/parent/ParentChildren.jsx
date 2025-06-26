import { Avatar, Box, Button, Callout, Card, Dialog, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import { AlertCircleIcon, ArrowDownRight, ArrowUpRight, Coins, Eye, ListIcon, Plus, TrendingUp, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router';
import { useChildren } from '../../api/parent/parent.queries';
import { useGetStudentTransaction, usePointsDetailsById } from '../../api/points/points.queries';
import { EmptyStateCard, Loader } from '../../components';
import { formatDate } from '../../utils/helperFunctions';

function ParentChildren() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: childrenData, isLoading, isError, error } = useChildren()
  const { data: children = [] } = childrenData ?? {}; // Safe destructuring with fallback

  // Fetch points data only when a child is selected
  const { data, isFetching: isLoadingPoints, isError: isErrorPoints, error: errorPoints } = usePointsDetailsById(selectedChild?._id);
  const pointAccount = data?.data ?? {}; // Safe data extraction with fallback

  // Fetch transaction history with pagination support
  const { data: transactionData,
    isFetching: isLoadingTransactionData,
    isError: isErrorTransactions,
    error: errorTransactions,
  } = useGetStudentTransaction(selectedChild?._id, {
    limit: 5
  });

  // Flatten paginated transaction data safely
  const transactions = transactionData?.pages?.flatMap(page => page?.data?.transactions || []) || [];

  // Handler for opening points modal with selected child
  const handleViewPoints = (child) => {
    setSelectedChild(child);
    setIsModalOpen(true);
  };

  return (
    <Box className='mx-auto max-w-5xl'>
      <Flex justify='between' align='center' gap='2' wrap='wrap'>
        <div>
          {/* Header Section */}
          <Heading size='6' mb='2'>
            My Children
          </Heading>

          {/* General helper text */}
          <Text as='p' size='3' color='gray'>
            Manage your children's accounts and view their progress.
          </Text>
        </div>
        <LinkChildButton />
      </Flex>
      <Separator my='4' size='4' />

      {/* Children List */}
      <Box className='space-y-4'>
        {isLoading ? (
          <Flex justify='center' align='center'><Loader /></Flex>
        ) : isError ? (
          <Callout.Root color='red'>
            <Callout.Icon>
              <AlertCircleIcon size={16} />
            </Callout.Icon>
            <Callout.Text>
              {error?.response?.data?.message || error?.message || 'Something went wrong'}
            </Callout.Text>
          </Callout.Root>
        ) : (
          children.length > 0 ? (
            <>
              {/* Render each child as a card with avatar and actions */}
              {children.map((child) => (
                <Card
                  key={child?._id}
                  size={'2'}
                  className='shadow-md'
                >
                  <Flex justify="between" align="center" gap='2' wrap='wrap'>
                    {/* Child Info */}
                    <Flex align="start" gap="2">
                      <Avatar
                        size="4"
                        src={child?.userId?.avatar}
                        fallback={child?.userId?.firstName?.[0] || "C"} // Safe fallback for missing names
                        radius="full"
                      />
                      <Box>
                        <Text as='p' weight="medium">
                          {child?.userId?.firstName || ''} {child?.userId?.lastName || ''} {/* Safe name rendering */}
                        </Text>
                        <Text size='2' color='gray'>
                          {child?.userId?.email || 'No email'}
                        </Text>
                        <Text as='p' size="2" color="gray" mt='1'>
                          {child?.grade || 'No grade'} {child?.schoolId?.name && `• ${child.schoolId.name}`} {/* Conditional school display */}
                        </Text>
                      </Box>
                    </Flex>

                    {/* Actions */}
                    <Flex align="center" gap="3">
                      <Button
                        variant="outline"
                        size="2"
                        className="gap-2"
                        onClick={() => handleViewPoints(child)}
                      >
                        <Eye size={16} /> View Points
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              ))}
              {/* Display count of visible children */}
              <Text as='p' size='1' color='gray' align={'center'}>
                Showing {children.length} of {children.length} children
              </Text>
            </>
          ) : (
            /* Empty State */
            <EmptyStateCard
              action={<LinkChildButton />}
              title='No children linked yet'
              description="Link your children's accounts to monitor their progress"
              icon={<Users size={16} />}
            />
          ))}
      </Box>

      {/* Points Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Content maxWidth="650px">
          <Dialog.Title>
            Points Overview
          </Dialog.Title>
          <Dialog.Description size="2" mb="4">
            {/* Selected child info header */}
            <Flex align="center" gap="2">
              <Avatar
                size="3"
                src={selectedChild?.userId?.avatar}
                fallback={selectedChild?.userId?.firstName?.[0] || "C"} // Safe fallback
                radius="full"
              />
              <div>
                <Text as='p' size="2" weight={'medium'}>
                  {selectedChild?.userId?.firstName || ''} {selectedChild?.userId?.lastName || ''} {/* Safe name display */}
                </Text>
                <Text as='p' size="2" color="gray" >
                  {selectedChild?.userId?.email || 'No email'}
                </Text>
              </div>
            </Flex>
          </Dialog.Description>
          <Box className="mt-6 space-y-6">
            {isLoadingPoints ? (
              <Flex justify='center' align='center'><Loader /></Flex>
            ) : isErrorPoints ? (
              <Callout.Root color='red'>
                <Callout.Icon>
                  <AlertCircleIcon size={16} />
                </Callout.Icon>
                <Callout.Text>
                  {errorPoints?.response?.data?.message || errorPoints?.message || 'Something went wrong'}
                </Callout.Text>
              </Callout.Root>
            ) : (
              <>
                {/* Points Balance Display */}
                <Box className="p-4 rounded-lg" style={{ backgroundColor: 'var(--blue-a2)' }}>
                  <Flex align="center" justify="between">
                    <Box>
                      <Text as='p' size="2" color="gray" className="mb-2">
                        Current Balance
                      </Text>
                      <Flex align="center" gap="2">
                        <Text size="6" weight="bold" style={{ color: 'var(--blue-11)' }}>
                          {pointAccount?.currentBalance || 0} {/* Safe number display */}
                        </Text>
                        <Coins className="w-7 h-7" style={{ color: 'var(--blue-9)' }} />
                      </Flex>
                    </Box>
                    <Box className="text-right">
                      <Text as='p' size="2" color="gray" className="mb-2">
                        This Week
                      </Text>
                      <Flex align="center" gap={'1'}>
                        <TrendingUp className="w-5 h-5" style={{ color: 'var(--green-9)' }} />
                        <Text size="5" weight="bold" style={{ color: 'var(--green-11)' }}>
                          +{pointAccount?.statistics?.weekly?.earned || 0} {/* Safe nested property access */}
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              </>
            )}

            {/* Recent Transactions */}
            <Box className='space-y-4'>

              {isLoadingTransactionData ? (
                <Flex justify='center' align='center'><Loader /></Flex>
              ) : isErrorTransactions ? (
                <Callout.Root color='red'>
                  <Callout.Icon>
                    <AlertCircleIcon size={16} />
                  </Callout.Icon>
                  <Callout.Text>
                    {errorTransactions?.response?.data?.message || errorTransactions?.message || 'Something went wrong'}
                  </Callout.Text>
                </Callout.Root>
              ) : transactions?.length > 0 ? (
                <>
                  <Text as='p' weight="medium">
                    Recent Transactions
                  </Text>
                  {/* Render each transaction with appropriate styling */}
                  {transactions?.map((transaction, index) => ( // Added index for unique keys
                    <React.Fragment key={`${transaction?._id || index}`}> {/* Safe key generation */}
                      <Flex align="start" gap="2" justify='between'>
                        <div className='flex gap-2 items-start'>
                          {/* Transaction type icon with conditional styling */}
                          {transaction?.type === 'earned' ?
                            <div className='p-2 rounded-full' style={{ backgroundColor: 'var(--green-a3)' }}>
                              <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--green-9)' }} />
                            </div> :
                            <div className='p-2 rounded-full' style={{ backgroundColor: 'var(--red-a3)' }}>
                              <ArrowDownRight className="w-4 h-4" style={{ color: 'var(--red-9)' }} />
                            </div>
                          }
                          <div>
                            <Text as='p' size={'2'}>
                              {transaction?.description || 'No description'} {/* Safe description display */}
                            </Text>
                            <Text size="1" color="gray">
                              {transaction?.createdAt ? formatDate(transaction.createdAt) : 'Unknown date'} {/* Safe date formatting */}
                            </Text>

                          </div>
                        </div>
                        {/* Transaction amount with type-based coloring */}
                        <Text
                          color={transaction?.type === 'earned' ? 'green' : 'red'}
                          size={'2'}
                          weight={'medium'}
                        >
                          {transaction?.type === 'spent' ? '' : '+'}{transaction?.amount || 0} {/* Safe amount display */}
                        </Text>
                      </Flex>
                      <Separator size='4' />
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <EmptyStateCard
                  title='No transactions found'
                  description="No transactions found for this child"
                  icon={<ListIcon size={16} />}
                />
              )}
            </Box>

            {/* Modal action buttons */}
            <Flex justify='end' align='center' gap='2'>
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Close
                </Button>
              </Dialog.Close>
            </Flex>
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </Box >
  );
}

export default ParentChildren;

// Link Child Button Component
function LinkChildButton() {
  return (
    <Button asChild>
      <Link to='/parent/settings/linked-accounts'>
        <Plus size={16} /> Link Child
      </Link>
    </Button>
  )
}