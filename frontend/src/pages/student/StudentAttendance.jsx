import { Badge, Box, Button, Callout, Card, Flex, Grid, Progress, Text, Tooltip } from '@radix-ui/themes';
import { AlertCircle, AlertCircleIcon, Award, CheckCircle, Clock, Info, TrendingUp, XCircle, Zap } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../Context/AuthContext';
import { useCheckInAttendance, useRecordAttendance } from '../../api/attendance/attendance.mutations';
import { useAttendanceSummary, useStudentAttendance } from '../../api/attendance/attendance.queries';
import { EmptyStateCard, Loader, PageHeader } from '../../components';
import ErrorCallout from '../../components/ErrorCallout';
import { formatDate } from '../../utils/helperFunctions';
import { Link, useParams } from 'react-router';
import { useGetStudentClassAttendanceDetails } from '../../api/student/student.queries';
import { useRecordClassAttendance } from '../../api/class-attendance/classAttendance.mutations';

function StudentAttendance() {
  const { classId } = useParams();
  const { profiles } = useAuth();
  const studentId = profiles?.['student']?._id;

  // Queries
  const { data, isLoading: isAttendanceLoading, isError: isAttendanceError, error: attendanceError } = useStudentAttendance({
    studentId, options: {
      enabled: !!studentId && !classId
    }
  });
  const recentAttendance = data?.data ?? [];

  const {
    data: attendanceSummary,
    isLoading: isAttendanceSummaryLoading,
    isError: isAttendanceSummaryError,
    error: attendanceSummaryError,
    isFetching: isAttendanceSummaryFetching
  } = useAttendanceSummary({
    studentId, options: {
      enabled: !!studentId && !classId
    }
  });
  const streakData = attendanceSummary?.data?.student ?? {};
  const summary = attendanceSummary?.data?.summary ?? {};


  const {
    data: classAttendanceDetails,
    isLoading: isClassAttendanceDetailsLoading,
    isError: isClassAttendanceDetailsError,
    error: classAttendanceDetailsError,
    isFetching: isClassAttendanceDetailsFetching
  } = useGetStudentClassAttendanceDetails({ studentId, classId });
  const classInfo = classAttendanceDetails?.data?.classInfo ?? {};
  const todaysClass = classAttendanceDetails?.data?.todaysClass ?? {};
  const statistics = classAttendanceDetails?.data?.statistics ?? {};
  const recentClassAttendance = classAttendanceDetails?.data?.recentAttendance ?? [];
  console.log(recentClassAttendance)

  // Mutations
  const checkInMutation = useCheckInAttendance();
  const classAttendanceMutation = useRecordClassAttendance();

  const handleMarkClassAttendance = () => {
    classAttendanceMutation.mutate({
      classId,
      studentId,
      status: 'present',
      comments: 'Marked by student',
      attendanceDate: new Date().toISOString(),
      activeRole: 'student'
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'green';
      case 'tardy': return 'yellow';
      case 'absent': return 'red';
      case 'excused': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle size={16} />;
      case 'tardy': return <Clock size={16} />;
      case 'absent': return <AlertCircle size={16} />;
      case 'excused': return <CheckCircle size={16} />;
      default: return null;
    }
  };

  // Loading states
  if (isAttendanceSummaryLoading || isClassAttendanceDetailsLoading) return (
    <div className='mx-auto space-y-6 max-w-5xl' >
      <AttendancePageHeader classId={classId} />
      <Flex justify='center' align='center' >
        <Loader />
      </Flex>
    </div>
  )

  // Error states
  if (isAttendanceSummaryError || isClassAttendanceDetailsError) return (
    <div className='mx-auto space-y-6 max-w-5xl' >
      <AttendancePageHeader classId={classId} />
      <ErrorCallout
        className='mx-auto max-w-2xl'
        errorMessage={attendanceSummaryError?.response?.data?.message || classAttendanceDetailsError?.response?.data?.message || 'Something went wrong while fetching attendance details'}
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

      {/* Check-in Section */}
      <Card size={{initial: '2', sm: '3'}} className='card_no_border'>
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between" gap='3' wrap={'wrap-reverse'}>
            <Box>
              <Text as='p' size="5" weight="bold">
                {classId ? `${classInfo?.name} - ${classInfo?.grade}` : 'Today\'s Check-in'}
              </Text>
              <Text as='p' size="2" color="gray">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </Box>
            {hasCheckedInToday() && (
              <Badge size={'2'} color="green">
                <CheckCircle size={16} />
                Checked In
              </Badge>
            )}
          </Flex>

          {!hasCheckedInToday() && !classId && (
            <Callout.Root color="blue" variant='surface'>
              <Callout.Icon>
                <Zap size={16} />
              </Callout.Icon>
              <Callout.Text>
                Ready to check in? Tap the button below to mark your attendance and earn points!
              </Callout.Text>
            </Callout.Root>
          )}

          {classId && (
            !todaysClass?.isScheduledToday ? (
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
                    color={todaysClass?.attendanceStatus === 'present' && todaysClass?.attendanceStatus === 'absent' ? 'red' : ''}
                    className="flex-1 gap-2 items-center capitalize shadow-md max-w-64 text-nowrap"
                    onClick={() => {
                      if (todaysClass?.attendanceMarked) return;
                      handleMarkClassAttendance();
                    }}
                    disabled={classAttendanceMutation.isPending || isClassAttendanceDetailsFetching}
                  >
                    {todaysClass?.attendanceStatus === 'present' ? (
                      <>
                        <CheckCircle size={16} />
                        Marked Present
                      </>
                    ) : todaysClass?.attendanceStatus === 'absent' ? (
                      <>
                        <XCircle size={16} />
                        Marked Absent
                      </>
                    ) : classAttendanceMutation.isPending ? 'Marking Attendance...' : 'Mark Attendance'}
                  </Button>
                  {todaysClass?.attendanceDetails?.pointsAwarded > 0 && todaysClass?.attendanceDetails?.status === 'present' && (
                    <Text as='p' size="2" color="green" className='flex gap-1 items-center'>
                     <Award size={16} /> {todaysClass?.attendanceDetails?.pointsAwarded} points earned today!
                    </Text>
                  )}
                </Flex>

                {todaysClass?.attendanceDetails?.recordedByRole && todaysClass?.attendanceDetails?.recordedByRole !== 'student' && todaysClass?.attendanceDetails?.recordedByRole !== 'parent' && (
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
                <Text as='span' size="2" weight="medium">Points earned today!</Text>
              </Text>
            )}
          </Flex>}
        </Flex>
      </Card>

      {/* Stats Grid */}
      <Grid columns={{ initial: '2', lg: '4' }} gap="4">
        <Card size={{initial: '2', sm: '3'}} className='card_no_border'>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <TrendingUp size={20} className="text-[--indigo-11] flex-shrink-0" />
              <Text as='p' size="2" color="gray" weight="medium">Current Streak</Text>
            </Flex>
            <Text size="6" weight="bold" color="indigo">
              {streakData?.currentStreak || statistics?.currentStreak || 0}x
            </Text>
          </Flex>
        </Card>

        <Card size={{initial: '2', sm: '3'}} className='card_no_border'>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Award size={20} className="text-[--green-11] flex-shrink-0" />
              <Text as='p' size="2" color="gray" weight="medium">Longest Streak</Text>
            </Flex>
            <Text size="6" weight="bold" color="green">
              {streakData?.longestStreak || statistics?.longestStreak || 0}
            </Text>
            <Text as='p' size="1" color="gray">personal best</Text>
          </Flex>
        </Card>

        <Card size={{initial: '2', sm: '3'}} className='card_no_border'>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <CheckCircle size={20} className="text-[--blue-11] flex-shrink-0" />
              <Text as='p' size="2" color="gray" weight="medium">Attendance Rate</Text>
            </Flex>
            <Flex justify={'between'} align={'baseline'} wrap={'wrap'} gap={'2'}>
              <Text as='p' size="6" weight="bold" color="blue">
                {summary?.attendanceRate || statistics?.attendanceRate || 0}%
              </Text>
              <Text as='p' size="1" color="gray">
                {summary?.present || statistics?.presentDaysInMonth || 0} / {summary?.totalDays || statistics?.totalScheduledDaysInMonth || 0}
              </Text>
            </Flex>
            <Progress value={summary?.attendanceRate || statistics?.attendanceRate || 0} color="blue" size="1" variant='classic'/>
          </Flex>
        </Card>

        <Card size={{initial: '2', sm: '3'}} className='card_no_border'>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Zap size={20} className="text-[--purple-11] flex-shrink-0" />
              <Text as='p' size="2" color="gray" weight="medium">Points This Month</Text>
            </Flex>
            <Text as='p' size="6" weight="bold" color="purple">
              {summary?.pointsEarned || statistics?.pointsThisMonth || 0}
            </Text>
            <Text as='p' size="1" color="gray">scholarship points</Text>
          </Flex>
        </Card>
      </Grid>

      {/* Recent Attendance */}
      <Flex direction="column" gap="4" pt='2'>
        <Flex align="center" justify="between" gap='1' wrap='wrap'>
          <Text as='p' size="5" weight="bold">Recent Attendance</Text>
        </Flex>

        <Box>
          {isAttendanceLoading ? (
            <Flex justify="center" align="center">
              <Loader />
            </Flex>
          ) : isAttendanceError ? (
            <Callout.Root color='red' variant='surface'>
              <Callout.Icon>
                <AlertCircleIcon size={16} />
              </Callout.Icon>
              <Callout.Text>
                {attendanceError?.response?.data?.message || 'Something went wrong while fetching attendance details'}
              </Callout.Text>
            </Callout.Root>
          ) : recentAttendance?.length > 0 ? (
            recentAttendance?.map((record) => (
              <Box key={record._id} className='hover:bg-[--gray-a2] transition-colors px-2 border-b border-[--gray-a6]'>
                <Flex align="center" justify="between" py="3">
                  <Flex align="center" gap="3">
                    <Badge color={getStatusColor(record.status)} variant="soft">
                      {getStatusIcon(record.status)}
                      {record.status}
                    </Badge>
                    <Text as='p' size="2" weight="medium">
                      {formatDate(record.date, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </Flex>
                  <Flex align="center" gap="4">
                    <Text as='div' className="flex gap-1 items-center" color='green'>
                      <Award size={16} />
                      <Text as='p' size="2">+{record.pointsAwarded}</Text>
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            ))
          ) : recentClassAttendance?.length > 0 ? (
            recentClassAttendance?.map((record) => (
              <Box key={record?.recordedAt} className='hover:bg-[--gray-a2] transition-colors px-2 border-b border-[--gray-a6]'>
                <Flex align="center" justify="between" py="3">
                  <Flex align="center" gap="3">
                    <Badge color={getStatusColor(record.status)} variant="soft">
                      {getStatusIcon(record.status)}
                      {record.status}
                    </Badge>
                    <Text as='p' size="2" weight="medium">
                      {formatDate(record.date, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </Flex>
                  <Flex align="center" gap="4">
                    <Text as='div' className="flex gap-1 items-center" color='green'>
                      <Award size={16} />
                      <Text as='p' size="2">+{record.pointsAwarded}</Text>
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            ))
          ) : (
            <EmptyStateCard
              description='No attendance records found'
            />
          )}
        </Box>
      </Flex>
    </Box>
  );
}

export default StudentAttendance;

// Attendance Page Header
function AttendancePageHeader({ classId }) {
  return (
    <PageHeader
      title={classId ? 'Class Attendance' : 'Daily Attendance'}
      description={classId ? 'Track your class attendance and build your streak' : 'Track your daily attendance and build your streak'}
      backButton={classId ? true : false}
    />
  )
}