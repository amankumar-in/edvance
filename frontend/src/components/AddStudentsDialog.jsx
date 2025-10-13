import { Avatar, Button, Dialog, Flex, Spinner, Text, TextField } from '@radix-ui/themes';
import { Check, Search, Users } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useStudents } from '../api/school-admin/school.queries';
import { useAddStudentToClass } from '../api/school-class/schoolClass.mutations';
import { useDebounce } from '../hooks/useDebounce';
import EmptyStateCard from './EmptyStateCard';
import ErrorCallout from './ErrorCallout';

function AddStudentsDialog({ open, onOpenChange, classId, classStudents = [] }) {
  const [searchTerm, setSearchTerm] = useState(null);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);


  const { data, isLoading, isFetching, isError, error } = useStudents({
    limit: 30,
    search: searchTerm === '' ? '' : debouncedSearchTerm,
  });

  const students = data?.data || [];
  console.log(students);

  const addStudentToClassMutation = useAddStudentToClass();

  const handleAddStudentToClass = (studentId) => {
    addStudentToClassMutation.mutate({ classId, studentId }, {
      onSuccess: () => {
        toast.success('Student added to class successfully');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong');
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="600px">
        <Dialog.Title>Add Students</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Add students to your class.
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <TextField.Root
            placeholder="Search students by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              {isFetching ? <Spinner /> : <Search size={16} />}
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        {/* Error if add student to class fails */}
        {addStudentToClassMutation.isError && <ErrorCallout errorMessage={addStudentToClassMutation.error?.response?.data?.message || 'Something went wrong'} className={'mt-4'} />}

        <div className='max-h-[50vh] overflow-y-auto mt-4'>
          {isError ? (
            <ErrorCallout errorMessage={error?.response?.data?.message || 'Something went wrong'} />
          ) : (
            students.length > 0 ? students.map((student) => (
              <>
                <Flex key={student._id} gap="2" align="center" className='p-2 hover:bg-[--gray-a2] last:border-b-0 border-b border-[--gray-a6]' justify="between">
                  <Flex gap="2">
                    <Avatar src={student?.userId?.avatar} fallback={student?.userId?.firstName?.charAt(0)} radius="full" />
                    <div>
                      <Text as="p" size="2" weight={'medium'}>{student?.userId?.firstName} {student?.userId?.lastName}</Text>
                      <Text as="p" size="1" color="gray">{student?.userId?.email}</Text>
                    </div>
                  </Flex>
                  {classStudents.some(s => s._id === student._id) ? (
                    <Check color='var(--green-9)' />
                  ) : (
                    <Button
                      className='shadow-md'
                      onClick={() => handleAddStudentToClass(student._id)}
                      disabled={addStudentToClassMutation.isPending && addStudentToClassMutation.variables?.studentId === student._id}
                    >
                      {addStudentToClassMutation.isPending && addStudentToClassMutation.variables?.studentId === student._id ? <Spinner /> : 'Add'}
                    </Button>
                  )}
                </Flex>
              </>
            )) : (
              <EmptyStateCard
                icon={<Users />}
                description="No students found matching your search"
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

export default AddStudentsDialog
