import { Box, Callout, Flex, Table, Text } from '@radix-ui/themes';
import { AlertCircleIcon, BookOpen } from 'lucide-react';
import React from 'react';
import { BarLoader } from 'react-spinners';
import { useClasses } from '../../api/school-admin/school.queries';
import { EmptyStateCard, Loader } from '../../components';
import PageHeader from './components/PageHeader';

const Classes = () => {
  const { data, isLoading, isFetching, isError, error } = useClasses();

  // Column definitions
  const columns = [
    {
      id: '_id',
      header: 'ID',
      sortable: true
    },
    {
      id: 'name',
      header: 'Class Name',
      sortable: true
    },
    {
      id: 'grade',
      header: 'Grade',
      sortable: true
    },
    {
      id: 'teacher',
      header: 'Teacher',
      sortable: false
    },
    {
      id: 'studentCount',
      header: 'Students',
      sortable: false
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <ClassesPageHeader />
        <Flex justify="center" align="center">
          <Loader />
        </Flex>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className='space-y-6'>
        <ClassesPageHeader />
        <Callout.Root color='red' variant='surface'>
          <Callout.Icon>
            <AlertCircleIcon size={16} />
          </Callout.Icon>
          <Callout.Text>
            {error?.response?.data?.message || error?.message || 'Failed to load classes'}
          </Callout.Text>
        </Callout.Root>
      </div>
    );
  }

  // Data
  const classes = data?.data || [];

  // main return
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
        <ClassesPageHeader />

        {/* Table */}
        <Table.Root variant='surface' layout={'auto'}>
          <Table.Header>
            <Table.Row>
              {columns.map((column) => (
                <Table.ColumnHeaderCell
                  key={column.id}
                >
                  <Flex align="center" gap="2" className='font-medium'>
                    {column.header}
                  </Flex>
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {classes.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length + 1}>
                  <EmptyStateCard
                    title='No classes created yet'
                    icon={<BookOpen />}
                  />
                </Table.Cell>
              </Table.Row>
            ) : (
              classes.map((schoolClass) => (
                <Table.Row key={schoolClass._id} className='hover:bg-[--gray-a2]'>
                  <Table.Cell className='font-mono text-nowrap'>
                    {schoolClass._id?.slice(-8)}
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    {schoolClass.name}
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    {schoolClass.grade || '-'}
                  </Table.Cell>
                  <Table.Cell>
                    {schoolClass.teacherId ? (
                      <div>
                        <Text as='p' weight="medium" mb='1'>
                          {schoolClass.teacherId.userId?.firstName} {schoolClass.teacherId.userId?.lastName}
                        </Text>
                        <Text as='p' size="1" color="gray">
                          {schoolClass.teacherId.userId?.email}
                        </Text>
                      </div>
                    ) : (
                      <Text color="gray">No teacher assigned</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {schoolClass.studentIds?.length || 0}
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>
    </>
  );
};

export default Classes;

function ClassesPageHeader() {
  return (
    <PageHeader
      title='Classes'
      description="Manage your school's classes"
    />
  )
}