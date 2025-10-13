import { Avatar, Box, Button, Callout, DropdownMenu, Flex, IconButton, Table, Text, TextField } from '@radix-ui/themes';
import { AlertCircle, MoreHorizontal, Plus, Search, User } from 'lucide-react';
import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useClassStudents } from '../../../api/school-class/schoolClass.queries';
import { AddStudentsDialog, ConfirmationDialog, EmptyStateCard, Loader } from '../../../components';
import { useRemoveStudentFromClass } from '../../../api/school-class/schoolClass.mutations';
import { toast } from 'sonner';
import AssignTeacherDialog from '../components/AssignTeacherDialog';


function Students() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddStudentsDialogOpen, setIsAddStudentsDialogOpen] = useState(false);
  const { classId } = useParams();
  const { data, isLoading, isError } = useClassStudents(classId);
  const students = data?.data ?? [];
  const classDetails = data?.classDetails ?? {};
  const teacherId = classDetails?.teacherId || null;

  const { mutate: removeStudentFromClass, isPending: isRemovingStudent } = useRemoveStudentFromClass();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAssignTeacherDialogOpen, setIsAssignTeacherDialogOpen] = useState(false);


  const handleRemoveStudent = (studentId) => {
    removeStudentFromClass({ id: classId, studentId }, {
      onSuccess: () => {
        toast.success('Student removed from class successfully');
        setSelectedStudent(null);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to remove student from class');
      }
    });
  }

  const filteredStudents = students.filter(student =>
    student?.userId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student?.userId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student?.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Flex justify="center" align="center">
          <Loader />
        </Flex>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='space-y-6'>
        <Callout.Root color='red' variant='surface'>
          <Callout.Icon>
            <AlertCircle size={16} />
          </Callout.Icon>
          <Callout.Text>
            Failed to load class details. Please try again.
          </Callout.Text>
        </Callout.Root>
      </div>
    );
  }

  if (!teacherId) {
    return (
      <div className='mx-auto max-w-5xl'>
        <EmptyStateCard
          title='No teacher assigned'
          description='First assign a teacher to this class and then add students to the class'
          icon={<User />}
          action={(
            <AssignTeacherDialog
              open={isAssignTeacherDialogOpen}
              onOpenChange={setIsAssignTeacherDialogOpen}
              classDetails={classDetails}
            >
              <Button onClick={() => setIsAssignTeacherDialogOpen(true)}>
                Assign Teacher
              </Button>
            </AssignTeacherDialog>
          )}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto mt-6 space-y-6 max-w-5xl">
      {/* Search and Controls */}
      <Flex justify="between" align="center" gap="4">
        <Flex align="center" gap="4" justify="between" wrap="wrap" className='w-full'>
          <TextField.Root
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='flex-1 max-w-sm min-w-[200px]'
          >
            <TextField.Slot>
              <Search size={16} />
            </TextField.Slot>
          </TextField.Root>

          <AddStudentButton onAddStudent={() => setIsAddStudentsDialogOpen(true)} />
        </Flex>
      </Flex>

      {/* Students Table */}
      <Table.Root variant="surface" className='shadow-md'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell className='font-medium text-nowrap'>Student ({students.length})</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='font-medium text-nowrap'>Email</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='font-medium text-nowrap'>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <Table.Row key={student?._id} className='hover:bg-[--gray-a2]'>
                <Table.Cell>
                  <Flex align="center" gap="3">
                    <Avatar
                      size="2"
                      radius='full'
                      src={student?.userId?.avatar}
                      fallback={`${student?.userId?.firstName[0]}`}
                    />
                    <Box>
                      <Text as='p'>
                        {student?.userId?.firstName} {student?.userId?.lastName}
                      </Text>
                      <Text color="gray" size="2"></Text>
                    </Box>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  {student?.userId?.email}
                </Table.Cell>
                <Table.Cell>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <IconButton variant="ghost" highContrast color="gray">
                        <MoreHorizontal size={18} />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content variant='soft'>
                      <DropdownMenu.Label>Actions</DropdownMenu.Label>
                      <DropdownMenu.Item color="red" onClick={() => setSelectedStudent(student)}>
                        Remove from Class
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell colSpan={3}>
                <EmptyStateCard
                  title='No students found'
                  description='No students found in this class'
                  action={<AddStudentButton onAddStudent={() => setIsAddStudentsDialogOpen(true)} />}
                />
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
      <AddStudentsDialog
        open={isAddStudentsDialogOpen}
        onOpenChange={setIsAddStudentsDialogOpen}
        classId={classId}
        classStudents={students}
      />

      <ConfirmationDialog
        title='Remove Student from Class'
        description={`Are you sure you want to remove ${selectedStudent?.userId?.firstName || 'this student'} from the class?`}
        open={!!selectedStudent}
        onOpenChange={() => setSelectedStudent(null)}
        onConfirm={() => handleRemoveStudent(selectedStudent?._id)}
        confirmColor='red'
        isLoading={isRemovingStudent}
      />
    </div>

  )
}

export default Students

function AddStudentButton({ onAddStudent }) {
  return (
    <Button onClick={onAddStudent} className='shadow-md'>
      <Plus size={16} />
      Add Student
    </Button>
  )
}
