import { Avatar, Card, Flex, IconButton, Text } from '@radix-ui/themes';
import { Minus } from 'lucide-react';
import React, { useEffect } from 'react';
import { useGetMonthAttendance } from '../../../api/class-attendance/classAttendance.queries';
import { ErrorCallout, Loader } from '../../../components';
import { AttendancePopover } from './Attendance';

const MonthView = ({
  daysInMonth,
  selectedYear,
  selectedMonth,
  today,
  handleRecordAttendance,
  classId,
  currentView,
  handleLoading
}) => {
  const {
    data: monthAttendance,
    isLoading,
    isError,
    error,
    isFetching,
    refetch
  } = useGetMonthAttendance(classId, selectedMonth + 1, selectedYear, currentView === "month");
  const students = monthAttendance?.data?.students ?? []

  useEffect(() => {
    handleLoading(isFetching && !isLoading)
  }, [isFetching, isLoading, handleLoading])

  if (isLoading) {
    return (
      <Flex justify='center' align='center' py='8'>
        <Loader />
      </Flex>
    )
  }

  if (isError) {
    return (
      <ErrorCallout
        errorMessage={error?.response?.data?.message || error?.message || 'Failed to load month attendance'}
        onRetry={refetch}
      />
    )
  }

  return (
    <Card size={'3'} className='shadow-md'>
      <div className='space-y-4'>
        <div className='overflow-x-auto max-h-[65vh] pb-2'>
          <div className="flex items-center">
            <div className="flex gap-3 items-center px-4 py-3 w-64 font-medium shrink-0">
              Student
            </div>
            <div className="flex gap-2 px-4">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const date = new Date(selectedYear, selectedMonth, day)
                const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" })
                const isToday =
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
                
                // Check if this is a future date
                const isFuture = date > today;

                return (
                  <div
                    key={day}
                    className={`flex flex-col rounded-full items-center py-1 w-10 ${
                      isToday ? "bg-[--accent-9] text-[--accent-contrast]" : 
                      isFuture ? "opacity-50" : ""}`}
                  >
                    <Text as='p' align='center' size={'1'}>
                      {dayOfWeek}
                    </Text>
                    <Text as='p' align='center' size={'2'} weight='medium'>
                      {day}
                    </Text>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            {students?.map(student => {
              return (
                <div key={student.studentId} className="flex items-center">
                  <div className="flex gap-3 items-center px-2 py-3 w-64 shrink-0">
                    <Avatar
                      src={student?.avatar}
                      fallback={student?.name?.charAt(0)}
                      radius='full'
                      size={'2'}
                      highContrast
                    />
                    <p className="text-sm truncate" title={student.name}>{student.name}</p>
                    <Text as='p' size={'2'} className='ml-auto whitespace-nowrap'>
                      {student?.present ?? 0} / {student?.classesHeld ?? 0}
                      <Text size={'1'} as='span' color='gray' className='ml-1'>
                        ({student?.attendanceRate ?? 0}%)
                      </Text>
                    </Text>
                  </div>

                  <div className="flex flex-1 gap-2 px-4">
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1
                      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                      const status = student?.attendance?.[dateStr] ?? null

                      // Handle no class scheduled (null status)
                      if (!status) {
                        return (
                          <IconButton
                            key={day}
                            variant="surface"
                            color='gray'
                            size={'3'}
                            disabled
                            radius='full'
                            className='disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            <Minus size={16} />
                          </IconButton>
                        )
                      }

                      // NEW: Handle future dates
                      if (status === 'future') {
                        return (
                          <IconButton
                            key={day}
                            variant="soft"
                            color='blue'
                            size={'3'}
                            disabled
                            radius='full'
                            className='disabled:opacity-30 disabled:cursor-not-allowed'
                          >
                            <Text size={'1'}>•</Text>
                          </IconButton>
                        )
                      }

                      // Handle past/today dates with actual attendance status
                      return (
                        <AttendancePopover
                          key={day}
                          student={student}
                          dateStr={dateStr}
                          status={status}
                          handleRecordAttendance={handleRecordAttendance}
                        >
                          <IconButton
                            variant={status === 'present' || status === 'absent' ? 'solid' : 'outline'}
                            color={status === 'present' ? 'green' : status === 'absent' ? 'red' : 'gray'}
                            size={'3'}
                            radius='full'
                          >
                            {status === 'present' ? 'P' : status === 'absent' && 'A'}
                          </IconButton>
                        </AttendancePopover>
                      )
                    })}
                  </div>

                </div>
              )
            })}
          </div>

        </div>
        <div className='flex flex-wrap gap-y-2 gap-x-6 items-center'>
          <Flex align='center' gap='1'>
            <div className='bg-[--green-9] rounded-full size-4' />
            <Text as='p' size={'2'}>Present (P)</Text>
          </Flex>
          <Flex align='center' gap='1'>
            <div className='bg-[--red-9] rounded-full size-4' />
            <Text as='p' size={'2'}>Absent (A)</Text>
          </Flex>
          <Flex align='center' gap='1'>
            <div className='border border-[--gray-a8] rounded-full size-4' />
            <Text as='p' size={'2'}>Not Marked</Text>
          </Flex>
          <Flex align='center' gap='1'>
            <div className='border border-[--gray-a8] rounded-full size-4 bg-[--gray-a3] opacity-50 flex items-center justify-center'>-</div>
            <Text as='p' size={'2'}>No Class</Text>
          </Flex>
          {/* NEW: Add legend for future dates */}
          <Flex align='center' gap='1'>
            <div className='border border-[--blue-a8] rounded-full size-4 bg-[--blue-a3] opacity-30 flex items-center justify-center text-xs'>•</div>
            <Text as='p' size={'2'}>Future Class</Text>
          </Flex>
        </div>
      </div>
    </Card>
  )
}

export default MonthView