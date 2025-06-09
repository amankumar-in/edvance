import { Badge, Card, Flex, Progress, Skeleton, Tabs, Text } from '@radix-ui/themes';
import { ArrowDownRight, ArrowUpRight, Award, Calendar, Coins, Minus, Star, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
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

  const { data, isLoading } = usePointsDetailsById(studentId);
  const pointAccount = data?.data ?? {};

  const { data: transactionData,
    isLoading: isLoadingTransactionData,
    isError: isErrorTransactions,
    error: errorTransactions,
  } = useGetStudentTransaction(studentId, {
    limit: 5
  });

  const transactions = transactionData?.pages?.flatMap(page => page?.data?.transactions || []);


  // Calculate statistics from transaction data
  const calculateStatistics = () => {
    if (transactions?.length > 0) {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const weeklyTransactions = transactions.filter(t => new Date(t.createdAt) >= weekAgo);
      const monthlyTransactions = transactions.filter(t => new Date(t.createdAt) >= monthAgo);

      const weeklyEarned = weeklyTransactions.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.amount, 0);
      const weeklySpent = Math.abs(weeklyTransactions.filter(t => t.type === 'spent').reduce((sum, t) => sum + t.amount, 0));
      const monthlyEarned = monthlyTransactions.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.amount, 0);
      const monthlySpent = Math.abs(monthlyTransactions.filter(t => t.type === 'spent').reduce((sum, t) => sum + t.amount, 0));

      const sources = ['task', 'attendance', 'badge', 'behavior', 'redemption', 'manual_adjustment'];
      const bySource = sources.map(source => {
        const sourceTransactions = transactions.filter(t => t.source === source && t.type === 'earned');
        const amount = sourceTransactions.reduce((sum, t) => sum + t.amount, 0);
        const total = transactions.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.amount, 0);
        return {
          source,
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
          transactions: sourceTransactions.length
        };
      }).filter(s => s.amount > 0);

      return {
        weekly: { earned: weeklyEarned, spent: weeklySpent, net: weeklyEarned - weeklySpent, transactions: weeklyTransactions.length },
        monthly: { earned: monthlyEarned, spent: monthlySpent, net: monthlyEarned - monthlySpent, transactions: monthlyTransactions.length },
        bySource
      };
    }
  };

  const statistics = calculateStatistics();

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
    <div >
      <div className="mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="text-center sm:text-left">
          <Text size="7" weight="bold" style={{ color: 'var(--gray-12)' }} className="block">
            My Points
          </Text>
          <Text size="3" color="gray" className="block mt-2">
            Track your academic achievements and rewards
          </Text>
        </div>

        {/* Main Balance Card */}
        <Card className="relative p-6 overflow-hidden text-center sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
          <div className="relative">
            <Text size="2" color="gray" className="font-medium tracking-wide uppercase">
              Current Balance
            </Text>
            <Skeleton loading={isLoading} className='w-40 mx-auto'>
              <Flex align="center" justify="center" gap="3" className="mt-2 mb-4">
                <Text as='p' size="9" weight="bold" className='text-[var(--accent-10)]'>
                  {pointAccount?.currentBalance?.toLocaleString()}
                </Text>
                <Coins className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: 'var(--accent-10)' }} />
              </Flex>
            </Skeleton>

            {/* Level Badge */}
            <Skeleton loading={isLoading}>
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-[--gray-a6] rounded-full backdrop-blur-sm bg-[--color-background]">
                <Trophy className="w-5 h-5" style={{ color: 'var(--amber-9)' }} />
                <Text size="2" weight="medium">Level {pointAccount.level}</Text>
              </div>
            </Skeleton>

            {/* Progress */}
            {pointAccount.level !== 10 && (
              <div className="max-w-md mx-auto mt-4">
                <Flex justify="between" className="mb-2">
                  <Text size="1" color="gray">Level {pointAccount.level}</Text>
                  <Text size="1" color="gray">{pointAccount.pointsToNextLevel ?? 0} to Level {(pointAccount.level ?? 0) + 1}</Text>
                </Flex>
                <Progress value={pointAccount?.progressPercentage ?? 0} className="w-full" />
                <Text size="1" color="gray" className="mt-1">
                  {pointAccount?.progressPercentage}% progress to next level
                </Text>
              </div>
            )}
          </div>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4 sm:p-6">
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

          <Card className="p-4 sm:p-6">
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

          <Card className="p-4 sm:p-6">
            <Flex align="center" gap="3" className="mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--blue-a3)' }}>
                <Calendar className="w-5 h-5" style={{ color: 'var(--blue-9)' }} />
              </div>
              <div>
                <Text as='p' size="1" color="gray" className="tracking-wide uppercase">This Week</Text>
                <Skeleton loading={isLoading}>
                  <Text as='p' size="4" weight="bold" style={{ color: 'var(--blue-11)' }}>
                    +{statistics?.weekly.earned}
                  </Text>
                </Skeleton>
              </div>
            </Flex>
          </Card>

          <Card className="p-4 sm:p-6">
            <Flex align="center" gap="3" className="mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--purple-a3)' }}>
                <Target className="w-5 h-5" style={{ color: 'var(--purple-9)' }} />
              </div>
              <div>
                <Text as='p' size="1" color="gray" className="tracking-wide uppercase">This Month</Text>
                <Skeleton loading={isLoading}>
                  <Text as='p' size="4" weight="bold" style={{ color: 'var(--purple-11)' }}>
                    +{statistics?.monthly.earned}
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
    </div>
  );
};

export default StudentPoints;