import { Badge, Box, Button, Callout, DropdownMenu, Flex, IconButton, Select, Spinner, Table, Text, TextField } from '@radix-ui/themes';
import { AlertCircleIcon, Check, Copy, Eye, KeyRound, MoreHorizontal, Pencil, Plus, Search, Trash, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router';
import { BarLoader } from 'react-spinners';
import { useClasses } from '../../api/school-admin/school.queries';
import { useDeleteClass } from '../../api/school-class/schoolClass.mutations';
import { ConfirmationDialog, EmptyStateCard, Loader, Pagination } from '../../components';
import { SortIcon } from '../../components/platform-admin/UserTable';
import { useDebounce } from '../../hooks/useDebounce';
import CreateClassDialog from './components/CreateClassDialog';
import GenerateJoinCodeDialog from './components/GenerateJoinCodeDialog';
import PageHeader from './components/PageHeader';
import { toast } from 'sonner';

// Grade options
const gradeOptions = [
  { label: 'All', value: null, },
  { label: 'Kindergarten', value: 'K', },
  { label: '1st Grade', value: '1', },
  { label: '2nd Grade', value: '2', },
  { label: '3rd Grade', value: '3', },
  { label: '4th Grade', value: '4', },
  { label: '5th Grade', value: '5', },
  { label: '6th Grade', value: '6', },
  { label: '7th Grade', value: '7', },
  { label: '8th Grade', value: '8', },
  { label: '9th Grade', value: '9', },
  { label: '10th Grade', value: '10', },
  { label: '11th Grade', value: '11', },
  { label: '12th Grade', value: '12', },
]

const Classes = () => {
  // State for filters and search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState(null);

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // API call with all parameters
  const { data, isLoading, isFetching, isError, error } = useClasses({
    page,
    limit,
    sort,
    order,
    search: searchQuery === '' ? '' : debouncedSearchQuery,
    grade: gradeFilter
  });

  const deleteClassMutation = useDeleteClass();

  const [openCreateClassDialog, setOpenCreateClassDialog] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedClassToRemove, setSelectedClassToRemove] = useState(null);
  const [isGenerateCodeDialogOpen, setIsGenerateCodeDialogOpen] = useState(false);
  const [selectedClassForCode, setSelectedClassForCode] = useState(null);
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false);
  const [selectedClassToEdit, setSelectedClassToEdit] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);


  // Handlers
  const handleOpenCreateClassDialog = () => {
    setOpenCreateClassDialog(true);
  }

  const handleRemoveClick = (schoolClass) => {
    setSelectedClassToRemove(schoolClass);
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveCancel = () => {
    setIsRemoveDialogOpen(false);
    setSelectedClassToRemove(null);
  };

  const handleRemoveConfirm = () => {
    if (selectedClassToRemove?._id) {
      deleteClassMutation.mutate(selectedClassToRemove._id, {
        onSuccess: () => {
          setIsRemoveDialogOpen(false);
          setSelectedClassToRemove(null);
        }
      });
    }
  };

  const handleGenerateCodeClick = (schoolClass) => {
    setSelectedClassForCode(schoolClass);
    setIsGenerateCodeDialogOpen(true);
  };

  const handleGenerateCodeCancel = () => {
    setIsGenerateCodeDialogOpen(false);
    setSelectedClassForCode(null);
  };

  const handleEditClassClick = (schoolClass) => {
    setSelectedClassToEdit(schoolClass);
    setIsEditClassDialogOpen(true);
  };

  const handleEditClassCancel = () => {
    setIsEditClassDialogOpen(false);
    setSelectedClassToEdit(null);
  };

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
    setPage(1); // Reset to first page when sorting
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setGradeFilter(null);
    setSort('name');
    setOrder('asc');
    setPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle Search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleItemsPerPageChange = (newLimit, newPage) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleCopyJoinCode = (joinCode) => {
    navigator.clipboard.writeText(joinCode).then(() => {
      setCopiedCode(joinCode);
      toast.success('Copied to clipboard');

      // Remove the copied state after 2 seconds
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    }).catch(() => {
      console.error('Failed to copy join code');
    });
  };

  // Column definitions
  const columns = [
    {
      id: '_id',
      header: 'ID',
      sortable: false
    },
    {
      id: 'name',
      header: 'Class Name',
      sortable: true
    },
    {
      id: 'joinCode',
      header: 'Join Code',
      sortable: true
    },
    {
      id: 'grade',
      header: 'Grade',
      sortable: true
    },
    {
      id: 'firstName',
      header: 'Teacher',
      sortable: true
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
        <ClassesPageHeader action={handleOpenCreateClassDialog} />

        {/* Search and Filters */}
        <Box className='space-y-4'>
          <Flex gap="4" align="center" wrap="wrap">
            {/* Search */}
            <Box className="flex-1 min-w-[200px] max-w-sm">
              <TextField.Root
                placeholder="Search classes, join codes, or teachers..."
                value={searchQuery}
                onChange={handleSearchChange}
              >
                <TextField.Slot>
                  {isFetching ? <Spinner /> : <Search size={16} />}
                </TextField.Slot>
              </TextField.Root>
            </Box>

            {/* Grade Filter */}
            <Select.Root value={gradeFilter} onValueChange={setGradeFilter}>
              <Select.Trigger placeholder="All Grades" variant='classic' >
                <Text color='gray' weight={'medium'}>Grade: </Text>
                {gradeOptions.find(option => option.value === gradeFilter)?.label || 'All Grades'}
              </Select.Trigger>
              <Select.Content variant="soft" position="popper">
                {gradeOptions.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* Reset Filters */}
            {(searchQuery || gradeFilter) && (
              <Button
                variant="soft"
                color="gray"
                onClick={handleResetFilters}
                size="2"
              >
                Reset <X size={16} />
              </Button>
            )}
          </Flex>
        </Box>

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
            {classes.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length + 1}>
                  <EmptyStateCard
                    title='No classes found'
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
                  <Table.Cell className='font-mono tabular-nums text-nowrap'>
                    <Flex gap='3' align='center' >
                      {schoolClass.joinCode}
                      <IconButton
                        title='Copy join code'
                        aria-label='Copy join code'
                        disabled={!schoolClass.joinCode}
                        variant='ghost'
                        color={copiedCode === schoolClass.joinCode ? 'green' : 'gray'}
                        size='2'
                        onClick={() => handleCopyJoinCode(schoolClass.joinCode)}
                      >
                        {copiedCode === schoolClass.joinCode ? <Check size={14} /> : <Copy size={14} />}
                      </IconButton>
                    </Flex>
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
                      <Badge color='gray' variant='soft' className='italic' >
                        Unassigned
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {schoolClass.studentCount || 0}
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
                            <Link to={`/school-admin/classes/${schoolClass._id}`}>
                              <Eye size={14} /> View
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onClick={() => handleEditClassClick(schoolClass)}
                          >
                            <Pencil size={14} /> Edit
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onClick={() => handleGenerateCodeClick(schoolClass)}
                          >
                            <KeyRound size={14} /> Generate Code
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator />
                          <DropdownMenu.Item color='red'
                            onClick={() => handleRemoveClick(schoolClass)}
                          >
                            <Trash size={14} /> Delete
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
          itemLabel="classes"
          disabled={isLoading || isFetching}
        />
      </Box>

      {/* Dialogs */}
      <CreateClassDialog
        open={openCreateClassDialog}
        onOpenChange={setOpenCreateClassDialog}
        isEdit={false}
      />

      <CreateClassDialog
        open={isEditClassDialogOpen}
        onOpenChange={handleEditClassCancel}
        isEdit={true}
        selectedClass={selectedClassToEdit}
      />

      <ConfirmationDialog
        title='Delete Class'
        description={
          selectedClassToRemove
            ? `Are you sure you want to delete ${selectedClassToRemove.name} class?`
            : 'Are you sure you want to delete this class?'
        }
        open={isRemoveDialogOpen}
        onOpenChange={handleRemoveCancel}
        onConfirm={handleRemoveConfirm}
        confirmColor='red'
        confirmText={deleteClassMutation.isPending ? 'Deleting...' : 'Delete'}
        isLoading={deleteClassMutation.isPending}
      />

      <GenerateJoinCodeDialog
        open={isGenerateCodeDialogOpen}
        onOpenChange={handleGenerateCodeCancel}
        schoolClass={selectedClassForCode}
      />

    </>
  );
};

export default Classes;

// Page header
function ClassesPageHeader({ action }) {
  return (
    <PageHeader
      title='Classes'
      description="Manage your school's classes"
    >
      <Button
        onClick={action}
        className='shadow-md'
      >
        <Plus size={14} /> Create Class
      </Button>
    </PageHeader>
  )
}