import { Badge, Box, Button, Callout, DropdownMenu, Flex, IconButton, Skeleton, Spinner, Table, Text, TextField } from '@radix-ui/themes';
import { AlertCircleIcon, MoreHorizontal, SearchIcon, Trash, UserPlus, X } from 'lucide-react';
import React, { useState } from 'react';
import { BarLoader } from 'react-spinners';
import { useTeachers } from '../../api/school-admin/school.queries';
import { ConfirmationDialog, EmptyStateCard, Loader, Pagination } from '../../components';
import { SortIcon } from '../../components/platform-admin/UserTable';
import { useDebounce } from '../../hooks/useDebounce';
import PageHeader from './components/PageHeader';

const Teachers = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('firstName');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);  
  const [selectedTeacherToRemove, setSelectedTeacherToRemove] = useState(null);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Queries
  const { data, isLoading, isFetching, isError, error } = useTeachers({
    page,
    limit,
    sort,
    order,
    search: searchTerm === '' ? '' : debouncedSearchTerm,
  });

  // Column definitions
  const columns = [
    {
      id: '_id',
      header: 'ID',
    },
    {
      id: 'firstName',
      header: 'Name',
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      sortable: true
    },
    {
      id: 'subjectsTaught',
      header: 'Subjects',
      sortable: false
    },
    {
      id: 'phoneNumber',
      header: 'Phone',
      sortable: true
    }
  ];

  // Handlers
  const handleSort = (field) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('asc');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPage(1);
  };

  const handleRemoveClick = (teacher) => {
    setSelectedTeacherToRemove(teacher);
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveCancel = () => {
    setIsRemoveDialogOpen(false);
    setSelectedTeacherToRemove(null);
  };

  const handleRemoveConfirm = () => {}

  // Loading states
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <TeachersPageHeader loading={isLoading} />
        <Flex justify="center" align="center">
          <Loader />
        </Flex>
      </div>
    );
  }

  // Error states
  if (isError) {
    return (
      <div className='space-y-6'>
        <TeachersPageHeader />
        <Callout.Root color='red' variant='surface'>
          <Callout.Icon>
            <AlertCircleIcon size={16} />
          </Callout.Icon>
          <Callout.Text>
            {error?.response?.data?.message || error?.message || 'Failed to load teachers'}
          </Callout.Text>
        </Callout.Root>
      </div>
    );
  }

  // Data
  const teachers = data?.data || [];
  const pagination = data?.pagination || {};
  const currentSort = { field: sort, order: order };

  // Render
  return (
    <>
      {/* Top bar loader */}
      {isFetching && (
        <div className='flex fixed top-0 right-0 left-0 z-50'>
          <BarLoader
            color='#00a2c7'
            width={'100%'}
            height={'4px'}
          />
        </div>
      )}
      <Box className='space-y-6'>
        {/* Header */}
        <TeachersPageHeader />

        {/* Search and Filters */}
        <Flex gap="3" align="center" wrap="wrap">
          <TextField.Root
            placeholder='Search students...'
            value={searchTerm}
            onChange={handleSearchChange}
            className='w-full max-w-sm'
          >
            <TextField.Slot>
              {isFetching ? <Spinner /> : <SearchIcon size={16} />}
            </TextField.Slot>
          </TextField.Root>

          {(searchTerm) && (
            <Button
              variant="soft"
              color="gray"
              onClick={handleClearFilters}
              size="2"
            >
              Reset <X size={16} />
            </Button>
          )}
        </Flex>

        {/* Table */}
        <Table.Root variant='surface' layout={'auto'} className='shadow-md'>
          <Table.Header>
            <Table.Row>
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
              <Table.ColumnHeaderCell className='font-medium'>
                Actions
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {teachers.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length + 1}>
                  <EmptyStateCard
                    title={
                      (searchTerm)
                        ? "No teachers found"
                        : "No teachers yet"
                    }
                    description={
                      (searchTerm)
                        ? "Try adjusting your search or filters"
                        : "No teachers have been added to your school yet"
                    }
                    action={searchTerm ? null : <AddTeacherButton />}
                  />
                </Table.Cell>
              </Table.Row>
            ) : (
              teachers.map((teacher) => (
                <Table.Row key={teacher._id} className='hover:bg-[--gray-a2]'>
                  <Table.Cell className='font-mono text-nowrap' >{teacher._id?.slice(-8)}</Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    {teacher.userId?.firstName} {teacher.userId?.lastName}
                  </Table.Cell>
                  <Table.Cell className='text-nowrap' >{teacher.userId?.email}</Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    {teacher.subjectsTaught?.length > 0 ? (
                      <Flex gap="1" >
                        {teacher.subjectsTaught.map((subject, index) => (
                          <Badge key={index} variant='soft' highContrast className='capitalize'>
                            {subject}
                          </Badge>
                        ))}
                      </Flex>
                    ) : (
                      <Text color="gray">-</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>{teacher.userId?.phoneNumber || '-'}</Table.Cell>
                  <Table.Cell>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <IconButton
                          variant="ghost"
                          color="gray"
                          highContrast
                        >
                          <MoreHorizontal size={18} />
                        </IconButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content variant='soft'>
                        <DropdownMenu.Group >
                          <DropdownMenu.Label>Actions</DropdownMenu.Label>
                          <DropdownMenu.Item color='red' 
                          onClick={() => handleRemoveClick(teacher)}
                          >
                            <Trash size={14} /> Remove Teacher
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
          totalPages={pagination?.totalPages ?? 1}
          totalItems={pagination?.totalDocs ?? 0}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPage={true}
          showPageInfo={true}
          showFirstLast={true}
          showPrevNext={true}
          itemsPerPageOptions={[5, 10, 20, 50, 100]}
          itemLabel="teachers"
          disabled={isLoading || isFetching}
        />
      </Box>

      {/* Remove Administrator Dialog */}
      <ConfirmationDialog
        title='Remove Teacher'
        description={
          selectedTeacherToRemove
            ? `Are you sure you want to remove ${selectedTeacherToRemove.userId?.firstName} ${selectedTeacherToRemove.userId?.lastName} (${selectedTeacherToRemove.userId?.email}) as a teacher from your school?`
            : 'Are you sure you want to remove this teacher from your school?'
        }
        open={isRemoveDialogOpen}
        onOpenChange={handleRemoveCancel}
        onConfirm={handleRemoveConfirm}
        confirmColor='red'
        // confirmText={removeAdministratorMutation.isPending ? 'Removing...' : 'Remove'}
        // isLoading={removeAdministratorMutation.isPending}
      />
    </>
  );
};

export default Teachers;

// Page header component
function TeachersPageHeader({ loading = false }) {
  return (
    <PageHeader
      title='Teachers'
      description="Manage your school's teachers"
    >
      <AddTeacherButton loading={loading} />
    </PageHeader>
  )
}

// Add teacher button component
function AddTeacherButton({ loading = false }) {
  return (
    <Skeleton loading={loading}>
      <Button className='shadow-md'>
        <UserPlus size={16} />
        Add Teacher
      </Button>
    </Skeleton>
  )
}