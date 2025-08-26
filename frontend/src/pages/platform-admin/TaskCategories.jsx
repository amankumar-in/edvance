import { Badge, Box, Button, Callout, Card, DropdownMenu, Flex, Heading, IconButton, Select, Separator, Table, Text, TextField } from '@radix-ui/themes';
import { Activity, AlertCircleIcon, Book, Calculator, Calendar, Database, Droplet, Edit, FunnelX, Home, ListTodo, Microscope, MoreVertical, Music, Pen, Plus, RefreshCw, Search, Settings, ThumbsUp, Trash2, TreePine } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import { useCreateDefaultTaskCategories, useDeleteTaskCategory } from '../../api/task-category/taskCategory.mutations';
import { useGetTaskCategories } from '../../api/task-category/taskCategory.queries';
import { ConfirmationDialog, EmptyStateCard, Loader, StatusGuide } from '../../components';
import { useDebounce } from '../../hooks/useDebounce';


// Icon mapping for categories
const iconMap = {
  'calculator': Calculator,
  'book': Book,
  'microscope': Microscope,
  'pen': Pen,
  'home': Home,
  'droplet': Droplet,
  'thumbs-up': ThumbsUp,
  'calendar': Calendar,
  'activity': Activity,
  'music': Music,
  'settings': Settings,
};

const TaskCategories = () => {
  const [filterType, setFilterType] = useState(null);
  const [filterVisibility, setFilterVisibility] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [defaultCategoriesDialogOpen, setDefaultCategoriesDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Use debounced search only for API calls, not for the input value
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: taskCategories, isLoading: isTaskCategoriesLoading, isError: isTaskCategoriesError, error, isFetching, refetch } = useGetTaskCategories({
    type: filterType,
    visibility: filterVisibility,
    isSystem: filterStatus,
    search: debouncedSearch,
    role: 'platform-admin'
  });

  const createDefaultCategories = useCreateDefaultTaskCategories();
  const deleteTaskCategory = useDeleteTaskCategory();

  // Memoize expensive calculations
  const typeOptions = useMemo(() => [
    { value: null, label: 'All' },
    { value: 'academic', label: 'Academic' },
    { value: 'home', label: 'Home' },
    { value: 'behavior', label: 'Behavior' },
    { value: 'extracurricular', label: 'Extracurricular' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'custom', label: 'Custom' },
  ], []);

  const visibilityOptions = useMemo(() => [
    { value: null, label: 'All' },
    { value: 'private', label: 'Private' },
    { value: 'family', label: 'Family' },
    { value: 'class', label: 'Class' },
    { value: 'school', label: 'School' },
    { value: 'public', label: 'Public' },
  ], []);

  const statusOptions = useMemo(() => [
    { value: null, label: 'All' },
    { value: 'true', label: 'System Categories' },
    { value: 'false', label: 'Custom Categories' },
  ], []);

  const handleCreateDefaultCategories = useCallback(() => {
    createDefaultCategories.mutate('platform_admin', {
      onSuccess: ({ message }) => {
        setDefaultCategoriesDialogOpen(false);
        toast.success(message || 'Default categories created successfully');
      },
      onError: (error) => {
        console.error(error);
        toast.error(error?.response?.data?.message || error?.message || 'Something went wrong');
      }
    });
  }, [createDefaultCategories]);

  const handleDeleteCategory = useCallback(() => {
    if (!categoryToDelete) return;

    deleteTaskCategory.mutate(categoryToDelete._id, {
      onSuccess: ({ message }) => {
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        toast.success(message || 'Category deleted successfully');
      },
      onError: (error) => {
        console.error(error);
        toast.error(error?.response?.data?.message || error?.message || 'Failed to delete category');
      }
    });
  }, [deleteTaskCategory, categoryToDelete]);

  const openDeleteDialog = useCallback((category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  }, []);

  // No need for complex grouping since backend returns populated parent data

  const renderIcon = useCallback((iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={16} /> : <Settings size={16} />;
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const renderCategoryRow = useCallback((category) => (
    <Table.Row key={category._id} className='hover:bg-[--gray-a3] odd:bg-[--gray-a2]'>
      <Table.Cell>
        <Flex align="center" gap="3" className='text-nowrap'>
          {category.parentCategory && (
            <Box style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>
              <TreePine size={16} color="var(--gray-8)" />
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
            <Text weight="medium">
              {category.name}
            </Text>
            {category.parentCategory && (
              <Text size="1" color="gray" style={{ display: 'block' }}>
                Parent: {category.parentCategory.name}
              </Text>
            )}
            {category.description && (
              <Text size="1" color="gray" style={{ display: 'block' }}>
                {category.description.length > 50
                  ? category.description.substring(0, 50) + '...'
                  : category.description}
              </Text>
            )}
            {category.subject && (
              <Badge size="1" color="blue" variant="soft" style={{ marginTop: '2px' }}>
                {category.subject} - Grade {category.gradeLevel}
              </Badge>
            )}
          </Box>
        </Flex>
      </Table.Cell>

      <Table.Cell className='capitalize'>
        {category.type}
      </Table.Cell>

      <Table.Cell>
        {category.defaultPointValue}
      </Table.Cell>

      <Table.Cell>
        <Badge
          color={category.visibility === 'public' ? 'green' :
            category.visibility === 'school' ? 'blue' : 'gray'}
          variant="outline"
        >
          {category.visibility}
        </Badge>
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
            <Badge color="orange" variant="surface">
              System
            </Badge>
          )}
          {category.parentCategory && (
            <Badge color="purple" variant="soft" size="1">
              Sub
            </Badge>
          )}
        </Flex>
      </Table.Cell>

      <Table.Cell className='text-nowrap'>
        {formatDate(category.createdAt)}
      </Table.Cell>

      <Table.Cell>
        {!category.isSystem && <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="ghost" color="gray">
              <MoreVertical size={16} />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content variant='soft'>
            <DropdownMenu.Item asChild>
              <Link to={`/platform-admin/dashboard/task-categories/edit/${category._id}`}>
                <Edit size={14} /> Edit Category
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item color="red" onClick={() => openDeleteDialog(category)}>
              <Trash2 size={14} />
              Delete Category
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>}
      </Table.Cell>
    </Table.Row>
  ), [renderIcon, formatDate, openDeleteDialog]);

  return (
    <div>
      {isFetching && !isTaskCategoriesLoading && <div className='fixed right-0 left-0 top-16'>
        <BarLoader
          color='#0090ff'
          width={'100%'}
          height={'4px'}
        />
      </div>}
      <Box>
        <Flex direction="column" className='gap-6'>
          {/* Header */}
          <Flex justify="between" align="center" gap="4" wrap="wrap">
            <Box className='space-y-1'>
              <Heading size="6" weight={'medium'}>Task Categories Management</Heading>
              <Text as="p" color="gray" size="2">
                Create, organize, and manage task categories across the platform
              </Text>
            </Box>
            <Flex align="center" gap="2" wrap="wrap">
              {/* Initialize Defaults */}
              <Button
                variant="soft"
                color="orange"
                size="2"
                onClick={() => setDefaultCategoriesDialogOpen(true)}
              >
                <Database size={16} /> Initialize Defaults
              </Button>

              {/* Create Category */}
              <CreateCategoryButton />
            </Flex>
          </Flex>

          <Separator size={'4'} />

          {/* Advanced Filters */}
          <Box>
            <Flex direction="column" gap="4">
              <Flex gap="4" align="end" wrap="wrap" justify="between">
                {/* Search Categories */}
                <label className='flex-1 min-w-[240px] max-w-xl'>
                  <Text as='p' size="2" mb="1" weight="medium">
                    Search Categories
                  </Text>
                  <TextField.Root
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  >
                    <TextField.Slot>
                      <Search size={16} />
                    </TextField.Slot>
                  </TextField.Root>
                </label>

                <Flex align="center" gap="4" wrap="wrap">
                  {/* Filter by Type */}
                  <Select.Root disabled={isFetching} value={filterType} onValueChange={setFilterType}>
                    <Select.Trigger className='capitalize' variant='classic' color='gray'>
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

                  {/* Filter by Visibility */}
                  <Select.Root disabled={isFetching} value={filterVisibility} onValueChange={setFilterVisibility}>
                    <Select.Trigger className='capitalize' variant='classic' color='gray'>
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

                  {/* Filter by Status */}
                  <Select.Root disabled={isFetching} value={filterStatus} onValueChange={setFilterStatus}>
                    <Select.Trigger className='capitalize' variant='classic' color='gray'>
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

                  {/* Refresh */}
                  <Button disabled={isFetching} title="Refresh" aria-label="Refresh" variant="ghost" color="gray"
                    onClick={() => {
                      setFilterType(null);
                      setFilterVisibility(null);
                      setFilterStatus(null);
                      setSearchTerm('');
                      refetch();
                    }}
                  >
                    <RefreshCw size={16} />
                  </Button>

                  {/* Reset Filters */}
                  <Button variant="soft" color="gray"
                    onClick={() => {
                      setFilterType(null);
                      setFilterVisibility(null);
                      setFilterStatus(null);
                      setSearchTerm('');
                    }}
                  >
                    <FunnelX size={16} />
                    Reset
                  </Button>
                </Flex>

              </Flex>

            </Flex>

            {/* Status Information Section */}
            <div className='mt-4'>
              <StatusGuide />
            </div>
          </Box>


          {isTaskCategoriesLoading ? (
            <Flex justify="center">
              <Loader />
            </Flex>
          ) : isTaskCategoriesError ? (
            <Callout.Root color='red'>
              <Callout.Icon>
                <AlertCircleIcon size={16} />
              </Callout.Icon>
              <Callout.Text>
                {error?.response?.data?.message || error?.message || 'Something went wrong'}
              </Callout.Text>
            </Callout.Root>
          ) : taskCategories?.data?.length > 0 ? (
            <Card size={'2'} className='shadow-md [--card-border-width:0px]'>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell className='font-medium capitalize' key='category'>Category ({taskCategories?.data?.length > 0 && taskCategories?.data?.length})</Table.ColumnHeaderCell>
                    {['type', 'points', 'visibility', 'status', 'created', 'actions'].map((header) => (
                      <Table.ColumnHeaderCell className='font-medium capitalize' key={header}>{header}</Table.ColumnHeaderCell>
                    ))}
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {taskCategories?.data?.map((category) => (
                    renderCategoryRow(category)
                  ))}
                </Table.Body>
              </Table.Root>
            </Card>
          ) : (
            <EmptyStateCard
              title="No categories found"
              description="No categories found matching your criteria."
              icon={<ListTodo size={16} />}
              action={<CreateCategoryButton />}
            />
          )}

        </Flex>

        {/* Create Default Categories Dialog */}
        <ConfirmationDialog
          open={defaultCategoriesDialogOpen}
          onOpenChange={setDefaultCategoriesDialogOpen}
          title="Confirm Default Categories"
          description="Initialize the system default categories (Math, Reading, Science, Writing, Chores, Hygiene, Positive Behavior, Attendance, Sports, Arts) if they don't already exist. This action is typically performed once during system setup."
          onConfirm={handleCreateDefaultCategories}
          confirmIcon={<Database size={16} />}
          confirmText="Initialize Default Categories"
          isLoading={createDefaultCategories.isPending}
          confirmColor="orange"
        />

        {/* Delete Category Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Category"
          description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone and will remove the category from the system.`}
          onConfirm={handleDeleteCategory}
          confirmIcon={<Trash2 size={16} />}
          confirmText="Delete Category"
          isLoading={deleteTaskCategory.isPending}
          confirmColor="red"
        />

      </Box >
    </div>
  );
};

export default TaskCategories;

function CreateCategoryButton() {
  return (
    <Button asChild>
      <Link to="/platform-admin/dashboard/task-categories/create">
        <Plus size={16} />  Create Category
      </Link>
    </Button>
  );
}