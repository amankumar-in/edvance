import { Avatar, Button, Card, Flex, Text } from '@radix-ui/themes';
import { Minus, Search } from 'lucide-react';
import React, { useEffect } from 'react';
import { useGetWeekAttendance } from '../../../api/class-attendance/classAttendance.queries';
import { ErrorCallout, Loader } from '../../../components';
import { AttendancePopover } from './Attendance';

const WeekView = ({
  getWeekDays,
  handleRecordAttendance,
  classId,
  currentView,
  selectedDateString,
  handleLoading
}) => {
  const {
    data: weekAttendance,
    isLoading: isWeekLoading,
    isError: isWeekError,
    error: weekError,
    isFetching: isWeekFetching,
    refetch: refetchWeekAttendance,
  } = useGetWeekAttendance(classId, selectedDateString, currentView === "week");
  const weekAttendanceData = weekAttendance?.data ?? {};

  const students = weekAttendanceData?.students ?? [];
  const classDays = weekAttendanceData?.classDays ?? [];

  const weekDays = getWeekDays()
  const today = new Date()

  useEffect(() => {
    handleLoading(isWeekFetching && !isWeekLoading)
  }, [isWeekFetching, isWeekLoading, handleLoading])

  if (isWeekLoading) {
    return (
      <Flex
        justify='center' align='center' py='8'>
        <Loader />
      </Flex>
    )
  }

  if (isWeekError) {
    return (
      <ErrorCallout
        errorMessage={weekError?.response?.data?.message || weekError?.message || 'Failed to load week attendance'}
        onRetry={refetchWeekAttendance}
      />
    )
  }

  return (
    <Card size={'3'} className='shadow-md'>
      <div className="overflow-auto w-full max-h-[65vh]">
        {/* Header Row */}
        <div className="flex pb-2">
          <div className="flex gap-2 items-center px-4 py-2 w-64 font-medium shrink-0">
            <span>Student</span>
          </div>
          <div className="flex flex-1 gap-2">
            {weekDays.map((day, index) => {
              // const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
              const dayName = day.toLocaleDateString("en-US", { weekday: "short" })
              const isToday =
                day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth() &&
                day.getFullYear() === today.getFullYear()

              return (
                <div
                  key={index}
                  className={`flex flex-col flex-1 items-center p-1 min-w-20 rounded ${isToday ? "bg-[--accent-9] text-[--accent-contrast]" : ""}`}
                >
                  <Text as='p' size={'1'}>
                    {dayName}
                  </Text>
                  <Text as='p' size={'2'} weight='medium'>
                    {day.getDate()}
                  </Text>

                </div>
              )
            })}
          </div>
        </div>

        {/* Student Rows */}
        <div className="pb-2 space-y-2">
          {students?.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <Search className="mx-auto mb-4 w-12 h-12 opacity-50" />
              <p className="text-lg">No students found</p>
              <p className="text-sm">Try adjusting your search terms</p>
              <Button
                variant="outline"
                // onClick={() => setSearchQuery("")}
                className="mt-4 text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                Clear Search
              </Button>
            </div>
          )}
          {students?.map((student) => {
            return (
              <div key={student.studentId} className="flex flex-1 items-center rounded-lg">
                <div className="flex gap-3 items-center px-2 w-64 min-w-64">
                  <Avatar
                    src={student?.avatar}
                    radius='full'
                    fallback={student?.name?.charAt(0)}
                    size={'2'}
                    highContrast
                  />
                  <div className="flex-1 min-w-0">
                    <Text as='p' size={'2'} className='truncate'>
                      {student?.name}
                    </Text>
                  </div>
                </div>

                <div className="flex flex-1 gap-2">
                  {weekDays.map((day, index) => {
                    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
                    const hasClass = classDays.some(d => d === dateStr);
                    const status = student?.attendance?.[dateStr] ?? null;

                    if (!hasClass) {
                      return (
                        <Button
                          key={index}
                          variant="surface"
                          color='gray'
                          className="flex-1 h-12 min-w-20 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled
                        >
                          <Minus size={16} />
                        </Button>
                      )
                    }

                    // Check if this is a future date
                    const isFuture = day > today;

                    if (isFuture) {
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          color='gray'
                          className="flex-1 h-12 min-w-20 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled
                        >
                          -
                        </Button>
                      )
                    }

                    return (
                      <AttendancePopover
                        student={student}
                        dateStr={dateStr}
                        status={status}
                        handleRecordAttendance={handleRecordAttendance}
                      >
                        <Button
                          key={index}
                          variant={status === 'present' || status === 'absent' ? 'solid' : 'outline'}
                          color={status === 'present' ? 'green' : status === 'absent' ? 'red' : 'gray'}
                          className="flex-1 h-12 min-w-20"
                        >
                          {status === 'present' ? 'P' : status === 'absent' && 'A'}
                        </Button>
                      </AttendancePopover>
                    )
                  })}
                </div>
              </div>
            )

          })}
        </div>
      </div>
    </Card>
  )
}

export default WeekView
