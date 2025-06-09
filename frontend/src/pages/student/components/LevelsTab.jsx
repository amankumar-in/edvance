import { Badge, Callout, Card, Flex, Text } from '@radix-ui/themes';
import { AlertCircleIcon, Trophy } from 'lucide-react';
import React from 'react';
import { useGetAllLevels } from '../../../api/points/points.queries';
import { Loader } from '../../../components';

const LevelsTab = ({ pointAccount }) => {
  const { data: levelData, isLoading, isError, error } = useGetAllLevels()
  const levelProgression = levelData?.data?.levels

  if (isLoading) return (
    <Flex justify='center' align='center'>
      <Loader />
    </Flex>
  );

  if (isError) return (
    <Callout.Root color='red'>
      <Callout.Icon>
        <AlertCircleIcon size={16} />
      </Callout.Icon>
      <Callout.Text>
        {error?.response?.data?.message || error?.message || 'Something went wrong while fetching user details'}
      </Callout.Text>
    </Callout.Root>
  );

  return (
    <Card className="p-6">
      <Text as='p' size="5" weight="bold" className="mb-6" style={{ color: 'var(--gray-12)' }}>
        Level Progression
      </Text>
      <div className="space-y-4">
        {levelProgression?.map(level => {
          const isCurrentLevel = level?.level === pointAccount?.level;
          const isAchieved = level?.level <= pointAccount?.level;
          const isNext = level?.level === pointAccount?.level + 1;

          return (
            <Card
              key={level?.level}
              className={`p-4 transition-all ${isCurrentLevel ? 'shadow-md border bg-[--accent-a3] border-[--focus-8]' : 'border-transparent'}`}
            >
              <Flex align="start" gap="4">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${isAchieved ? "bg-[--green-9] text-[--gray-12]" : "bg-[--gray-6] text-[--gray-11]"}`}
                >
                  {isAchieved
                    ? <Trophy className="w-6 h-6" />
                    : <Text as='p' weight="bold">{level?.level}</Text>
                  }
                </div>
                <div className="flex-1">
                  <Flex align="center" gap="2" className="mb-1">
                    <Text as='p' weight="bold">
                      Level {level?.level}
                    </Text>
                    {isCurrentLevel && <Badge color="cyan" variant="solid">Current</Badge>}
                    {isNext && <Badge color="orange" variant="soft">Next</Badge>}
                    {isAchieved && !isCurrentLevel && <Badge color="green" variant="soft">Achieved</Badge>}
                  </Flex>
                  <Text as='p' size="2">{level?.name}</Text>
                  <Text as='p' size="1" color="gray">{level?.threshold?.toLocaleString()} points required</Text>
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