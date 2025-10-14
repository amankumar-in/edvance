import { Badge, Box, Button, Callout, Card, Flex, Grid, Progress, Text, Tooltip } from '@radix-ui/themes';
import { format } from 'date-fns';
import { AlertCircle, Award, CheckCircle, Coins, Flame, Info, Medal, TrendingUp, XCircle, Zap } from 'lucide-react';
import React from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../Context/AuthContext';
import { useCheckInAttendance } from '../../api/attendance/attendance.mutations';
import { useAttendanceSummary } from '../../api/attendance/attendance.queries';
import { useRecordClassAttendance } from '../../api/class-attendance/classAttendance.mutations';
import { useGetStudentClassAttendanceInfo } from '../../api/class-attendance/classAttendance.queries';
import ErrorCallout from '../../components/ErrorCallout';
import Loader from '../../components/Loader';
import PageHeader from '../../components/PageHeader';
import StudentAttendanceCalendar from './components/attendance/StudentAttendanceCalendar';

function StudentAttendance() {
  const { classId } = useParams();
  const { profiles } = useAuth();
  const studentId = profiles?.['student']?._id;

  // Queries
  const {
    data: studentClassAttendanceInfo,
    isError: isStudentClassAttendanceInfoError,
    error: studentClassAttendanceInfoError,
    refetch: refetchStudentClassAttendanceInfo,
    isFetching: isStudentClassAttendanceInfoFetching,
  } = useGetStudentClassAttendanceInfo({ studentId, classId });

  const {
    classInfo = {},
    isClassScheduledToday = false,
    todayStatus: attendanceStatus = null,
    canMarkToday = false,
    currentStreak = 0,
    longestStreak = 0,
    presentDaysInMonth = 0,
    classesHeldSoFar = 0,
    attendanceRate = 0,
    pointsEarned: pointsEarnedThisMonth = 0,
    monthlyInfo = {},
    scheduledDays = [],
    markedByRole,
  } = studentClassAttendanceInfo?.data ?? {};
  const { name, grade } = classInfo;

  console.log(studentClassAttendanceInfo);

  const {
    data: attendanceSummary,
    isLoading: isAttendanceSummaryLoading,
    isError: isAttendanceSummaryError,
    error: attendanceSummaryError,
    isFetching: isAttendanceSummaryFetching,
    refetch: refetchAttendanceSummary,
  } = useAttendanceSummary({
    studentId, options: {
      enabled: !!studentId && !classId
    }
  });
  const streakData = attendanceSummary?.data?.student ?? {};
  const summary = attendanceSummary?.data?.summary ?? {};

  // Mutations
  const checkInMutation = useCheckInAttendance();
  const classAttendanceMutation = useRecordClassAttendance();

  const handleMarkClassAttendance = () => {
    classAttendanceMutation.mutate({
      classId,
      studentId,
      attendanceDate: new Date().toLocaleDateString('en-CA'),
    }, {
      onSuccess: () => {
        toast.success('Attendance marked successfully');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to mark  attendance');
      }
    })
  }

  // Check if student has checked in today
  const hasCheckedInToday = () => {
    if (!streakData?.lastCheckInDate) return false;

    const lastCheckIn = new Date(streakData.lastCheckInDate);
    const today = new Date();

    return lastCheckIn.toDateString() === today.toDateString();
  };

  // Handle check-in
  const handleCheckIn = async () => {
    checkInMutation.mutate(studentId, {
      onSuccess: () => {
        toast.success('Check-in successful! Points earned!');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to check in');
      }
    })
  };

  // Loading states
  if (isStudentClassAttendanceInfoFetching) return (
    <div className='mx-auto space-y-6 max-w-5xl' >
      <AttendancePageHeader classId={classId} />
      <Flex justify='center' align='center' >
        <Loader />
      </Flex>
    </div>
  )

  // Error states
  if (isStudentClassAttendanceInfoError) return (
    <div className='mx-auto space-y-6 max-w-5xl' >
      <AttendancePageHeader classId={classId} />
      <ErrorCallout
        errorMessage={studentClassAttendanceInfoError?.response?.data?.message || studentClassAttendanceInfoError?.message || 'Something went wrong while fetching attendance details'}
        onRetry={refetchStudentClassAttendanceInfo}
      />
    </div>
  )

  // Main content
  return (
    <Box className="mx-auto space-y-6 max-w-5xl">
      <AttendancePageHeader classId={classId} />

      {!classId && (
        <Callout.Root variant='surface' color='blue'>
          <Callout.Icon>
            <Info size={18} />
          </Callout.Icon>
          <Callout.Text weight={'medium'} size={'3'}>
            You haven't joined a school yet
          </Callout.Text>
          <Text as='p' size="2">
            To access class attendance, please join your school using the code shared by your teacher.
          </Text>
          <Button
            className='w-max'
            asChild
          >
            <Link to={'/student/settings/linked-accounts#school'}>
              Join a school
            </Link>
          </Button>
        </Callout.Root>
      )}

      <Flex wrap={'wrap'} gap='4' className='relative'>
        <div className="flex-1 space-y-4 min-w-fit">

          {/* Check-in Section */}
          <Card size={{ initial: '2', sm: '3' }} className='card_no_border'>
            <Flex direction="column" gap="4">
              <Flex align="center" justify="between" gap='3' wrap={'wrap-reverse'}>
                {/* Class Details */}
                <Box>
                  <Text as="p" size="5" weight="bold">
                    {classId
                      ? `${name || "—"} - ${grade || "—"}`
                      : "Today's Check-in"}
                  </Text>
                  <Text as='p' size="2" color="gray">
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </Text>
                </Box>
                {!classId && hasCheckedInToday() && (
                  <Badge size={'2'} color="green">
                    <CheckCircle size={16} />
                    Checked In
                  </Badge>
                )}
              </Flex>

              {!classId && !hasCheckedInToday() && (
                <Callout.Root color="blue" variant='surface'>
                  <Callout.Icon>
                    <Zap size={16} />
                  </Callout.Icon>
                  <Callout.Text>
                    Ready to check in? Tap the button below to mark your attendance and earn scholarship points!
                  </Callout.Text>
                </Callout.Root>
              )}

              {classId && (
                !isClassScheduledToday ? (
                  <Callout.Root color="blue" variant='surface'>
                    <Callout.Icon>
                      <AlertCircle size={16} />
                    </Callout.Icon>
                    <Callout.Text>
                      No class scheduled today
                    </Callout.Text>
                  </Callout.Root>
                ) : (
                  <>
                    <Flex align="center" gap="3" wrap='wrap'>
                      <Button
                        size={'3'}
                        color={attendanceStatus === 'present' && attendanceStatus === 'absent' ? 'red' : 'grass'}
                        className="flex-1 gap-2 items-center capitalize shadow-md max-w-64 text-nowrap disabled:cursor-not-allowed"
                        onClick={handleMarkClassAttendance}
                        disabled={
                          classAttendanceMutation.isPending ||
                          !canMarkToday ||
                          isStudentClassAttendanceInfoFetching
                        }
                      >
                        {attendanceStatus === 'present' ? (
                          <>
                            <CheckCircle size={16} />
                            Marked Present
                          </>
                        ) : attendanceStatus === 'absent' ? (
                          <>
                            <XCircle size={16} />
                            Marked Absent
                          </>
                        ) : classAttendanceMutation.isPending ? 'Marking Attendance...' : 'Mark Attendance'}
                      </Button>
                      {/* {todaysClass?.attendanceDetails?.pointsAwarded > 0 && todaysClass?.attendanceDetails?.status === 'present' && (
                        <Text as='p' size="2" color="green" className='flex gap-1 items-center'>
                          <Award size={16} /> {todaysClass?.attendanceDetails?.pointsAwarded} points earned today!
                        </Text>
                      )} */}
                    </Flex>

                    {markedByRole && markedByRole !== 'student'  && (
                      <Callout.Root color="blue" variant='surface'>
                        <Callout.Icon>
                          <AlertCircle size={16} />
                        </Callout.Icon>
                        <Callout.Text>
                          You attendance has been marked by your class teacher.
                        </Callout.Text>
                      </Callout.Root>
                    )}
                  </>
                )
              )}

              {!classId && <Flex align="center" gap="3" wrap='wrap'>
                <Tooltip
                  content={checkInMutation.isPending ? 'Checking In...' : hasCheckedInToday() ? 'You have already checked in today' : 'Check In Now'}
                >
                  <Button
                    size={'3'}
                    disabled={checkInMutation.isPending || hasCheckedInToday() || isAttendanceSummaryFetching}
                    onClick={handleCheckIn}
                    className="flex-1 shadow-md max-w-64 text-nowrap"
                  >
                    {checkInMutation.isPending ? 'Checking In...' :
                      hasCheckedInToday() ? 'Already Checked In' :
                        'Check In Now'}
                  </Button>
                </Tooltip>
                {hasCheckedInToday() && !classId && (
                  <Text as='div' color='green' className='flex gap-1 items-center'>
                    <Award size={16} />
                    <Text as='span' size="2" weight="medium">Scholarship points earned today!</Text>
                  </Text>
                )}
              </Flex>}
            </Flex>
          </Card>

          {/* Stats Grid */}
          <Grid columns={{ initial: '2' }} gap="4">
            {/* Current Streak */}
            <Card size={{ initial: '2', sm: '3' }} className='overflow-hidden relative card_no_border'>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[--orange-a2]"></div>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <Flame size={20} className="text-[--orange-11] flex-shrink-0" />
                  <Text as='p' size="2" color="gray" weight="medium">Current Streak</Text>
                </Flex>
                <Text size="6" weight="bold" color="orange">
                  {currentStreak}x
                </Text>
              </Flex>
            </Card>

            {/* Longest Streak */}
            <Card size={{ initial: '2', sm: '3' }} className='overflow-hidden relative card_no_border'>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[--purple-a2]"></div>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <Medal size={20} className="text-[--purple-11] flex-shrink-0" />
                  <Text as='p' size="2" color="gray" weight="medium">Longest Streak</Text>
                </Flex>
                <Text size="6" weight="bold" color="purple">
                  {longestStreak}
                </Text>
                <Text as='p' size="1" color="gray">personal best</Text>
              </Flex>
            </Card>

            {/* Attendance Rate */}
            <Card size={{ initial: '2', sm: '3' }} className='card_no_border'>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[--sky-a2]"></div>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <TrendingUp size={20} className="text-[--sky-11] flex-shrink-0" />
                  <Text as='p' size="2" color="gray" weight="medium">Attendance Rate</Text>
                </Flex>
                <Flex justify={'between'} align={'baseline'} wrap={'wrap'} gap={'2'}>
                  <Text as='p' size="6" weight="bold" color="sky">
                    {attendanceRate}%
                  </Text>
                  <Text as='p' size="1" color="gray">
                    {presentDaysInMonth} / {classesHeldSoFar}
                  </Text>
                </Flex>
                <Progress value={attendanceRate} color="blue" size="1" variant='classic' />
              </Flex>
            </Card>

            {/* Points This Month */}
            <Card size={{ initial: '2', sm: '3' }} className='card_no_border'>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[--green-a2]"></div>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <Coins size={20} className="text-[--green-11] flex-shrink-0" />
                  <Text as='p' size="2" color="gray" weight="medium">SP This Month</Text>
                </Flex>
                <Text as='p' size="6" weight="bold" color="green">
                  {pointsEarnedThisMonth}
                </Text>
                <Text as='p' size="1" color="gray">scholarship points</Text>
              </Flex>
            </Card>
          </Grid>
        </div>

        <Card size={{ initial: '2', sm: '3' }} className='flex justify-center card_no_border h-fit'>
          <StudentAttendanceCalendar
            attendance={monthlyInfo}
            scheduledDays={scheduledDays}
          />
        </Card>
      </Flex>
    </Box>
  );
}

export default StudentAttendance;

// Attendance Page Header
function AttendancePageHeader({ classId }) {
  return (
    <PageHeader
      title={classId ? 'Attendance' : 'Daily Attendance'}
      description={classId ? 'Track your class attendance and build your streak' : 'Track your daily attendance and build your streak'}
    />
  )
}