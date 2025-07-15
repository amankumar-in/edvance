import { Callout, Card, Flex, Progress, Skeleton, Tabs, Text } from '@radix-ui/themes';
import { AlertCircleIcon, ArrowDownRight, ArrowUpRight, Award, Calendar, Coins, Minus, Star, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { useGetStudentTransaction, usePointsDetailsById } from '../../api/points/points.queries';
import { useAuth } from '../../Context/AuthContext';
import ActivityTab from './components/ActivityTab';
import LevelsTab from './components/LevelsTab';
import OverviewTab from './components/OverviewTab';

const StudentPoints = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { profiles } = useAuth();
  const studentId = profiles?.student?._id;

  const { data, isLoading, isError, error } = usePointsDetailsById(studentId);
  const pointAccount = data?.data ?? {};

  const { data: transactionData,
    isLoading: isLoadingTransactionData,
    isError: isErrorTransactions,
    error: errorTransactions,
  } = useGetStudentTransaction(studentId, {
    limit: 5
  });

  // Transactions for the activity tab
  const transactions = transactionData?.pages?.flatMap(page => page?.data?.transactions || []);

  // Statistics for the overview tab 
  const statistics = pointAccount?.statistics;

  // Utility functions
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned': return <ArrowUpRight className="size-5" style={{ color: 'var(--green-9)' }} />;
      case 'spent': return <ArrowDownRight className="size-5" style={{ color: 'var(--red-9)' }} />;
      case 'adjusted': return <Minus className="size-5" style={{ color: 'var(--orange-9)' }} />;
      default: return <Minus className="size-5" style={{ color: 'var(--gray-9)' }} />;
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'task': return <Star className="w-5 h-5" style={{ color: 'var(--blue-9)' }} />;
      case 'attendance': return <Calendar className="w-5 h-5" style={{ color: 'var(--green-9)' }} />;
      case 'badge': return <Award className="w-5 h-5" style={{ color: 'var(--amber-9)' }} />;
      case 'behavior': return <Trophy className="w-5 h-5" style={{ color: 'var(--purple-9)' }} />;
      case 'redemption': return <Coins className="w-5 h-5" style={{ color: 'var(--red-9)' }} />;
      case 'manual_adjustment': return <Target className="w-5 h-5" style={{ color: 'var(--orange-9)' }} />;
      default: return <Zap className="w-5 h-5" style={{ color: 'var(--gray-9)' }} />;
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'earned': return 'green';
      case 'spent': return 'red';
      case 'adjusted': return 'orange';
      default: return 'gray';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffInHours = Math.floor((now - then) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const formatSource = (source) => {
    return source?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="mx-auto space-y-6 max-w-5xl">
      {/* Header */}
      <div className="text-center sm:text-left">
        <Text size="7" weight="bold">
          Scholarship Points
        </Text>
        <Text size="3" color="gray" className="block mt-2">
          Track your academic achievements and rewards
        </Text>
      </div>

      {isError && (
        <Callout.Root color='red'>
          <Callout.Icon>
            <AlertCircleIcon size={16} />
          </Callout.Icon>
          <Callout.Text>
            {error?.response?.data?.message || error?.message || 'Something went wrong while fetching user details'}
          </Callout.Text>
        </Callout.Root>
      )}

      {/* Main Balance Card */}
      <Card className="overflow-hidden relative text-center" size='2'>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
        <div className="relative">
          <Text size="2" color="gray" className="font-medium tracking-wide uppercase">
            Current Balance
          </Text>
          <Skeleton loading={isLoading} className='mx-auto w-40'>
            <Flex align="center" justify="center" gap="3" className="mt-2 mb-4">
              <Text as='p' size="9" weight="bold" className='text-[var(--accent-10)]'>
                {pointAccount?.currentBalance?.toLocaleString()}
              </Text>
              <Coins className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: 'var(--accent-10)' }} />
            </Flex>
          </Skeleton>

          {/* Level Badge */}
          <Skeleton loading={isLoading}>
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-[--gray-a6] rounded-full backdrop-blur-sm bg-[--color-background] ">
              <Trophy className="size-6" style={{ color: 'var(--amber-9)' }} />
              <div className="flex flex-col items-start">
                <Text as='p' size="2" weight="medium">Level {pointAccount.level}</Text>
                {pointAccount.levelName && (
                  <Text as='p' size="1" color="gray">
                    {pointAccount.levelName}
                  </Text>
                )}
              </div>
            </div>
          </Skeleton>

          {/* Progress */}
          {pointAccount.level !== 10 && (
            <div className="mx-auto mt-4 max-w-md">
              <Flex justify="between" className="mb-2">
                <Text size="1" color="gray">Level {pointAccount.level}</Text>
                <Text size="1" color="gray">{pointAccount.pointsToNextLevel ?? 0} to Level {(pointAccount.level ?? 0) + 1}</Text>
              </Flex>
              <Progress value={pointAccount?.progressPercentage ?? 0} className="w-full" />
              <Text size="1" color="gray" className="mt-1">
                {pointAccount?.progressPercentage?.toFixed(2)}% progress to next level
              </Text>
            </div>
          )}
        </div>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size='2' className='shadow-md'>
          <Flex align="center" gap="3" className="mb-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--green-a3)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--green-9)' }} />
            </div>
            <div>
              <Text as='p' size="1" color="gray" className="tracking-wide uppercase">Total Earned</Text>
              <Skeleton loading={isLoading}>
                <Text as='p' size="4" weight="bold" style={{ color: 'var(--green-11)' }}>
                  +{pointAccount?.totalEarned?.toLocaleString()}
                </Text>
              </Skeleton>
            </div>
          </Flex>
        </Card>

        <Card size='2' className='shadow-md'>
          <Flex align="center" gap="3" className="mb-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--red-a3)' }}>
              <ArrowDownRight className="w-5 h-5" style={{ color: 'var(--red-9)' }} />
            </div>
            <div>
              <Text as='p' size="1" color="gray" className="tracking-wide uppercase">Total Spent</Text>
              <Skeleton loading={isLoading}>
                <Text as='p' size="4" weight="bold" style={{ color: 'var(--red-11)' }}>
                  -{pointAccount?.totalSpent?.toLocaleString()}
                </Text>
              </Skeleton>
            </div>
          </Flex>
        </Card>

        <Card size='2' className='shadow-md'>
          <Flex align="center" gap="3" className="mb-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--blue-a3)' }}>
              <Calendar className="w-5 h-5" style={{ color: 'var(--blue-9)' }} />
            </div>
            <div>
              <Text as='p' size="1" color="gray" className="tracking-wide uppercase">This Week</Text>
              <Skeleton loading={isLoading}>
                <Text as='p' size="4" weight="bold" style={{ color: 'var(--blue-11)' }}>
                  +{statistics?.weekly?.earned || 0}
                </Text>
              </Skeleton>
            </div>
          </Flex>
        </Card>

        <Card size='2' className='shadow-md'>
          <Flex align="center" gap="3" className="mb-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--purple-a3)' }}>
              <Target className="w-5 h-5" style={{ color: 'var(--purple-9)' }} />
            </div>
            <div>
              <Text as='p' size="1" color="gray" className="tracking-wide uppercase">This Month</Text>
              <Skeleton loading={isLoading}>
                <Text as='p' size="4" weight="bold" style={{ color: 'var(--purple-11)' }}>
                  +{statistics?.monthly?.earned || 0}
                </Text>
              </Skeleton>
            </div>
          </Flex>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs.Root value={selectedTab} onValueChange={setSelectedTab}>
        <Tabs.List>
          <Tabs.Trigger value="overview">Dashboard</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          <Tabs.Trigger value="levels">Levels</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="mt-6">
          <OverviewTab
            pointAccount={pointAccount}
            statistics={statistics}
            transactions={transactions}
            getTransactionIcon={getTransactionIcon}
            getSourceIcon={getSourceIcon}
            getStatusColor={getStatusColor}
            formatTimeAgo={formatTimeAgo}
            formatSource={formatSource}
            setSelectedTab={setSelectedTab}
            errorTransactions={errorTransactions}
            isErrorTransactions={isErrorTransactions}
            isLoadingTransactions={isLoadingTransactionData}
            studentId={studentId}
            isLoadingPointsDetails={isLoading}
          />
        </Tabs.Content>

        <Tabs.Content value="activity" className="mt-6">
          <ActivityTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            transactionFilter={transactionFilter}
            setTransactionFilter={setTransactionFilter}
            sourceFilter={sourceFilter}
            setSourceFilter={setSourceFilter}
            getTransactionIcon={getTransactionIcon}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            formatSource={formatSource}
            studentId={studentId}
          />
        </Tabs.Content>

        <Tabs.Content value="levels" className="mt-6">
          <LevelsTab
            pointAccount={pointAccount}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default StudentPoints;