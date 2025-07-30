import { Avatar, Button, Dialog, Flex, Spinner, Text, TextField } from '@radix-ui/themes';
import { Check, Search, Users } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useTeachers } from '../../../api/school-admin/school.queries';
import { useAssignTeacherToClass } from '../../../api/school-class/schoolClass.mutations';
import { EmptyStateCard, ErrorCallout } from '../../../components';
import { useDebounce } from '../../../hooks/useDebounce';

function AssignTeacherDialog({ open, onOpenChange, classDetails, children = null }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, isFetching, isError, error } = useTeachers({
    limit: 30,
    search: searchTerm === '' ? '' : debouncedSearchTerm,
    sort: 'firstName',
    order: 'asc',
  });

  const teachers = data?.data || [];

  const assignTeacherMutation = useAssignTeacherToClass();

  const handleAssignTeacher = (teacherId) => {
    assignTeacherMutation.mutate({ id: classDetails._id, teacherId }, {
      onSuccess: () => {
        toast.success('Teacher assigned to class successfully');
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong');
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children && (
        <Dialog.Trigger>
          {children}
        </Dialog.Trigger>
      )}
      <Dialog.Content maxWidth="600px">
        <Dialog.Title>Assign Teacher</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Assign a teacher to this class.
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <TextField.Root
            size="3"
            placeholder="Search teachers by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              {isFetching ? <Spinner /> : <Search size={16} />}
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        {/* Error if add student to class fails */}
        {assignTeacherMutation.isError && <ErrorCallout errorMessage={assignTeacherMutation.error?.response?.data?.message || 'Something went wrong'} className={'mt-4'} />}

        <div className='max-h-[50vh] overflow-y-auto mt-4'>
          {isError ? (
            <ErrorCallout errorMessage={error?.response?.data?.message || 'Something went wrong'} />
          ) : (
            teachers.length > 0 ? teachers.map((teacher) => (
              <Flex key={teacher._id} gap="2" align="center" className='p-2 hover:bg-[--gray-a2] last:border-b-0 border-b border-[--gray-a6]' justify="between">
                <Flex gap="2">
                  <Avatar src={teacher?.userId?.profilePicture} fallback={teacher?.userId?.firstName?.charAt(0)} radius="full" />
                  <div>
                    <Text as="p" size="2" weight={'medium'}>{teacher?.userId?.firstName} {teacher?.userId?.lastName}</Text>
                    <Text as="p" size="1" color="gray">{teacher?.userId?.email}</Text>
                  </div>
                </Flex>
                {classDetails?.teacherId?._id === teacher._id ? (
                  <Check color='var(--green-9)' />
                ) : (
                  <Button
                    className='shadow-md'
                    onClick={() => handleAssignTeacher(teacher._id)}
                    disabled={assignTeacherMutation.isPending}
                  >
                    {assignTeacherMutation.isPending && assignTeacherMutation.variables?.teacherId === teacher._id ? <Spinner /> : 'Assign'}
                  </Button>
                )}
              </Flex>
            )) : (
              <EmptyStateCard
                icon={<Users />}
                description="No teachers found matching your search"
              />
            ))}
        </div>

        <Flex gap="3" mt="4" justify="start">
          <Dialog.Close>
            <Button variant="surface" color="gray">
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>

  )
}

export default AssignTeacherDialog
