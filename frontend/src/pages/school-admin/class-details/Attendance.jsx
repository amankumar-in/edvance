import { Badge, Button, Card, Flex, IconButton, Select, Spinner, Text, TextField, Tooltip } from '@radix-ui/themes';
import { format } from 'date-fns';
import { Calendar, ChevronLeftIcon, ChevronRightIcon, Clock, Gauge, Search, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
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

const ALLOWED_VIEWS = ["day", "week", "month"];

function Attendance() {
  const { classId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get("view");
  const view = ALLOWED_VIEWS.includes(viewParam) ? viewParam : "month";

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
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

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate)

    if (view === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    } else if (view === "week") {
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
    if (view === "day") {
      return selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } else if (view === "week") {
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
    const date = new Date(selectedDate);

    let dayOfWeek = date.getDay();
    // Adjust: Monday=0, Sunday=6
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    date.setDate(date.getDate() - diff);

    // Format in local timezone
    return date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
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

    if (view === 'day') {
      const [year, month, day] = value.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    } else if (view === 'week') {
      const [year, weekStr] = value.split('-W');
      const week = parseInt(weekStr, 10);
      const monday = getDateOfISOWeek(week, parseInt(year, 10));
      setSelectedDate(monday);
    } else if (view === 'month') {
      const [year, month] = value.split('-').map(Number);
      setSelectedYear(year);
      setSelectedMonth(month - 1);
      setSelectedDate(new Date(year, month - 1, 1));
    }
  };

  const getInputValue = () => {
    if (view === 'day') {
      return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    } else if (view === 'week') {
      const year = selectedDate.getFullYear();
      const week = getISOWeekNumber(selectedDate);
      return `${year}-W${String(week).padStart(2, '0')}`;
    } else if (view === 'month') {
      return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`; // YYYY-MM
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  function handleLoading(loading) {
    setLoading(loading)
  }

  const renderView = () => {
    switch (view) {
      case "day":
        return (
          <DayView
            classId={classId}
            currentView={view}
            selectedDate={selectedDate}
            selectedDateString={selectedDateString}
            handleLoading={handleLoading}
            searchQuery={searchQuery}
          />
        );

      case "week":
        return (
          <WeekView
            classId={classId}
            currentView={view}
            getWeekDays={getWeekDays}
            selectedDateString={getWeekStartDate()}
            today={today}
            handleLoading={handleLoading}
            searchQuery={searchQuery}
          />
        );

      case "month":
      default:
        return (
          <MonthView
            classId={classId}
            currentView={view}
            daysInMonth={daysInMonth}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            today={today}
            handleLoading={handleLoading}
            searchQuery={searchQuery}
          />
        );
    }
  };

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
      <Card size={'3'} className='space-y-4'>
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
                  "text-center",
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
        <Card size={'3'} className=''>
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

        <Card size={'3'} className=''>
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

        <Card size={'3'} className=''>
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

        <Card size={'3'} className=''>
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
            variant='surface'
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
            <Tooltip content={view === "day" ? "Previous Day" : view === "week" ? "Previous Week" : "Previous Month"}>
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
            <Tooltip content={view === "day" ? "Next Day" : view === "week" ? "Next Week" : "Next Month"}>
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
            type={view === 'month' ? 'month' : view === 'week' ? 'week' : 'date'}
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
            {searchQuery && <TextField.Slot side='right'>
              <IconButton
                variant='ghost'
                color='gray'
                size='2'
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </IconButton>
            </TextField.Slot>}
          </TextField.Root>
          <Select.Root
            value={view}
            onValueChange={(value) => {
              setSearchParams(prev => {
                prev.set('view', value)
                return prev
              }, { preventScrollReset: true })
            }}
          >
            <Select.Trigger />
            <Select.Content position="popper" variant='soft'>
              <Select.Item value="day">Day</Select.Item>
              <Select.Item value="week">Week</Select.Item>
              <Select.Item value="month">Month</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>

      {/* view */}
      {renderView()}
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