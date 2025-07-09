import { Box, Button, Callout, DropdownMenu, Flex, IconButton, Spinner, Table, TextField } from '@radix-ui/themes';
import { AlertCircleIcon, EyeIcon, MoreHorizontal, SearchIcon, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router';
import { BarLoader } from 'react-spinners';
import { useStudents } from '../../api/school-admin/school.queries';
import { EmptyStateCard, Loader, Pagination } from '../../components';
import { SortIcon } from '../../components/platform-admin/UserTable';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/helperFunctions';
import PageHeader from './components/PageHeader';

const Students = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('firstName');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, isFetching, isError, error } = useStudents({
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
      id: 'grade',
      header: 'Grade',
    },
    {
      id: 'dateOfBirth',
      header: 'Date of Birth',
    }
  ];

  const handleSort = (field) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('asc');
    }
  };

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing items per page
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };


  const handleClearFilters = () => {
    setSearchTerm('');
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <StudentsPageHeader />
        <Flex justify="center" align="center">
          <Loader />
        </Flex>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='space-y-6'>
        <StudentsPageHeader />
        <Callout.Root color='red' variant='surface' >
          <Callout.Icon>
            <AlertCircleIcon size={16} />
          </Callout.Icon>
          <Callout.Text>
            {error?.response?.data?.message || error?.message || 'Failed to load students'}
          </Callout.Text>
        </Callout.Root>
      </div>
    );
  }

  const students = data?.data || [];
  const pagination = data?.pagination || {};
  const currentSort = { field: sort, order: order };

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
        <StudentsPageHeader />

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

          {searchTerm && (
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
        <Table.Root variant='surface'>
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
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {students.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length + 1}>
                  <EmptyStateCard
                    title={
                      (searchTerm)
                        ? "No students found"
                        : "No students yet"
                    }
                    description={
                      (searchTerm)
                        ? "Try adjusting your search or filters"
                        : "No students have been added to your school yet"
                    }
                  />
                </Table.Cell>
              </Table.Row>
            ) : (
              students.map((student) => (
                <Table.Row key={student._id} className='hover:bg-[--gray-a2]'>
                  <Table.Cell className='font-mono text-nowrap'>
                    {student._id && `${student._id.slice(-8)}`}
                  </Table.Cell>
                  <Table.Cell>
                    {student.userId?.firstName} {student.userId?.lastName}
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>{student.userId?.email}</Table.Cell>
                  <Table.Cell className='text-nowrap'>{student.grade || '-'}</Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    {formatDate(student.userId?.dateOfBirth)}
                  </Table.Cell>
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
                          <DropdownMenu.Label>Actions</DropdownMenu.Label>
                          <DropdownMenu.Item asChild>
                            <Link to={`/school-admin/students/${student._id}`}>
                              <EyeIcon size={14} />
                              View Student
                            </Link>
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
          itemLabel="students"
          disabled={isLoading || isFetching}
        />
      </Box>
    </>
  );
};

export default Students;

function StudentsPageHeader() {
  return (
    <PageHeader
      title='Students'
      description="Manage your school's students"
    />
  )
}