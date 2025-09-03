import { Badge, Button, Callout, Card, DropdownMenu, Flex, IconButton, Select, Separator, Table, Text, TextField } from '@radix-ui/themes'
import { AlertCircleIcon, BookOpen, Calendar, Check, ClipboardList, Filter, MoreHorizontal, PencilIcon, Plus, Tag, TrashIcon, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { BarLoader } from 'react-spinners'
import { toast } from 'sonner'
import { useDeleteTask } from '../../api/task/task.mutations'
import { useGetTasks } from '../../api/task/task.queries'
import { ConfirmationDialog, EmptyStateCard, Loader, Pagination } from '../../components'
import PageHeader from '../../components/PageHeader'
import { SortIcon } from '../../components/platform-admin/UserTable'
import { formatDate } from '../../utils/helperFunctions'

function Tasks() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const currentSort = { field: sort, order: order };

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    assignedTo: '',
    createdBy: '',
    category: '',
    subCategory: '',
    status: '',
    difficulty: '',
    requiresApproval: '',
    isFeatured: '',
    schoolId: '',
    classId: '',
    startDate: '',
    endDate: '',
    dueDate: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const { data, isLoading, isError, error, isFetching } = useGetTasks({
    page,
    limit,
    sort,
    order
  })

  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const { data: tasks = [], pagination = {} } = data ?? {}

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
      // Toggle order if clicking the same field
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
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
      assignedTo: '',
      createdBy: '',
      category: '',
      subCategory: '',
      status: '',
      difficulty: '',
      requiresApproval: '',
      isFeatured: '',
      schoolId: '',
      classId: '',
      startDate: '',
      endDate: '',
      dueDate: ''
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteTaskId(task._id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTaskId) {
      deleteTask(deleteTaskId, {
        onSuccess: () => {
          toast.success('Task deleted successfully');
          setDeleteTaskId(null);
          setTaskToDelete(null);
          setShowDeleteDialog(false);
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || error?.message || 'Failed to delete task');
        }
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTaskId(null);
    setTaskToDelete(null);
    setShowDeleteDialog(false);
  };

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title',
      sortable: true,
    },
    {
      header: 'Description',
      accessorKey: 'description',
      sortable: true,
    },
    {
      header: "Category",
      accessorKey: "category",
    },
    {
      header: "Sub Category",
      accessorKey: "subCategory",
    },
    {
      header: "Point Value",
      accessorKey: "pointValue",
      sortable: true,
    },
    {
      header: "Created By",
      accessorKey: "createdBy",
    },
    {
      header: "Creator Role",
      accessorKey: "creatorRole",
    },
    {
      header: "Assigned To",
      accessorKey: "assignedTo",
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      sortable: true,
    },
    {
      header: "Requires Approval",
      accessorKey: "requiresApproval",
    },
    {
      header: "Approver Type",
      accessorKey: "approverType",
    },
    {
      header: "Difficulty",
      accessorKey: "difficulty",
    },
    {
      header: "Featured",
      accessorKey: "isFeatured",
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
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
          title={'Tasks Management'}
          description={'Create, assign, and manage tasks across the platform'}
        >
          {/* Create task button */}
          <CreateTaskButton />
        </PageHeader>

        <Separator size={'4'} />

        {/* Search and Filter Controls */}
        <Flex direction="column" gap="4" className='max-w-4xl'>
          {/* Search and Filter Toggle Row */}
          <Flex justify="between" align="center" gap="3">

            <Flex align="center" gap="4">
              <Button
                variant={showFilters ? "solid" : "soft"}
                color={!showFilters && "gray"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                Filters
              </Button>

              {getActiveFiltersCount() > 0 && (
                <Button variant="ghost" color="gray" onClick={clearFilters}>
                  <X size={16} />
                  Clear
                </Button>
              )}
            </Flex>
          </Flex>

          {showFilters && <Card className='flex flex-col gap-4' size='2'>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <>
                <div>
                  <Text size="3" weight="medium" mb="3" style={{ display: 'block' }}>
                    <Tag size={16} style={{ display: 'inline', marginRight: '8px' }} />
                    Filter Options
                  </Text>

                  <Flex direction="column" gap="4">
                    {/* Row 1: Assignment and Creation */}
                    <Flex gap="4" wrap="wrap">
                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <Text as='p' size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          <Users size={14} style={{ display: 'inline', marginRight: '6px' }} />
                          Assigned To
                        </Text>
                        <Select.Root value={filters.assignedTo || "all"} onValueChange={(value) => handleFilterChange('assignedTo', value === "all" ? "" : value)}>
                          <Select.Trigger placeholder="Select assignment type" />
                          <Select.Content variant='soft' position='popper'>
                            <Select.Item value="all">All Assignments</Select.Item>
                            <Select.Item value="student">Students</Select.Item>
                            <Select.Item value="parent">Parents</Select.Item>
                            <Select.Item value="teacher">Teachers</Select.Item>
                            <Select.Item value="unassigned">Unassigned</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </div>

                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          Created By
                        </Text>
                        <TextField.Root
                          placeholder="Creator ID or name"
                          value={filters.createdBy}
                          onChange={(e) => handleFilterChange('createdBy', e.target.value)}
                          className='w-full'
                        />
                      </div>

                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          Status
                        </Text>
                        <Select.Root value={filters.status || "all"} onValueChange={(value) => handleFilterChange('status', value === "all" ? "" : value)}>
                          <Select.Trigger placeholder="Select status" />
                          <Select.Content variant='soft' position='popper'>
                            <Select.Item value="all">All Statuses</Select.Item>
                            <Select.Item value="pending">Pending</Select.Item>
                            <Select.Item value="in_progress">In Progress</Select.Item>
                            <Select.Item value="completed">Completed</Select.Item>
                            <Select.Item value="overdue">Overdue</Select.Item>
                            <Select.Item value="cancelled">Cancelled</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </div>
                    </Flex>

                    {/* Row 2: Categories and Properties */}
                    <Flex gap="4" wrap="wrap">
                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <Text as='p' size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          <BookOpen size={14} style={{ display: 'inline', marginRight: '6px' }} />
                          Category
                        </Text>
                        <Select.Root value={filters.category || "all"} onValueChange={(value) => handleFilterChange('category', value === "all" ? "" : value)}>
                          <Select.Trigger placeholder="Select category" />
                          <Select.Content variant='soft' position='popper'>
                            <Select.Item value="all">All Categories</Select.Item>
                            <Select.Item value="academic">Academic</Select.Item>
                            <Select.Item value="behavioral">Behavioral</Select.Item>
                            <Select.Item value="extracurricular">Extracurricular</Select.Item>
                            <Select.Item value="community">Community Service</Select.Item>
                            <Select.Item value="personal">Personal Development</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </div>

                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          Sub Category
                        </Text>
                        <TextField.Root
                          placeholder="Enter sub category"
                          value={filters.subCategory}
                          onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                        />
                      </div>

                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <Text as='p' size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          Difficulty
                        </Text>
                        <Select.Root value={filters.difficulty || "all"} onValueChange={(value) => handleFilterChange('difficulty', value === "all" ? "" : value)}>
                          <Select.Trigger placeholder="Select difficulty" />
                          <Select.Content variant='soft' position='popper'>
                            <Select.Item value="all">All Difficulties</Select.Item>
                            <Select.Item value="easy">Easy</Select.Item>
                            <Select.Item value="medium">Medium</Select.Item>
                            <Select.Item value="hard">Hard</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </div>
                    </Flex>

                    {/* Row 3: Approval and Features */}
                    <Flex gap="4" wrap="wrap">
                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <Text as='p' size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          Requires Approval
                        </Text>
                        <Select.Root value={filters.requiresApproval || "all"} onValueChange={(value) => handleFilterChange('requiresApproval', value === "all" ? "" : value)}>
                          <Select.Trigger placeholder="Select approval requirement" />
                          <Select.Content variant='soft' position='popper'>
                            <Select.Item value="all">All Tasks</Select.Item>
                            <Select.Item value="true">Requires Approval</Select.Item>
                            <Select.Item value="false">No Approval Required</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </div>

                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          Featured Tasks
                        </Text>
                        <Select.Root value={filters.isFeatured || "all"} onValueChange={(value) => handleFilterChange('isFeatured', value === "all" ? "" : value)}>
                          <Select.Trigger placeholder="Select featured status" />
                          <Select.Content variant='soft' position='popper'>
                            <Select.Item value="all">All Tasks</Select.Item>
                            <Select.Item value="true">Featured Only</Select.Item>
                            <Select.Item value="false">Non-Featured Only</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </div>

                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          School ID
                        </Text>
                        <TextField.Root
                          placeholder="Enter school ID"
                          value={filters.schoolId}
                          onChange={(e) => handleFilterChange('schoolId', e.target.value)}
                        />
                      </div>
                    </Flex>

                    {/* Row 4: Dates */}
                    <Flex gap="4" wrap="wrap">
                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <Text as='p' size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                          Start Date
                        </Text>
                        <TextField.Root
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange('startDate', e.target.value)}
                          className='w-max'
                        />
                      </div>

                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          End Date
                        </Text>
                        <TextField.Root
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange('endDate', e.target.value)}
                          className='w-max'
                        />
                      </div>

                      <div style={{ minWidth: '200px', flex: 1 }}>
                        <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                          Due Date
                        </Text>
                        <TextField.Root
                          type="date"
                          value={filters.dueDate}
                          onChange={(e) => handleFilterChange('dueDate', e.target.value)}
                          className='w-max'
                        />
                      </div>
                    </Flex>
                  </Flex>
                </div>
              </>
            )}

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <>
                <Separator size={'4'} />
                <div>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Active Filters ({getActiveFiltersCount()})
                  </Text>
                  <Flex gap="2" wrap="wrap">
                    {Object.entries(filters).map(([key, value]) => {
                      if (!value) return null;

                      const filterLabels = {
                        search: 'Search',
                        assignedTo: 'Assigned To',
                        createdBy: 'Created By',
                        category: 'Category',
                        subCategory: 'Sub Category',
                        status: 'Status',
                        difficulty: 'Difficulty',
                        requiresApproval: 'Requires Approval',
                        isFeatured: 'Featured',
                        schoolId: 'School ID',
                        classId: 'Class ID',
                        startDate: 'Start Date',
                        endDate: 'End Date',
                        dueDate: 'Due Date'
                      };

                      return (
                        <Badge key={key} size={'2'} highContrast >
                          {filterLabels[key]}: {value}
                          <IconButton
                            size="1"
                            variant="ghost"
                            color="gray"
                            onClick={() => handleFilterChange(key, '')}
                            style={{ marginLeft: '4px' }}
                          >
                            <X size={12} />
                          </IconButton>
                        </Badge>
                      );
                    })}
                  </Flex>
                </div>
              </>
            )}
          </Card>}

        </Flex>

        {isLoading ? (
          // Loading state
          <Flex justify="center">
            <Loader />
          </Flex>
        ) : isError ? (
          // Error state
          <Callout.Root color='red'>
            <Callout.Icon>
              <AlertCircleIcon size={16} />
            </Callout.Icon>
            <Callout.Text>
              {error?.response?.data?.message || error?.message || 'Something went wrong'}
            </Callout.Text>
          </Callout.Root>

        ) : tasks.length > 0 ? (
          // Main data table
          <Card size={'2'} className='shadow [--card-border-width:0px]'>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  {columns.map((column) => (
                    <Table.ColumnHeaderCell key={column.accessorKey} className='font-medium text-nowrap'
                      onClick={() => handleSort(column.accessorKey)}
                      style={column.sortable ? { cursor: 'pointer' } : undefined}
                    >
                      <Flex align="center" gap="2" className='font-medium'>
                        {column.header}
                        {column.sortable && (
                          <SortIcon currentSort={currentSort} columnName={column.accessorKey} />
                        )}
                      </Flex>
                    </Table.ColumnHeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {tasks.map((task) => (
                  <Table.Row
                    className='hover:bg-[--gray-a3] odd:bg-[--gray-a2]'
                    key={task._id}
                  >
                    <Table.Cell>
                      <Text title={task.title} className='line-clamp-1 min-w-[300px]'>{task.title}</Text>
                    </Table.Cell>
                    <Table.Cell >
                      <Text title={task.description} className='line-clamp-1 min-w-[300px]'>{task.description || '-'}</Text>
                    </Table.Cell>
                    <Table.Cell className='text-nowrap'>{task.category}</Table.Cell>
                    <Table.Cell className='text-nowrap'>{task.subCategory || '-'}</Table.Cell>
                    <Table.Cell>{task.pointValue}</Table.Cell>
                    <Table.Cell>{task.createdBy}</Table.Cell>
                    <Table.Cell>{task.creatorRole}</Table.Cell>
                    <Table.Cell>{task.assignedTo?.role || '-'}</Table.Cell>
                    <Table.Cell className='text-nowrap'>{formatDate(task.dueDate) || '-'}</Table.Cell>
                    <Table.Cell>{task.requiresApproval ? <Check size={14} color='var(--green-10)' /> : <X size={14} color='var(--red-10)' />}</Table.Cell>
                    <Table.Cell>{task.approverType || '-'}</Table.Cell>
                    <Table.Cell>{task.difficulty || '-'}</Table.Cell>
                    <Table.Cell>{task.isFeatured ? <Check size={14} color='var(--green-10)' /> : <X size={14} color='var(--red-10)' />}</Table.Cell>
                    <Table.Cell className='text-nowrap'>{formatDate(task.createdAt) || '-'}</Table.Cell>
                    <Table.Cell>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <IconButton
                            variant="ghost"
                            color="gray"
                          >
                            <MoreHorizontal size={14} />
                          </IconButton>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content variant='soft'>
                          <DropdownMenu.Group >
                            <DropdownMenu.Label className='text-xs'>Actions</DropdownMenu.Label>
                            <DropdownMenu.Item asChild>
                              <Link to={`/platform-admin/dashboard/tasks/edit/${task._id}`}>
                                <PencilIcon size={14} />
                                Edit Task
                              </Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item color='red'
                              disabled={isDeleting && deleteTaskId === task._id}
                              onClick={() => handleDeleteClick(task)}
                            >
                              <TrashIcon size={14} />
                              Delete Task
                            </DropdownMenu.Item>
                          </DropdownMenu.Group>
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
              itemLabel="tasks"
              disabled={isLoading || isFetching}
              className='mt-4'
            />
          </Card>
        ) : (
          // Empty state
          <EmptyStateCard
            title="No tasks found"
            description="No tasks found matching your criteria."
            icon={<ClipboardList size={16} />}
            action={<CreateTaskButton />}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Task"
          description={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          confirmText="Delete Task"
          cancelText="Cancel"
          isLoading={isDeleting}
          confirmColor="red"
        />
      </div>
    </div>
  )
}

export default Tasks

function CreateTaskButton() {
  return (
    <Button asChild>
      <Link to='create'>
        <Plus size={16} /> Add Task
      </Link>
    </Button>
  );
}
