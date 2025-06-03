import { Badge, Card, Flex, Select, Text, TextField } from '@radix-ui/themes';
import { Search } from 'lucide-react';
import React from 'react';

const ActivityTab = ({ 
  filteredTransactions, 
  searchQuery, 
  setSearchQuery, 
  transactionFilter, 
  setTransactionFilter, 
  sourceFilter, 
  setSourceFilter, 
  getTransactionIcon, 
  getStatusColor, 
  formatDate, 
  formatSource 
}) => {
  return (
    <Card className="p-6">
      {/* Filters */}
      <div className="mb-6">
        <Flex justify="between" align="center" className="mb-4">
          <Text size="5" weight="bold" style={{ color: 'var(--gray-12)' }}>
            All Activity
          </Text>
          <Text size="2" color="gray">
            {filteredTransactions.length} activities
          </Text>
        </Flex>
        <div className="flex flex-col gap-3 sm:flex-row">
          <TextField.Root
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          >
            <TextField.Slot>
              <Search className="w-4 h-4" />
            </TextField.Slot>
          </TextField.Root>
          <Select.Root value={transactionFilter} onValueChange={setTransactionFilter}>
            <Select.Trigger placeholder="Type" className="w-full sm:w-32" />
            <Select.Content>
              <Select.Item value="all">All Types</Select.Item>
              <Select.Item value="earned">Earned</Select.Item>
              <Select.Item value="spent">Spent</Select.Item>
              <Select.Item value="adjusted">Adjusted</Select.Item>
            </Select.Content>
          </Select.Root>
          <Select.Root value={sourceFilter} onValueChange={setSourceFilter}>
            <Select.Trigger placeholder="Source" className="w-full sm:w-40" />
            <Select.Content>
              <Select.Item value="all">All Sources</Select.Item>
              <Select.Item value="task">Task</Select.Item>
              <Select.Item value="attendance">Attendance</Select.Item>
              <Select.Item value="badge">Badge</Select.Item>
              <Select.Item value="behavior">Behavior</Select.Item>
              <Select.Item value="redemption">Redemption</Select.Item>
              <Select.Item value="manual_adjustment">Manual Adjustment</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="space-y-3">
        {filteredTransactions.map(transaction => (
          <Card key={transaction._id} className="p-4 transition-shadow hover:shadow-md">
            <Flex justify="between" align="start">
              <Flex align="start" gap="3">
                <div className="p-2 rounded-full" style={{ 
                  backgroundColor: transaction.type === 'earned' ? 'var(--green-a3)' : 
                                  transaction.type === 'spent' ? 'var(--red-a3)' : 'var(--orange-a3)'
                }}>
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <Text size="3" weight="medium" className="block">
                    {transaction.description}
                  </Text>
                  <Flex align="center" gap="2" className="flex-wrap mt-1">
                    <Badge color={getStatusColor(transaction.type)} variant="soft" size="1">
                      {transaction.type}
                    </Badge>
                    <Badge color="gray" variant="outline" size="1">
                      {formatSource(transaction.source)}
                    </Badge>
                    <Text size="1" color="gray">{transaction.awardedByRole}</Text>
                    <Text size="1" color="gray">•</Text>
                    <Text size="1" color="gray">{formatDate(transaction.createdAt)}</Text>
                  </Flex>
                  {transaction.sourceId && (
                    <Text size="1" color="gray" className="mt-1">
                      ID: {transaction.sourceId}
                    </Text>
                  )}
                </div>
              </Flex>
              <div className="flex-shrink-0 ml-4 text-right">
                <Text 
                  size="4" 
                  weight="bold"
                  style={{ color: transaction.type === 'spent' ? 'var(--red-11)' : 'var(--green-11)' }}
                >
                  {transaction.type === 'spent' ? '' : '+'}{transaction.amount}
                </Text>
                <Text size="1" color="gray" display="block">
                  Balance: {transaction.balanceAfter}
                </Text>
              </div>
            </Flex>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default ActivityTab; 