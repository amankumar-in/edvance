import { Badge, Button, Callout, Card, Flex, Progress, Text } from '@radix-ui/themes';
import { Activity, AlertCircleIcon, ArrowDownRight, ArrowUpRight, Award, Calendar, Coins, Star, Target, TrendingUp, Trophy } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router';
import { EmptyStateCard, Loader } from '../../../components';
const OverviewTab = ({
  pointAccount,
  statistics,
  transactions,
  getTransactionIcon,
  getSourceIcon,
  getStatusColor,
  formatTimeAgo,
  formatSource,
  setSelectedTab,
  isLoadingTransactions,
  isErrorTransactions,
  errorTransactions,
  studentId,
  isLoadingPointsDetails
}) => {

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Progress Card */}
        <Card className="relative overflow-hidden" size='2'>
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br from-green-500/10 to-blue-500/10 blur-sm"></div>
          <div className="relative">
            <Flex align="center" gap="3" className="mb-4" >
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--green-a3)' }}>
                <TrendingUp className="w-6 h-6" style={{ color: 'var(--green-9)' }} />
              </div>
              <div>
                <Text as='p' size="4" weight="bold" style={{ color: 'var(--gray-12)' }}>
                  This Week's Progress
                </Text>
                <Text as='p' size="2" color="gray">Keep up the great work!</Text>
              </div>
            </Flex>

            {isLoadingPointsDetails ? (
              <Flex justify='center' align='center'>
                <Loader />
              </Flex>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 text-center rounded-lg" style={{ backgroundColor: 'var(--green-a2)' }}>
                    <Text size="5" weight="bold" style={{ color: 'var(--green-11)' }} className="block">
                      +{statistics?.weekly?.earned || 0}
                    </Text>
                    <Text size="1" color="gray" className="tracking-wide uppercase">Points Earned</Text>
                  </div>
                  <div className="p-4 text-center rounded-lg" style={{ backgroundColor: 'var(--blue-a2)' }}>
                    <Text size="5" weight="bold" style={{ color: 'var(--blue-11)' }} className="block">
                      {statistics?.weekly?.transactions || 0}
                    </Text>
                    <Text size="1" color="gray" className="tracking-wide uppercase">Activities</Text>
                  </div>
                </div>

                <div className="p-4 border-2 rounded-lg" style={{ borderColor: 'var(--green-6)', backgroundColor: 'var(--green-a1)' }}>
                  <Flex justify="between" align="center">
                    <Text size="2" weight="medium">Net This Week</Text>
                    <Text size="4" weight="bold" style={{ color: 'var(--green-11)' }}>
                      {(statistics?.weekly?.net || 0) >= 0 ? '+' : ''}{statistics?.weekly?.net || 0}
                    </Text>
                  </Flex>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Level Progress Card */}
        <Card className="relative overflow-hidden" size='2'>
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-sm"></div>
          <div className="relative">
            <Flex align="center" gap="3" className="mb-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--amber-a3)' }}>
                <Trophy className="w-6 h-6" style={{ color: 'var(--amber-9)' }} />
              </div>
              <div>
                <Text as='p' size="4" weight="bold" style={{ color: 'var(--gray-12)' }}>
                  Level Progress
                </Text>
                <Text as='p' size="2" color="gray">{pointAccount.levelName}</Text>
              </div>
            </Flex>

            {isLoadingPointsDetails ? (
              <Flex justify='center' align='center'>
                <Loader />
              </Flex>
            ) : (
              <div>
                <div className="mb-4">
                  <Flex justify="between" className="mb-2">
                    <Text size="2" color="gray">Level {pointAccount.level}</Text>
                    <Text size="2" color="gray">Level {pointAccount.level + 1}</Text>
                  </Flex>
                  <Progress value={pointAccount?.progressPercentage ?? 0} className="mb-2" />
                  <Text size="1" color="gray" className="text-center">
                    {pointAccount.pointsToNextLevel} points until next level
                  </Text>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 text-center rounded-lg" style={{ backgroundColor: 'var(--amber-a2)' }}>
                    <Text size="4" weight="bold" style={{ color: 'var(--amber-11)' }} className="block">
                      {pointAccount.level}
                    </Text>
                    <Text size="1" color="gray" className="tracking-wide uppercase">Current Level</Text>
                  </div>
                  <div className="p-3 text-center rounded-lg" style={{ backgroundColor: 'var(--purple-a2)' }}>
                    <Text size="4" weight="bold" style={{ color: 'var(--purple-11)' }} className="block">
                      {pointAccount?.progressPercentage?.toFixed(2)}%
                    </Text>
                    <Text size="1" color="gray" className="tracking-wide uppercase">Progress</Text>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card size='2'>
        <Text as='p' size="4" weight="bold" className="mb-4" style={{ color: 'var(--gray-12)' }}>
          Quick Actions
        </Text>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Button asChild variant="soft" size="3" className="flex-col h-20 gap-2">
            <Link to={`/student/tasks`}>
              <Star className="w-6 h-6" />
              <Text size="2">View Tasks</Text>
            </Link>
          </Button>
          <Button variant="soft" size="3" className="flex-col h-20 gap-2">
            <Award className="w-6 h-6" />
            <Text size="2">My Badges</Text>
          </Button>
          <Button variant="soft" size="3" className="flex-col h-20 gap-2" onClick={() => setSelectedTab('activity')}>
            <Calendar className="w-6 h-6" />
            <Text size="2">All Activity</Text>
          </Button>
          <Button variant="soft" size="3" className="flex-col h-20 gap-2" onClick={() => setSelectedTab('levels')}>
            <Trophy className="w-6 h-6" />
            <Text size="2">View Levels</Text>
          </Button>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2">
          <Card size='2'>
            <Flex justify="between" align="center" className="mb-6">
              <div>
                <Text as='p' size="5" weight="bold" style={{ color: 'var(--gray-12)' }}>
                  Recent Activity
                </Text>
                <Text as='p' size="2" color="gray">Your latest achievements and activities</Text>
              </div>
              <Button variant="soft" size="2" onClick={() => setSelectedTab('activity')}>
                View All
              </Button>
            </Flex>

            <div className="space-y-4">
              {isLoadingTransactions ? (
                <Flex justify='center' align='center'>
                  <Loader />
                </Flex>
              ) : isErrorTransactions ? (
                <Callout.Root color='red'>
                  <Callout.Icon>
                    <AlertCircleIcon size={16} />
                  </Callout.Icon>
                  <Callout.Text>
                    {errorTransactions?.response?.data?.message || errorTransactions?.message || 'Something went wrong while fetching user details'}
                  </Callout.Text>
                </Callout.Root>
              ) : transactions?.length > 0 ? (
                transactions?.map((transaction, index) => (
                  <Card key={transaction._id} size='2' className="transition-all duration-200 hover:shadow-md"
                  >
                    <Flex justify="between" align="center" wrap="wrap" gap="3">
                      <Flex align="center" gap="4">
                        <div className="relative">
                          <div className="p-3 rounded-full" style={{
                            backgroundColor: transaction.type === 'earned' ? 'var(--green-a3)' :
                              transaction.type === 'spent' ? 'var(--red-a3)' : 'var(--orange-a3)'
                          }}>
                            {getTransactionIcon(transaction.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <Text as='p' size="3" weight="medium" className="block mb-1">
                            {transaction.description}
                          </Text>
                          <Flex align="center" gap="2" className="flex-wrap">
                            <Badge color={getStatusColor(transaction.type)} variant="soft" size="1">
                              {transaction.type}
                            </Badge>
                            <Badge color="gray" variant="outline" size="1">
                              {formatSource(transaction.source)}
                            </Badge>
                            <Text size="1" color="gray">{formatTimeAgo(transaction.createdAt)}</Text>
                          </Flex>
                        </div>
                      </Flex>
                      <div className="flex-1 text-right text-nowrap">
                        <Text
                          size="4"
                          weight="bold"
                          style={{ color: transaction.type === 'spent' ? 'var(--red-11)' : 'var(--green-11)' }}
                          className="block"
                        >
                          {transaction.type === 'spent' ? '' : '+'}{transaction.amount}
                        </Text>
                        <Text size="1" color="gray">Balance: {transaction.balanceAfter}</Text>
                      </div>
                    </Flex>
                  </Card>
                ))
              ) : (
                <EmptyStateCard
                  title="No Activity Found"
                  description="There's nothing to show here right now."
                  icon={<Activity size={32} className="text-[--accent-9]" />}
                />
              )}


            </div>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Monthly Overview */}
          <Card size='2'>
            <Text as='p' size="4" weight="bold" className="mb-4" style={{ color: 'var(--gray-12)' }}>
              Monthly Overview
            </Text>
            {isLoadingPointsDetails ? (
              <Flex justify='center' align='center'>
                <Loader />
              </Flex>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--green-a2)' }}>
                  <Flex align="center" gap="3">
                    <ArrowUpRight className="w-5 h-5" style={{ color: 'var(--green-9)' }} />
                    <div className="flex items-center justify-between flex-1">
                      <Text as='p' size="1" color="gray" className="tracking-wide uppercase">Earned</Text>
                      <Text as='p' size="4" weight="bold" style={{ color: 'var(--green-11)' }}>
                        +{statistics?.monthly?.earned || 0}
                      </Text>
                    </div>
                  </Flex>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--red-a2)' }}>
                  <Flex align="center" gap="3">
                    <ArrowDownRight className="w-5 h-5" style={{ color: 'var(--red-9)' }} />
                    <div className="flex items-center justify-between flex-1">
                      <Text as='p' size="1" color="gray" className="tracking-wide uppercase">Spent</Text>
                      <Text as='p' size="4" weight="bold" style={{ color: 'var(--red-11)' }}>
                        -{statistics?.monthly?.spent || 0}
                      </Text>
                    </div>
                  </Flex>
                </div>

                <div className="p-4 border-2 rounded-lg" style={{
                  borderColor: (statistics?.monthly?.net || 0) >= 0 ? 'var(--green-6)' : 'var(--red-6)',
                  backgroundColor: (statistics?.monthly?.net || 0) >= 0 ? 'var(--green-a1)' : 'var(--red-a1)'
                }}>
                  <Flex align="center" gap="3">
                    <Target className="w-5 h-5" style={{
                      color: (statistics?.monthly?.net || 0) >= 0 ? 'var(--green-9)' : 'var(--red-9)'
                    }} />
                    <div className="flex items-center justify-between flex-1">
                      <Text as='p' size="1" color="gray" className="tracking-wide uppercase">Net Change</Text>
                      <Text as='p' size="4" weight="bold" style={{
                        color: (statistics?.monthly?.net || 0) >= 0 ? 'var(--green-11)' : 'var(--red-11)'
                      }}>
                        {(statistics?.monthly?.net || 0) >= 0 ? '+' : ''}{statistics?.monthly?.net || 0}
                      </Text>
                    </div>
                  </Flex>
                </div>
              </div>
            )}
          </Card>

          {/* Top Sources */}
          <Card size='2'>
            <Text as='p' size="4" weight="bold" className="mb-4" style={{ color: 'var(--gray-12)' }}>
              Points by Source
            </Text>
            <div className="space-y-4">
              {isLoadingPointsDetails ? (
                <Flex justify='center' align='center'>
                  <Loader />
                </Flex>
              ) : statistics?.bySource?.length > 0 ? (
                statistics.bySource.map((source) => {
                  return (
                    <div key={source.source}>
                      <Flex align="center" gap="3" className="mb-2">
                        <div className="relative">
                          <div className="p-2 rounded-lg bg-[--gray-a3]">
                            {getSourceIcon(source.source)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <Flex justify="between" align="center" className="mb-1">
                            <Text size="2" weight="medium">{formatSource(source.source)}</Text>
                            <Text size="2" weight="bold">{source.amount}</Text>
                          </Flex>
                          <Progress value={source.percentage} className="mb-1" />
                          <Text size="1" color="gray">{source.percentage}% of total points</Text>
                        </div>
                      </Flex>
                    </div>
                  );
                })
              ) : (
                <EmptyStateCard
                  title="No Sources Available "
                  description="You haven't earned any points yet."
                  icon={<Coins size={32} className="text-[--accent-9]" />}
                />
              )}
            </div>
          </Card>

          {/* Achievement Highlight */}
          {pointAccount?.progressPercentage > 0 && <Card className="relative overflow-hidden" style={{ backgroundColor: 'var(--amber-a2)' }} size='2'>
            <div className="absolute right-0 -translate-y-1/2 top-1/2 opacity-10">
              <Trophy className="w-24 h-24" />
            </div>
            <div className="relative space-y-2">
              <Text as='p' size="4" weight="bold" style={{ color: 'var(--amber-11)' }}>
                🎉 Great Job!
              </Text>
              <Text as='p' size="2" color="gray">
                You're {pointAccount?.progressPercentage?.toFixed(2)}% of the way to Level {pointAccount?.level + 1}!
              </Text>
              <Button size="2" variant="solid" color="amber" onClick={() => setSelectedTab('levels')}>
                View All Levels
              </Button>
            </div>
          </Card>}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab; 