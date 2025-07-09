import { Box, Button, Callout, DropdownMenu, Flex, IconButton, Skeleton, Spinner, Table, TextField } from '@radix-ui/themes';
import { AlertCircleIcon, MoreHorizontal, SearchIcon, Trash, UserPlus, X } from 'lucide-react';
import React, { useState } from 'react';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import { useRemoveAdministrator } from '../../api/school-admin/school.mutations';
import { useAdministrators, useSchoolProfile } from '../../api/school-admin/school.queries';
import { ConfirmationDialog, EmptyStateCard, Loader, Pagination } from '../../components';
import { SortIcon } from '../../components/platform-admin/UserTable';
import { useAuth } from '../../Context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/helperFunctions';
import PageHeader from '../school-admin/components/PageHeader';
import AddAdministratorDialog from './components/AddAdministratorDialog';

const Administrators = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('firstName');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedAdminToRemove, setSelectedAdminToRemove] = useState(null);
  const { user } = useAuth();
  const userId = user?._id;

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Queries
  const { data: schoolProfile, isLoading: isSchoolProfileLoading, isError: isSchoolProfileError, error: schoolProfileError } = useSchoolProfile();
  const schoolId = schoolProfile?.data?._id;

  const { data, isLoading, isFetching, isError, error } = useAdministrators(schoolId, {
    page,
    limit,
    sort,
    order,
    search: searchTerm === '' ? '' : debouncedSearchTerm
  });

  // Mutations
  const removeAdministratorMutation = useRemoveAdministrator();

  // Handlers
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSort = (field) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('asc');
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPage(1);
  };

  const handleRemoveClick = (admin) => {
    setSelectedAdminToRemove(admin);
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveCancel = () => {
    setIsRemoveDialogOpen(false);
    setSelectedAdminToRemove(null);
  };

  // Remove administrator
  const handleRemoveConfirm = () => {
    if (!selectedAdminToRemove || !schoolId) return;

    removeAdministratorMutation.mutate({
      schoolId,
      adminId: selectedAdminToRemove._id
    }, {
      onSuccess: () => {
        toast.success('Administrator removed successfully');
        setIsRemoveDialogOpen(false);
        setSelectedAdminToRemove(null);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to remove administrator');
      }
    });
  };

  // Loading
  if (isLoading || isSchoolProfileLoading) {
    return (
      <div className='space-y-6'>
        <AdministratorsPageHeader
          loading={isLoading || isSchoolProfileLoading}
          onAddClick={() => setIsAddDialogOpen(true)}
        />
        <Flex justify='center' align='center'>
          <Loader />
        </Flex>
      </div>
    );
  }

  // Error
  if (isError || isSchoolProfileError) {
    return (
      <div className='space-y-6'>
        <AdministratorsPageHeader
          onAddClick={() => setIsAddDialogOpen(true)}
        />
        <Callout.Root color='red' variant='surface' >
          <Callout.Icon>
            <AlertCircleIcon size={16} />
          </Callout.Icon>
          <Callout.Text>
            {error?.response?.data?.message || schoolProfileError?.response?.data?.message || 'Failed to load administrators'}
          </Callout.Text>
        </Callout.Root>
      </div>
    );
  }

  // Data
  const administrators = data?.data || [];
  const pagination = data?.pagination || {};
  const currentSort = { field: sort, order: order };

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
        <AdministratorsPageHeader
          onAddClick={() => setIsAddDialogOpen(true)}
        />

        {/* Info Note */}
        <Callout.Root color="blue" variant='surface'>
          <Callout.Text>
            <strong>Note:</strong> At least one administrator must be assigned to the school at all times.
          </Callout.Text>
        </Callout.Root>

        {/* Search and Filters */}
        <Flex gap="3" align="center" wrap="wrap">
          <TextField.Root
            placeholder='Search administrators...'
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
        <Table.Root variant='surface' layout={'auto'}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell
                className='font-medium'
              >
                ID
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell
                className='font-medium'
                onClick={() => handleSort('firstName')}
                style={{ cursor: 'pointer' }}
              >
                <Button variant='ghost' color='gray' className='font-medium' highContrast>
                  Name <SortIcon currentSort={currentSort} columnName="firstName" />
                </Button>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell
                className='font-medium'
                onClick={() => handleSort('email')}
                style={{ cursor: 'pointer' }}
              >
                <Button variant='ghost' color='gray' className='font-medium' highContrast>
                  Email <SortIcon currentSort={currentSort} columnName="email" />
                </Button>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell
                className='font-medium'
                onClick={() => handleSort('createdAt')}
                style={{ cursor: 'pointer' }}
              >
                <Button variant='ghost' color='gray' className='font-medium' highContrast>
                  Joined <SortIcon currentSort={currentSort} columnName="createdAt" />
                </Button>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className='font-medium'>
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {administrators.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <EmptyStateCard
                    title={
                      (searchTerm)
                        ? "No administrators found"
                        : "No administrators yet"
                    }
                    description={
                      (searchTerm)
                        ? "Try adjusting your search or filters"
                        : "No administrators have been added to your school yet"
                    }
                  />
                </Table.Cell>
              </Table.Row>
            ) : (
              administrators.map((admin) => (
                <Table.Row key={admin._id} className='hover:bg-[--gray-a2]'>
                  <Table.Cell className='font-mono text-nowrap'>
                    {admin._id?.slice(-8)}
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    {admin.firstName} {admin.lastName}
                  </Table.Cell>
                  <Table.Cell className='text-nowrap'>{admin.email}</Table.Cell>
                  <Table.Cell className='text-nowrap'>
                    {formatDate(admin.createdAt)}
                  </Table.Cell>
                  <Table.Cell>
                    {userId !== admin._id && <DropdownMenu.Root>
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
                          <DropdownMenu.Item color='red' onClick={() => handleRemoveClick(admin)}>
                            <Trash size={14} /> Remove Administrator
                          </DropdownMenu.Item>
                        </DropdownMenu.Group>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>}
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
          disabled={isLoading || isFetching}
          itemLabel='administrators'
        />

      </Box>

      {/* Add Administrator Dialog */}
      <AddAdministratorDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        schoolId={schoolId}
      />

      {/* Remove Administrator Dialog */}
      <ConfirmationDialog
        title='Remove Administrator'
        description={
          selectedAdminToRemove
            ? `Are you sure you want to remove ${selectedAdminToRemove.firstName} ${selectedAdminToRemove.lastName} (${selectedAdminToRemove.email}) as an administrator from your school?`
            : 'Are you sure you want to remove this administrator from your school?'
        }
        open={isRemoveDialogOpen}
        onOpenChange={handleRemoveCancel}
        onConfirm={handleRemoveConfirm}
        confirmColor='red'
        confirmText={removeAdministratorMutation.isPending ? 'Removing...' : 'Remove'}
        isLoading={removeAdministratorMutation.isPending}
      />
    </>
  );
};

export default Administrators;

// Page Header Component
function AdministratorsPageHeader({ loading = false, onAddClick }) {
  return (
    <PageHeader
      title='Administrators'
      description='Manage your school administrators'
    >
      <Skeleton loading={loading}>
        <Button onClick={onAddClick}>
          <UserPlus size={16} />
          Add Administrator
        </Button>
      </Skeleton>

    </PageHeader>
  );
}