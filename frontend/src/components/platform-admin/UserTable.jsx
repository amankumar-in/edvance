import { Box, Callout, Card, Flex, IconButton, Select, Separator, Table, Text, Tooltip } from '@radix-ui/themes';
import { AlertCircleIcon, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, ChevronUp, EyeIcon, PencilIcon, TrashIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router';
import { BarLoader } from 'react-spinners';
import { useUsersByRole } from '../../api/user/user.queries';
import { Loader } from '../../components';

// Reusable sort icon component
export const SortIcon = ({ currentSort, columnName }) => {
  if (currentSort.field === columnName) {
    return currentSort.order === 'asc'
      ? <ChevronUp className='size-4' />
      : <ChevronDown className='size-4' />
  }
  return <ChevronsUpDown className='size-4' />
};

const UserTable = ({ role }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState('firstName');
  const [order, setOrder] = useState('desc');

  const { data, isLoading, isFetching, isError, error } = useUsersByRole({
    role,
    page,
    limit,
    sort,
    order
  });

  // Column definitions for headers only
  const columns = [
    {
      id: '_id',
      header: 'ID',
      sortable: true
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
      id: 'phoneNumber',
      header: 'Phone',
      sortable: true
    }
  ];

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

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (data?.data?.hasNextPage) {
      setPage(page + 1);
    }
  };

  // Placeholder functions for actions
  const handleView = (userId) => {
    console.log('View user:', userId);
    // Implement view logic
  };

  const handleEdit = (userId) => {
    console.log('Edit user:', userId);
    // Implement edit logic
  };

  const handleDelete = (userId) => {
    console.log('Delete user:', userId);
    // Implement delete logic
  };


  if (isLoading) {
    return (
      <>
        <Flex justify="center" align="center">
          <Loader />
        </Flex>
      </>
    );
  }

  if (isError) {
    return (
      <Callout.Root color='red'>
        <Callout.Icon>
          <AlertCircleIcon />
        </Callout.Icon>
        <Callout.Text>
          {error?.response?.data?.message || error?.message || 'Something went wrong'}
        </Callout.Text>
      </Callout.Root>
    );
  }

  const users = data?.data?.docs || [];
  const pagination = data?.data || {};

  // Current sort state object for the SortIcon component
  const currentSort = { field: sort, order: order };

  return (
    <Box>
      {isFetching && <div className='fixed right-0 left-0 top-16'>
        <BarLoader
          color='#0090ff'
          width={'100%'}
          height={'4px'}
        />
      </div>}
      <Card size={'2'} className='shadow-md'>
        <Table.Root variant='ghost' layout={'auto'}>
          <Table.Header>
            <Table.Row>
              {columns.map((column) => (
                <Table.ColumnHeaderCell

                  key={column.id}
                  onClick={column.sortable ? () => handleSort(column.id) : undefined}
                  style={column.sortable ? { cursor: 'pointer' } : undefined}
                >
                  <Flex align="center" gap="2" className='font-medium'>
                    {column.header}
                    {column.sortable && (
                      <SortIcon currentSort={currentSort} columnName={column.id} />
                    )}
                  </Flex>
                </Table.ColumnHeaderCell>
              ))}
              <Table.ColumnHeaderCell className='font-medium'>
                Actions
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {users.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length + 1}>
                  <Text align="center">No users found</Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              users.map((user) => (
                <Table.Row key={user._id} className='hover:bg-[--gray-a3] odd:bg-[--gray-a2]'>
                  <Table.Cell>{user._id}</Table.Cell>
                  <Table.Cell className='text-nowrap'>{user.name}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>{user.phoneNumber || '-'}</Table.Cell>
                  <Table.Cell>
                    <Flex gap="2" align={'center'}>
                      <Tooltip content='Edit user'>
                        <IconButton
                          size={'1'}
                          variant='soft'
                          highContrast
                        >
                          <PencilIcon size={14} />
                        </IconButton>
                      </Tooltip>
                      <Separator orientation={'vertical'} />
                      <Tooltip content='View user'>
                        <IconButton
                          // variant='ghost'
                          size={'1'}
                          asChild
                          variant='soft'
                          highContrast
                        >
                          <Link to={`/platform-admin/dashboard/users/user/${user._id}`}>
                            <EyeIcon size={14} />
                          </Link>
                        </IconButton  >
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
            )}
          </Table.Body>
        </Table.Root>

        <Flex justify="between" align="center" mt="4" wrap={'wrap-reverse'} gap={'2'}>
          <Flex align="center" gap="2">
            <Text size="2">Rows per page:</Text>
            <Select.Root
              value={String(limit)}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <Select.Trigger />
              <Select.Content position='popper' variant='soft'>
                <Select.Item value="10">10</Select.Item>
                <Select.Item value="25">25</Select.Item>
                <Select.Item value="50">50</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>

          {/* Pagination */}
          <Flex align="center" gap="2">
            <Text size="2">
              {pagination.pagingCounter || 0}-{Math.min((pagination.pagingCounter || 0) + (users.length - 1), pagination.totalDocs || 0)} of {pagination.totalDocs || 0}
            </Text>
            <IconButton
              aria-label='First'
              title='First'
              variant="ghost"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft size={16} />
            </IconButton>
            <IconButton
              aria-label='Previous'
              title='Previous'
              variant="ghost"
              disabled={!pagination.hasPrevPage}
              onClick={handlePreviousPage}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton
              aria-label='Next'
              title='Next'
              variant="ghost"
              disabled={!pagination.hasNextPage}
              onClick={handleNextPage}
            >
              <ChevronRight size={16} />
            </IconButton>
            <IconButton
              aria-label='Last'
              title='Last'
              variant="ghost"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage(pagination.totalPages)}
            >
              <ChevronsRight size={16} />
            </IconButton>
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
};

export default UserTable; 