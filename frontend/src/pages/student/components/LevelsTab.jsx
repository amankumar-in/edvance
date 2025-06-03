import { Badge, Card, Flex, Text } from '@radix-ui/themes';
import { Trophy } from 'lucide-react';
import React from 'react';

const LevelsTab = ({ levelProgression, pointAccount }) => {
  return (
    <Card className="p-6">
      <Text size="5" weight="bold" className="mb-6" style={{ color: 'var(--gray-12)' }}>
        Level Progression
      </Text>
      <div className="space-y-4">
        {levelProgression.map(level => {
          const isCurrentLevel = level.level === pointAccount.level;
          const isAchieved = level.level <= pointAccount.level;
          const isNext = level.level === pointAccount.level + 1;

          return (
            <Card 
              key={level.level} 
              className={`p-4 transition-all ${isCurrentLevel ? 'ring-2 shadow-lg' : ''}`}
              style={{ 
                backgroundColor: isCurrentLevel ? 'var(--blue-a3)' : 'var(--gray-a1)',
                ringColor: isCurrentLevel ? 'var(--blue-7)' : 'transparent'
              }}
            >
              <Flex align="center" gap="4">
                <div 
                  className="flex items-center justify-center w-12 h-12 rounded-full"
                  style={{ 
                    backgroundColor: isAchieved ? 'var(--green-9)' : 'var(--gray-6)',
                    color: isAchieved ? 'white' : 'var(--gray-11)'
                  }}
                >
                  {isAchieved ? <Trophy className="w-6 h-6" /> : <Text size="3" weight="bold">{level.level}</Text>}
                </div>
                <div className="flex-1">
                  <Flex align="center" gap="2" className="mb-1">
                    <Text size="4" weight="bold">Level {level.level}</Text>
                    {isCurrentLevel && <Badge color="blue" variant="solid">Current</Badge>}
                    {isNext && <Badge color="orange" variant="soft">Next</Badge>}
                    {isAchieved && !isCurrentLevel && <Badge color="green" variant="soft">Achieved</Badge>}
                  </Flex>
                  <Text size="3" color="gray">{level.name}</Text>
                  <Text size="2" color="gray">{level.threshold.toLocaleString()} points required</Text>
                </div>
              </Flex>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};

export default LevelsTab; 