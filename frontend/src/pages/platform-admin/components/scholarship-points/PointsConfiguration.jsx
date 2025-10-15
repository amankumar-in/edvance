import { Badge, Box, Button, Card, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { BarLoader } from "react-spinners";
import { useGetActiveConfiguration } from "../../../../api/points/points.queries";
import EmptyStateCard from "../../../../components/EmptyStateCard";
import ErrorCallout from "../../../../components/ErrorCallout";
import Loader from '../../../../components/Loader';
import ConfigurationHistory from "./ConfigurationHistory";

// Point Configuration Component
const PointConfiguration = () => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // API hooks
  const { data: configData, isLoading, isError, error, isFetching, refetch, isRefetching } = useGetActiveConfiguration();

  // Extract configuration data
  const activeConfig = configData?.data;

  // Loading state
  if (isLoading) {
    return (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  }

  // Error state
  if (isError) {
    return (
      <ErrorCallout
        errorMessage={error?.response?.data?.message || error?.message || 'Failed to load point configuration'}
        onRetry={refetch}
        isRetrying={isRefetching}
      />
    );
  }

  // No data state
  if (!activeConfig) {
    return (
      <EmptyStateCard
        title={'No active point configuration found'}
        description={'Please create a new configuration to get started.'}
        action={
          <Button onClick={() => setConfigDialogOpen(true)}>
            <Plus size={16} />
            Create Configuration
          </Button>
        }
      />
    );
  }

  const ConfigSection = ({ title, children }) => (
    <Card size="2" className="shadow [--card-border-width:0px]">
      <Flex justify="between" align="center">
        <Heading size="3">{title}</Heading>
      </Flex>
      <Separator size={'4'} my={'3'} />
      {children}
    </Card>
  );

  return (
    <Box className="space-y-6">
      {isFetching && (
        <div className='fixed right-0 left-0 top-16 z-50'>
          <BarLoader
            color='#0090ff'
            width={'100%'}
            height={'4px'}
          />
        </div>
      )}
      <Flex justify="between" align="center" wrap='wrap' gap='2'>
        <Flex align="center" gap="2" wrap='wrap'>
          <Badge color="green" variant="soft">Version {activeConfig.version}</Badge>
          <Badge color="blue" variant="outline">Active</Badge>
        </Flex>
        <Button asChild>
          <Link to='/platform-admin/dashboard/configuration/edit'>
            <Edit size={16} />
            Update Configuration
          </Link>
        </Button>
      </Flex>

      {/* Configuration Sections */}
      <div className="space-y-4">
        <Text as='p' weight={'bold'} size={'4'}>
          Current Configuration:
        </Text>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ConfigSection
            title="Attendance Points"
          >
            <div className="space-y-2">
              <Flex justify="between">
                <Text as="p" size={'2'}>Daily Check-in</Text>
                <Text as="p" size={'2'}>{activeConfig.activityPoints.attendance.dailyCheckIn} pts</Text>
              </Flex>
              <Flex justify="between">
                <Text as="p" size={'2'}>Streak Bonus</Text>
                <Text as="p" size={'2'} color={activeConfig.activityPoints.attendance.streak.enabled ? "green" : "gray"}>
                  {activeConfig.activityPoints.attendance.streak.enabled ?
                    `${activeConfig.activityPoints.attendance.streak.bonus} pts every ${activeConfig.activityPoints.attendance.streak.interval} days` :
                    'Disabled'
                  }
                </Text>
              </Flex>
              <Flex justify="between">
                <Text as="p" size={'2'}>Perfect Week</Text>
                <Text as="p" size={'2'} color={activeConfig.activityPoints.attendance.perfectWeek.enabled ? "green" : "gray"}>
                  {activeConfig.activityPoints.attendance.perfectWeek.enabled ?
                    `${activeConfig.activityPoints.attendance.perfectWeek.bonus} pts` :
                    'Disabled'
                  }
                </Text>
              </Flex>
            </div>
          </ConfigSection>

          <ConfigSection
            title="Task Categories"
          >
            <div className="space-y-2">
              {/* Handle both Map and Object structures from backend */}
              {activeConfig.activityPoints.tasks.categories && typeof activeConfig.activityPoints.tasks.categories === 'object' ?
                (activeConfig.activityPoints.tasks.categories.entries ?
                  Array.from(activeConfig.activityPoints.tasks.categories.entries()).map(([category, points]) => (
                    <Flex key={category} justify="between">
                      <Text as="p" size={'2'} className="capitalize">{category}</Text>
                      <Text as="p" size={'2'}>{points} pts</Text>
                    </Flex>
                  )) :
                  Object.entries(activeConfig.activityPoints.tasks.categories).map(([category, points]) => (
                    <Flex key={category} justify="between">
                      <Text as="p" size={'2'} className="capitalize">{category}</Text>
                      <Text as="p" size={'2'}>{points} pts</Text>
                    </Flex>
                  ))
                ) : null
              }
            </div>
          </ConfigSection>

          <ConfigSection
            title="Badge Points"
          >
            <div className="space-y-2">
              <Flex justify="between">
                <Text as="p" size={'2'}>Default Badge</Text>
                <Text as="p" size={'2'}>{activeConfig.activityPoints.badges.default} pts</Text>
              </Flex>
              {/* Handle both Map and Object structures for special badges */}
              {activeConfig.activityPoints.badges.special && typeof activeConfig.activityPoints.badges.special === 'object' ?
                (activeConfig.activityPoints.badges.special.entries ?
                  Array.from(activeConfig.activityPoints.badges.special.entries()).map(([badge, points]) => (
                    <Flex key={badge} justify="between">
                      <Text as="p" size={'2'} className="capitalize">{badge.replace('_', ' ')}</Text>
                      <Text as="p" size={'2'}>{points} pts</Text>
                    </Flex>
                  )) :
                  Object.entries(activeConfig.activityPoints.badges.special).map(([badge, points]) => (
                    <Flex key={badge} justify="between">
                      <Text as="p" size={'2'} className="capitalize">{badge.replace('_', ' ')}</Text>
                      <Text as="p" size={'2'}>{points} pts</Text>
                    </Flex>
                  ))
                ) : null
              }
            </div>
          </ConfigSection>

          <ConfigSection
            title="Behavior Points"
          >
            <div className="space-y-2">
              <Flex justify="between">
                <Text as="p" size={'2'}>Positive Behavior</Text>
                <Text as="p" size={'2'}>+{activeConfig.activityPoints.behavior.positive} pts</Text>
              </Flex>
              <Flex justify="between">
                <Text as="p" size={'2'}>Negative Behavior</Text>
                <Text as="p" size={'2'}>{activeConfig.activityPoints.behavior.negative} pts</Text>
              </Flex>
            </div>
          </ConfigSection>

          <ConfigSection
            title="Daily Limits"
          >
            <div className="space-y-2">
              <Flex justify="between">
                <Text as="p" size={'2'}>Overall Daily Limit</Text>
                <Text as="p" size={'2'} color={activeConfig.limits.daily.enabled ? "green" : "gray"}>
                  {activeConfig.limits.daily.enabled ? `${activeConfig.limits.daily.maxPoints} pts` : 'Disabled'}
                </Text>
              </Flex>
              <Flex justify="between">
                <Text as="p" size={'2'}>Attendance Daily Limit</Text>
                <Text as="p" size={'2'} color={activeConfig.limits.sources.attendance.daily.enabled ? "green" : "gray"}>
                  {activeConfig.limits.sources.attendance.daily.enabled ? `${activeConfig.limits.sources.attendance.daily.maxPoints} pts` : 'Disabled'}
                </Text>
              </Flex>
              <Flex justify="between">
                <Text as="p" size={'2'}>Task Daily Limit</Text>
                <Text as="p" size={'2'} color={activeConfig.limits.sources.task.daily.enabled ? "green" : "gray"}>
                  {activeConfig.limits.sources.task.daily.enabled ? `${activeConfig.limits.sources.task.daily.maxPoints} pts` : 'Disabled'}
                </Text>
              </Flex>
            </div>
          </ConfigSection>

          <ConfigSection
            title="Weekly & Monthly Limits"
          >
            <div className="space-y-2">
              <Flex justify="between">
                <Text as="p" size={'2'}>Weekly Limit</Text>
                <Text as="p" size={'2'} color={activeConfig.limits.weekly.enabled ? "green" : "gray"}>
                  {activeConfig.limits.weekly.enabled ? `${activeConfig.limits.weekly.maxPoints} pts` : 'Disabled'}
                </Text>
              </Flex>
              <Flex justify="between">
                <Text as="p" size={'2'}>Monthly Limit</Text>
                <Text as="p" size={'2'} color={activeConfig.limits.monthly.enabled ? "green" : "gray"}>
                  {activeConfig.limits.monthly.enabled ? `${activeConfig.limits.monthly.maxPoints} pts` : 'Disabled'}
                </Text>
              </Flex>
            </div>
          </ConfigSection>

          {/* Task Difficulty Multipliers */}
          <ConfigSection
            title="Difficulty Multipliers"
          >
            <div className="space-y-2">
              {/* Handle both Map and Object structures for difficulty multipliers */}
              {activeConfig.activityPoints.tasks.difficultyMultipliers && typeof activeConfig.activityPoints.tasks.difficultyMultipliers === 'object' ?
                (activeConfig.activityPoints.tasks.difficultyMultipliers.entries ?
                  Array.from(activeConfig.activityPoints.tasks.difficultyMultipliers.entries()).map(([difficulty, multiplier]) => (
                    <Flex key={difficulty} justify="between">
                      <Text as="p" size={'2'} className="capitalize">{difficulty}</Text>
                      <Text as="p" size={'2'}>{multiplier}x</Text>
                    </Flex>
                  )) :
                  Object.entries(activeConfig.activityPoints.tasks.difficultyMultipliers).map(([difficulty, multiplier]) => (
                    <Flex key={difficulty} justify="between">
                      <Text as="p" size={'2'} className="capitalize">{difficulty}</Text>
                      <Text as="p" size={'2'}>{multiplier}x</Text>
                    </Flex>
                  ))
                ) : null
              }
            </div>
          </ConfigSection>
        </div>
      </div>

      {/* Version History */}
      <div className="space-y-4">
        <Text as='p' weight={'bold'} size={'4'}>
          Version History:
        </Text>
        <ConfigurationHistory
          setConfigDialogOpen={setConfigDialogOpen}
          configDialogOpen={configDialogOpen}
        />
      </div>
    </Box>
  );
};

export default PointConfiguration;