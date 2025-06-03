import { Badge, Button, Card, Flex, Progress, Text } from '@radix-ui/themes';
import { ArrowDownRight, ArrowUpRight, Award, Calendar, Star, Target, TrendingUp, Trophy } from 'lucide-react';
import React from 'react';

const OverviewTab = ({
  pointAccount,
  statistics,
  transactions,
  getTransactionIcon,
  getSourceIcon,
  getStatusColor,
  formatTimeAgo,
  formatSource,
  setSelectedTab
}) => {
  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Progress Card */}
        <Card className="relative p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br from-green-500/10 to-blue-500/10 blur-sm"></div>
          <div className="relative">
            <Flex align="center" gap="3" className="mb-4">
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

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 text-center rounded-lg" style={{ backgroundColor: 'var(--green-a2)' }}>
                <Text size="5" weight="bold" style={{ color: 'var(--green-11)' }} className="block">
                  +{statistics.weekly.earned}
                </Text>
                <Text size="1" color="gray" className="tracking-wide uppercase">Points Earned</Text>
              </div>
              <div className="p-4 text-center rounded-lg" style={{ backgroundColor: 'var(--blue-a2)' }}>
                <Text size="5" weight="bold" style={{ color: 'var(--blue-11)' }} className="block">
                  {statistics.weekly.transactions}
                </Text>
                <Text size="1" color="gray" className="tracking-wide uppercase">Activities</Text>
              </div>
            </div>

            <div className="p-4 border-2 rounded-lg" style={{ borderColor: 'var(--green-6)', backgroundColor: 'var(--green-a1)' }}>
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">Net This Week</Text>
                <Text size="4" weight="bold" style={{ color: 'var(--green-11)' }}>
                  {statistics.weekly.net >= 0 ? '+' : ''}{statistics.weekly.net}
                </Text>
              </Flex>
            </div>
          </div>
        </Card>

        {/* Level Progress Card */}
        <Card className="relative p-6 overflow-hidden">
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

            <div className="mb-4">
              <Flex justify="between" className="mb-2">
                <Text size="2" color="gray">Level {pointAccount.level}</Text>
                <Text size="2" color="gray">Level {pointAccount.level + 1}</Text>
              </Flex>
              <Progress value={pointAccount.progressPercentage} className="h-3 mb-2" />
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
                  {pointAccount.progressPercentage}%
                </Text>
                <Text size="1" color="gray" className="tracking-wide uppercase">Progress</Text>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <Text size="4" weight="bold" className="mb-4" style={{ color: 'var(--gray-12)' }}>
          Quick Actions
        </Text>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Button variant="soft" size="3" className="flex-col h-20 gap-2">
            <Star className="w-6 h-6" />
            <Text size="2">View Tasks</Text>
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
          <Card className="p-6">
            <Flex justify="between" align="center" className="mb-6">
              <div>
                <Text size="5" weight="bold" style={{ color: 'var(--gray-12)' }}>
                  Recent Activity
                </Text>
                <Text size="2" color="gray">Your latest achievements and activities</Text>
              </div>
              <Button variant="soft" size="2" onClick={() => setSelectedTab('activity')}>
                View All
              </Button>
            </Flex>

            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction, index) => (
                <Card key={transaction._id} className="p-4 transition-all duration-200 border-l-4 hover:shadow-md"
                  style={{
                    borderLeftColor: transaction.type === 'earned' ? 'var(--green-9)' :
                      transaction.type === 'spent' ? 'var(--red-9)' : 'var(--orange-9)',
                    backgroundColor: index === 0 ? 'var(--blue-a1)' : 'transparent'
                  }}>
                  <Flex justify="between" align="center">
                    <Flex align="center" gap="4">
                      <div className="relative">
                        <div className="p-3 rounded-full" style={{
                          backgroundColor: transaction.type === 'earned' ? 'var(--green-a3)' :
                            transaction.type === 'spent' ? 'var(--red-a3)' : 'var(--orange-a3)'
                        }}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        {index === 0 && (
                          <div className="absolute flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full -top-1 -right-1">
                            <Star className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Text size="3" weight="medium" className="block mb-1">
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
                    <div className="text-right">
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
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Monthly Overview */}
          <Card className="p-6">
            <Text size="4" weight="bold" className="mb-4" style={{ color: 'var(--gray-12)' }}>
              Monthly Overview
            </Text>
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--green-a2)' }}>
                <Flex align="center" gap="3">
                  <ArrowUpRight className="w-5 h-5" style={{ color: 'var(--green-9)' }} />
                  <div className="flex-1">
                    <Text size="1" color="gray" className="tracking-wide uppercase">Earned</Text>
                    <Text size="4" weight="bold" style={{ color: 'var(--green-11)' }}>
                      +{statistics.monthly.earned}
                    </Text>
                  </div>
                </Flex>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--red-a2)' }}>
                <Flex align="center" gap="3">
                  <ArrowDownRight className="w-5 h-5" style={{ color: 'var(--red-9)' }} />
                  <div className="flex-1">
                    <Text size="1" color="gray" className="tracking-wide uppercase">Spent</Text>
                    <Text size="4" weight="bold" style={{ color: 'var(--red-11)' }}>
                      -{statistics.monthly.spent}
                    </Text>
                  </div>
                </Flex>
              </div>

              <div className="p-4 border-2 rounded-lg" style={{
                borderColor: statistics.monthly.net >= 0 ? 'var(--green-6)' : 'var(--red-6)',
                backgroundColor: statistics.monthly.net >= 0 ? 'var(--green-a1)' : 'var(--red-a1)'
              }}>
                <Flex align="center" gap="3">
                  <Target className="w-5 h-5" style={{
                    color: statistics.monthly.net >= 0 ? 'var(--green-9)' : 'var(--red-9)'
                  }} />
                  <div className="flex-1">
                    <Text size="1" color="gray" className="tracking-wide uppercase">Net Change</Text>
                    <Text size="4" weight="bold" style={{
                      color: statistics.monthly.net >= 0 ? 'var(--green-11)' : 'var(--red-11)'
                    }}>
                      {statistics.monthly.net >= 0 ? '+' : ''}{statistics.monthly.net}
                    </Text>
                  </div>
                </Flex>
              </div>
            </div>
          </Card>

          {/* Top Sources */}
          <Card className="p-6">
            <Text size="4" weight="bold" className="mb-4" style={{ color: 'var(--gray-12)' }}>
              Top Point Sources
            </Text>
            <div className="space-y-4">
              {statistics.bySource.slice(0, 4).map((source, index) => (
                <div key={source.source}>
                  <Flex align="center" gap="3" className="mb-2">
                    <div className="relative">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--gray-a3)' }}>
                        {getSourceIcon(source.source)}
                      </div>
                      {index === 0 && (
                        <div className="absolute flex items-center justify-center w-4 h-4 rounded-full -top-1 -right-1 bg-amber-500">
                          <Text size="1" weight="bold" className="text-white">1</Text>
                        </div>
                      )}
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
              ))}
            </div>
          </Card>

          {/* Achievement Highlight */}
          <Card className="relative p-6 overflow-hidden" style={{ backgroundColor: 'var(--amber-a2)' }}>
            <div className="absolute right-0 -translate-y-1/2 top-1/2 opacity-10">
              <Trophy className="w-24 h-24" />
            </div>
            <div className="relative space-y-2">
              <Text as='p' size="4" weight="bold" style={{ color: 'var(--amber-11)' }}>
                🎉 Great Job!
              </Text>
              <Text as='p' size="2" color="gray">
                You're {pointAccount.progressPercentage}% of the way to Level {pointAccount.level + 1}!
              </Text>
              <Button size="2" variant="solid" color="amber" onClick={() => setSelectedTab('levels')}>
                View All Levels
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab; 