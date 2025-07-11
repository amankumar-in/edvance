import { Badge, Box, Button, Callout, Card, Flex, Grid, Progress, Text, Tooltip } from '@radix-ui/themes';
import { AlertCircle, AlertCircleIcon, Award, CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../Context/AuthContext';
import { useCheckInAttendance } from '../../api/attendance/attendance.mutations';
import { useAttendanceSummary, useStudentAttendance } from '../../api/attendance/attendance.queries';
import { EmptyStateCard, Loader, PageHeader } from '../../components';
import ErrorCallout from '../../components/ErrorCallout';
import { formatDate } from '../../utils/helperFunctions';

function StudentAttendance() {
  const { profiles } = useAuth();
  const studentId = profiles?.['student']?._id;

  // Queries

  const { data, isLoading: isAttendanceLoading, isError: isAttendanceError, error: attendanceError } = useStudentAttendance(studentId);
  const recentAttendance = data?.data ?? [];

  const { data: attendanceSummary, isLoading: isAttendanceSummaryLoading, isError: isAttendanceSummaryError, error: attendanceSummaryError, isFetching: isAttendanceSummaryFetching } = useAttendanceSummary(studentId);
  const streakData = attendanceSummary?.data?.student ?? {};
  const summary = attendanceSummary?.data?.summary ?? {};

  // Mutations
  const checkInMutation = useCheckInAttendance();

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
  if (isAttendanceSummaryLoading) return (
    <div className='mx-auto space-y-6 max-w-5xl' >
      <AttendancePageHeader />
      <Flex justify='center' align='center' >
        <Loader />
      </Flex>
    </div>
  )

  // Error states
  if (isAttendanceSummaryError) return (
    <div className='mx-auto space-y-6 max-w-5xl' >
      <AttendancePageHeader />
      <ErrorCallout
        className='mx-auto'
        errorMessage={attendanceSummaryError?.response?.data?.message || 'Something went wrong while fetching attendance details'}
      />
    </div>
  )

  // Main content
  return (
    <Box className="mx-auto space-y-6 max-w-5xl">
      <AttendancePageHeader />

      {/* Check-in Section */}
      <Card size="3" className='shadow-md'>
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between" gap='3' wrap={'wrap-reverse'}>
            <Box>
              <Text as='p' size="5" weight="bold">
                Today's Check-in
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

          {!hasCheckedInToday() && (
            <Callout.Root color="blue" variant='surface'>
              <Callout.Icon>
                <Zap size={16} />
              </Callout.Icon>
              <Callout.Text>
                Ready to check in? Tap the button below to mark your attendance and earn points!
              </Callout.Text>
            </Callout.Root>
          )}

          <Flex align="center" gap="3" wrap='wrap'>
            <Tooltip
              content={checkInMutation.isPending ? 'Checking In...' : hasCheckedInToday() ? 'You have already checked in today' : 'Check In Now'}
            >
              <Button
                color="green"
                disabled={checkInMutation.isPending || hasCheckedInToday() || isAttendanceSummaryFetching}
                onClick={handleCheckIn}
                className="flex-1 max-w-64 text-nowrap"
              >
                {checkInMutation.isPending ? 'Checking In...' :
                  hasCheckedInToday() ? 'Already Checked In' :
                    'Check In Now'}
              </Button>
            </Tooltip>
            {hasCheckedInToday() && (
              <Text as='div' color='green' className='flex gap-1 items-center'>
                <Award size={16} />
                <Text as='span' size="2" weight="medium">Points earned today!</Text>
              </Text>
            )}
          </Flex>
        </Flex>
      </Card>

      {/* Stats Grid */}
      <Grid columns={{ initial: '2', lg: '4' }} gap="4">
        <Card size="2" className='shadow-md'>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <TrendingUp size={20} className="text-[--indigo-11] flex-shrink-0" />
              <Text as='p' size="2" color="gray" weight="medium">Current Streak</Text>
            </Flex>
            <Text size="6" weight="bold" color="indigo">
              {streakData?.currentStreak || 0}
            </Text>
            <Text as='p' size="1" color="gray">days in a row</Text>
          </Flex>
        </Card>

        <Card size="2" className='shadow-md'>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Award size={20} className="text-[--green-11] flex-shrink-0" />
              <Text as='p' size="2" color="gray" weight="medium">Longest Streak</Text>
            </Flex>
            <Text size="6" weight="bold" color="green">
              {streakData?.longestStreak || 0}
            </Text>
            <Text as='p' size="1" color="gray">personal best</Text>
          </Flex>
        </Card>

        <Card size="2" className='shadow-md'>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <CheckCircle size={20} className="text-[--blue-11] flex-shrink-0" />
              <Text as='p' size="2" color="gray" weight="medium">Attendance Rate</Text>
            </Flex>
            <Text as='p' size="6" weight="bold" color="blue">
              {summary?.attendanceRate || 0}%
            </Text>
            <Progress value={summary?.attendanceRate || 0} color="blue" size="1" />
          </Flex>
        </Card>

        <Card size="2" className='shadow-md'>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Zap size={20} className="text-[--purple-11] flex-shrink-0" />
              <Text as='p' size="2" color="gray" weight="medium">Points This Month</Text>
            </Flex>
            <Text as='p' size="6" weight="bold" color="purple">
              {summary?.pointsEarned || 0}
            </Text>
            <Text as='p' size="1" color="gray">scholarship points</Text>
          </Flex>
        </Card>
      </Grid>

      {/* Recent Attendance */}
      <Flex direction="column" gap="4" pt='2'>
        <Flex align="center" justify="between" gap='1' wrap='wrap'>
          <Text as='p' size="5" weight="bold">Recent Attendance</Text>
          <Button variant="ghost" asChild >
            <Link to='/student/attendance/history'>
              View All History
            </Link>
          </Button>
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
function AttendancePageHeader() {
  return (
    <PageHeader
      title={'Daily Attendance'}
      description={'Track your daily attendance and build your streak'}
    />
  )
}