import {
  AlertDialog,
  Badge,
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Select,
  Separator,
  Table,
  Text,
  TextField,
  Tooltip
} from '@radix-ui/themes';
import {
  AlertCircleIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Crown,
  Eye,
  Filter,
  Gift,
  PencilIcon,
  Plus,
  Tag,
  TrashIcon,
  Users,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import { EmptyStateCard, Loader } from '../../components';
import { SortIcon } from '../../components/platform-admin/UserTable';
import { formatDate } from '../../utils/helperFunctions';

const Rewards = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const currentSort = { field: sort, order: order };

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subcategory: '',
    categoryId: '',
    creatorType: '',
    schoolId: '',
    classId: '',
    minPoints: '',
    maxPoints: '',
    isActive: '',
    limitedQuantity: '',
    expiryDate: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  // Mock data - replace with actual API call using useGetRewards
  const isLoading = false;
  const isFetching = false;
  const isError = false;
  const error = null;

  const mockRewards = [
    {
      _id: '1',
      title: 'Extra Recess Time',
      description: 'Get 15 minutes of extra recess time to play with friends',
      category: 'school',
      subcategory: 'privilege',
      categoryName: 'School',
      subcategoryName: 'Privilege',
      pointsCost: 50,
      creatorType: 'school',
      creatorId: 'school_admin_1',
      schoolId: 'school_1',
      limitedQuantity: false,
      quantity: null,
      expiryDate: null,
      isActive: true,
      createdAt: '2024-01-15T00:00:00Z',
      redemptionCount: 12
    },
    {
      _id: '2', 
      title: 'Family Movie Night',
      description: 'Family movie night with popcorn and favorite snacks',
      category: 'family',
      subcategory: 'experience',
      categoryName: 'Family',
      subcategoryName: 'Experience',
      pointsCost: 200,
      creatorType: 'parent',
      creatorId: 'parent_1',
      limitedQuantity: true,
      quantity: 3,
      expiryDate: '2024-03-01T00:00:00Z',
      isActive: true,
      createdAt: '2024-01-10T00:00:00Z',
      redemptionCount: 5
    },
    {
      _id: '3',
      title: '$10 Amazon Gift Card',
      description: '$10 Amazon gift card for online purchases',
      category: 'sponsor',
      subcategory: 'digital',
      categoryName: 'Sponsor',
      subcategoryName: 'Digital',
      pointsCost: 500,
      creatorType: 'system',
      creatorId: 'system',
      limitedQuantity: true,
      quantity: 0,
      expiryDate: null,
      isActive: false,
      createdAt: '2024-01-05T00:00:00Z',
      redemptionCount: 25
    },
    {
      _id: '4',
      title: 'Library Helper Badge',
      description: 'Special badge and recognition for helping in the library',
      category: 'school',
      subcategory: 'privilege',
      categoryName: 'School',
      subcategoryName: 'Privilege',
      pointsCost: 75,
      creatorType: 'teacher',
      creatorId: 'teacher_1',
      schoolId: 'school_1',
      classId: 'class_1',
      limitedQuantity: true,
      quantity: 5,
      expiryDate: '2024-06-01T00:00:00Z',
      isActive: true,
      createdAt: '2024-01-12T00:00:00Z',
      redemptionCount: 3
    },
    {
      _id: '5',
      title: 'Nintendo eShop Card $5',
      description: '$5 Nintendo eShop gift card for games',
      category: 'sponsor',
      subcategory: 'digital',
      categoryName: 'Sponsor',
      subcategoryName: 'Digital',
      pointsCost: 300,
      creatorType: 'system',
      creatorId: 'system',
      limitedQuantity: true,
      quantity: 10,
      expiryDate: '2024-12-31T00:00:00Z',
      isActive: true,
      createdAt: '2024-01-08T00:00:00Z',
      redemptionCount: 18
    },
    {
      _id: '6',
      title: 'Choose Weekend Activity',
      description: 'Pick the family weekend activity for this Saturday',
      category: 'family',
      subcategory: 'privilege',
      categoryName: 'Family',
      subcategoryName: 'Privilege',
      pointsCost: 150,
      creatorType: 'parent',
      creatorId: 'parent_2',
      limitedQuantity: false,
      quantity: null,
      expiryDate: null,
      isActive: true,
      createdAt: '2024-01-14T00:00:00Z',
      redemptionCount: 7
    },
    {
      _id: '7',
      title: 'Science Kit',
      description: 'Educational science experiment kit for home learning',
      category: 'school',
      subcategory: 'item',
      categoryName: 'School',
      subcategoryName: 'Item',
      pointsCost: 400,
      creatorType: 'school',
      creatorId: 'school_admin_1',
      schoolId: 'school_1',
      limitedQuantity: true,
      quantity: 2,
      expiryDate: null,
      isActive: true,
      createdAt: '2024-01-09T00:00:00Z',
      redemptionCount: 2
    },
    {
      _id: '8',
      title: 'Ice Cream Treat',
      description: 'Choice of ice cream from the school cafeteria',
      category: 'school',
      subcategory: 'item',
      categoryName: 'School',
      subcategoryName: 'Item',
      pointsCost: 25,
      creatorType: 'teacher',
      creatorId: 'teacher_2',
      schoolId: 'school_1',
      classId: 'class_2',
      limitedQuantity: false,
      quantity: null,
      expiryDate: '2024-04-30T00:00:00Z',
      isActive: true,
      createdAt: '2024-01-11T00:00:00Z',
      redemptionCount: 45
    }
  ];

  const mockData = {
    rewards: mockRewards,
    pagination: {
      total: 8,
      page: 1,
      limit: 20,
      pages: 1
    }
  };

  const { rewards = [], pagination = {} } = mockData ?? {};

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPage(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.pages) {
      setPage(pagination.page + 1);
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(Number(newLimit));
    setPage(1);
  };

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
      category: '',
      subcategory: '',
      categoryId: '',
      creatorType: '',
      schoolId: '',
      classId: '',
      minPoints: '',
      maxPoints: '',
      isActive: '',
      limitedQuantity: '',
      expiryDate: ''
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  // Action handlers
  const handleViewDetails = (reward) => {
    setSelectedReward(reward);
    setShowDetailsDialog(true);
  };

  const handleEditReward = (reward) => {
    // Navigate to edit page (we can implement this later)
    console.log('Edit reward:', reward);
    toast.info('Edit functionality coming soon!');
  };

  const handleDeleteReward = (reward) => {
    setSelectedReward(reward);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Reward "${selectedReward.title}" deleted successfully`);
      setShowDeleteDialog(false);
      setSelectedReward(null);
      // In a real app, you would refetch the data here
    } catch (error) {
      toast.error('Failed to delete reward');
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

  const getCreatorTypeBadgeColor = (type) => {
    switch (type) {
      case 'system': return 'green';
      case 'school': return 'yellow';
      case 'parent': return 'blue';
      case 'teacher': return 'orange';
      case 'social_worker': return 'indigo';
      default: return 'gray';
    }
  };

  const getStatusBadge = (reward) => {
    if (!reward.isActive) {
      return <Badge color="red" variant="soft">Inactive</Badge>;
    }
    if (reward.expiryDate && new Date(reward.expiryDate) < new Date()) {
      return <Badge color="orange" variant="soft">Expired</Badge>;
    }
    if (reward.limitedQuantity && reward.quantity === 0) {
      return <Badge color="yellow" variant="soft">Out of Stock</Badge>;
    }
    return <Badge color="green" variant="soft">Active</Badge>;
  };

  const columns = [
    {
      header: 'Reward',
      accessorKey: 'title',
    },
    {
      header: 'Category',
      accessorKey: 'category',
    },
    {
      header: 'Points Cost',
      accessorKey: 'pointsCost',
      sortable: true,
    },
    {
      header: 'Creator',
      accessorKey: 'creatorType',
    },
    {
      header: 'Status',
      accessorKey: 'status',
    },
    {
      header: 'Quantity',
      accessorKey: 'quantity',
    },
    {
      header: 'Redemptions',
      accessorKey: 'redemptionCount',
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      sortable: true,
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
    }
  ];

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
            <Heading as='h1' size='6' weight='medium' mb={'1'}>Rewards Management</Heading>
            <Text as="p" color="gray" size="2">
              Create and manage rewards that students can redeem with their points
            </Text>
          </div>

          {/* Navigation buttons */}
          <Flex gap="2" align="center">
            <Button variant="outline" color="gray" asChild>
              <Link to='/platform-admin/dashboard/reward-categories'>
                <Tag size={16} /> Categories
              </Link>
            </Button>
            <Button variant="outline" color="gray" asChild>
              <Link to='/platform-admin/dashboard/reward-redemptions'>
                <ClipboardList size={16} /> Redemptions
              </Link>
            </Button>
            <Button asChild>
              <Link to='create'>
                <Plus size={16} /> Add Reward
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
              placeholder="Search rewards..."
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
                  {/* Category Filter */}
                  <Select.Root
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <Select.Trigger placeholder="Category" className="min-w-[120px]" />
                    <Select.Content>
                      <Select.Item value="all">All Categories</Select.Item>
                      <Select.Item value="family">Family</Select.Item>
                      <Select.Item value="school">School</Select.Item>
                      <Select.Item value="sponsor">Sponsor</Select.Item>
                    </Select.Content>
                  </Select.Root>

                  {/* Subcategory Filter */}
                  <Select.Root
                    value={filters.subcategory}
                    onValueChange={(value) => handleFilterChange('subcategory', value)}
                  >
                    <Select.Trigger placeholder="Subcategory" className="min-w-[120px]" />
                    <Select.Content>
                      <Select.Item value="all">All Subcategories</Select.Item>
                      <Select.Item value="privilege">Privilege</Select.Item>
                      <Select.Item value="item">Item</Select.Item>
                      <Select.Item value="experience">Experience</Select.Item>
                      <Select.Item value="digital">Digital</Select.Item>
                    </Select.Content>
                  </Select.Root>

                  {/* Creator Type Filter */}
                  <Select.Root
                    value={filters.creatorType}
                    onValueChange={(value) => handleFilterChange('creatorType', value)}
                  >
                    <Select.Trigger placeholder="Creator Type" className="min-w-[120px]" />
                    <Select.Content>
                      <Select.Item value="all">All Creators</Select.Item>
                      <Select.Item value="system">System</Select.Item>
                      <Select.Item value="school">School</Select.Item>
                      <Select.Item value="parent">Parent</Select.Item>
                      <Select.Item value="teacher">Teacher</Select.Item>
                      <Select.Item value="social_worker">Social Worker</Select.Item>
                    </Select.Content>
                  </Select.Root>

                  {/* Status Filter */}
                  <Select.Root
                    value={filters.isActive}
                    onValueChange={(value) => handleFilterChange('isActive', value)}
                  >
                    <Select.Trigger placeholder="Status" className="min-w-[120px]" />
                    <Select.Content>
                      <Select.Item value="all">All Status</Select.Item>
                      <Select.Item value="true">Active</Select.Item>
                      <Select.Item value="false">Inactive</Select.Item>
                    </Select.Content>
                  </Select.Root>
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

                  {/* Limited Quantity Filter */}
                  <Select.Root
                    value={filters.limitedQuantity}
                    onValueChange={(value) => handleFilterChange('limitedQuantity', value)}
                  >
                    <Select.Trigger placeholder="Quantity Type" className="min-w-[120px]" />
                    <Select.Content>
                      <Select.Item value="all">All Types</Select.Item>
                      <Select.Item value="true">Limited Quantity</Select.Item>
                      <Select.Item value="false">Unlimited</Select.Item>
                    </Select.Content>
                  </Select.Root>
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
                <Gift size={16} color="var(--blue-11)" />
                <Text size="2" color="gray">Total Rewards</Text>
              </Flex>
              <Text size="6" weight="bold" color="blue">
                {pagination.total || 0}
              </Text>
            </Flex>
          </Card>

          <Card className="flex-1 min-w-[200px]">
            <Flex direction="column" gap="2" p="4">
              <Flex align="center" gap="2">
                <Crown size={16} color="var(--green-11)" />
                <Text size="2" color="gray">Active Rewards</Text>
              </Flex>
              <Text size="6" weight="bold" color="green">
                {rewards.filter(r => r.isActive).length}
              </Text>
            </Flex>
          </Card>

          <Card className="flex-1 min-w-[200px]">
            <Flex direction="column" gap="2" p="4">
              <Flex align="center" gap="2">
                <Tag size={16} color="var(--orange-11)" />
                <Text size="2" color="gray">Limited Quantity</Text>
              </Flex>
              <Text size="6" weight="bold" color="orange">
                {rewards.filter(r => r.limitedQuantity).length}
              </Text>
            </Flex>
          </Card>

          <Card className="flex-1 min-w-[200px]">
            <Flex direction="column" gap="2" p="4">
              <Flex align="center" gap="2">
                <Users size={16} color="var(--purple-11)" />
                <Text size="2" color="gray">Total Redemptions</Text>
              </Flex>
              <Text size="6" weight="bold" color="purple">
                {rewards.reduce((sum, r) => sum + (r.redemptionCount || 0), 0)}
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
                {error?.response?.data?.message || error?.message || 'Failed to load rewards'}
              </Callout.Text>
            </Callout.Root>
          ) : rewards.length === 0 ? (
            <EmptyStateCard
              title="No rewards found"
              description="Create your first reward to get started"
              icon={<Gift size={48} />}
              action={
                <Button asChild>
                  <Link to="create">
                    <Plus size={16} /> Create Reward
                  </Link>
                </Button>
              }
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
                  {rewards.map((reward) => (
                    <Table.Row key={reward._id} className="hover:bg-[--gray-a2]">
                      <Table.Cell>
                        <Flex direction="column" gap="1">
                          <Text weight="medium" size="2">
                            {reward.title}
                          </Text>
                          <Text size="1" color="gray" className="max-w-[200px] truncate">
                            {reward.description}
                          </Text>
                        </Flex>
                      </Table.Cell>

                      <Table.Cell>
                        <Flex direction="column" gap="1">
                          <Badge color={getCategoryBadgeColor(reward.category)} variant="soft">
                            {reward.categoryName || reward.category}
                          </Badge>
                          {reward.subcategoryName && (
                            <Badge color="gray" variant="outline" size="1">
                              {reward.subcategoryName}
                            </Badge>
                          )}
                        </Flex>
                      </Table.Cell>

                      <Table.Cell>
                        <Text weight="medium" size="2">
                          {reward.pointsCost} pts
                        </Text>
                      </Table.Cell>

                      <Table.Cell>
                        <Badge color={getCreatorTypeBadgeColor(reward.creatorType)} variant="soft">
                          {reward.creatorType}
                        </Badge>
                      </Table.Cell>

                      <Table.Cell>
                        {getStatusBadge(reward)}
                      </Table.Cell>

                      <Table.Cell>
                        {reward.limitedQuantity ? (
                          <Text size="2">
                            {reward.quantity} left
                          </Text>
                        ) : (
                          <Text size="2" color="gray">
                            Unlimited
                          </Text>
                        )}
                      </Table.Cell>

                      <Table.Cell>
                        <Text size="2">
                          {reward.redemptionCount || 0}
                        </Text>
                      </Table.Cell>

                      <Table.Cell>
                        <Text size="2" color="gray">
                          {formatDate(reward.createdAt)}
                        </Text>
                      </Table.Cell>

                      <Table.Cell>
                        <Flex gap="1">
                          <Tooltip content="View Details">
                            <IconButton 
                              variant="ghost" 
                              size="1"
                              onClick={() => handleViewDetails(reward)}
                            >
                              <Eye size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Edit Reward">
                            <IconButton 
                              variant="ghost" 
                              size="1"
                              onClick={() => handleEditReward(reward)}
                            >
                              <PencilIcon size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Delete Reward">
                            <IconButton 
                              variant="ghost" 
                              size="1" 
                              color="red"
                              onClick={() => handleDeleteReward(reward)}
                            >
                              <TrashIcon size={14} />
                            </IconButton>
                          </Tooltip>
                        </Flex>
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
                    {pagination.total} rewards
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
            <Dialog.Title>Reward Details</Dialog.Title>
            {selectedReward && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text size="2" weight="medium" color="gray">Title</Text>
                    <Text size="3">{selectedReward.title}</Text>
                  </div>
                  <div>
                    <Text size="2" weight="medium" color="gray">Points Cost</Text>
                    <Text size="3">{selectedReward.pointsCost} points</Text>
                  </div>
                  <div>
                    <Text size="2" weight="medium" color="gray">Category</Text>
                    <Text size="3">{selectedReward.categoryName || selectedReward.category}</Text>
                  </div>
                  <div>
                    <Text size="2" weight="medium" color="gray">Creator Type</Text>
                    <Text size="3">{selectedReward.creatorType}</Text>
                  </div>
                  <div>
                    <Text size="2" weight="medium" color="gray">Status</Text>
                    {getStatusBadge(selectedReward)}
                  </div>
                  <div>
                    <Text size="2" weight="medium" color="gray">Quantity</Text>
                    <Text size="3">
                      {selectedReward.limitedQuantity ? `${selectedReward.quantity} left` : 'Unlimited'}
                    </Text>
                  </div>
                  <div>
                    <Text size="2" weight="medium" color="gray">Created</Text>
                    <Text size="3">{formatDate(selectedReward.createdAt)}</Text>
                  </div>
                  <div>
                    <Text size="2" weight="medium" color="gray">Redemptions</Text>
                    <Text size="3">{selectedReward.redemptionCount || 0}</Text>
                  </div>
                </div>
                <div>
                  <Text size="2" weight="medium" color="gray">Description</Text>
                  <Text size="3">{selectedReward.description}</Text>
                </div>
                {selectedReward.expiryDate && (
                  <div>
                    <Text size="2" weight="medium" color="gray">Expires</Text>
                    <Text size="3">{formatDate(selectedReward.expiryDate)}</Text>
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialog.Content>
            <AlertDialog.Title>Delete Reward</AlertDialog.Title>
            <AlertDialog.Description>
              Are you sure you want to delete "{selectedReward?.title}"? This action cannot be undone.
            </AlertDialog.Description>
            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button color="red" onClick={confirmDelete}>Delete</Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </div>
    </div>
  );
};

export default Rewards; 