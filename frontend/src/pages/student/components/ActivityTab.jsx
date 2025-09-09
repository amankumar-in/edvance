import { Badge, Button, Callout, Card, Flex, IconButton, Select, Spinner, Text, Tooltip } from '@radix-ui/themes';
import { AlertCircleIcon, Filter, FunnelX, Inbox } from 'lucide-react';
import React, { useState } from 'react';
import { useGetStudentTransaction } from '../../../api/points/points.queries';
import { EmptyStateCard, Loader } from '../../../components';
import { formatDate } from '../../../utils/helperFunctions';

const ActivityTab = ({
  getTransactionIcon,
  getStatusColor,
  formatSource,
  studentId
}) => {
  const [sourceFilter, setSourceFilter] = useState('all')
  const [transactionFilter, setTransactionFilter] = useState('all')
  const hasFilters = sourceFilter !== 'all' || transactionFilter !== 'all'

  const { data, isLoading, isFetchingNextPage, isError, error, fetchNextPage, hasNextPage, isFetching } = useGetStudentTransaction(studentId, {
    source: sourceFilter === 'all' ? undefined : sourceFilter,
    type: transactionFilter === 'all' ? undefined : transactionFilter
  })

  const transactions = data?.pages?.flatMap(page => page?.data?.transactions || []);

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
    <Card className="space-y-6 card_no_border" size='2'>
      {/* Filters */}
      <div>
        <Flex justify="between" align="center" className="mb-4">
          <Text as='p' size="5" weight="bold" style={{ color: 'var(--gray-12)' }}>
            All Activity
          </Text>
          <Text as='p' size="2" color="gray">
            {transactions?.length} {transactions?.length === 1 ? "activity" : "activities"}
          </Text>
        </Flex>
        <div className="flex flex-wrap gap-3 items-center">
          <Select.Root disabled={isFetching} value={transactionFilter} onValueChange={setTransactionFilter}>
            <Select.Trigger placeholder="Type" />
            <Select.Content variant='soft' position='popper'>
              <Select.Item value="all">All Types</Select.Item>
              <Select.Item value="earned">Earned</Select.Item>
              <Select.Item value="spent">Spent</Select.Item>
              <Select.Item value="adjusted">Adjusted</Select.Item>
            </Select.Content>
          </Select.Root>
          <Select.Root disabled={isFetching} value={sourceFilter} onValueChange={setSourceFilter}>
            <Select.Trigger placeholder="Source" />
            <Select.Content variant='soft' position='popper'>
              <Select.Item value="all">All Sources</Select.Item>
              <Select.Item value="task">Task</Select.Item>
              <Select.Item value="attendance">Attendance</Select.Item>
              <Select.Item value="badge">Badge</Select.Item>
              <Select.Item value="behavior">Behavior</Select.Item>
              <Select.Item value="redemption">Redemption</Select.Item>
              <Select.Item value="manual_adjustment">Manual Adjustment</Select.Item>
            </Select.Content>
          </Select.Root>
          <Tooltip content='Remove filters'>
            <IconButton
              variant='ghost'
              color='gray'
              onClick={() => {
                setSourceFilter('all');
                setTransactionFilter('all');
              }}
            >
              <FunnelX size={'16'} />
            </IconButton>
          </Tooltip>
          {isFetching && <Spinner />}
        </div>
      </div>

      {/* Activity Cards */}
      <div className="space-y-3">
        {transactions?.map(transaction => (
          <Card key={transaction?._id} className="transition-shadow hover:shadow-md" size='2'>
            <Flex justify="between" align="start" wrap="wrap" gap="3">
              <Flex align="start" gap="3">
                <div className="p-2 rounded-full" style={{
                  backgroundColor: transaction?.type === 'earned' ? 'var(--green-a3)' :
                    transaction?.type === 'spent' ? 'var(--red-a3)' : 'var(--orange-a3)'
                }}>
                  {getTransactionIcon(transaction?.type)}
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <Text as='p' size="3" weight="medium" className="block">
                    {transaction?.description}
                  </Text>
                  <Flex align="center" gap="2" className="flex-wrap mt-1">
                    <Badge color={getStatusColor(transaction?.type)} variant="soft" size="1">
                      {transaction?.type}
                    </Badge>
                    <Badge color="gray" variant="outline" size="1">
                      {formatSource(transaction?.source)}
                    </Badge>
                    <Text as='p' size="1" color="gray">{transaction?.awardedByRole}</Text>
                    <Text as='p' size="1" color="gray">•</Text>
                    <Text as='p' size="1" color="gray">{formatDate(transaction?.createdAt, {
                      dateStyle: "medium", timeStyle: "short"
                    })}</Text>
                  </Flex>
                </div>
              </Flex>
              <div className="flex-1 ml-4 text-right text-nowrap">
                <Text
                  as='p'
                  size="4"
                  weight="bold"
                  style={{ color: transaction?.type === 'spent' ? 'var(--red-11)' : 'var(--green-11)' }}
                >
                  {transaction?.type === 'spent' ? '' : '+'}{transaction?.amount}
                </Text>
                <Text as='p' size="1" color="gray" display="block" mt={'1'}>
                  Balance: {transaction?.balanceAfter}
                </Text>
              </div>
            </Flex>
          </Card>
        ))}
        {transactions?.length === 0 && (
          <EmptyStateCard
            title="No Activity Found"
            description={
              hasFilters
                ? "No results match your current filters."
                : "There's nothing to show right now."
            }
            icon={hasFilters
              ? <Filter size={32} className="text-[--accent-9]" />
              : <Inbox size={32} className="text-[--accent-9]" />}
          />
        )}
      </div>

      {isFetchingNextPage && (
        <Flex justify='center' align='center'>
          <Loader />
        </Flex>
      )}

      {hasNextPage && !isFetchingNextPage && (
        <div className='text-center'>
          <Button
            onClick={() => fetchNextPage()}
            variant='surface'
          >
            Load more
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ActivityTab; 