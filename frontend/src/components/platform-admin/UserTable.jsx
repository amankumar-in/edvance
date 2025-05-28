import { Box, Button, Callout, Flex, IconButton, Select, Separator, Table, Text } from '@radix-ui/themes';
import { AlertCircleIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import React, { useState } from 'react';
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
import { BarLoader } from 'react-spinners';
import { Loader } from '../../components';
import { Link } from 'react-router';
import { useUsersByRole } from '../../api/user/user.queries'

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
          <Loader className='size-6' borderWidth={2} borderColor='var(--accent-9)' />
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

  return (
    <Box>
      {isFetching && <div className='fixed left-0 right-0 top-16'>
        <BarLoader
          color='#0090ff'
          width={'100%'}
          height={'4px'}
        />
      </div>}
      <div
        style={{
          overflowX: 'auto',
          width: '100%',
        }}
      >
        <Table.Root variant='ghost' style={{ minWidth: 700 }}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell onClick={() => handleSort('_id')} style={{ cursor: 'pointer' }}>
                <Flex align="center" gap="2" className='font-medium'>
                  ID
                  {sort === '_id' && (
                    order === 'asc' ? <MdArrowDropUp className='size-5' /> : <MdArrowDropDown className='size-5' />
                  )}
                </Flex>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell onClick={() => handleSort('firstName')} style={{ cursor: 'pointer' }}>
                <Flex align="center" gap="2" className='font-medium'>
                  Name
                  {sort === 'firstName' && (
                    order === 'asc' ? <MdArrowDropUp className='size-5' /> : <MdArrowDropDown className='size-5' />
                  )}
                </Flex>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                <Flex align="center" gap="2" className='font-medium'>
                  Email
                  {sort === 'email' && (
                    order === 'asc' ? <MdArrowDropUp className='size-5' /> : <MdArrowDropDown className='size-5' />
                  )}
                </Flex>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell onClick={() => handleSort('phoneNumber')} style={{ cursor: 'pointer' }}>
                <Flex align="center" gap="2" className='font-medium'>
                  Phone
                  {sort === 'phoneNumber' && (
                    order === 'asc' ? <MdArrowDropUp className='size-5' /> : <MdArrowDropDown className='size-5' />
                  )}
                </Flex>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className='font-medium'>
                Actions
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {users.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text align="center">No users found</Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              users.map((user) => (
                <Table.Row key={user._id}>
                  <Table.Cell>
                    <Text size="2">{user._id}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text className='capitalize'>{user.name || `${user.firstName} ${user.lastName}`}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {user.email}
                  </Table.Cell>
                  <Table.Cell>
                    {user.phoneNumber || '-'}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2" align={'center'}>
                      <Button
                        variant='ghost'
                      >
                        Edit
                      </Button>
                      <Separator orientation={'vertical'} color='blue' />
                      <Button
                        variant='ghost'
                      >
                        Delete
                      </Button>
                      <Separator orientation={'vertical'} color='blue' />
                      <Button
                        variant='ghost'
                        asChild
                      >
                        <Link to={`/platform-admin/dashboard/users/user/${user._id}`}>
                          View
                        </Link>
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </div>

      <Flex justify="between" align="center" mt="4">
        <Flex align="center" gap="2">
          <Text size="2">Rows per page:</Text>
          <Select.Root
            value={String(limit)}
            onValueChange={(value) => setLimit(Number(value))}
          >
            <Select.Trigger />
            <Select.Content>
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
    </Box>
  );
};

export default UserTable; 