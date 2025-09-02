import { Badge, Button, Callout, Card, Code, Dialog, DropdownMenu, Flex, Heading, IconButton, Select, Separator, Table, Text, TextArea, TextField } from '@radix-ui/themes';
import { AlertCircleIcon, Check, Eye, Filter, Gift, Mail, MoreHorizontal, Tag, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import { useCancelRedemption, useFulfillRedemption } from '../../api/rewards/rewards.mutations';
import { useGetRedemptions } from '../../api/rewards/rewards.queries';
import { EmptyStateCard, Loader, Pagination } from '../../components';
import { SortIcon } from '../../components/platform-admin/UserTable';
import { formatDate } from '../../utils/helperFunctions';
import PageHeader from '../../components/PageHeader';

function RewardRedemptions() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('redemptionDate');
  const [order, setOrder] = useState('desc');
  const currentSort = { field: sort, order: order };

  // Filter states
  const [filters, setFilters] = useState({
    status: null,
    rewardId: null,
    studentId: null,
    startDate: null,
    endDate: null,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [fulfillmentFeedback, setFulfillmentFeedback] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  // Build query parameters
  const queryParams = {
    page,
    limit,
    sort,
    order,
    ...(filters.status && filters.status !== 'all' && { status: filters.status }),
    ...(filters.rewardId && { rewardId: filters.rewardId }),
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  };

  // API Queries
  const {
    data: redemptionsData,
    isLoading,
    isFetching,
    isError,
    error
  } = useGetRedemptions(queryParams);

  // Mutations
  const { mutate: fulfillRedemption, isPending: isFulfillingRedemption } = useFulfillRedemption();
  const { mutate: cancelRedemption, isPending: isCancellingRedemption } = useCancelRedemption();

  const { redemptions = [], pagination = {} } = redemptionsData?.data ?? {}

  // function to handle page change
  const handlePageChange = (page) => {
    setPage(page);
  };

  // function to handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage, newCurrentPage) => {
    setLimit(newItemsPerPage);
    setPage(newCurrentPage);
  };

  const handleSort = (field) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('asc');
    }
    setPage(1); // Reset to first page when sorting changes
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      status: null,
      rewardId: null,
      studentId: null,
      startDate: null,
      endDate: null,
    });
    setPage(1); // Reset to first page when clearing filters
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== null).length;
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'fulfilled': return 'green';
      case 'canceled': return 'red';
      case 'expired': return 'gray';
      default: return 'gray';
    }
  };

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
        feedback: fulfillmentFeedback
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
        reason: cancellationReason
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

  const columns = [
    {
      header: 'Student',
      accessorKey: 'studentName',
    },
    {
      header: 'Reward',
      accessorKey: 'rewardTitle',
    },
    {
      header: 'Points',
      accessorKey: 'pointsSpent',
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
    },
    {
      header: 'Redeemed',
      accessorKey: 'redemptionDate',
      sortable: true,
    },
    {
      header: 'Code',
      accessorKey: 'redemptionCode',
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
    }
  ]

  return (
    <div>
      {isFetching && !isLoading && <div className='fixed right-0 left-0 top-16'>
        <BarLoader
          color='#0090ff'
          width={'100%'}
          height={'4px'}
        />
      </div>}
      <div className='relative space-y-6'>
        {/* Heading */}
        <PageHeader
          title='Reward Redemptions'
          description='Monitor and manage reward redemptions across the platform'
        >
          {/* Navigation buttons */}
          <Flex gap="2" align="center">
            <Button variant="outline" color="gray" asChild>
              <Link to='/platform-admin/dashboard/rewards'>
                <Gift size={16} /> Rewards
              </Link>
            </Button>
            <Button variant="outline" color="gray" asChild>
              <Link to='/platform-admin/dashboard/reward-categories'>
                <Tag size={16} /> Categories
              </Link>
            </Button>
          </Flex>
        </PageHeader>

        <Separator size={'4'} />

        {/* Search and Filter Controls */}
        <Flex direction="column" gap="4" className='max-w-4xl'>
          <Flex gap="3" align="center" wrap="wrap">

            {/* Toggle Filters */}
            <Button
              variant="outline"
              color="gray"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters {" "}
              {getActiveFiltersCount() > 0 && getActiveFiltersCount()}
            </Button>

            {/* Clear Filters */}
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="outline"
                color="red"
                onClick={clearFilters}
                size="2"
              >
                <X size={16} />
                Clear
              </Button>
            )}
          </Flex>

          {/* Advanced Filters */}
          {showFilters && (
            <Card>
              <Flex direction="column" gap="4">
                <Flex gap="3" wrap="wrap">
                  {/* Status Filter */}
                  <Select.Root
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <Select.Trigger placeholder="Status" className='capitalize' variant='classic'>
                      <Text color='gray' weight={'medium'}>Status: </Text>
                      {filters.status === null ? 'All' : filters.status}
                    </Select.Trigger>
                    <Select.Content variant='soft' position='popper'>
                      <Select.Item value={null}>All</Select.Item>
                      <Select.Item value="pending">Pending</Select.Item>
                      <Select.Item value="fulfilled">Fulfilled</Select.Item>
                      <Select.Item value="canceled">Canceled</Select.Item>
                      <Select.Item value="expired">Expired</Select.Item>
                    </Select.Content>
                  </Select.Root>

                  {/* Date Range */}
                  <label className='flex gap-2 items-center'>
                    <Text size={'1'}>Start Date: </Text>
                    <TextField.Root
                      placeholder="Start Date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      type="date"
                      className="min-w-[140px]"
                    />
                  </label>
                  <label className='flex gap-2 items-center'>
                    <Text size={'1'}>End Date: </Text>
                    <TextField.Root
                      placeholder="End Date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      type="date"
                      className="min-w-[140px]"
                    />
                  </label>
                </Flex>
              </Flex>
            </Card>
          )}
        </Flex>

        {/* Table */}
        {isLoading ? (
          <Flex justify='center' align='center'>
            <Loader />
          </Flex>
        ) : isError ? (
          <Callout.Root color="red" className="m-4">
            <Callout.Icon>
              <AlertCircleIcon size={16} />
            </Callout.Icon>
            <Callout.Text>
              {error?.response?.data?.message || error?.message || 'Failed to load redemptions'}
            </Callout.Text>
          </Callout.Root>
        ) : redemptions.length === 0 ? (
          <EmptyStateCard
            title="No redemptions found"
            description="No reward redemptions have been made yet"
            icon={<Gift size={48} />}
          />
        ) : (
          <Card size={'2'} className='shadow [--card-border-width:0px]'>
            <Table.Root variant='surface'>
              <Table.Header>
                <Table.Row>
                  {columns.map((column) => (
                    <Table.ColumnHeaderCell key={column.accessorKey}>
                      {column.sortable ? (
                        <Button
                          variant="ghost"
                          size="2"
                          onClick={() => handleSort(column.accessorKey)}
                          className="font-medium"
                          color='gray'
                          highContrast
                        >
                          {column.header}
                          <SortIcon
                            currentSort={currentSort}
                            columnName={column.accessorKey}
                          />
                        </Button>
                      ) : (
                        <Text as='p' weight="medium" size="2">
                          {column.header}
                        </Text>
                      )}
                    </Table.ColumnHeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {redemptions.map((redemption) => (
                  <Table.Row key={redemption._id} className="hover:bg-[--gray-a3] odd:bg-[--gray-a2]">
                    <Table.Cell>
                      <Flex direction="column" gap="1">
                        <Text as='p' weight="medium" size="2">
                          {redemption?.studentInfo?.firstName || 'N/A'}
                        </Text>
                        <Text as='p' size="1" color="gray">
                          {redemption?.studentInfo?.email || 'N/A'}
                        </Text>
                      </Flex>
                    </Table.Cell>

                    <Table.Cell>
                      <Flex direction="column" gap="1" className='whitespace-nowrap'>
                        <Text as='p' size="2">
                          {redemption.rewardId.title}
                        </Text>
                        <Flex gap="1">
                          <Badge variant="soft" size="1">
                            {redemption.rewardId?.category || 'N/A'}
                          </Badge>
                          {redemption.rewardId?.subcategory && (
                            <Badge color="gray" variant="outline" size="1">
                              {redemption.rewardId.subcategory}
                            </Badge>
                          )}
                        </Flex>
                      </Flex>
                    </Table.Cell>

                    <Table.Cell>
                      {redemption.pointsSpent} pts
                    </Table.Cell>

                    <Table.Cell>
                      <Badge color={getStatusBadgeColor(redemption.status)} variant="soft">
                        {redemption.status}
                      </Badge>
                    </Table.Cell>

                    <Table.Cell>
                      {formatDate(redemption.redemptionDate)}
                    </Table.Cell>

                    <Table.Cell className='text-nowrap'>
                      <Code variant='soft' className='select-all'>{redemption.redemptionCode}</Code>
                    </Table.Cell>

                    <Table.Cell>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <IconButton highContrast variant="ghost" color="gray">
                            <MoreHorizontal size={14} />
                          </IconButton>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content variant='soft'>
                          <DropdownMenu.Item onClick={() => handleViewDetails(redemption)}>
                            <Eye size={14} />
                            View Details
                          </DropdownMenu.Item>
                          {redemption.status === 'pending' && (
                            <>
                              <DropdownMenu.Separator />
                              <DropdownMenu.Item onClick={() => handleFulfillRedemption(redemption)}>
                                <Check size={14} />
                                Fulfill
                              </DropdownMenu.Item>
                              <DropdownMenu.Item color="red" onClick={() => handleCancelRedemption(redemption)}>
                                <X size={14} />
                                Cancel
                              </DropdownMenu.Item>
                            </>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>

            {/* Pagination */}
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
              className='mt-4'
            />
          </Card>
        )}

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
      </div>
    </div>
  )
}

export default RewardRedemptions 