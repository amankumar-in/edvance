import { Badge, Button, Card, Flex, IconButton, Popover, Select, Spinner, Text, TextField, Tooltip } from '@radix-ui/themes';
import { format } from 'date-fns';
import { Calendar, ChevronLeftIcon, ChevronRightIcon, Clock, Gauge, Search, Users } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { useRecordClassAttendance } from '../../../api/class-attendance/classAttendance.mutations';
import { useGetClassAttendanceInfo } from '../../../api/class-attendance/classAttendance.queries';
import { ErrorCallout, Loader } from '../../../components';
import { BRAND_COLOR } from '../../../utils/constants';
import { cn } from '../../../utils/helperFunctions';
import PageHeader from '../components/PageHeader';
import DayView from './DayView';
import MonthView from './MonthView';
import WeekView from './WeekView';

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

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [currentView, setCurrentView] = useState("day")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const selectedDateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  const today = new Date()

  // Queries
  const {
    data: classAttendanceInfo,
    isLoading: isClassAttendanceInfoLoading,
    isError: isClassAttendanceInfoError,
    error: classAttendanceInfoError
  } = useGetClassAttendanceInfo({ classId, enabled: !!classId });

  const classAttendanceInfoData = classAttendanceInfo?.data ?? {};

  const {
    totalStudents = 0,
    totalClassesHeld = 0,
    averageAttendance = 0,
    classInfo: { name = "", grade = "", createdAt } = {},
    schedule = [],
    calculatedUpTo = new Date()
  } = classAttendanceInfoData;

  // Mutations
  const recordAttendanceMutation = useRecordClassAttendance();

  // TODO: Implement this functionality in backend and integrate it with the frontend
  const handleRecordAttendance = useCallback(async ({ studentId, attendanceDate, status }) => {
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
  }, [classId, recordAttendanceMutation])

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

  const getWeekStartDate = () => {
    const startOfWeek = new Date(selectedDate);
    let dayOfWeek = startOfWeek.getDay();
    // Adjust so Monday is 0, Sunday is 6
    dayOfWeek = (dayOfWeek + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    return startOfWeek.toISOString().split('T')[0];
  };

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

  const handleDateChange = (e) => {
    const value = e.target.value;

    if (currentView === 'day') {
      const [year, month, day] = value.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
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

  const getInputValue = () => {
    if (currentView === 'day') {
      return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    } else if (currentView === 'week') {
      const year = selectedDate.getFullYear();
      const week = getISOWeekNumber(selectedDate);
      return `${year}-W${String(week).padStart(2, '0')}`;
    } else if (currentView === 'month') {
      return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`; // YYYY-MM
    }
  };

  // TODO: Implement the client side search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));

  function handleLoading(loading) {
    setLoading(loading)
  }

  if (isClassAttendanceInfoLoading) {
    return (
      <div className='space-y-6'>
        <AttendancePageHeader />
        <Flex justify='center' align='center'>
          <Loader />
        </Flex>
      </div>
    )
  }

  if (isClassAttendanceInfoError) {
    return (
      <div className='space-y-6'>
        <AttendancePageHeader />
        <ErrorCallout errorMessage={classAttendanceInfoError?.response?.data?.message || "Something went wrong"} />
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
            <Text as='p' size={'5'} weight='medium'>
              Class Schedule - {name || "-"}
            </Text>
          </Flex>
          <Text as='p' size={'2'} color='gray'>
            ({grade || "-"})
          </Text>
        </Flex>
        <div style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }} className='grid gap-4' >
          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => {
            // Find the schedule once and reuse it
            const daySchedule = schedule?.find(s => s.dayOfWeek.toLowerCase() === day.toLowerCase());
            const hasClass = !!daySchedule; // Convert to boolean
            const isToday = new Date().getDay() === index;

            return (
              <Card
                size={'2'}
                key={day}
                className={cn(
                  "text-center shadow-md",
                  hasClass ? "":"bg-[--gray-a3] opacity-70",
                  isToday ? "ring-1 ring-[--accent-9]" : "",
                )}
              >
                <Text as='p'
                  mb='2'
                  color={hasClass ? BRAND_COLOR : "gray"}
                >
                  {day}
                </Text>
                {hasClass ? (
                  <Badge variant='solid' className='flex justify-center items-center w-full'>
                    {daySchedule.startTime} - {daySchedule.endTime}
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
                <Text as='p' size={'2'} color='white'>{schedule?.length || 0} classes per week</Text>
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
            <Text as='p' size={'2'} color='gray'>
              Total Students
            </Text>
          </Flex>
          <Text as='p' size={'6'} weight='bold' mt={'2'} >
            {totalStudents}
          </Text>
        </Card>

        <Card size={'3'} className='shadow-md'>
          <Flex align='center' gap='2'>
            <Calendar size={16} />
            <Text as='p' size={'2'} color='gray'>
              Total Classes
            </Text>
          </Flex>
          <Text as='p' size={'6'} weight='bold' mt={'2'} >
            {totalClassesHeld}
          </Text>
          <Text as='p' size={'1'} color='gray' mt={'2'}>
            {createdAt ? format(createdAt, 'MMM do, yyyy') : '-'} - {calculatedUpTo ? format(calculatedUpTo, 'MMM do, yyyy') : '-'}
          </Text>
        </Card>

        <Card size={'3'} className='shadow-md'>
          <Flex align='center' gap='2'>
            <Clock size={16} />
            <Text as='p' size={'2'} color='gray'>
              Schedule
            </Text>
          </Flex>
          <Text as='p' size={'2'} weight='medium' mt={'2'} >
            {
              schedule?.length > 0 ?
                schedule?.map(s => s.dayOfWeek?.slice(0, 3)).join(", ") :
                "-"
            }
          </Text>
        </Card>

        <Card size={'3'} className='shadow-md'>
          <Flex align='center' gap='2'>
            <Gauge size={16} />
            <Text as='p' size={'2'} color='gray'>
              Avg Attendance
            </Text>
          </Flex>
          <Text as='p' size={'6'} weight='bold' mt={'2'} >
            {averageAttendance}%
          </Text>
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

          <Spinner size={'3'} loading={loading} />

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

      {/* {filteredStudents?.length === 0 && (
        <EmptyStateCard
          title="No students found"
          description="Try adjusting your search terms"
          icon={<Search />}
          action={<Button variant='outline' color='gray' onClick={() => setSearchQuery("")}>Clear Search</Button>}
        />
      )} */}

      {/* view */}
      {currentView === "day" && (
        <DayView
          selectedDate={selectedDate}
          classId={classId}
          currentView={currentView}
          selectedDateString={selectedDateString}
          handleRecordAttendance={handleRecordAttendance}
          handleLoading={handleLoading}
        />
      )}
      {currentView === "week" && (
        <WeekView
          getWeekDays={getWeekDays}
          classId={classId}
          currentView={currentView}
          selectedDateString={getWeekStartDate()}
          handleRecordAttendance={handleRecordAttendance}
          handleLoading={handleLoading}
        />
      )}
      {currentView === "month" && (
        <MonthView
          classId={classId}
          currentView={currentView}
          daysInMonth={daysInMonth}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          today={today}
          handleLoading={handleLoading}
        />
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

// TODO: Move this to a separate file and make it a component
export const AttendancePopover = ({ children, student, dateStr, status, handleRecordAttendance }) => {
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