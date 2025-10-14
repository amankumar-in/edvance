import { Box, Button, Card, Dialog, Flex, Heading, Inset, ScrollArea, Separator, Text } from '@radix-ui/themes';
import React from 'react';
import { useGetConfigurationVersion } from '../../../../api/points/points.queries';
import ErrorCallout from '../../../../components/ErrorCallout';
import Loader from '../../../../components/Loader';

// Configuration Version Details Component
const ConfigurationVersionDetails = ({ version, open, onOpenChange, children = null }) => {
  const { data: versionData, isLoading, isError, error } = useGetConfigurationVersion(version);

  const config = versionData?.data;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '800px' }}>
        {children && (
          <Dialog.Trigger>{children}</Dialog.Trigger>
        )}
        <Dialog.Title>Configuration Version {version} Details</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          View detailed configuration settings for version {version}.
        </Dialog.Description>

        {isLoading ? (
          <Flex justify="center" py="6">
            <Loader />
          </Flex>
        ) : isError ? (
          <ErrorCallout errorMessage={error?.response?.data?.message || 'Failed to load version details'} />
        ) : config ? (
          <Inset py='current'>
            <div className='max-h-[60vh] overflow-y-auto scrollbar_thin_stable_both'>
              <Box px={'4'} pb={'4'} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Attendance Points */}
                <Card size="2" className="shadow-md">
                  <Flex justify="between" align="center">
                    <Heading size="3">Attendance Points</Heading>
                  </Flex>
                  <Separator size={'4'} my={'3'} />
                  <div className="space-y-2">
                    <Flex justify="between">
                      <Text as="p" size={'2'}>Daily Check-in</Text>
                      <Text as="p" size={'2'}>{config.activityPoints.attendance.dailyCheckIn} pts</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text as="p" size={'2'}>Streak Bonus</Text>
                      <Text as="p" size={'2'} color={config.activityPoints.attendance.streak.enabled ? "green" : "gray"}>
                        {config.activityPoints.attendance.streak.enabled ?
                          `${config.activityPoints.attendance.streak.bonus} pts every ${config.activityPoints.attendance.streak.interval} days` :
                          'Disabled'
                        }
                      </Text>
                    </Flex>
                    <Flex justify="between">
                      <Text as="p" size={'2'}>Perfect Week</Text>
                      <Text as="p" size={'2'} color={config.activityPoints.attendance.perfectWeek.enabled ? "green" : "gray"}>
                        {config.activityPoints.attendance.perfectWeek.enabled ?
                          `${config.activityPoints.attendance.perfectWeek.bonus} pts` :
                          'Disabled'
                        }
                      </Text>
                    </Flex>
                  </div>
                </Card>

                {/* Task Categories */}
                <Card size="2" className="shadow-md">
                  <Flex justify="between" align="center">
                    <Heading size="3">Task Categories</Heading>
                  </Flex>
                  <Separator size={'4'} my={'3'} />
                  <div className="space-y-2">
                    {/* Handle both Map and Object structures from backend */}
                    {config.activityPoints.tasks.categories && typeof config.activityPoints.tasks.categories === 'object' ?
                      (config.activityPoints.tasks.categories.entries ?
                        Array.from(config.activityPoints.tasks.categories.entries()).map(([category, points]) => (
                          <Flex key={category} justify="between">
                            <Text as="p" size={'2'} className="capitalize">{category}</Text>
                            <Text as="p" size={'2'}>{points} pts</Text>
                          </Flex>
                        )) :
                        Object.entries(config.activityPoints.tasks.categories).map(([category, points]) => (
                          <Flex key={category} justify="between">
                            <Text as="p" size={'2'} className="capitalize">{category}</Text>
                            <Text as="p" size={'2'}>{points} pts</Text>
                          </Flex>
                        ))
                      ) : null
                    }
                  </div>
                </Card>

                {/* Badge Points */}
                <Card size="2" className="shadow-md">
                  <Flex justify="between" align="center">
                    <Heading size="3">Badge Points</Heading>
                  </Flex>
                  <Separator size={'4'} my={'3'} />
                  <div className="space-y-2">
                    <Flex justify="between">
                      <Text as="p" size={'2'}>Default Badge</Text>
                      <Text as="p" size={'2'}>{config.activityPoints.badges.default} pts</Text>
                    </Flex>
                    {/* Handle both Map and Object structures for special badges */}
                    {config.activityPoints.badges.special && typeof config.activityPoints.badges.special === 'object' ?
                      (config.activityPoints.badges.special.entries ?
                        Array.from(config.activityPoints.badges.special.entries()).map(([badge, points]) => (
                          <Flex key={badge} justify="between">
                            <Text as="p" size={'2'} className="capitalize">{badge.replace('_', ' ')}</Text>
                            <Text as="p" size={'2'}>{points} pts</Text>
                          </Flex>
                        )) :
                        Object.entries(config.activityPoints.badges.special).map(([badge, points]) => (
                          <Flex key={badge} justify="between">
                            <Text as="p" size={'2'} className="capitalize">{badge.replace('_', ' ')}</Text>
                            <Text as="p" size={'2'}>{points} pts</Text>
                          </Flex>
                        ))
                      ) : null
                    }
                  </div>
                </Card>

                {/* Behavior Points */}
                <Card size="2" className="shadow-md">
                  <Flex justify="between" align="center">
                    <Heading size="3">Behavior Points</Heading>
                  </Flex>
                  <Separator size={'4'} my={'3'} />
                  <div className="space-y-2">
                    <Flex justify="between">
                      <Text as="p" size={'2'}>Positive Behavior</Text>
                      <Text as="p" size={'2'}>+{config.activityPoints.behavior.positive} pts</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text as="p" size={'2'}>Negative Behavior</Text>
                      <Text as="p" size={'2'}>{config.activityPoints.behavior.negative} pts</Text>
                    </Flex>
                  </div>
                </Card>

                {/* Daily Limits */}
                <Card size="2" className="shadow-md">
                  <Flex justify="between" align="center">
                    <Heading size="3">Daily Limits</Heading>
                  </Flex>
                  <Separator size={'4'} my={'3'} />
                  <div className="space-y-2">
                    <Flex justify="between">
                      <Text as="p" size={'2'}>Overall Daily Limit</Text>
                      <Text as="p" size={'2'} color={config.limits.daily.enabled ? "green" : "gray"}>
                        {config.limits.daily.enabled ? `${config.limits.daily.maxPoints} pts` : 'Disabled'}
                      </Text>
                    </Flex>
                    <Flex justify="between">
                      <Text as="p" size={'2'}>Attendance Daily Limit</Text>
                      <Text as="p" size={'2'} color={config.limits.sources.attendance.daily.enabled ? "green" : "gray"}>
                        {config.limits.sources.attendance.daily.enabled ? `${config.limits.sources.attendance.daily.maxPoints} pts` : 'Disabled'}
                      </Text>
                    </Flex>
                    <Flex justify="between">
                      <Text as="p" size={'2'}>Task Daily Limit</Text>
                      <Text as="p" size={'2'} color={config.limits.sources.task.daily.enabled ? "green" : "gray"}>
                        {config.limits.sources.task.daily.enabled ? `${config.limits.sources.task.daily.maxPoints} pts` : 'Disabled'}
                      </Text>
                    </Flex>
                  </div>
                </Card>

                {/* Weekly & Monthly Limits */}
                <Card size="2" className="shadow-md">
                  <Flex justify="between" align="center">
                    <Heading size="3">Weekly & Monthly Limits</Heading>
                  </Flex>
                  <Separator size={'4'} my={'3'} />
                  <div className="space-y-2">
                    <Flex justify="between">
                      <Text as="p" size={'2'}>Weekly Limit</Text>
                      <Text as="p" size={'2'} color={config.limits.weekly.enabled ? "green" : "gray"}>
                        {config.limits.weekly.enabled ? `${config.limits.weekly.maxPoints} pts` : 'Disabled'}
                      </Text>
                    </Flex>
                    <Flex justify="between">
                      <Text as="p" size={'2'}>Monthly Limit</Text>
                      <Text as="p" size={'2'} color={config.limits.monthly.enabled ? "green" : "gray"}>
                        {config.limits.monthly.enabled ? `${config.limits.monthly.maxPoints} pts` : 'Disabled'}
                      </Text>
                    </Flex>
                  </div>
                </Card>

                {/* Task Difficulty Multipliers */}
                <Card size="2" className="shadow-md">
                  <Flex justify="between" align="center">
                    <Heading size="3">Difficulty Multipliers</Heading>
                  </Flex>
                  <Separator size={'4'} my={'3'} />
                  <div className="space-y-2">
                    {/* Handle both Map and Object structures for difficulty multipliers */}
                    {config.activityPoints.tasks.difficultyMultipliers && typeof config.activityPoints.tasks.difficultyMultipliers === 'object' ?
                      (config.activityPoints.tasks.difficultyMultipliers.entries ?
                        Array.from(config.activityPoints.tasks.difficultyMultipliers.entries()).map(([difficulty, multiplier]) => (
                          <Flex key={difficulty} justify="between">
                            <Text as="p" size={'2'} className="capitalize">{difficulty}</Text>
                            <Text as="p" size={'2'}>{multiplier}x</Text>
                          </Flex>
                        )) :
                        Object.entries(config.activityPoints.tasks.difficultyMultipliers).map(([difficulty, multiplier]) => (
                          <Flex key={difficulty} justify="between">
                            <Text as="p" size={'2'} className="capitalize">{difficulty}</Text>
                            <Text as="p" size={'2'}>{multiplier}x</Text>
                          </Flex>
                        ))
                      ) : null
                    }
                  </div>
                </Card>
              </Box>
            </div>
          </Inset>
        ) : (
          <Text>No configuration data available</Text>
        )}

        <Flex justify="end" className='pt-4 border-t border-[--gray-6]'>
          <Dialog.Close>
            <Button variant="soft" color="gray">Close</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default ConfigurationVersionDetails
