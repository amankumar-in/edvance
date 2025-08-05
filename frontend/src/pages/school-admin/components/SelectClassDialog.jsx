import { Cross1Icon } from '@radix-ui/react-icons';
import { Box, Button, Card, Dialog, Flex, IconButton, Select, Separator, Spinner, Text, TextField } from '@radix-ui/themes';
import { Check, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import { useClasses } from '../../../api/school-admin/school.queries';
import { EmptyStateCard, ErrorCallout, Loader } from '../../../components';
import { useDebounce } from '../../../hooks/useDebounce';

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

function SelectClassDialog({ open, onOpenChange, classDetails = null, children = null, onSelectClass }) {
  const [searchTerm, setSearchTerm] = useState(classDetails?.name || '');
  const [gradeFilter, setGradeFilter] = useState(null);
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, isFetching, isError, error } = useClasses({
    limit: 30,
    search: searchTerm === '' ? '' : debouncedSearchTerm,
    sort: 'name',
    order: 'asc',
    grade: gradeFilter,
  });

  const classes = data?.data || [];

  const handleSelectClass = (classDetails) => {
    onSelectClass(classDetails);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children && (
        <Dialog.Trigger>
          {children}
        </Dialog.Trigger>
      )}
      <Dialog.Content maxWidth="600px">
        <Dialog.Title>Select Class</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Select a class to assign to this task or reward.
        </Dialog.Description>

        <div className='space-y-4'>
          <Flex gap="3" direction={{ initial: 'column', sm: 'row' }}>
            <Box className='flex-1'>
              <TextField.Root
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              >
                <TextField.Slot>
                  {isFetching ? <Spinner /> : <Search size={16} />}
                </TextField.Slot>
                {searchTerm?.length > 0 && (
                  <TextField.Slot side='right'>
                    <IconButton
                      title='Clear search'
                      aria-label='Clear search'
                      size='1'
                      variant='ghost'
                      color='gray'
                      onClick={() => setSearchTerm('')}
                    >
                      <X size={18} />
                    </IconButton>
                  </TextField.Slot>
                )}
              </TextField.Root>
              <Text as='p' size='1' color='gray' mt='2' className='flex gap-1 items-center'>
                Search classes by name or join code or teacher name
              </Text>
            </Box>

            {/* Grade Filter */}
            <Box>
              <Select.Root value={gradeFilter} onValueChange={setGradeFilter}>
                <Select.Trigger placeholder="All Grades" >
                  <Text color='gray' weight={'medium'}>Grade: </Text>
                  {gradeOptions.find(option => option.value === gradeFilter)?.label || 'All Grades'}
                </Select.Trigger>
                <Select.Content variant="soft" position="popper" align='end'>
                  {gradeOptions.map(option => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>

          {/* Selected Class */}
          {classDetails?._id && (
            <Card size={'1'} className='flex flex-1 gap-2 justify-between items-center shadow-sm'>
              <Text as='p' size={'2'} weight={'medium'}>
                {classDetails?.name} {classDetails?.grade}
              </Text>
              <Button variant='ghost' size={'1'} color='gray'
                onClick={() => {
                  onSelectClass(null);
                }}
              >
                <Cross1Icon /> Unassign
              </Button>
            </Card>
          )}

          <div className='max-h-[50vh] overflow-y-auto mt-4 space-y-1'>
            {isLoading ? (
              <Flex justify="center" align="center" py={'4'}>
                <Loader />
              </Flex>
            ) : isError ? (
              <ErrorCallout errorMessage={error?.response?.data?.message || 'Something went wrong'} />
            ) : (
              <>
                {classes.length > 0 ? (
                  classes.map((c, i) => (
                    <React.Fragment key={c._id}>
                      <Flex
                        key={c._id}
                        gap="2"
                        align="center"
                        className={`p-2 rounded-md border-2 ${classDetails?._id === c._id ? 'border-[--green-a6] bg-[--green-a1]' : 'cursor-pointer hover:bg-[--gray-a2] border-transparent'}`}
                        justify="between"
                        onClick={() => handleSelectClass(c)}
                      >
                        <Flex gap="2">
                          <div>
                            <Text as="p" size="2" weight={'medium'}>
                              {c?.name}
                            </Text>
                            <Text as="p" size="1" color="gray">{c?.grade}</Text>
                          </div>
                        </Flex>
                        {classDetails?._id === c._id ? (<Check size={18} color='var(--green-9)' />) : null}
                      </Flex>
                      {i !== classes.length - 1 && <Separator size={'4'} />}
                    </React.Fragment>
                  ))
                ) : (
                  <EmptyStateCard description="No classes found." />
                )}
              </>
            )}
          </div>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Done
              </Button>
            </Dialog.Close>
          </Flex>
        </div>
      </Dialog.Content>
    </Dialog.Root>

  )
}

export default SelectClassDialog
