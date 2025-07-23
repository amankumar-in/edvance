import { Button, DropdownMenu, Flex, IconButton, Table, Text } from '@radix-ui/themes'
import { CheckSquare, MoreHorizontal, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router'
import { BarLoader } from 'react-spinners'
import { toast } from 'sonner'
import { useGetSchoolProfile } from '../../api/school-admin/school.queries'
import { useDeleteTask } from '../../api/task/task.mutations'
import { useGetTasks } from '../../api/task/task.queries'
import { ConfirmationDialog, EmptyStateCard, ErrorCallout, Loader, Pagination } from '../../components'
import { SortIcon } from '../../components/platform-admin/UserTable'
import { formatDate } from '../../utils/helperFunctions'
import PageHeader from './components/PageHeader'


function Tasks() {
  // State for filters and search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const { data, isLoading: isSchoolLoading, isError: isSchoolError, error: schoolError } = useGetSchoolProfile()
  const schoolId = data?.data?._id
  const { data: tasks, isLoading: isTasksLoading, isFetching: isTasksFetching, isError: isTasksError, error: tasksError } = useGetTasks({ 
    role: 'school_admin', 
    schoolId: schoolId,
    page,
    limit,
    sort,
    order
  }, {
    enabled: !!schoolId
  })

  const tasksData = tasks?.data;
  const pagination = tasks?.pagination;
  const currentSort = { field: sort, order: order };

  // Sort functionality
  const handleSort = (field) => {
    if (sort === field) {
      // Toggle order if clicking the same field
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSort(field);
      setOrder('asc');
    }
    // setPage(1); // Reset to first page when sorting
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit, newPage) => {
    setLimit(newLimit);
    setPage(1);
  };


  const columns = [
    {
      header: 'Title',
      id: 'title',
    },
    {
      header: 'Description',
      id: 'description',
    },
    {
      header: "Category",
      id: "category",
    },
    {
      header: "Sub Category",
      id: "subCategory",
    },
    {
      header: "Point Value",
      id: "pointValue",
    },
    {
      header: "Assigned To",
      id: "assignedTo",
    },
    {
      header: "Due Date",
      id: "dueDate",
      sortable: true,
    },
    {
      header: "Difficulty",
      id: "difficulty",
    },
    {
      header: "Created At",
      id: "createdAt",
      sortable: true,
    },
    {
      header: "Actions",
      id: "actions",
    }
  ]

  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();


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

  if (isSchoolLoading || isTasksLoading) {
    return (
      <div className='space-y-6'>
        <TaskPageHeader />
        <Flex justify='center' align='center'>
          <Loader />
        </Flex>
      </div>
    )
  }

  if(isSchoolError || isTasksError){
    return (
      <div className="space-y-6">
        <TaskPageHeader />
        <ErrorCallout errorMessage={schoolError?.response?.data?.message || schoolError?.message || tasksError?.response?.data?.message || tasksError?.message || 'Failed to load tasks'}
        className={'mx-auto max-w-3xl'}
        />
      </div>
    )
  }

  return (
    <>
      {isTasksFetching && (
        <div className='flex fixed top-0 right-0 left-0 z-50'>
          <BarLoader
            color='#00a2c7'
            width={'100%'}
            height={'4px'}
          />
        </div>
      )}
      <div className='space-y-6'>
        <TaskPageHeader />

        <Table.Root variant='surface' layout={'auto'} className='shadow-md'>
          <Table.Header>
            <Table.Row >
              {columns.map((column) => (
                <Table.ColumnHeaderCell
                  key={column.id}
                  onClick={column.sortable ? () => handleSort(column.id) : undefined}
                  style={column.sortable ? { cursor: 'pointer' } : undefined}
                  className='font-medium text-nowrap'
                >
                  {column.sortable ? (
                    <Button variant='ghost' color='gray' className='font-medium' highContrast>
                      {column.header} <SortIcon currentSort={currentSort} columnName={column.id} />

                    </Button>
                  ) : (
                    column.header
                  )}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tasksData.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length + 1}>
                  <EmptyStateCard
                    title='No tasks found'
                    icon={<CheckSquare />}
                  />
                </Table.Cell>
              </Table.Row>
            ) : (
              tasksData.map((task) => (
                <Table.Row key={task._id} className='hover:bg-[--gray-a2]'>
                  <Table.Cell title={task.title}>
                    <Text as="p" title={task.title} className='line-clamp-2 min-w-[250px]'>{task.title}</Text>
                  </Table.Cell>
                  <Table.Cell title={task.description}>
                    <Text as="p" title={task.description} className='line-clamp-2 min-w-[250px]'>{task.description || '-'}</Text>
                  </Table.Cell>
                  <Table.Cell>{task.category}</Table.Cell>
                  <Table.Cell>{task.subCategory}</Table.Cell>
                  <Table.Cell>{task.pointValue}</Table.Cell>
                  <Table.Cell>
                    {task?.assignedTo?.role}
                  </Table.Cell>
                  <Table.Cell>{formatDate(task.dueDate)}</Table.Cell>
                  <Table.Cell>{task.difficulty}</Table.Cell>
                  <Table.Cell>{formatDate(task.createdAt)}</Table.Cell>
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
                            <Link to={`/school-admin/tasks/edit/${task._id}`}>
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
              ))
            )}
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
          disabled={isTasksLoading}
        />


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
    </>
  )
}

export default Tasks

function TaskPageHeader() {
  return (
    <PageHeader title='Tasks' description='Manage tasks for your school' >
      <CreateTaskButton />
    </PageHeader>
  )
}

function CreateTaskButton() {
  return (
    <Button className='shadow-md' asChild>
      <Link to='/school-admin/tasks/create'>
        <PlusIcon size={16} />
        Create Task
      </Link>
    </Button>
  )
}
