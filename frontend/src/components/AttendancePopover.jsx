import { Button, Flex, Popover, Spinner, Text } from '@radix-ui/themes';
import { format } from 'date-fns';
import React from 'react';
import { toast } from 'sonner';
import { useAuth } from '../Context/AuthContext';
import { useTeacherMarkClassAttendance } from '../api/class-attendance/classAttendance.mutations';

const AttendancePopover = ({
  children,
  student,
  dateStr,
  status,
  classId
}) => {
  const { activeRole } = useAuth();
  const {
    name = "",
    studentId = ""
  } = student ?? {};

  // Mutations
  const recordAttendanceMutation = useTeacherMarkClassAttendance();

  const isPending = (action) => {
    if (!action) return recordAttendanceMutation.isPending;
    return recordAttendanceMutation.isPending && action === recordAttendanceMutation.variables.status
  }

  const handleRecordAttendance = async ({ studentId, attendanceDate, status }) => {
    if(!classId) return toast.error("Class ID is required");
    recordAttendanceMutation.mutate({
      classId,
      studentId,
      attendanceDate,
      status,
      comments: "",
      activeRole: activeRole
    }, {
      onSuccess: () => {
        toast.success("Attendance recorded successfully")
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to record attendance")
      }
    })
  }

  return (
    <Popover.Root>
      <Popover.Trigger>
        {children}
      </Popover.Trigger>
      <Popover.Content size="1" minWidth="300px">
        <Text as="p" weight={'medium'} mb={'2'}>
          Attendance Details
        </Text>

        <div className='space-y-1'>
          <Flex align='center' gap='2'>
            <Text as='div' size={'2'} color='gray'>
              Student:
            </Text>
            <Text as='div' size={'2'}>
              {name || "-"}
            </Text>
          </Flex>
          <Flex align='center' gap='2'>
            <Text as='div' size={'2'} color='gray'>
              Date:
            </Text>
            <Text as='div' size={'2'}>
              {format(new Date(dateStr), 'MMM do, yyyy')}
            </Text>
          </Flex>
          <Flex align='center' gap='2'>
            <Text as='div' size={'2'} color='gray'>
              Class:
            </Text>
            <Text as='div' size={'2'}>
              Physical Education
            </Text>
          </Flex>
          <Flex align='center' gap='2'>
            <Text as='div' size={'2'} color='gray'>
              Current Status:
            </Text>
            <Text as='div' size={'2'}
              color={status === 'present' ? 'green' : status === 'absent' ? 'red' : 'gray'}
              highContrast
            >
              {status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : 'Not Marked'}
            </Text>
          </Flex>
        </div>

        <Flex gap='2' mt={'2'}>
          <Button className='flex-1' color='green'
            onClick={() => {
              if (!studentId || !dateStr) {
                return toast.error("Student ID and date are required")
              }
              handleRecordAttendance({
                studentId: studentId,
                attendanceDate: dateStr,
                status: 'present'
              })
            }}
            disabled={status === 'present' || isPending('present')}
          >
            {isPending('present') && <Spinner />} Present
          </Button>
          <Button className='flex-1' color='red'
            onClick={() => {
              if (!studentId || !dateStr) {
                return toast.error("Student ID and date are required")
              }
              handleRecordAttendance({
                studentId: studentId,
                attendanceDate: dateStr,
                status: 'absent'
              })
            }}
            disabled={status === 'absent' || isPending('absent')}
          >
            {isPending('absent') && <Spinner />} Absent
          </Button>
        </Flex>
      </Popover.Content>
    </Popover.Root >
  )
}

export default AttendancePopover
