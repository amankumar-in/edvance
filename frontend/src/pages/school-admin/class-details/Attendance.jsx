import { Avatar, Badge, Button, Card, Flex, IconButton, Popover, Select, Separator, Spinner, Text, TextField, Tooltip } from '@radix-ui/themes';
import { Calendar, ChevronLeftIcon, ChevronRightIcon, Clock, Gauge, Minus, Search, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { useGetDayAttendance, useGetMonthAttendance, useGetWeekAttendance } from '../../../api/class-attendance/classAttendance.queries';
import { useClassDetails } from '../../../api/school-class/schoolClass.queries';
import { ErrorCallout, Loader } from '../../../components';
import EmptyStateCard from '../../../components/EmptyStateCard';
import PageHeader from '../components/PageHeader';
import { useRecordClassAttendance } from '../../../api/class-attendance/classAttendance.mutations';
import { BRAND_COLOR } from '../../../utils/constants';

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function Attendance() {
  const { classId } = useParams();
  const { data } = useClassDetails(classId);
  const classDetails = data?.data ?? {};
  const schedule = classDetails?.schedule ?? [];

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [currentView, setCurrentView] = useState("month")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const selectedDateString = selectedDate.toISOString().split('T')[0]
  const [searchQuery, setSearchQuery] = useState("")

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  const today = new Date()

  // Queries
  const { data: monthAttendance, isLoading, isError, error, isFetching } = useGetMonthAttendance(classId, selectedMonth + 1, selectedYear);
  const students = monthAttendance?.data?.students ?? []
  const monthlySummary = monthAttendance?.data?.monthlySummary ?? {}

  const { data: dayAttendance, isLoading: isDayLoading, isError: isDayError, error: dayError, isFetching: isDayFetching } = useGetDayAttendance(classId, selectedDateString);
  const dayAttendanceData = dayAttendance?.data ?? {};
  const dayAttendanceStudents = dayAttendanceData?.students ?? [];

  const { data: weekAttendance, isLoading: isWeekLoading, isError: isWeekError, error: weekError, isFetching: isWeekFetching } = useGetWeekAttendance(classId, selectedDateString);
  const weekAttendanceData = weekAttendance?.data ?? {};

  // Mutations
  const recordAttendanceMutation = useRecordClassAttendance();

  const handleRecordAttendance = async ({ studentId, attendanceDate, status }) => {
    recordAttendanceMutation.mutate({
      classId,
      studentId,
      attendanceDate,
      status,
      comments: "",
      activeRole: "school_admin"
    }, {
      onSuccess: () => {
        toast.success("Attendance recorded successfully")
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to record attendance")
      }
    })
  }

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate)

    if (currentView === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    } else if (currentView === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      if (direction === "prev") {
        if (selectedMonth === 0) {
          setSelectedMonth(11)
          setSelectedYear(selectedYear - 1)
        } else {
          setSelectedMonth(selectedMonth - 1)
        }
      } else {
        if (selectedMonth === 11) {
          setSelectedMonth(0)
          setSelectedYear(selectedYear + 1)
        } else {
          setSelectedMonth(selectedMonth + 1)
        }
      }
      return
    }

    setSelectedDate(newDate)
    setSelectedMonth(newDate.getMonth())
    setSelectedYear(newDate.getFullYear())
  }

  const getDateRangeText = () => {
    if (currentView === "day") {
      return selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } else if (currentView === "week") {
      const startOfWeek = new Date(selectedDate);
      const dayOfWeek = selectedDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const diffToMonday = (dayOfWeek + 6) % 7; // shift so Monday is 0
      startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return `${monthNames[selectedMonth]} ${selectedYear}`
    }
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(selectedDate)
    let dayOfWeek = startOfWeek.getDay()

    // Adjust so Monday is 0, Sunday is 6
    dayOfWeek = (dayOfWeek + 6) % 7

    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(day.getDate() + i)
      days.push(day)
    }

    return days
  }

  function getDateOfISOWeek(week, year) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const ISOweekStart = simple;
    if (dayOfWeek <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  }

  function getISOWeekNumber(date) {
    const temp = new Date(date.getTime());
    temp.setHours(0, 0, 0, 0);
    temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
    const week1 = new Date(temp.getFullYear(), 0, 4);
    return Math.ceil((((temp - week1) / 86400000) + week1.getDay() + 1) / 7);
  }

  const getInputValue = () => {
    if (currentView === 'day') {
      return selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (currentView === 'week') {
      const year = selectedDate.getFullYear();
      const week = getISOWeekNumber(selectedDate);
      return `${year}-W${String(week).padStart(2, '0')}`;
    } else if (currentView === 'month') {
      return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`; // YYYY-MM
    }
  };

  const handleDateChange = (e) => {
    const value = e.target.value;

    if (currentView === 'day') {
      setSelectedDate(new Date(value));
    } else if (currentView === 'week') {
      const [year, weekStr] = value.split('-W');
      const week = parseInt(weekStr, 10);
      const monday = getDateOfISOWeek(week, parseInt(year, 10));
      setSelectedDate(monday);
    } else if (currentView === 'month') {
      const [year, month] = value.split('-').map(Number);
      setSelectedYear(year);
      setSelectedMonth(month - 1);
      setSelectedDate(new Date(year, month - 1, 1));
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <AttendancePageHeader />
        <Flex justify='center' align='center'>
          <Loader />
        </Flex>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='space-y-6'>
        <AttendancePageHeader />
        <ErrorCallout errorMessage={error?.response?.data?.message || "Something went wrong"} />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* page header */}
      <AttendancePageHeader />

      {/* class schedule */}
      <Card size={'3'} className='space-y-4 shadow-md'>
        <Flex align='center' gap='2' wrap='wrap'>
          <Flex align='center' gap='2'>
            <Clock size={20} className='shrink-0' />
            <Text as='p' size={'5'} weight='medium'>Class Schedule - {classDetails?.name}</Text>
          </Flex>
          <Text as='p' size={'2'} color='gray'>({classDetails?.grade})</Text>
        </Flex>
        <div style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }} className='grid gap-4' >
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => {
            const hasClass = schedule.some(s => s.dayOfWeek.toLowerCase() === day.toLowerCase())
            const isToday = new Date().getDay() === index

            return (
              <Card
                size={'2'}
                key={day}
                className={` text-center ${hasClass ? "":"bg-[--gray-a3] opacity-70"} ${isToday && "ring-1 ring-[--accent-9]"} shadow-md`}
              >
                <Text as='p'
                  mb='2'
                  color={hasClass ? BRAND_COLOR : "gray"}
                >
                  {day}
                </Text>
                {hasClass ? (
                  <Badge variant='solid' className='flex justify-center items-center w-full'>
                    {schedule.find(s => s.dayOfWeek === day)?.startTime} - {schedule.find(s => s.dayOfWeek === day)?.endTime}
                  </Badge>
                ) : (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-xs text-gray-500">No Class</div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Schedule Summary */}
        <div className="pt-4 border-t border-[--gray-a6]">
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-4 items-center">
              <div className="flex flex-wrap gap-1 items-center">
                <Text as='p' size={'2'} color='gray'>Weekly Schedule:</Text>
                <Text as='p' size={'2'} color='white'>{schedule?.length ?? 0} classes per week</Text>
              </div>
            </div>

          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <Card size={'3'} className='shadow-md'>
          <Flex align='center' gap='2'>
            <Users size={16} />
            <Text as='p' size={'2'} color='gray'>{searchQuery ? "Filtered Students" : "Total Students"}</Text>
          </Flex>
          <Text as='p' size={'6'} weight='bold' mt={'2'} >
            {searchQuery ? `${filteredStudents.length}/${students.length}` : students.length}
          </Text>
        </Card>

        <Card size={'3'} className='shadow-md'>
          <Flex align='center' gap='2'>
            <Calendar size={16} />
            <Text as='p' size={'2'} color='gray'>
              Total Classes
            </Text>
          </Flex>
          <Text as='p' size={'6'} weight='bold' mt={'2'} >{monthlySummary?.totalScheduledDays ?? 0}</Text>
        </Card>

        <Card size={'3'} className='shadow-md'>
          <Flex align='center' gap='2'>
            <Clock size={16} />
            <Text as='p' size={'2'} color='gray'>
              Schedule
            </Text>
          </Flex>
          <Text as='p' size={'2'} weight='medium' mt={'2'} >{schedule?.length > 0 ? schedule?.map(s => s.dayOfWeek?.slice(0, 3)).join(", ") : "-"}</Text>
        </Card>

        <Card size={'3'} className='shadow-md'>
          <Flex align='center' gap='2'>
            <Gauge size={16} />
            <Text as='p' size={'2'} color='gray'>
              Avg Attendance
            </Text>
          </Flex>
          <Text as='p' size={'6'} weight='bold' mt={'2'} >{monthlySummary?.averageAttendanceRate ?? 0}%</Text>
        </Card>
      </div>

      {/* date picker */}
      <Flex justify='between' align='center' gap='4' wrap='wrap'>
        <Flex align='center' gap={'4'} wrap='wrap'>
          <Button
            variant='outline'
            color='gray'
            onClick={() => {
              setSelectedDate(new Date())
              setSelectedMonth(new Date().getMonth())
              setSelectedYear(new Date().getFullYear())
            }}
          >
            Today
          </Button>

          {/* Next and Previous */}
          <Flex align='center' gap='4'>
            <Tooltip content={currentView === "day" ? "Previous Day" : currentView === "week" ? "Previous Week" : "Previous Month"}>
              <IconButton
                variant='ghost'
                color='gray'
                highContrast
                size={'3'}
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeftIcon size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip content={currentView === "day" ? "Next Day" : currentView === "week" ? "Next Week" : "Next Month"}>
              <IconButton
                variant='ghost'
                color='gray'
                highContrast
                size={'3'}
                onClick={() => navigateDate("next")}
              >
                <ChevronRightIcon size={20} />
              </IconButton>
            </Tooltip>
          </Flex>

          <Text as='p' size={'5'} weight='medium'>
            {getDateRangeText()}
          </Text>

          <TextField.Root
            value={getInputValue()}
            type={currentView === 'month' ? 'month' : currentView === 'week' ? 'week' : 'date'}
            onChange={handleDateChange}
          />

          <Spinner size={'3'} loading={isFetching || isDayFetching} />

        </Flex>


        <Flex gap='4' align='center' wrap='wrap'>
          <TextField.Root
            value={searchQuery}
            onChange={(e) => handleSearch(e)}
            radius className='max-w-md'
            placeholder='Search students by name'
          >
            <TextField.Slot>
              <Search size={16} />
            </TextField.Slot>
          </TextField.Root>
          <Select.Root value={currentView} onValueChange={(value) => setCurrentView(value)}>
            <Select.Trigger />
            <Select.Content position="popper" variant='soft'>
              <Select.Item value="day">Day</Select.Item>
              <Select.Item value="week">Week</Select.Item>
              <Select.Item value="month">Month</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>

      {filteredStudents?.length === 0 && (
        <EmptyStateCard
          title="No students found"
          description="Try adjusting your search terms"
          icon={<Search />}
          action={<Button variant='outline' color='gray' onClick={() => setSearchQuery("")}>Clear Search</Button>}
        />
      )}

      {/* view */}
      {filteredStudents?.length > 0 && (
        <>
          {currentView === "day" && renderDayView({ selectedDate, classSchedule: schedule, handleRecordAttendance, attendanceData: dayAttendanceData })}
          {currentView === "week" && renderWeekView({ selectedDate, getWeekDays, classSchedule: schedule, attendanceData: weekAttendanceData, handleRecordAttendance })}
          {currentView === "month" && renderMonthView({ daysInMonth, selectedYear, selectedMonth, today, classSchedule: schedule, students: filteredStudents, handleRecordAttendance, monthlySummary })}
        </>
      )}

    </div>
  )
}

export default Attendance

function AttendancePageHeader() {
  return (
    <PageHeader
      title='Attendance Management'
      description='View and manage the attendance for all classes.'
      icon={<Clock className="w-5 h-5" />}
    />
  )
}

const renderWeekView = ({ selectedDate, getWeekDays, classSchedule, attendanceData, handleRecordAttendance }) => {
  const students = attendanceData?.students ?? [];
  const classDays = attendanceData?.classDays ?? [];
  console.log(students)

  const weekDays = getWeekDays()
  const today = new Date()
  return (
    <Card size={'3'} className='shadow-md'>
      <div className="overflow-auto w-full max-h-[65vh]">
        {/* Header Row */}
        <div className="flex pb-2">
          <div className="flex gap-2 items-center px-4 py-2 w-64 font-medium shrink-0">
            <span>Student</span>
            {/* <Badge variant="secondary" className="bg-gray-700">
                  {searchQuery ? `${filteredStudents.length}/${students.length}` : filteredStudents.length}
                </Badge> */}
          </div>
          <div className="flex flex-1 gap-2">
            {weekDays.map((day, index) => {
              const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
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
                onClick={() => setSearchQuery("")}
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
                  <Avatar radius='full' fallback={student?.name?.charAt(0)} size={'2'} highContrast />
                  <div className="flex-1 min-w-0">
                    <Text as='p' size={'2'} className='truncate'>{student?.name}</Text>
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
                          className="flex-1 h-12 min-w-20 disabled:opacity-50"
                          disabled
                        >
                          <Minus size={16} />
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

const renderDayView = ({ selectedDate, classSchedule, handleRecordAttendance, attendanceData }) => {
  const students = attendanceData?.students ?? [];
  const hasClass = attendanceData?.isScheduled ?? false;

  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
  const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" })

  return (
    <div className='space-y-4'>
      <Separator size={'4'} />
      <Flex justify='between' align='center' gap='4' wrap='wrap'>
        <Text as='p' size={'4'} weight='medium' className='flex gap-2 items-center'>
          <Calendar size={16} /> Daily Attendance - {dayName}
        </Text>
        {hasClass ? (
          <Flex align='center' gap='2' wrap='wrap'>
            <Text as='p' size={'2'} color='gray'>
              Bulk Actions:
            </Text>
            <Flex gap='2' wrap='wrap'>
              <Button variant='surface' color='green' >
                Mark All Present
              </Button>
              <Button variant='surface' color='red'>
                Mark All Absent
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Badge
            variant="soft"
            color='gray'
          >
            No Class
          </Badge>
        )}
      </Flex>
      {!hasClass ? (
        <EmptyStateCard
          title="No class scheduled for this day"
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
                onClick={() => setSearchQuery("")}
                className="mt-4 text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                Clear Search
              </Button>
            </div>
          )}
          {students.map((student) => {
            return (
              <>
                <Card key={student.studentId} size={'2'} className='flex flex-col justify-between hover:shadow-md'>
                  <div className="flex gap-3 items-start mb-3">
                    <Avatar radius='full' fallback={student?.studentName?.charAt(0)} size={'2'} highContrast />
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
                        if (student?.status === 'present') return;  // if present, do not allow to mark absent
                        handleRecordAttendance({
                          studentId: student.studentId,
                          attendanceDate: dateStr,
                          status: 'present'
                        })
                      }}
                      className='flex-1'
                    >
                      Present
                    </Button>
                    <Button
                      color={student?.status === 'absent' ? 'red' : 'gray'}
                      variant={student?.status === 'absent' ? 'solid' : 'soft'}
                      onClick={() => {
                        if (student?.status === 'absent') return;  // if absent, do not allow to mark present
                        handleRecordAttendance({
                          studentId: student.studentId,
                          attendanceDate: dateStr,
                          status: 'absent'
                        })
                      }}
                      className='flex-1'
                    >
                      Absent
                    </Button>
                  </div>
                </Card>
              </>
            )
          })}
        </div>
      )}
    </div>
  )
}

const renderMonthView = ({ daysInMonth, selectedYear, selectedMonth, today, classSchedule, students, handleRecordAttendance, monthlySummary }) => {
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
                const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" }) // e.g., "Mon"
                const isToday =
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()

                return (
                  <div
                    key={day}
                    className={`flex flex-col rounded-full items-center py-1 w-10 ${isToday ? "bg-[--accent-9] text-[--accent-contrast]" : ""}`}
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
                <div key={student.id} className="flex items-center">
                  <div className="flex gap-3 items-center px-2 py-3 w-64 shrink-0">
                    <Avatar fallback={student?.name?.charAt(0)} radius='full' size={'2'} highContrast />
                    <p className="text-sm truncate" title={student.name}>{student.name}</p>
                    <Text as='p' size={'2'} color='gray' className='ml-auto whitespace-nowrap'>
                      {student?.present ?? 0} / {monthlySummary?.totalScheduledDays ?? 0}
                    </Text>
                  </div>

                  <div className="flex flex-1 gap-2 px-4">
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1
                      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                      const status = student?.attendance?.[dateStr] ?? null

                      if (!status) {
                        return (
                          <IconButton
                            key={day}
                            variant="surface"
                            color='gray'
                            size={'3'}
                            disabled
                            radius='full'
                            className='disabled:opacity-50'
                          >
                            <Minus size={16} />
                          </IconButton>
                        )
                      }

                      return (
                        <AttendancePopover
                          student={student}
                          dateStr={dateStr}
                          status={status}
                          handleRecordAttendance={handleRecordAttendance}
                        >
                          <IconButton
                            key={day}
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
            <div className='border border-[--gray-a8] rounded-full size-4 bg-[--gray-a3] opacity-50 flex items-center justify-center' >-</div>
            <Text as='p' size={'2'}>No Class</Text>
          </Flex>
        </div>
      </div>
    </Card>
  )
}

const AttendancePopover = ({ open, setOpen, children, student, dateStr, status, handleRecordAttendance }) => {
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
              {student.name}
            </Text>
          </Flex>
          <Flex align='center' gap='2'>
            <Text as='div' size={'2'} color='gray'>
              Date:
            </Text>
            <Text as='div' size={'2'}>
              {new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
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
            onClick={() => handleRecordAttendance({
              studentId: student.studentId,
              attendanceDate: dateStr,
              status: 'present'
            })}
            disabled={status === 'present'}
          >
            Present
          </Button>
          <Button className='flex-1' color='red'
            onClick={() => handleRecordAttendance({
              studentId: student.studentId,
              attendanceDate: dateStr,
              status: 'absent'
            })}
            disabled={status === 'absent'}
          >
            Absent
          </Button>
        </Flex>
      </Popover.Content>
    </Popover.Root >
  )
}