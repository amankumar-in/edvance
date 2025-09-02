import { Badge, Button, Callout, Card, Dialog, DropdownMenu, Flex, Heading, IconButton, Select, Separator, Table, Text, TextField } from '@radix-ui/themes';
import { AlertCircleIcon, Check, ClipboardList, Eye, Filter, Gift, MoreHorizontal, PencilIcon, Plus, Search, Tag, TrashIcon, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import { useDeleteReward } from '../../api/rewards/rewards.mutations';
import { useGetRewards } from '../../api/rewards/rewards.queries';
import { ConfirmationDialog, EmptyStateCard, Loader, Pagination } from '../../components';
import { SortIcon } from '../../components/platform-admin/UserTable';
import { useDebounce } from '../../hooks/useDebounce';
import { FALLBACK_IMAGES } from '../../utils/constants';
import { formatDate } from '../../utils/helperFunctions';
import PageHeader from '../../components/PageHeader';

const Rewards = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const currentSort = { field: sort, order: order };
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  // Filter states
  const [filters, setFilters] = useState({
    category: null,
    subcategory: null,
    categoryId: null,
    creatorType: null,
    schoolId: null,
    classId: null,
    expiryDate: null,
    isFeatured: null,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  // Queries
  const { data: rewardsData, isLoading, isFetching, isError, error } = useGetRewards({
    page,
    limit,
    sort,
    order,
    ...filters,
    search: debouncedSearch,
  });
  const { rewards = [], pagination = {} } = rewardsData?.data ?? {};

  // mutations
  const { mutate: deleteReward, isPending: isDeletingReward } = useDeleteReward();

  // function to handle page change
  const handlePageChange = (page) => {
    setPage(page);
  };

  // function to handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage, newCurrentPage) => {
    setLimit(newItemsPerPage);
    setPage(newCurrentPage);
  };

  // function to handle sort
  const handleSort = (field) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('asc');
    }
  };

  // function to handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // function to clear filters
  const clearFilters = () => {
    setFilters({
      category: null,
      subcategory: null,
      categoryId: null,
      creatorType: null,
      schoolId: null,
      classId: null,
      expiryDate: null,
      isFeatured: null,
    });
    setSearch('');
  };

  // function to get active filters count
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== null).length + (search !== '' ? 1 : 0);
  };

  // function to handle view details
  const handleViewDetails = (reward) => {
    setSelectedReward(reward);
    setShowDetailsDialog(true);
  };

  // function to handle delete reward
  const handleDeleteReward = (reward) => {
    setSelectedReward(reward);
    setShowDeleteDialog(true);
  };

  // function to delete reward
  const confirmDelete = async () => {
    deleteReward(selectedReward._id, {
      onSuccess: () => {
        toast.success(`Reward "${selectedReward.title}" deleted successfully`);
        setShowDeleteDialog(false);
        setSelectedReward(null);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to delete reward');
      }
    });
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
      header: 'Created',
      accessorKey: 'createdAt',
      sortable: true,
    },
    {
      header: 'Featured',
      accessorKey: 'featured',
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
    }
  ];

  // creator type options
  const creatorTypeOptions = [
    { value: null, label: 'All' },
    { value: 'system', label: 'System' },
    { value: 'school', label: 'School' },
    { value: 'parent', label: 'Parent' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'social_worker', label: 'Social Worker' },
  ];

  // category options
  const categoryOptions = [
    { value: null, label: 'All' },
    { value: 'family', label: 'Family' },
    { value: 'school', label: 'School' },
    { value: 'sponsor', label: 'Sponsor' },
  ];

  // subcategory options
  const subcategoryOptions = [
    { value: null, label: 'All' },
    { value: 'privilege', label: 'Privilege' },
    { value: 'item', label: 'Item' },
    { value: 'experience', label: 'Experience' },
    { value: 'digital', label: 'Digital' },
  ];

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
          title="Rewards"
          description="Create and manage rewards that students can redeem with their points"
        >
          {/* Navigation buttons */}
          <Flex gap="2" align="center" className='flex-wrap'>
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
        </PageHeader>

        <Separator size={'4'} />

        {/* Search and Filter Controls */}
        <Flex direction="column" gap="4" className='max-w-4xl'>
          <Flex gap="3" align="center" wrap="wrap">
            {/* Search */}
            <TextField.Root
              placeholder="Search rewards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px]"
            >
              <TextField.Slot>
                <Search size={16} />
              </TextField.Slot>
            </TextField.Root>

            {/* Toggle Filters */}
            <Button
              variant="outline"
              color="gray"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters {" "}
              {getActiveFiltersCount() > 0 && (
                getActiveFiltersCount()
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
                    <Select.Trigger placeholder='Category' variant='classic'>
                      <Text color='gray' weight={'medium'}>Category: </Text>
                      {categoryOptions.find(option => option.value === filters.category)?.label}
                    </Select.Trigger>
                    <Select.Content variant='soft' position='popper'>
                      {categoryOptions.map(option => (
                        <Select.Item key={option.value} value={option.value}>
                          {option.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>

                  {/* Subcategory Filter */}
                  <Select.Root
                    value={filters.subcategory}
                    onValueChange={(value) => handleFilterChange('subcategory', value)}
                  >
                    <Select.Trigger placeholder='Subcategory' variant='classic'>
                      <Text color='gray' weight={'medium'}>Subcategory: </Text>
                      {subcategoryOptions.find(option => option.value === filters.subcategory)?.label}
                    </Select.Trigger>
                    <Select.Content variant='soft' position='popper'>
                      {subcategoryOptions.map(option => (
                        <Select.Item key={option.value} value={option.value}>
                          {option.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>

                  {/* Creator Type Filter */}
                  <Select.Root
                    value={filters.creatorType}
                    onValueChange={(value) => handleFilterChange('creatorType', value)}
                  >
                    <Select.Trigger placeholder='Creator Type' variant='classic'>
                      <Text color='gray' weight={'medium'}>Creator: </Text>
                      {creatorTypeOptions.find(option => option.value === filters.creatorType)?.label}
                    </Select.Trigger>
                    <Select.Content variant='soft' position='popper'>
                      {creatorTypeOptions.map(option => (
                        <Select.Item key={option.value} value={option.value}>
                          {option.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>

                  {/* Featured Filter  */}
                  <Select.Root
                    value={filters.isFeatured}
                    onValueChange={(value) => handleFilterChange('isFeatured', value)}
                  >
                    <Select.Trigger placeholder='Featured' variant='classic'>
                      <Text color='gray' weight={'medium'}>Featured: </Text>
                      {filters.isFeatured === null ? 'All' : filters.isFeatured === 'true' ? 'Yes' : 'No'}
                    </Select.Trigger>
                    <Select.Content variant='soft' position='popper'>
                      <Select.Item value={null}>All</Select.Item>
                      <Select.Item value="true">Yes</Select.Item>
                      <Select.Item value="false">No</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Flex>
            </Card>
          )}
        </Flex>

        {/* Table */}
        {isLoading ? (
          <Flex justify="center">
            <Loader />
          </Flex>
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
          <Card size={'2'} className='shadow [--card-border-width:0px]'>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  {columns.map((column) => (
                    <Table.ColumnHeaderCell key={column.accessorKey} className='text-nowrap'>
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
                  <Table.Row key={reward._id} className="hover:bg-[--gray-a3] odd:bg-[--gray-a2]">
                    <Table.Cell>
                      <Flex direction="column" gap="1">
                        <Text title={reward?.title} as='p' weight="medium" size="2" className='line-clamp-1 min-w-[300px]'>
                          {reward?.title}
                        </Text>
                        <Text title={reward?.description} as='p' size="1" color="gray" className='line-clamp-2 min-w-[300px]'>
                          {reward?.description}
                        </Text>
                      </Flex>
                    </Table.Cell>

                    <Table.Cell className='text-nowrap'>
                      <Flex gap="1">
                        <Badge color={getCategoryBadgeColor(reward?.category)} variant="soft">
                          {reward?.categoryName || reward?.category}
                        </Badge>
                        {reward?.subcategoryName && (
                          <Badge color="gray" variant="outline" size="1">
                            {reward?.subcategoryName}
                          </Badge>
                        )}
                      </Flex>
                    </Table.Cell>

                    <Table.Cell>
                      {reward?.pointsCost}
                    </Table.Cell>

                    <Table.Cell>
                      <Badge color={getCreatorTypeBadgeColor(reward?.creatorType)} variant="soft">
                        {reward?.creatorType}
                      </Badge>
                    </Table.Cell>

                    <Table.Cell>
                      {getStatusBadge(reward)}
                    </Table.Cell>

                    <Table.Cell>
                      {reward?.limitedQuantity ? (
                        reward?.quantity
                      ) : (
                        "Unlimited"
                      )}
                    </Table.Cell>

                    <Table.Cell className='text-nowrap'>
                      {formatDate(reward?.createdAt)}
                    </Table.Cell>

                    <Table.Cell>
                      {reward?.isFeatured ? <Check size={14} color='var(--green-10)' /> : <X size={14} color='var(--red-10)' />}
                    </Table.Cell>

                    <Table.Cell>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <IconButton highContrast variant="ghost" color="gray">
                            <MoreHorizontal size={14} />
                          </IconButton>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content variant='soft'>
                          <DropdownMenu.Label className='text-xs'>  Actions </DropdownMenu.Label>
                          <DropdownMenu.Item onClick={() => handleViewDetails(reward)}>
                            <Eye size={14} /> View Details
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild>
                            <Link to={`/platform-admin/dashboard/rewards/edit/${reward._id}`}>
                              <PencilIcon size={14} /> Edit Reward
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator />
                          <DropdownMenu.Item color='red' onClick={() => handleDeleteReward(reward)}>
                            <TrashIcon size={14} /> Delete Reward
                          </DropdownMenu.Item>
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
              itemLabel="rewards"
              disabled={isLoading || isFetching}
              className='mt-4'
            />
          </Card>
        )}

        {/* Details Dialog */}
        <Dialog.Root open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <Dialog.Content className="max-w-xl" aria-describedby={undefined}>
            <Dialog.Title>Reward Details</Dialog.Title>
            {selectedReward && (
              <div className="space-y-4">
                {/* {selectedReward.image && ( */}
                <img
                  src={selectedReward.image || FALLBACK_IMAGES.product}
                  alt={selectedReward.title}
                  className='object-cover object-center w-full rounded-lg aspect-video'
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGES.product;
                  }}
                />
                {/* )} */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Text as='p' size="1" weight="medium" mb="1" color='gray'>Title</Text>
                    <Text as='p' size="2">{selectedReward.title}</Text>
                  </div>
                  <div>
                    <Text as='p' size="1" weight="medium" mb="1" color='gray'>Points Cost</Text>
                    <Text as='p' size="2">{selectedReward.pointsCost} points</Text>
                  </div>
                  <div>
                    <Text as='p' size="1" weight="medium" mb="1" color='gray'>Category</Text>
                    <Text as='p' size="2">{selectedReward.categoryName || selectedReward.category} {selectedReward.subcategoryName && `- ${selectedReward.subcategoryName || selectedReward.subcategory}`} </Text>
                  </div>
                  <div>
                    <Text as='p' size="1" weight="medium" mb="1" color='gray'>Creator Type</Text>
                    <Text as='p' size="2">{selectedReward.creatorType}</Text>
                  </div>
                  <div>
                    <Text as='p' size="1" weight="medium" mb="1" color='gray'>Status</Text>
                    {getStatusBadge(selectedReward)}
                  </div>
                  <div>
                    <Text as='p' size="1" weight="medium" mb="1" color='gray'>Quantity</Text>
                    <Text as='p' size="2">
                      {selectedReward.limitedQuantity ? `${selectedReward.quantity} left` : 'Unlimited'}
                    </Text>
                  </div>
                  <div>
                    <Text as='p' size="1" weight="medium" mb="1" color='gray'>Created</Text>
                    <Text as='p' size="2">{formatDate(selectedReward.createdAt)}</Text>
                  </div>
                  <div>
                    <Text as='p' size="1" weight="medium" mb="1" color='gray'>Featured</Text>
                    <Text as='p' size="2">
                      {selectedReward.isFeatured ? (
                        <span className='flex gap-1 items-center'><Check size={14} color='var(--green-10)' /> Yes</span>
                      ) : (
                        <span className='flex gap-1 items-center'><X size={14} color='var(--red-10)' /> No</span>
                      )}
                    </Text>
                  </div>
                </div>
                <div>
                  <Text as='p' size="1" weight="medium" mb="1" color='gray'>Description</Text>
                  <Text as='p' size="2">{selectedReward.description}</Text>
                </div>
                {selectedReward.redemptionInstructions && (
                  <div>
                    <Text as='p' size="1" weight="medium" mb="1" color='gray'>Redemption Instructions</Text>
                    <Text as='p' size="2" className="p-4 whitespace-pre-wrap bg-[--blue-a2] rounded-lg border border-[--blue-6]">
                      {selectedReward.redemptionInstructions}
                    </Text>
                  </div>
                )}
                {selectedReward.restrictions && (
                  <div>
                    <Text as='p' size="1" weight="medium" mb="1" color='gray'>Restrictions</Text>
                    <Text as='p' size="2" className="whitespace-pre-wrap bg-[--orange-a2] rounded-lg border border-[--orange-6] p-4">
                      {selectedReward.restrictions}
                    </Text>
                  </div>
                )}
                {selectedReward.expiryDate && (
                  <div>
                    <Text as='p' size="1" weight="medium" mb="1" color='gray'>Expires</Text>
                    <Text as='p' size="2">{formatDate(selectedReward.expiryDate)}</Text>
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
        <ConfirmationDialog
          title="Delete Reward"
          description={`Are you sure you want to delete "${selectedReward?.title}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          confirmColor='red'
          isLoading={isDeletingReward}
        />
      </div>
    </div >
  );
};

export default Rewards; 