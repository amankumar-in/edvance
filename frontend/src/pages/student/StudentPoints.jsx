import { Badge, Card, Flex, Progress, Tabs, Text } from '@radix-ui/themes';
import { ArrowDownRight, ArrowUpRight, Award, Calendar, Coins, Minus, Star, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
import React, { useState } from 'react';
import ActivityTab from './components/ActivityTab';
import LevelsTab from './components/LevelsTab';
import OverviewTab from './components/OverviewTab';
import SourcesTab from './components/SourcesTab';

const StudentPoints = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data matching exact backend PointAccount model
  const pointAccount = {
    studentId: "student123",
    currentBalance: 485,
    totalEarned: 1250,
    totalSpent: 765,
    level: 4,
    levelName: "Proficient Scholar",
    lastUpdated: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    pointsToNextLevel: 250,
    progressPercentage: 75,
    isMaxLevel: false
  };

  // Exact level progression from PointConfiguration model
  const levelProgression = [
    { level: 1, name: 'Novice Scholar', threshold: 0 },
    { level: 2, name: 'Apprentice Scholar', threshold: 100 },
    { level: 3, name: 'Developing Scholar', threshold: 250 },
    { level: 4, name: 'Proficient Scholar', threshold: 500 },
    { level: 5, name: 'Advanced Scholar', threshold: 1000 },
    { level: 6, name: 'Distinguished Scholar', threshold: 1750 },
    { level: 7, name: 'Expert Scholar', threshold: 2750 },
    { level: 8, name: 'Master Scholar', threshold: 4000 },
    { level: 9, name: 'Grand Scholar', threshold: 5500 },
    { level: 10, name: 'Premier Scholar', threshold: 7500 }
  ];

  // Mock data matching exact backend PointTransaction model
  const transactions = [
    {
      _id: "trans1",
      accountId: "acc123",
      studentId: "student123",
      amount: 25,
      type: "earned",
      source: "task",
      sourceId: "task123",
      description: "Completed Math Assignment Chapter 5",
      awardedBy: "teacher456",
      awardedByRole: "teacher",
      balanceAfter: 485,
      metadata: { 
        taskCategory: "homework", 
        difficulty: "medium",
        taskId: "task123"
      },
      createdAt: "2024-01-15T10:30:00Z",
      transactionDay: "2024-01-15T00:00:00Z",
      transactionWeek: "2024-01-14T00:00:00Z",
      transactionMonth: "2024-01-01T00:00:00Z"
    },
    {
      _id: "trans2",
      accountId: "acc123",
      studentId: "student123",
      amount: 15,
      type: "earned",
      source: "attendance",
      sourceId: "attendance_week_2",
      description: "Perfect week attendance bonus",
      awardedBy: "system",
      awardedByRole: "system",
      balanceAfter: 460,
      metadata: { 
        attendanceWeek: "2024-01-08",
        perfectDays: 5
      },
      createdAt: "2024-01-14T09:00:00Z",
      transactionDay: "2024-01-14T00:00:00Z",
      transactionWeek: "2024-01-14T00:00:00Z",
      transactionMonth: "2024-01-01T00:00:00Z"
    },
    {
      _id: "trans3",
      accountId: "acc123",
      studentId: "student123",
      amount: -50,
      type: "spent",
      source: "redemption",
      sourceId: "reward123",
      description: "Redeemed: Extra computer time",
      awardedBy: "system",
      awardedByRole: "system",
      balanceAfter: 445,
      metadata: { 
        rewardId: "computer_time_30min",
        rewardType: "privilege"
      },
      createdAt: "2024-01-13T14:20:00Z",
      transactionDay: "2024-01-13T00:00:00Z",
      transactionWeek: "2024-01-07T00:00:00Z",
      transactionMonth: "2024-01-01T00:00:00Z"
    },
    {
      _id: "trans4",
      accountId: "acc123",
      studentId: "student123",
      amount: 35,
      type: "earned",
      source: "task",
      sourceId: "task456",
      description: "Excellent work on Science Project",
      awardedBy: "teacher789",
      awardedByRole: "teacher",
      balanceAfter: 495,
      metadata: { 
        taskCategory: "project", 
        difficulty: "hard",
        taskId: "task456",
        grade: "A+"
      },
      createdAt: "2024-01-12T16:45:00Z",
      transactionDay: "2024-01-12T00:00:00Z",
      transactionWeek: "2024-01-07T00:00:00Z",
      transactionMonth: "2024-01-01T00:00:00Z"
    },
    {
      _id: "trans5",
      accountId: "acc123",
      studentId: "student123",
      amount: 20,
      type: "earned",
      source: "badge",
      sourceId: "badge_math_whiz",
      description: "Earned Math Whiz badge",
      awardedBy: "system",
      awardedByRole: "system",
      balanceAfter: 460,
      metadata: { 
        badgeId: "math_whiz",
        badgeCategory: "academic",
        requirements: "Complete 10 math tasks"
      },
      createdAt: "2024-01-11T11:15:00Z",
      transactionDay: "2024-01-11T00:00:00Z",
      transactionWeek: "2024-01-07T00:00:00Z",
      transactionMonth: "2024-01-01T00:00:00Z"
    },
    {
      _id: "trans6",
      accountId: "acc123",
      studentId: "student123",
      amount: 10,
      type: "adjusted",
      source: "manual_adjustment",
      sourceId: "adj123",
      description: "Manual adjustment for extra credit",
      awardedBy: "teacher456",
      awardedByRole: "teacher",
      balanceAfter: 440,
      metadata: { 
        reason: "extra_credit",
        approvedBy: "teacher456"
      },
      createdAt: "2024-01-10T13:20:00Z",
      transactionDay: "2024-01-10T00:00:00Z",
      transactionWeek: "2024-01-07T00:00:00Z",
      transactionMonth: "2024-01-01T00:00:00Z"
    }
  ];

  // Calculate statistics from transaction data
  const calculateStatistics = () => {
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
  };

  const statistics = calculateStatistics();

  // Utility functions
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned': return <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--green-9)' }} />;
      case 'spent': return <ArrowDownRight className="w-4 h-4" style={{ color: 'var(--red-9)' }} />;
      case 'adjusted': return <Minus className="w-4 h-4" style={{ color: 'var(--orange-9)' }} />;
      default: return <Minus className="w-4 h-4" style={{ color: 'var(--gray-9)' }} />;
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
    return source.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const filteredTransactions = transactions.filter(transaction => {
    const typeMatch = transactionFilter === 'all' || transaction.type === transactionFilter;
    const sourceMatch = sourceFilter === 'all' || transaction.source === sourceFilter;
    const searchMatch = searchQuery === '' || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.source.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && sourceMatch && searchMatch;
  });

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
            <Flex align="center" justify="center" gap="3" className="mt-2 mb-4">
              <Text size="9" weight="bold" className='text-[var(--accent-10)]'>
                {pointAccount.currentBalance.toLocaleString()}
              </Text>
              <Coins className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: 'var(--accent-10)' }} />
            </Flex>
            
            {/* Level Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-[--gray-a6] rounded-full backdrop-blur-sm bg-[--color-background]">
              <Trophy className="w-5 h-5" style={{ color: 'var(--amber-9)' }} />
              <Text size="2" weight="medium">Level {pointAccount.level}</Text>
              <Badge color="amber" variant="soft">{pointAccount.levelName}</Badge>
            </div>
            
            {/* Progress */}
            {!pointAccount.isMaxLevel && (
              <div className="max-w-md mx-auto mt-4">
                <Flex justify="between" className="mb-2">
                  <Text size="1" color="gray">Level {pointAccount.level}</Text>
                  <Text size="1" color="gray">{pointAccount.pointsToNextLevel} to Level {pointAccount.level + 1}</Text>
                </Flex>
                <Progress value={pointAccount.progressPercentage} className="w-full" />
                <Text size="1" color="gray" className="mt-1">
                  {pointAccount.progressPercentage}% progress to next level
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
                <Text as='p' size="4" weight="bold" style={{ color: 'var(--green-11)' }}>
                  +{pointAccount.totalEarned.toLocaleString()}
                </Text>
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
                <Text as='p' size="4" weight="bold" style={{ color: 'var(--red-11)' }}>
                  -{pointAccount.totalSpent.toLocaleString()}
                </Text>
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
                <Text as='p' size="4" weight="bold" style={{ color: 'var(--blue-11)' }}>
                  +{statistics.weekly.earned}
                </Text>
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
                <Text as='p' size="4" weight="bold" style={{ color: 'var(--purple-11)' }}>
                  +{statistics.monthly.earned}
                </Text>
              </div>
            </Flex>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs.Root value={selectedTab} onValueChange={setSelectedTab}>
          <Tabs.List className="w-full">
            <Tabs.Trigger value="overview" className="flex-1">Dashboard</Tabs.Trigger>
            <Tabs.Trigger value="activity" className="flex-1">Activity</Tabs.Trigger>
            <Tabs.Trigger value="sources" className="flex-1">Sources</Tabs.Trigger>
            <Tabs.Trigger value="levels" className="flex-1">Levels</Tabs.Trigger>
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
            />
          </Tabs.Content>

          <Tabs.Content value="activity" className="mt-6">
            <ActivityTab 
              filteredTransactions={filteredTransactions}
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
            />
          </Tabs.Content>

          <Tabs.Content value="sources" className="mt-6">
            <SourcesTab 
              statistics={statistics}
              getSourceIcon={getSourceIcon}
              formatSource={formatSource}
            />
          </Tabs.Content>

          <Tabs.Content value="levels" className="mt-6">
            <LevelsTab 
              levelProgression={levelProgression}
              pointAccount={pointAccount}
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default StudentPoints;