import { Card, Flex, Progress, Text } from '@radix-ui/themes';
import React from 'react';

const SourcesTab = ({ statistics, getSourceIcon, formatSource }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Monthly Overview */}
      <Card className="p-6">
        <Text size="5" weight="bold" className="mb-4" style={{ color: 'var(--gray-12)' }}>
          Monthly Summary
        </Text>
        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--green-a2)' }}>
            <Flex justify="between" align="center">
              <Text size="2" color="gray">Points Earned</Text>
              <Text size="4" weight="bold" style={{ color: 'var(--green-11)' }}>
                +{statistics.monthly.earned}
              </Text>
            </Flex>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--red-a2)' }}>
            <Flex justify="between" align="center">
              <Text size="2" color="gray">Points Spent</Text>
              <Text size="4" weight="bold" style={{ color: 'var(--red-11)' }}>
                -{statistics.monthly.spent}
              </Text>
            </Flex>
          </div>
          <div className="p-4 border-2 rounded-lg" style={{ borderColor: 'var(--blue-6)' }}>
            <Flex justify="between" align="center">
              <Text size="2" weight="medium">Net Change</Text>
              <Text size="4" weight="bold" style={{ color: statistics.monthly.net >= 0 ? 'var(--green-11)' : 'var(--red-11)' }}>
                {statistics.monthly.net >= 0 ? '+' : ''}{statistics.monthly.net}
              </Text>
            </Flex>
          </div>
        </div>
      </Card>

      {/* Source Breakdown */}
      <Card className="p-6">
        <Text size="5" weight="bold" className="mb-4" style={{ color: 'var(--gray-12)' }}>
          Points by Source
        </Text>
        <div className="space-y-4">
          {statistics.bySource.map(source => (
            <Card key={source.source} className="p-4" style={{ backgroundColor: 'var(--gray-a2)' }}>
              <Flex align="center" gap="3" className="mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--white)' }}>
                  {getSourceIcon(source.source)}
                </div>
                <div className="flex-1">
                  <Flex justify="between" align="center">
                    <Text size="3" weight="medium">{formatSource(source.source)}</Text>
                    <Text size="3" weight="bold">{source.amount} pts</Text>
                  </Flex>
                </div>
              </Flex>
              <Progress value={source.percentage} className="mb-2" />
              <Flex justify="between">
                <Text size="1" color="gray">{source.percentage}% of total</Text>
                <Text size="1" color="gray">{source.transactions} activities</Text>
              </Flex>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SourcesTab; 