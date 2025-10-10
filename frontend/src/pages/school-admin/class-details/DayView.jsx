import { Avatar, Badge, Button, Card, Flex, Separator, Text } from '@radix-ui/themes';
import { Calendar, Search } from 'lucide-react';
import React, { useEffect } from 'react';
import { useGetDayAttendance } from '../../../api/class-attendance/classAttendance.queries';
import { EmptyStateCard, ErrorCallout, Loader } from '../../../components';
import { cn } from '../../../utils/helperFunctions';

const DayView = ({
  selectedDate,
  handleRecordAttendance,
  classId,
  currentView,
  selectedDateString, 
  handleLoading 
}) => {
  const {
    data: dayAttendance,
    isLoading: isDayLoading,
    isError: isDayError,
    error: dayError,
    isFetching: isDayFetching,
    refetch
  } = useGetDayAttendance(classId, selectedDateString, currentView === "day");

  const dayAttendanceData = dayAttendance?.data ?? {};
  const dayAttendanceStudents = dayAttendanceData?.students ?? [];
  const students = dayAttendanceStudents ?? [];
  const hasClass = dayAttendanceData?.isScheduled ?? false;
  const isFutureDate = dayAttendanceData?.isFutureDate ?? false; // NEW

  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
  const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" })

  useEffect(() => {
    handleLoading(isDayFetching && !isDayLoading)
  }, [isDayFetching, isDayLoading, handleLoading])

  if (isDayLoading) {
    return (
      <Flex justify='center' align='center' py='8'>
        <Loader />
      </Flex>
    )
  }

  if (isDayError) {
    return (
      <ErrorCallout
        errorMessage={dayError?.response?.data?.message || dayError?.message || 'Failed to load day attendance'}
        onRetry={refetch}
      />
    )
  }

  return (
    <div className='space-y-4'>
      <Separator size={'4'} />
      <Flex justify='between' align='center' gap='4' wrap='wrap'>
        <Text as='p' size={'4'} weight='medium' className='flex gap-2 items-center'>
          <Calendar size={16} /> Daily Attendance - {dayName}
            {isFutureDate && (
            <Badge color='gray' variant='soft' ml='2'>
              Future Date
            </Badge>
          )}
        </Text>
        {hasClass && !isFutureDate ? (
          <Flex align='center' gap='2' wrap='wrap'>
            <Text as='p' size={'2'} color='gray'>
              Bulk Actions:
            </Text>
            <Flex gap='2' wrap='wrap'>
              <Button variant='surface' color='green'>
                Mark All Present
              </Button>
              <Button variant='surface' color='red'>
                Mark All Absent
              </Button>
            </Flex>
          </Flex>
        ) : hasClass && isFutureDate ? (
          <Badge variant="soft" color='blue'>
            Scheduled - Not Yet Occurred
          </Badge>
        ) : (
          <Badge variant="soft" color='gray'>
            No Class
          </Badge>
        )}
      </Flex>

      {!hasClass ? (
        <EmptyStateCard
          title="No class scheduled for this day"
          icon={<Calendar />}
        />
      ) : isFutureDate ? (
        <EmptyStateCard
          title="Future Date"
          description="Attendance cannot be recorded for dates that haven't occurred yet"
          icon={<Calendar />}
        />
      ) : (
        <div className='grid gap-4' style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 320px))" }}>
          {students.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <Search className="mx-auto mb-4 w-12 h-12 opacity-50" />
              <p className="text-lg">No students found</p>
              <p className="text-sm">Try adjusting your search terms</p>
              <Button
                variant="outline"
                onClick={() => {}}
                className="mt-4 text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                Clear Search
              </Button>
            </div>
          )}
          {students.map((student) => {
            return (
              <Card key={student.studentId} size={'2'} className='flex flex-col justify-between hover:shadow-md'>
                <div className="flex gap-3 items-start mb-3">
                  <Avatar src={student?.avatar} radius='full' fallback={student?.studentName?.charAt(0)} size={'2'} highContrast />
                  <div className="flex-1">
                    <Text as='p' size={'2'} weight='medium'>{student.studentName}</Text>
                    <Text as='p' size={'1'} color='gray'>{student.email}</Text>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    color={student?.status === 'present' ? 'green' : 'gray'}
                    variant={student?.status === 'present' ? 'solid' : 'soft'}
                    onClick={() => {
                      if (student?.status === 'present') return;
                      handleRecordAttendance({
                        studentId: student.studentId,
                        attendanceDate: dateStr,
                        status: 'present'
                      })
                    }}
                    // disabled={student?.status === 'present'} // Better UX than returning early
                    className={cn(
                      'flex-1', 
                      student?.status === 'present' && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    Present
                  </Button>
                  <Button
                    color={student?.status === 'absent' ? 'red' : 'gray'}
                    variant={student?.status === 'absent' ? 'solid' : 'soft'}
                    onClick={() => {
                      if (student?.status === 'absent') return;
                      handleRecordAttendance({
                        studentId: student.studentId,
                        attendanceDate: dateStr,
                        status: 'absent'
                      })
                    }}
                    // disabled={student?.status === 'absent'} // Better UX than returning early
                    className={cn(
                      'flex-1', 
                      student?.status === 'absent' && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    Absent
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DayView
