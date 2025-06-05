import { Button, Callout, Flex, Heading, IconButton, Select, Separator, Table, Text, Tooltip } from '@radix-ui/themes'
import { AlertCircleIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PencilIcon, Plus, TrashIcon } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router'
import { BarLoader } from 'react-spinners'
import { useGetTasks } from '../../api/task/task.queries'
import { Loader } from '../../components'
import { SortIcon } from '../../components/platform-admin/UserTable'
import { formatDate } from '../../utils/helperFunctions'

function Tasks() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [sort, setSort] = useState('dueDate');
  const [order, setOrder] = useState('asc');
  const currentSort = { field: sort, order: order };

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
      <div className='relative px-4 py-8 space-y-4 lg:px-8 xl:px-12'>

        <Flex justify='between' align='center'>
          <Heading as='h1' size='6' weight='medium'>Tasks</Heading>
          <Button asChild>
            <Link to='create'>
              <Plus size={16} /> Add Task
            </Link>
          </Button>
        </Flex>
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
              {isLoading ? (
                <Table.Row >
                  <Table.Cell colSpan={columns.length + 1}>
                    <Loader className='size-6' borderWidth={2} borderColor='var(--accent-9)' />
                  </Table.Cell>
                </Table.Row>
              ) : (
                isError ? (
                  <Table.Row>
                    <Table.Cell colSpan={columns.length + 1}>
                      <Callout.Root color='red'>
                        <Callout.Icon>
                          <AlertCircleIcon size={16} />
                        </Callout.Icon>
                        <Callout.Text>
                          {error?.response?.data?.message || error?.message || 'Something went wrong'}
                        </Callout.Text>
                      </Callout.Root>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  tasks.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={columns.length + 1}>
                        <Text align="center">No tasks found</Text>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    tasks.map((task) => (
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
                    ))
                  )
                )
              )}
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
      </div>
    </div>
  )
}

export default Tasks
