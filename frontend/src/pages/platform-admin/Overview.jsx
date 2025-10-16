import { Badge, Box, Card, Flex, Grid, Separator, Skeleton, Table, Text } from '@radix-ui/themes';
import { Activity, CheckCircle2, CheckSquare, Clock, Database, Gift, TrendingDown, TrendingUp, UserPlus, Users, XCircle } from 'lucide-react';
import React from 'react';
import { useGetDashboardOverview, useGetSystemHealth } from '../../api/analytics/analytics.queries';
import { EmptyStateCard, ErrorCallout, PageHeader } from '../../components';

function Overview() {
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useGetDashboardOverview();
  const { data: healthData, isLoading: isHealthLoading, error: healthError } = useGetSystemHealth();

  const dashboard = dashboardData?.data;
  const health = healthData?.data;

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (typeof num === 'string') return num;
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Helper function to format percentage
  const formatPercentage = (num) => {
    if (num === undefined || num === null) return '0.0';
    return Math.abs(num).toFixed(1);
  };

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper component for change indicator
  const ChangeIndicator = ({ value }) => {
    if (value === 0) return null;

    const isPositive = value > 0;
    return (
      <Flex align="center" gap="1">
        {isPositive ? (
          <TrendingUp size={14} className="text-[--green-9]" />
        ) : (
          <TrendingDown size={14} className="text-[--red-9]" />
        )}
        <Text size="1" weight="medium" className={isPositive ? 'text-[--green-9]' : 'text-[--red-9]'}>
          {isPositive ? '+' : '-'}{formatPercentage(value)}%
        </Text>
      </Flex>
    );
  };

  // Helper component for metric card
  const MetricCard = ({ title, value, subtitle, icon: Icon, color, change, isLoading }) => (
    <Card size='3' className="flex-1 min-w-[220px] card_no_border">
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Box className={`p-2 rounded-full`}
            style={{ backgroundColor: `var(--${color}-3)` }}
            >
              <Icon className={`text-[--${color}-9]`} size={20} />
            </Box>
            <Text as='p' weight="medium" size="2" color='gray'>
              {title}
            </Text>
          </Flex>
          {change !== undefined && <ChangeIndicator value={change} />}
        </Flex>
        {isLoading ? (
          <Skeleton className='w-max'>
            <Text as='p' size="8" weight="bold">00000</Text>
          </Skeleton>
        ) : (
          <Text as='p' size="8" weight="bold">
            {formatNumber(value)}
          </Text>
        )}
        {subtitle && (
          <Text as='p' size="1" color='gray'>
            {subtitle}
          </Text>
        )}
      </Flex>
    </Card>
  );

  // Status badge helper
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: { color: 'green', icon: CheckCircle2 },
      running: { color: 'blue', icon: Activity },
      failed: { color: 'red', icon: XCircle },
      pending: { color: 'amber', icon: Clock },
      healthy: { color: 'green', icon: CheckCircle2 },
      connected: { color: 'green', icon: CheckCircle2 },
      disconnected: { color: 'red', icon: XCircle }
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge color={config.color} variant="soft">
        <Flex align="center" gap="1">
          <Icon size={12} />
          {status}
        </Flex>
      </Badge>
    );
  };

  // Show error state
  if (dashboardError || healthError) {
    return (
      <ErrorCallout
        errorMessage={dashboardError?.response?.data?.message || dashboardError?.message || healthError?.response?.data?.message || healthError?.message || 'Failed to load dashboard data'}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={'Dashboard Overview'}
        description={'Real-time analytics and system health monitoring'}
      >
        <Flex align="center" gap="2">
          <Clock size={14} className="text-[--gray-9]" />
          <Text size="1" className="text-[--gray-10]">
            Last updated: {formatDate(dashboard?.lastUpdated)}
          </Text>
        </Flex>
      </PageHeader>
      <Separator size="4" />

      {/* User Metrics Section */}
      <section>
        <Text as='div' size="4" weight="bold" mb="3">
          User Metrics
        </Text>
        <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
          <MetricCard
            title="Total Users"
            value={dashboard?.userMetrics?.totalUsers}
            subtitle="All registered users"
            icon={Users}
            color="indigo"
            change={dashboard?.userMetrics?.change?.totalUsers}
            isLoading={isDashboardLoading}
          />
          <MetricCard
            title="Active Users"
            value={dashboard?.userMetrics?.activeUsers}
            subtitle="Users active in last 30 days"
            icon={Activity}
            color="green"
            change={dashboard?.userMetrics?.change?.activeUsers}
            isLoading={isDashboardLoading}
          />
          <MetricCard
            title="New Users"
            value={dashboard?.userMetrics?.newUsers}
            subtitle="Recently registered users"
            icon={UserPlus}
            color="blue"
            isLoading={isDashboardLoading}
          />
        </Grid>
      </section>

      {/* Task Metrics Section */}
      <section>
        <Text as="div" size="4" weight="bold" mb="3" className="text-[--gray-12]">
          Task Metrics
        </Text>
        <Grid columns={{ initial: '1', sm: '2', lg: '4' }} gap="4">
          <MetricCard
            title="Total Tasks"
            value={dashboard?.taskMetrics?.totalTasks}
            subtitle="All tasks in system"
            icon={CheckSquare}
            color="purple"
            isLoading={isDashboardLoading}
          />
          <MetricCard
            title="Completed Tasks"
            value={dashboard?.taskMetrics?.completedTasks}
            subtitle="Successfully completed"
            icon={CheckCircle2}
            color="green"
            isLoading={isDashboardLoading}
          />
          <MetricCard
            title="Pending Tasks"
            value={dashboard?.taskMetrics?.pendingTasks}
            subtitle="Awaiting completion"
            icon={Clock}
            color="amber"
            isLoading={isDashboardLoading}
          />
          <MetricCard
            title="Completion Rate"
            value={`${dashboard?.taskMetrics?.completionRate}%`}
            subtitle="Task completion rate"
            icon={TrendingUp}
            color="cyan"
            change={dashboard?.taskMetrics?.change?.completionRate}
            isLoading={isDashboardLoading}
          />
        </Grid>
      </section>

      {/* Point Metrics Section */}
      <section>
        <Text as="div" size="4" weight="bold" mb="3" className="text-[--gray-12]">
          Point Metrics
        </Text>
        <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
          <MetricCard
            title="Total Points Earned"
            value={dashboard?.pointMetrics?.totalPointsEarned}
            subtitle="All points earned by users"
            icon={TrendingUp}
            color="green"
            change={dashboard?.pointMetrics?.change?.pointsEarned}
            isLoading={isDashboardLoading}
          />
          <MetricCard
            title="Total Points Spent"
            value={dashboard?.pointMetrics?.totalPointsSpent}
            subtitle="Points redeemed for rewards"
            icon={Gift}
            color="orange"
            isLoading={isDashboardLoading}
          />
          <MetricCard
            title="Avg Points/Account"
            value={dashboard?.pointMetrics?.averagePointsPerAccount}
            subtitle="Average points per user"
            icon={Activity}
            color="blue"
            isLoading={isDashboardLoading}
          />
        </Grid>
      </section>

      {/* Badge Metrics Section */}
      <section>
        <Text as="div" size="4" weight="bold" mb="3" className="text-[--gray-12]">
          Badge Metrics
        </Text>
        <Grid columns={{ initial: '1', sm: '2' }} gap="4">
          <MetricCard
            title="Total Badges Awarded"
            value={dashboard?.badgeMetrics?.totalBadgesAwarded}
            subtitle="All badges earned"
            icon={Gift}
            color="amber"
            change={dashboard?.badgeMetrics?.change?.badgesAwarded}
            isLoading={isDashboardLoading}
          />
          <MetricCard
            title="Unique Students Awarded"
            value={dashboard?.badgeMetrics?.uniqueStudentsAwarded}
            subtitle="Students with at least one badge"
            icon={Users}
            color="purple"
            isLoading={isDashboardLoading}
          />
        </Grid>
      </section>

      <Separator size="4" />

      {/* System Health & Recent Jobs - Two Column Layout */}
      <Grid columns={{ initial: '1', lg: '2' }} gap="6">
        {/* System Health Section */}
        <section>
          <Text as="div" size="4" weight="bold" mb="3">
            System Health
          </Text>
          <Card className='card_no_border' size='3'>
            {isHealthLoading ? (
              <Skeleton>
                <Box style={{ height: '150px' }} />
              </Skeleton>
            ) : (
              <Flex direction="column" gap="4">
                {/* Overall Status */}
                <Flex align="center" justify="between">
                  <Text as='p' size="2" weight="medium">
                    Overall Status
                  </Text>
                  <StatusBadge status={health?.status} />
                </Flex>

                <Separator size="4" />

                {/* Database Status */}
                <Box>
                  <Flex align="center" justify="between" mb="2">
                    <Flex align="center" gap="2">
                      <Database size={16} className="text-[--blue-9]" />
                      <Text as='p' size="2" weight="medium">
                        Database
                      </Text>
                    </Flex>
                    <StatusBadge status={health?.database?.status} />
                  </Flex>
                  <Grid columns="2" gap="4" mt="3">
                    <Box>
                      <Text as='p' size="1" color='gray' mb='1'>User Metrics</Text>
                      <Text as='p' size="2" weight="bold">
                        {formatNumber(health?.database?.collections?.userMetrics)}
                      </Text>
                    </Box>
                    <Box>
                      <Text as='p' size="1" color='gray' mb='1'>Task Metrics</Text>
                      <Text as='p' size="2" weight="bold">
                        {formatNumber(health?.database?.collections?.taskMetrics)}
                      </Text>
                    </Box>
                    <Box>
                      <Text as='p' size="1" color='gray' mb='1'>Point Metrics</Text>
                      <Text as='p' size="2" weight="bold">
                        {formatNumber(health?.database?.collections?.pointMetrics)}
                      </Text>
                    </Box>
                    <Box>
                      <Text as='p' size="1" color='gray' mb='1'>Badge Metrics</Text>
                      <Text as='p' size="2" weight="bold">
                        {formatNumber(health?.database?.collections?.badgeMetrics)}
                      </Text>
                    </Box>
                  </Grid>
                </Box>

                <Separator size="4" />

                {/* Last Job Run */}
                <Flex align="center" justify="between">
                  <Flex align="center" gap="2">
                    <Clock size={12} className="text-[--gray-11]" />
                    <Text as='p' size="1" color='gray'>
                      Last Job Run
                    </Text>
                  </Flex>
                  <Text as='p' size="1" color='gray'>
                    {formatDate(health?.jobs?.lastRun)}
                  </Text>
                </Flex>
              </Flex>
            )}
          </Card>
        </section>

        {/* Recent Analytics Jobs Section */}
        <section>
          <Text as="div" size="4" weight="bold" mb="3">
            Recent Analytics Jobs
          </Text>
          <Box>
            {isDashboardLoading ? (
              <Skeleton>
                <Card style={{ height: '278px' }} />
              </Skeleton>
            ) : dashboard?.recentJobs?.length > 0 ? (
              <Table.Root variant="surface" className='overflow-y-auto h-[278px] scrollbar-thin'>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell className='text-nowrap'>Job Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className='text-nowrap'>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className='text-nowrap'>Records</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className='text-nowrap'>Created</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>

                  {dashboard.recentJobs.map((job, index) => (
                    <Table.Row key={index}>
                      <Table.Cell className='text-nowrap'>
                        <Badge color="gray" variant="soft" className="capitalize">
                          {job.jobType}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className='text-nowrap'>
                        <StatusBadge status={job.status} />
                      </Table.Cell>
                      <Table.Cell className='text-nowrap'>
                        <Text as='p' size="2">
                          {formatNumber(job.processedRecords || 0)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell className='text-nowrap'>
                        <Text as='p' size="1" color='gray'>
                          {formatDate(job.createdAt)}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            ) : (
              <EmptyStateCard
                title="No recent jobs"
                description="No recent jobs have been run"
                icon={<Clock size={48} />}
              />
            )}
          </Box>
        </section>
      </Grid>

      {/* System Health Jobs Detail */}
      {health?.jobs?.recent?.length > 0 && (
        <section>
          <Text as="div" size="4" weight="bold" mb="3" className="text-[--gray-12]">
            System Health Jobs
          </Text>
          <Box>
            {isHealthLoading ? (
              <Skeleton>
                <Box style={{ height: '100px' }} />
              </Skeleton>
            ) : (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell className='text-nowrap'>Job Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className='text-nowrap'>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className='text-nowrap'>Last Run</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {health.jobs.recent.map((job, index) => (
                    <Table.Row key={index}>
                      <Table.Cell className='text-nowrap'>
                        <Badge color="gray" variant="soft" className="capitalize">
                          {job.jobType}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className='text-nowrap'>
                        <StatusBadge status={job.status} />
                      </Table.Cell>
                      <Table.Cell className='text-nowrap'>
                        <Text as='p' size="1" color='gray'>
                          {formatDate(job.lastRun)}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Box>
        </section>
      )}

      {/* Footer Timestamp */}
      <Flex justify="center" pt="4">
        <Text as='p' size="1" color='gray'>
          Data refreshes automatically • System time: {formatDate(health?.timestamp)}
        </Text>
      </Flex>
    </div>
  );
}

export default Overview;
