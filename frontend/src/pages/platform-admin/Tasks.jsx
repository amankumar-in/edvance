import { Badge, Button, Callout, Card, Flex, Heading, IconButton, Select, Separator, Table, Text, TextField, Tooltip } from '@radix-ui/themes'
import { AlertCircleIcon, BookOpen, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ClipboardList, Filter, PencilIcon, Plus, Tag, TrashIcon, Users, X } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router'
import { BarLoader } from 'react-spinners'
import { useGetTasks } from '../../api/task/task.queries'
import { EmptyStateCard, Loader } from '../../components'
import { SortIcon } from '../../components/platform-admin/UserTable'
import { formatDate } from '../../utils/helperFunctions'

function Tasks() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [sort, setSort] = useState('dueDate');
  const [order, setOrder] = useState('asc');
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

  const { data, isLoading, isError, error, isFetching } = useGetTasks({
    page,
    limit,
    sort,
    order
  })

  const { data: tasks = [], pagination = {} } = data ?? {}

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
    setPage(1) // Reset to first page when changing limit
  }

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

  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Title',
      accessorKey: 'title',
    },
    {
      header: 'Description',
      accessorKey: 'description',
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
    },
    {
      header: "Created By",
      accessorKey: "createdBy",
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
            <Heading as='h1' size='6' weight='medium' mb={'1'}>Tasks Management</Heading>
            <Text as="p" color="gray" size="2">
              Create, assign, and manage tasks across the platform
            </Text>
          </div>

          {/* Create task button */}
          <Button asChild>
            <Link to='create'>
              <Plus size={16} /> Add Task
            </Link>
          </Button>
        </Flex>

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
          <div>
            <Table.Root variant='surface' layout={'auto'}>
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
                  <Table.Row key={task._id} className='hover:bg-[--gray-a2]'>
                    <Table.Cell>{task._id}</Table.Cell>
                    <Table.Cell>
                      <Text title={task.title} className='line-clamp-2 min-w-[250px]'>{task.title}</Text>
                    </Table.Cell>
                    <Table.Cell >
                      <Text title={task.description} className='line-clamp-2 min-w-[250px]'>{task.description}</Text>
                    </Table.Cell>
                    <Table.Cell>{task.category}</Table.Cell>
                    <Table.Cell>{task.subCategory || '-'}</Table.Cell>
                    <Table.Cell>{task.pointValue}</Table.Cell>
                    <Table.Cell>{task.createdBy}</Table.Cell>
                    <Table.Cell>{task.assignedTo?.role || '-'}</Table.Cell>
                    <Table.Cell className='text-nowrap'>{formatDate(task.dueDate) || '-'}</Table.Cell>
                    <Table.Cell>{task.requiresApproval ? 'Yes' : 'No'}</Table.Cell>
                    <Table.Cell>{task.approverType || '-'}</Table.Cell>
                    <Table.Cell>{task.difficulty || '-'}</Table.Cell>
                    <Table.Cell>{task.isFeatured ? 'Yes' : 'No'}</Table.Cell>
                    <Table.Cell className='text-nowrap'>{formatDate(task.createdAt) || '-'}</Table.Cell>
                    <Table.Cell>
                      <Flex gap="2" align={'center'}>
                        <Tooltip content='Edit task'>
                          <IconButton
                            size={'1'}
                            variant='soft'
                            highContrast
                          >
                            <PencilIcon size={14} />
                          </IconButton>
                        </Tooltip>
                        <Separator orientation={'vertical'} />
                        <Tooltip content='Delete user'>
                          <IconButton
                            // variant='ghost'
                            color='red'
                            size={'1'}
                            variant='soft'
                            highContrast
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

            {/* Pagination Controls */}
            {!isLoading && !isError && tasks.length > 0 && (
              <Flex justify="between" align="center" mt="4" wrap={'wrap'} gap={'2'}>
                <Flex align="center" gap="2">
                  <Text size="2">Rows per page:</Text>
                  <Select.Root value={String(limit)} onValueChange={handleLimitChange}>
                    <Select.Trigger />
                    <Select.Content variant='soft' position={'popper'}>
                      <Select.Group>
                        <Select.Item value="10">10</Select.Item>
                        <Select.Item value="20">20</Select.Item>
                        <Select.Item value="50">50</Select.Item>
                        <Select.Item value="100">100</Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex align="center" gap="2">
                  <Text size="2">
                    {pagination.page > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total || 0}
                  </Text>
                  <IconButton
                    color='gray'
                    aria-label='First'
                    title='First'
                    variant="ghost"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(1)}
                  >
                    <ChevronsLeft size={16} />
                  </IconButton>
                  <IconButton
                    color='gray'
                    aria-label='Previous'
                    title='Previous'
                    variant="ghost"
                    disabled={pagination.page <= 1}
                    onClick={handlePreviousPage}
                  >
                    <ChevronLeft size={16} />
                  </IconButton>
                  <IconButton
                    color='gray'
                    aria-label='Next'
                    title='Next'
                    variant="ghost"
                    disabled={pagination.page >= pagination.pages}
                    onClick={handleNextPage}
                  >
                    <ChevronRight size={16} />
                  </IconButton>
                  <IconButton
                    color='gray'
                    aria-label='Last'
                    title='Last'
                    variant="ghost"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPage(pagination.pages)}
                  >
                    <ChevronsRight size={16} />
                  </IconButton>
                </Flex>
              </Flex>
            )}
          </div>
        ) : (
          // Empty state
          <EmptyStateCard
            title="No tasks found"
            description="No tasks found matching your criteria."
            icon={<ClipboardList size={16} />}
          />
        )}
      </div>
    </div>
  )
}

export default Tasks
