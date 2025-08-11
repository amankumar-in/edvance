import {
  Badge,
  Box,
  Button,
  Callout,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Select,
  Separator,
  Table,
  Text,
  TextField
} from '@radix-ui/themes';
import {
  AlertCircle,
  Check,
  ClipboardList,
  Edit,
  Filter,
  Folder,
  Gift,
  Heart,
  Home,
  Medal,
  Monitor,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  School,
  Search,
  ShoppingCart,
  Star,
  Trash2,
  X
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import { useCreateDefaultRewardCategories, useDeleteRewardCategory } from '../../api/rewards/rewards.mutations';
import { useGetRewardCategories } from '../../api/rewards/rewards.queries';
import { ConfirmationDialog, EmptyStateCard, Loader, Pagination } from '../../components';
import { useDebounce } from '../../hooks/useDebounce';

const RewardCategories = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // UI state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [filterType, setFilterType] = useState(null);
  const [filterVisibility, setFilterVisibility] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [defaultCategoriesDialogOpen, setDefaultCategoriesDialogOpen] = useState(false);

  // Use debounced search for API calls
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterType, filterVisibility, filterStatus]);

  // Queries
  const { data: rewardCategories, isLoading: isLoadingRewardCategories, error: errorRewardCategories, isError: isErrorRewardCategories, isFetching: isFetchingRewardCategories } = useGetRewardCategories({
    page: currentPage,
    limit: itemsPerPage,
    type: filterType,
    visibility: filterVisibility,
    isSystem: filterStatus,
    search: debouncedSearch,
  });

  const { categories = [] } = rewardCategories?.data ?? {}
  const { pagination } = rewardCategories?.data ?? {}

  // Mutations
  const { mutate: createDefaultRewardCategories, isPending: isCreatingDefaultRewardCategories } = useCreateDefaultRewardCategories();
  const { mutate: deleteRewardCategory, isPending: isDeletingRewardCategory } = useDeleteRewardCategory();

  // Category type options based on backend enums
  const typeOptions = [
    { value: 'all', label: 'All' },
    { value: 'family', label: 'Family' },
    { value: 'school', label: 'School' },
    { value: 'sponsor', label: 'Sponsor' },
    { value: 'custom', label: 'Custom' },
  ];

  const subcategoryTypeOptions = [
    { value: 'privilege', label: 'Privilege', description: 'Special privileges or permissions' },
    { value: 'item', label: 'Item', description: 'Physical or digital items' },
    { value: 'experience', label: 'Experience', description: 'Special experiences or activities' },
    { value: 'digital', label: 'Digital', description: 'Digital content or subscriptions' },
    { value: 'custom', label: 'Custom', description: 'Custom subcategory' },
  ];

  // visibility options
  const visibilityOptions = [
    { value: 'all', label: 'All' },
    { value: 'private', label: 'Private' },
    { value: 'family', label: 'Family' },
    { value: 'class', label: 'Class' },
    { value: 'school', label: 'School' },
    { value: 'public', label: 'Public' },
  ];

  // status options
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'true', label: 'System Categories' },
    { value: 'false', label: 'Custom Categories' },
  ];

  const colorOptions = [
    '#4285F4', '#34A853', '#FBBC05', '#EA4335', '#9B59B6',
    '#3498DB', '#E67E22', '#E74C3C', '#2ECC71', '#F39C12',
    '#8E44AD', '#16A085', '#2980B9', '#C0392B', '#D35400'
  ];

  const iconOptions = [
    { value: 'star', label: 'Star', icon: <Star size={16} /> },
    { value: 'gift', label: 'Gift', icon: <Gift size={16} /> },
    { value: 'heart', label: 'Heart', icon: <Heart size={16} /> },
    { value: 'home', label: 'Home', icon: <Home size={16} /> },
    { value: 'school', label: 'School', icon: <School size={16} /> },
    { value: 'medal', label: 'Medal', icon: <Medal size={16} /> },
    { value: 'shopping-cart', label: 'Shopping Cart', icon: <ShoppingCart size={16} /> },
    { value: 'monitor', label: 'Monitor', icon: <Monitor size={16} /> },
    { value: 'package', label: 'Package', icon: <Package size={16} /> },
    { value: 'folder', label: 'Folder', icon: <Folder size={16} /> },
  ];

  const getIconComponent = (iconName) => {
    const iconMap = {
      star: <Star size={16} />,
      gift: <Gift size={16} />,
      heart: <Heart size={16} />,
      home: <Home size={16} />,
      school: <School size={16} />,
      medal: <Medal size={16} />,
      'shopping-cart': <ShoppingCart size={16} />,
      monitor: <Monitor size={16} />,
      package: <Package size={16} />,
      folder: <Folder size={16} />,
    };
    return iconMap[iconName] || <Folder size={16} />;
  };

  const getTypeBadge = (type) => {
    const colorMap = {
      family: 'blue',
      school: 'orange',
      sponsor: 'purple',
      custom: 'gray',
    };
    return (
      <Badge color={colorMap[type] || 'gray'} variant="soft">
        {type}
      </Badge>
    );
  };

  // function to get visibility badge
  const getVisibilityBadge = (visibility) => {
    const colorMap = {
      private: 'red',
      family: 'blue',
      class: 'orange',
      school: 'green',
      public: 'gray',
    };
    return (
      <Badge className='capitalize' color={colorMap[visibility] || 'gray'} variant="outline">
        {visibility}
      </Badge>
    );
  };

  const handleDelete = async (category) => {
    try {
      // Simulate API call
      console.log('Deleting category:', category._id);
      // setCategories(categories.filter(c => c._id !== category._id));
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to create system default categories
  const handleCreateDefaultCategories = useCallback(() => {
    createDefaultRewardCategories(undefined, {
      onSuccess: ({ message }) => {
        toast.success(message || 'Default categories created successfully');
        setDefaultCategoriesDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'Something went wrong');
      },
    });
  }, [createDefaultRewardCategories]);

  const handleDeleteCategory = useCallback(() => {
    if (!categoryToDelete) return;

    deleteRewardCategory(categoryToDelete._id, {
      onSuccess: () => {
        toast.success('Category deleted successfully');
        setShowDeleteDialog(false);
        setCategoryToDelete(null);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to delete category');
      }
    });
  }, [categoryToDelete, deleteRewardCategory]);

  const openDeleteDialog = useCallback((category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  }, []);

  const renderIcon = useCallback((iconName) => {
    const iconMap = {
      star: Star,
      gift: Gift,
      heart: Heart,
      home: Home,
      school: School,
      medal: Medal,
      'shopping-cart': ShoppingCart,
      monitor: Monitor,
      package: Package,
      folder: Folder,
    };
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={16} /> : <Folder size={16} />;
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const renderCategoryRow = useCallback((category) => (
    <Table.Row key={category._id} className='hover:bg-[--gray-a3] even:bg-[--gray-a2]'>
      <Table.Cell>
        <Flex align="center" gap="3" className='text-nowrap'>
          {category.parentCategory && (
            <Box style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>
              <Folder size={16} color="var(--gray-8)" />
            </Box>
          )}
          <Flex
            align="center"
            justify="center"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: category.color,
              borderRadius: '6px',
              color: 'white'
            }}
          >
            {renderIcon(category.icon)}
          </Flex>
          <Box>
            <Text as='p' weight="medium">
              {category.name}
            </Text>
            {category.parentCategory && (
              <Text as='p' size="1" color="gray" style={{ display: 'block' }}>
                Parent: {category.parentCategory.name}
              </Text>
            )}
            {category.description && (
              <Text as='p' size="1" color="gray" style={{ display: 'block' }}>
                {category.description.length > 50
                  ? category.description.substring(0, 50) + '...'
                  : category.description}
              </Text>
            )}
          </Box>
        </Flex>
      </Table.Cell>

      <Table.Cell className='capitalize text-nowrap'>
        {getTypeBadge(category.type)}
        {category.subcategoryType && (
          <Badge color="gray" variant="outline" size="1" className="ml-1">
            {category.subcategoryType}
          </Badge>
        )}
      </Table.Cell>

      <Table.Cell >
        {category.minPointValue && category.maxPointValue && `${category.minPointValue} - ${category.maxPointValue}`}
      </Table.Cell>

      <Table.Cell>
        {getVisibilityBadge(category.visibility)}
      </Table.Cell>

      <Table.Cell>
        <Flex align="center" gap="2">
          <Badge
            color={category.isActive ? 'green' : 'red'}
            variant="soft"
          >
            {category.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {category.isSystem && (
            <Badge color="blue" variant="outline" size="1">
              System
            </Badge>
          )}
        </Flex>
      </Table.Cell>

      <Table.Cell>
        {category.isFeatured ? (
          <Check size={16} color="var(--green-10)" />
        ) : (
          <X size={16} color="var(--red-10)" />
        )}
      </Table.Cell>

      <Table.Cell>
        {category?.featuredOrder ?? 0}
      </Table.Cell>

      <Table.Cell className='text-nowrap'>
        {formatDate(category.createdAt)}
      </Table.Cell>

      <Table.Cell>
        <DropdownMenu.Root >
          <DropdownMenu.Trigger>
            <IconButton highContrast variant="ghost" color="gray">
              <MoreHorizontal size={16} />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content variant='soft' className='w-40'>
            <DropdownMenu.Item asChild >
              <Link to={`edit/${category._id}`}>
                <Edit size={14} />
                Edit
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              color="red"
              onClick={() => openDeleteDialog(category)}
            >
              <Trash2 size={14} />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Table.Cell>
    </Table.Row>
  ), [renderIcon, formatDate, openDeleteDialog]);

  const clearFilters = () => {
    setFilterType(null);
    setFilterVisibility(null);
    setFilterStatus(null);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterType !== null) count++;
    if (filterVisibility !== null) count++;
    if (filterStatus !== null) count++;
    if (searchTerm) count++;
    return count;
  };

  // Handle pagination changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage, newCurrentPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(newCurrentPage);
  };

  return (
    <div>
      {!isLoadingRewardCategories && isFetchingRewardCategories && <div className='fixed right-0 left-0 top-16'>
        <BarLoader
          color='#0090ff'
          width={'100%'}
          height={'4px'}
        />
      </div>}

      <div className='relative px-4 py-8 space-y-6 lg:px-8 xl:px-12'>
        {/* Header */}
        <Flex justify="between" align="center" gap="4" wrap="wrap">
          <Box className='space-y-1'>
            <Heading size="6" weight={'medium'}>Reward Categories Management</Heading>
            <Text as="p" color="gray" size="2">
              Create, organize, and manage reward categories across the platform
            </Text>
          </Box>

          <Flex align="center" gap="2" wrap="wrap">
            <Button variant="outline" color="gray" asChild>
              <Link to='/platform-admin/dashboard/rewards'>
                <Gift size={16} /> Rewards
              </Link>
            </Button>
            <Button variant="outline" color="gray" asChild>
              <Link to='/platform-admin/dashboard/reward-redemptions'>
                <ClipboardList size={16} /> Redemptions
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDefaultCategoriesDialogOpen(true);
              }}
            >
              <RefreshCw size={16} />
              Initialize
            </Button>
            <CreateCategoryButton />
          </Flex>
        </Flex>

        <Separator size={'4'} />

        {/* Search and Filters */}
        <Flex direction="column" gap="4" className='max-w-4xl'>
          <Flex gap="3" align="center" wrap="wrap">
            {/* Search */}
            <TextField.Root
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px]"
            >
              <TextField.Slot>
                <Search size={16} />
              </TextField.Slot>
            </TextField.Root>

            {/* Type Filter */}
            <Select.Root value={filterType || 'all'} onValueChange={(value) => setFilterType(value === 'all' ? null : value)}>
              <Select.Trigger className='capitalize' variant='classic'>
                <Text color='gray' weight={'medium'}>Type: </Text>
                {typeOptions.find(option => option.value === filterType)?.label}
              </Select.Trigger>
              <Select.Content variant='soft' position='popper'>
                {typeOptions.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* Visibility Filter */}
            <Select.Root value={filterVisibility || 'all'} onValueChange={(value) => setFilterVisibility(value === 'all' ? null : value)}>
              <Select.Trigger className='capitalize' variant='classic'>
                <Text color='gray' weight={'medium'}>Visibility: </Text>
                {visibilityOptions.find(option => option.value === filterVisibility)?.label}
              </Select.Trigger>
              <Select.Content variant='soft' position='popper'>
                {visibilityOptions.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* Status Filter */}
            <Select.Root value={filterStatus || 'all'} onValueChange={(value) => setFilterStatus(value === 'all' ? null : value)}>
              <Select.Trigger className='capitalize' variant='classic'>
                <Text color='gray' weight={'medium'}>Status: </Text>
                {statusOptions.find(option => option.value === filterStatus)?.label}
              </Select.Trigger>
              <Select.Content variant='soft' position='popper'>
                {statusOptions.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* Clear Filters */}
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="surface"
                color="red"
                onClick={clearFilters}
              >
                <Filter size={16} />
                Clear ({getActiveFiltersCount()})
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Categories Table */}
        {isLoadingRewardCategories ? (
          <Flex justify="center">
            <Loader />
          </Flex>
        ) : isErrorRewardCategories ? (
          <Callout.Root color="red" className="m-4">
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>
              {errorRewardCategories?.response?.data?.message || errorRewardCategories?.message || 'Failed to load categories'}
            </Callout.Text>
          </Callout.Root>
        ) : categories?.length === 0 ? (
          <EmptyStateCard
            title="No categories found"
            description="Create your first reward category to get started"
            icon={<Folder size={48} />}
            action={<CreateCategoryButton />}
          />
        ) : (
          <>
            <Table.Root variant='surface' className='shadow-md'>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>
                    <Text weight="medium" size="2">Category ({categories.length})</Text>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <Text weight="medium" size="2">Type</Text>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <Text weight="medium" size="2" className='text-nowrap'>Point Range</Text>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <Text weight="medium" size="2">Visibility</Text>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <Text weight="medium" size="2">Status</Text>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <Text weight="medium" size="2">Featured</Text>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <Text weight="medium" size="2">Order</Text>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <Text weight="medium" size="2">Created</Text>
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <Text weight="medium" size="2">Actions</Text>
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {categories.map(renderCategoryRow)}
              </Table.Body>
            </Table.Root>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={pagination?.pages ?? 1}
              totalItems={pagination?.total ?? 0}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              showItemsPerPage={true}
              showPageInfo={true}
              showFirstLast={true}
              showPrevNext={true}
              itemsPerPageOptions={[5, 10, 20, 50, 100]}
              itemLabel="categories"
              disabled={isLoadingRewardCategories || isFetchingRewardCategories}
            />
          </>
        )}


        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          open={defaultCategoriesDialogOpen}
          onOpenChange={() => setDefaultCategoriesDialogOpen(false)}
          title="Create Default Categories"
          description="This will create system default reward categories. Any existing categories with the same names will be skipped."
          onConfirm={handleCreateDefaultCategories}
          confirmText="Create Defaults"
          confirmColor="cyan"
          isLoading={isCreatingDefaultRewardCategories}
        />

        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteCategory}
          title="Delete Category"
          description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmColor="red"
          isLoading={isDeletingRewardCategory}
        />
      </div>
    </div>
  );
};

export default RewardCategories;

function CreateCategoryButton() {
  return (
    <Button asChild className='shadow-md'>
      <Link to='create'>
        <Plus size={16} /> Add Category
      </Link>
    </Button>
  );
}