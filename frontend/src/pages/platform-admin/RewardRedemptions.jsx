import { Badge, Button, Callout, Card, Dialog, DropdownMenu, Flex, Heading, IconButton, Select, Separator, Table, Text, TextArea, TextField } from '@radix-ui/themes';
import { AlertCircleIcon, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ClipboardList, Clock, CreditCard, Eye, Filter, Gift, Tag, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import { EmptyStateCard, Loader } from '../../components';
import { SortIcon } from '../../components/platform-admin/UserTable';
import { formatDate } from '../../utils/helperFunctions';

function RewardRedemptions() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('redemptionDate');
  const [order, setOrder] = useState('desc');
  const currentSort = { field: sort, order: order };

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    rewardId: '',
    studentId: '',
    startDate: '',
    endDate: '',
    minPoints: '',
    maxPoints: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [fulfillmentFeedback, setFulfillmentFeedback] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  // Mock data - replace with actual API call
  const isLoading = false;
  const isFetching = false;
  const isError = false;
  const error = null;

  const mockRedemptions = [
    {
      _id: '1',
      rewardId: {
        _id: 'reward_1',
        title: 'Extra Recess Time',
        pointsCost: 50,
        category: 'school',
        subcategory: 'privilege'
      },
      studentId: 'student_1',
      studentName: 'John Doe',
      studentEmail: 'john.doe@email.com',
      pointsSpent: 50,
      redemptionDate: '2024-01-15T10:30:00Z',
      redemptionCode: 'RDM-ABC123',
      status: 'pending',
      fulfillmentDate: null,
      fulfillerId: null,
      feedback: null,
      cancelReason: null,
      cancelledBy: null,
      cancelledAt: null
    },
    {
      _id: '2',
      rewardId: {
        _id: 'reward_2',
        title: 'Movie Night',
        pointsCost: 200,
        category: 'family',
        subcategory: 'experience'
      },
      studentId: 'student_2',
      studentName: 'Jane Smith',
      studentEmail: 'jane.smith@email.com',
      pointsSpent: 200,
      redemptionDate: '2024-01-14T14:20:00Z',
      redemptionCode: 'RDM-DEF456',
      status: 'fulfilled',
      fulfillmentDate: '2024-01-15T09:15:00Z',
      fulfillerId: 'parent_1',
      feedback: 'Enjoyed the movie night with family!',
      cancelReason: null,
      cancelledBy: null,
      cancelledAt: null
    },
    {
      _id: '3',
      rewardId: {
        _id: 'reward_3',
        title: 'Gift Card $10',
        pointsCost: 500,
        category: 'sponsor',
        subcategory: 'digital'
      },
      studentId: 'student_3',
      studentName: 'Mike Johnson',
      studentEmail: 'mike.johnson@email.com',
      pointsSpent: 500,
      redemptionDate: '2024-01-13T16:45:00Z',
      redemptionCode: 'RDM-GHI789',
      status: 'canceled',
      fulfillmentDate: null,
      fulfillerId: null,
      feedback: null,
      cancelReason: 'Student requested cancellation',
      cancelledBy: 'student_3',
      cancelledAt: '2024-01-14T08:30:00Z'
    },
    {
      _id: '4',
      rewardId: {
        _id: 'reward_4',
        title: 'Library Books',
        pointsCost: 75,
        category: 'school',
        subcategory: 'item'
      },
      studentId: 'student_4',
      studentName: 'Sarah Wilson',
      studentEmail: 'sarah.wilson@email.com',
      pointsSpent: 75,
      redemptionDate: '2024-01-10T11:00:00Z',
      redemptionCode: 'RDM-JKL012',
      status: 'expired',
      fulfillmentDate: null,
      fulfillerId: null,
      feedback: null,
      cancelReason: null,
      cancelledBy: null,
      cancelledAt: null
    }
  ];

  const mockData = {
    redemptions: [
      ...mockRedemptions,
      {
        _id: '5',
        rewardId: {
          _id: 'reward_5',
          title: 'Nintendo eShop Card $5',
          pointsCost: 300,
          category: 'sponsor',
          subcategory: 'digital'
        },
        studentId: 'student_5',
        studentName: 'Alex Chen',
        studentEmail: 'alex.chen@email.com',
        pointsSpent: 300,
        redemptionDate: '2024-01-16T09:30:00Z',
        redemptionCode: 'RDM-MNO345',
        status: 'pending',
        fulfillmentDate: null,
        fulfillerId: null,
        feedback: null,
        cancelReason: null,
        cancelledBy: null,
        cancelledAt: null
      },
      {
        _id: '6',
        rewardId: {
          _id: 'reward_6',
          title: 'Choose Weekend Activity',
          pointsCost: 150,
          category: 'family',
          subcategory: 'privilege'
        },
        studentId: 'student_6',
        studentName: 'Emma Davis',
        studentEmail: 'emma.davis@email.com',
        pointsSpent: 150,
        redemptionDate: '2024-01-15T15:45:00Z',
        redemptionCode: 'RDM-PQR678',
        status: 'fulfilled',
        fulfillmentDate: '2024-01-16T08:20:00Z',
        fulfillerId: 'parent_2',
        feedback: 'Great choice! We went to the zoo.',
        cancelReason: null,
        cancelledBy: null,
        cancelledAt: null
      }
    ],
    pagination: {
      total: 6,
      page: 1,
      limit: 20,
      pages: 1
    }
  };

  const { redemptions = [], pagination = {} } = mockData ?? {}

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPage(pagination.page - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination.page < pagination.pages) {
      setPage(pagination.page + 1)
    }
  }

  const handleLimitChange = (newLimit) => {
    setLimit(Number(newLimit))
    setPage(1)
  }

  const handleSort = (field) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('asc');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      rewardId: '',
      studentId: '',
      startDate: '',
      endDate: '',
      minPoints: '',
      maxPoints: ''
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
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

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'family': return 'blue';
      case 'school': return 'yellow';
      case 'sponsor': return 'purple';
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

  const confirmFulfillment = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Redemption fulfilled successfully');
      setShowFulfillDialog(false);
      setSelectedRedemption(null);
      setFulfillmentFeedback('');
    } catch (error) {
      toast.error('Failed to fulfill redemption');
    }
  };

  const confirmCancellation = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Redemption cancelled successfully');
      setShowCancelDialog(false);
      setSelectedRedemption(null);
      setCancellationReason('');
    } catch (error) {
      toast.error('Failed to cancel redemption');
    }
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
      {isFetching && !isLoading && <div className='fixed left-0 right-0 top-16'>
        <BarLoader
          color='#0090ff'
          width={'100%'}
          height={'4px'}
        />
      </div>}
      <div className='relative px-4 py-8 space-y-6 lg:px-8 xl:px-12'>

        {/* Heading */}
        <Flex justify='between' align='center'>
          <div>
            <Heading as='h1' size='6' weight='medium' mb={'1'}>Reward Redemptions</Heading>
            <Text as="p" color="gray" size="2">
              Monitor and manage reward redemptions across the platform
            </Text>
          </div>
          
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
        </Flex>

        <Separator size={'4'} />

        {/* Search and Filter Controls */}
        <Flex direction="column" gap="4" className='max-w-4xl'>
          <Flex gap="3" align="center" wrap="wrap">
            {/* Search */}
            <TextField.Root
              placeholder="Search by student, reward, or code..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="flex-1 min-w-[200px]"
            >
              <TextField.Slot>
                <ClipboardList size={16} />
              </TextField.Slot>
            </TextField.Root>

            {/* Toggle Filters */}
            <Button
              variant="outline"
              color="gray"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge color="blue" variant="solid" size="1" ml="1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
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
            <Card className="p-4">
              <Flex direction="column" gap="4">
                <Flex gap="3" wrap="wrap">
                  {/* Status Filter */}
                  <Select.Root
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <Select.Trigger placeholder="Status" className="min-w-[120px]" />
                    <Select.Content>
                      <Select.Item value="all">All Status</Select.Item>
                      <Select.Item value="pending">Pending</Select.Item>
                      <Select.Item value="fulfilled">Fulfilled</Select.Item>
                      <Select.Item value="canceled">Canceled</Select.Item>
                      <Select.Item value="expired">Expired</Select.Item>
                    </Select.Content>
                  </Select.Root>

                  {/* Date Range */}
                  <TextField.Root
                    placeholder="Start Date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    type="date"
                    className="min-w-[140px]"
                  />
                  <TextField.Root
                    placeholder="End Date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    type="date"
                    className="min-w-[140px]"
                  />
                </Flex>

                <Flex gap="3" wrap="wrap">
                  {/* Points Range */}
                  <TextField.Root
                    placeholder="Min Points"
                    value={filters.minPoints}
                    onChange={(e) => handleFilterChange('minPoints', e.target.value)}
                    className="min-w-[100px]"
                    type="number"
                  />
                  <TextField.Root
                    placeholder="Max Points"
                    value={filters.maxPoints}
                    onChange={(e) => handleFilterChange('maxPoints', e.target.value)}
                    className="min-w-[100px]"
                    type="number"
                  />
                </Flex>
              </Flex>
            </Card>
          )}
        </Flex>

        {/* Stats Cards */}
        <Flex gap="4" wrap="wrap">
          <Card className="flex-1 min-w-[200px]">
            <Flex direction="column" gap="2" p="4">
              <Flex align="center" gap="2">
                <ClipboardList size={16} color="var(--blue-11)" />
                <Text size="2" color="gray">Total Redemptions</Text>
              </Flex>
              <Text size="6" weight="bold" color="blue">
                {pagination.total || 0}
              </Text>
            </Flex>
          </Card>

          <Card className="flex-1 min-w-[200px]">
            <Flex direction="column" gap="2" p="4">
              <Flex align="center" gap="2">
                <Clock size={16} color="var(--yellow-11)" />
                <Text size="2" color="gray">Pending</Text>
              </Flex>
              <Text size="6" weight="bold" color="yellow">
                {redemptions.filter(r => r.status === 'pending').length}
              </Text>
            </Flex>
          </Card>

          <Card className="flex-1 min-w-[200px]">
            <Flex direction="column" gap="2" p="4">
              <Flex align="center" gap="2">
                <Check size={16} color="var(--green-11)" />
                <Text size="2" color="gray">Fulfilled</Text>
              </Flex>
              <Text size="6" weight="bold" color="green">
                {redemptions.filter(r => r.status === 'fulfilled').length}
              </Text>
            </Flex>
          </Card>

          <Card className="flex-1 min-w-[200px]">
            <Flex direction="column" gap="2" p="4">
              <Flex align="center" gap="2">
                <CreditCard size={16} color="var(--purple-11)" />
                <Text size="2" color="gray">Points Spent</Text>
              </Flex>
              <Text size="6" weight="bold" color="purple">
                {redemptions.reduce((sum, r) => sum + r.pointsSpent, 0)}
              </Text>
            </Flex>
          </Card>
        </Flex>

        {/* Table */}
        <Card>
          {isLoading ? (
            <Loader />
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
            <>
              <Table.Root>
                <Table.Header>
                  <Table.Row className="border-b border-[--gray-6]">
                    {columns.map((column) => (
                      <Table.ColumnHeaderCell key={column.accessorKey}>
                        {column.sortable ? (
                          <Button
                            variant="ghost"
                            size="2"
                            onClick={() => handleSort(column.accessorKey)}
                            className="font-medium"
                          >
                            {column.header}
                            <SortIcon
                              currentSort={currentSort}
                              columnName={column.accessorKey}
                            />
                          </Button>
                        ) : (
                          <Text weight="medium" size="2">
                            {column.header}
                          </Text>
                        )}
                      </Table.ColumnHeaderCell>
                    ))}
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {redemptions.map((redemption) => (
                    <Table.Row key={redemption._id} className="hover:bg-[--gray-a2]">
                      <Table.Cell>
                        <Flex direction="column" gap="1">
                          <Text weight="medium" size="2">
                            {redemption.studentName}
                          </Text>
                          <Text size="1" color="gray">
                            {redemption.studentEmail}
                          </Text>
                        </Flex>
                      </Table.Cell>

                      <Table.Cell>
                        <Flex direction="column" gap="1">
                          <Text weight="medium" size="2">
                            {redemption.rewardId.title}
                          </Text>
                          <Flex gap="1">
                            <Badge color={getCategoryBadgeColor(redemption.rewardId.category)} variant="soft" size="1">
                              {redemption.rewardId.category}
                            </Badge>
                            <Badge color="gray" variant="outline" size="1">
                              {redemption.rewardId.subcategory}
                            </Badge>
                          </Flex>
                        </Flex>
                      </Table.Cell>

                      <Table.Cell>
                        <Text weight="medium" size="2">
                          {redemption.pointsSpent} pts
                        </Text>
                      </Table.Cell>

                      <Table.Cell>
                        <Badge color={getStatusBadgeColor(redemption.status)} variant="soft">
                          {redemption.status}
                        </Badge>
                      </Table.Cell>

                      <Table.Cell>
                        <Text size="2" color="gray">
                          {formatDate(redemption.redemptionDate)}
                        </Text>
                      </Table.Cell>

                      <Table.Cell>
                        <Text size="2" weight="medium" className="font-mono">
                          {redemption.redemptionCode}
                        </Text>
                      </Table.Cell>

                      <Table.Cell>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger>
                            <IconButton variant="ghost" size="1">
                              <Eye size={14} />
                            </IconButton>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content>
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
              <Flex justify="between" align="center" p="4" className="border-t border-[--gray-6]">
                <Flex align="center" gap="3">
                  <Text size="2" color="gray">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} redemptions
                  </Text>
                  <Select.Root value={limit.toString()} onValueChange={handleLimitChange}>
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="10">10 per page</Select.Item>
                      <Select.Item value="20">20 per page</Select.Item>
                      <Select.Item value="50">50 per page</Select.Item>
                      <Select.Item value="100">100 per page</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex align="center" gap="2">
                  <IconButton
                    variant="outline"
                    size="2"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(1)}
                  >
                    <ChevronsLeft size={16} />
                  </IconButton>
                  <IconButton
                    variant="outline"
                    size="2"
                    disabled={pagination.page <= 1}
                    onClick={handlePreviousPage}
                  >
                    <ChevronLeft size={16} />
                  </IconButton>

                  <Flex align="center" gap="1">
                    <Text size="2">
                      Page {pagination.page} of {pagination.pages}
                    </Text>
                  </Flex>

                  <IconButton
                    variant="outline"
                    size="2"
                    disabled={pagination.page >= pagination.pages}
                    onClick={handleNextPage}
                  >
                    <ChevronRight size={16} />
                  </IconButton>
                  <IconButton
                    variant="outline"
                    size="2"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPage(pagination.pages)}
                  >
                    <ChevronsRight size={16} />
                  </IconButton>
                </Flex>
              </Flex>
            </>
          )}
        </Card>

        {/* Details Dialog */}
        <Dialog.Root open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <Dialog.Content className="max-w-2xl">
            <Dialog.Title>Redemption Details</Dialog.Title>
            {selectedRedemption && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text size="2" weight="medium" color="gray">Student</Text>
                    <Text size="3">{selectedRedemption.studentName}</Text>
                    <Text size="2" color="gray">{selectedRedemption.studentEmail}</Text>
                  </div>
                  <div>
                    <Text size="2" weight="medium" color="gray">Reward</Text>
                    <Text size="3">{selectedRedemption.rewardId.title}</Text>
                    <Text size="2" color="gray">{selectedRedemption.pointsSpent} points</Text>
                  </div>
                  <div>
                    <Text size="2" weight="medium" color="gray">Status</Text>
                    <Badge color={getStatusBadgeColor(selectedRedemption.status)} variant="soft">
                      {selectedRedemption.status}
                    </Badge>
                  </div>
                  <div>
                    <Text size="2" weight="medium" color="gray">Redemption Code</Text>
                    <Text size="3" className="font-mono">{selectedRedemption.redemptionCode}</Text>
                  </div>
                  <div>
                    <Text size="2" weight="medium" color="gray">Redeemed On</Text>
                    <Text size="3">{formatDate(selectedRedemption.redemptionDate)}</Text>
                  </div>
                  {selectedRedemption.fulfillmentDate && (
                    <div>
                      <Text size="2" weight="medium" color="gray">Fulfilled On</Text>
                      <Text size="3">{formatDate(selectedRedemption.fulfillmentDate)}</Text>
                    </div>
                  )}
                </div>
                {selectedRedemption.feedback && (
                  <div>
                    <Text size="2" weight="medium" color="gray">Feedback</Text>
                    <Text size="3">{selectedRedemption.feedback}</Text>
                  </div>
                )}
                {selectedRedemption.cancelReason && (
                  <div>
                    <Text size="2" weight="medium" color="gray">Cancellation Reason</Text>
                    <Text size="3">{selectedRedemption.cancelReason}</Text>
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
              <Text size="2">
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
                />
              </div>
            </div>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
              <Button color="green" onClick={confirmFulfillment}>
                <Check size={16} /> Fulfill
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Cancel Dialog */}
        <Dialog.Root open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <Dialog.Content className="max-w-lg">
            <Dialog.Title>Cancel Redemption</Dialog.Title>
            <div className="space-y-4">
              <Text size="2">
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
                />
              </div>
            </div>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
              <Button 
                color="red" 
                onClick={confirmCancellation}
                disabled={!cancellationReason.trim()}
              >
                <X size={16} /> Cancel Redemption
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </div>
  )
}

export default RewardRedemptions 