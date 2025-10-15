import { Box, Button, Callout, Flex, Heading, Switch, Text, TextField } from '@radix-ui/themes';
import { InfoIcon, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useUpdateConfiguration } from '../../api/points/points.mutations';
import { useGetActiveConfiguration } from '../../api/points/points.queries';
import { ErrorCallout } from '../../components';
import { FormFieldErrorMessage } from '../../components/FormFieldErrorMessage';
import Loader from '../../components/Loader';
import PageHeader from '../../components/PageHeader';
import FormSection from './components/FormSection';

const getFormValues = (activeConfig) => ({
  // Attendance points - Aligned with backend model defaults
  'activityPoints.attendance.dailyCheckIn': activeConfig?.activityPoints?.attendance?.dailyCheckIn ?? 5,
  'activityPoints.attendance.streak.enabled': activeConfig?.activityPoints?.attendance?.streak?.enabled ?? false,
  'activityPoints.attendance.streak.interval': activeConfig?.activityPoints?.attendance?.streak?.interval ?? 5,
  'activityPoints.attendance.streak.bonus': activeConfig?.activityPoints?.attendance?.streak?.bonus ?? 5,
  'activityPoints.attendance.perfectWeek.enabled': activeConfig?.activityPoints?.attendance?.perfectWeek?.enabled ?? false,
  'activityPoints.attendance.perfectWeek.bonus': activeConfig?.activityPoints?.attendance?.perfectWeek?.bonus ?? 10,

  // Task categories - Aligned with backend Map defaults
  'activityPoints.tasks.categories.homework': activeConfig?.activityPoints?.tasks?.categories?.get ? activeConfig.activityPoints.tasks.categories.get('homework') ?? 10 : activeConfig?.activityPoints?.tasks?.categories?.homework ?? 10,
  'activityPoints.tasks.categories.quiz': activeConfig?.activityPoints?.tasks?.categories?.get ? activeConfig.activityPoints.tasks.categories.get('quiz') ?? 15 : activeConfig?.activityPoints?.tasks?.categories?.quiz ?? 15,
  'activityPoints.tasks.categories.exam': activeConfig?.activityPoints?.tasks?.categories?.get ? activeConfig.activityPoints.tasks.categories.get('exam') ?? 25 : activeConfig?.activityPoints?.tasks?.categories?.exam ?? 25,
  'activityPoints.tasks.categories.project': activeConfig?.activityPoints?.tasks?.categories?.get ? activeConfig.activityPoints.tasks.categories.get('project') ?? 20 : activeConfig?.activityPoints?.tasks?.categories?.project ?? 20,
  'activityPoints.tasks.categories.reading': activeConfig?.activityPoints?.tasks?.categories?.get ? activeConfig.activityPoints.tasks.categories.get('reading') ?? 5 : activeConfig?.activityPoints?.tasks?.categories?.reading ?? 5,
  'activityPoints.tasks.categories.practice': activeConfig?.activityPoints?.tasks?.categories?.get ? activeConfig.activityPoints.tasks.categories.get('practice') ?? 8 : activeConfig?.activityPoints?.tasks?.categories?.practice ?? 8,

  // Difficulty multipliers - Aligned with backend Map defaults
  'activityPoints.tasks.difficultyMultipliers.easy': activeConfig?.activityPoints?.tasks?.difficultyMultipliers?.get ? activeConfig.activityPoints.tasks.difficultyMultipliers.get('easy') ?? 0.75 : activeConfig?.activityPoints?.tasks?.difficultyMultipliers?.easy ?? 0.75,
  'activityPoints.tasks.difficultyMultipliers.medium': activeConfig?.activityPoints?.tasks?.difficultyMultipliers?.get ? activeConfig.activityPoints.tasks.difficultyMultipliers.get('medium') ?? 1.0 : activeConfig?.activityPoints?.tasks?.difficultyMultipliers?.medium ?? 1.0,
  'activityPoints.tasks.difficultyMultipliers.hard': activeConfig?.activityPoints?.tasks?.difficultyMultipliers?.get ? activeConfig.activityPoints.tasks.difficultyMultipliers.get('hard') ?? 1.5 : activeConfig?.activityPoints?.tasks?.difficultyMultipliers?.hard ?? 1.5,

  // Badge points - Aligned with backend defaults
  'activityPoints.badges.default': activeConfig?.activityPoints?.badges?.default ?? 10,
  'activityPoints.badges.special.perfect_month': activeConfig?.activityPoints?.badges?.special?.get ? activeConfig.activityPoints.badges.special.get('perfect_month') ?? 50 : activeConfig?.activityPoints?.badges?.special?.perfect_month ?? 50,
  'activityPoints.badges.special.top_performer': activeConfig?.activityPoints?.badges?.special?.get ? activeConfig.activityPoints.badges.special.get('top_performer') ?? 100 : activeConfig?.activityPoints?.badges?.special?.top_performer ?? 100,

  // Behavior points - Aligned with backend defaults
  'activityPoints.behavior.positive': activeConfig?.activityPoints?.behavior?.positive ?? 5,
  'activityPoints.behavior.negative': activeConfig?.activityPoints?.behavior?.negative ?? -5,

  // Limits - Aligned with backend defaults
  'limits.daily.enabled': activeConfig?.limits?.daily?.enabled ?? false,
  'limits.daily.maxPoints': activeConfig?.limits?.daily?.maxPoints ?? 100,
  'limits.weekly.enabled': activeConfig?.limits?.weekly?.enabled ?? false,
  'limits.weekly.maxPoints': activeConfig?.limits?.weekly?.maxPoints ?? 500,
  'limits.monthly.enabled': activeConfig?.limits?.monthly?.enabled ?? false,
  'limits.monthly.maxPoints': activeConfig?.limits?.monthly?.maxPoints ?? 2000,
  'limits.sources.attendance.daily.enabled': activeConfig?.limits?.sources?.attendance?.daily?.enabled ?? false,
  'limits.sources.attendance.daily.maxPoints': activeConfig?.limits?.sources?.attendance?.daily?.maxPoints ?? 10,
  'limits.sources.task.daily.enabled': activeConfig?.limits?.sources?.task?.daily?.enabled ?? false,
  'limits.sources.task.daily.maxPoints': activeConfig?.limits?.sources?.task?.daily?.maxPoints ?? 50,
})

function EditConfiguration() {
  const [isFormReady, setIsFormReady] = useState(false)
  const navigate = useNavigate();
  const updateConfigMutation = useUpdateConfiguration();

  // Fetch active configuration
  const { data: activeConfigData, isLoading: isLoadingConfig } = useGetActiveConfiguration();
  const activeConfig = activeConfigData?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues: getFormValues(activeConfig)
  });

  // Populate form when active config is loaded
  useEffect(() => {
    if (activeConfig && !isLoadingConfig) {
      reset(getFormValues(activeConfig));
      setIsFormReady(true);
    }
  }, [activeConfig, reset, isLoadingConfig]);

  const onSubmit = (data) => {
    console.log(data.activityPoints.attendance.dailyCheckIn)
    // Transform flat form data back to nested structure - Aligned with backend model schema
    const configData = {
      activityPoints: {
        attendance: {
          dailyCheckIn: Number(data.activityPoints.attendance.dailyCheckIn),
          streak: {
            enabled: Boolean(data.activityPoints.attendance.streak.enabled),
            interval: Number(data.activityPoints.attendance.streak.interval),
            bonus: Number(data.activityPoints.attendance.streak.bonus)
          },
          perfectWeek: {
            enabled: Boolean(data.activityPoints.attendance.perfectWeek.enabled),
            bonus: Number(data.activityPoints.attendance.perfectWeek.bonus)
          }
        },
        tasks: {
          // Backend expects Map structure, but we send as object (backend will convert)
          categories: {
            homework: Number(data.activityPoints.tasks.categories.homework),
            quiz: Number(data.activityPoints.tasks.categories.quiz),
            exam: Number(data.activityPoints.tasks.categories.exam),
            project: Number(data.activityPoints.tasks.categories.project),
            reading: Number(data.activityPoints.tasks.categories.reading),
            practice: Number(data.activityPoints.tasks.categories.practice)
          },
          difficultyMultipliers: {
            easy: Number(data.activityPoints.tasks.difficultyMultipliers.easy),
            medium: Number(data.activityPoints.tasks.difficultyMultipliers.medium),
            hard: Number(data.activityPoints.tasks.difficultyMultipliers.hard)
          }
        },
        badges: {
          default: Number(data.activityPoints.badges.default),
          special: {
            perfect_month: Number(data.activityPoints.badges.special.perfect_month),
            top_performer: Number(data.activityPoints.badges.special.top_performer)
          }
        },
        behavior: {
          positive: Number(data.activityPoints.behavior.positive),
          negative: Number(data.activityPoints.behavior.negative)
        }
      },
      limits: {
        daily: {
          enabled: Boolean(data.limits.daily.enabled),
          maxPoints: Number(data.limits.daily.maxPoints)
        },
        weekly: {
          enabled: Boolean(data.limits.weekly.enabled),
          maxPoints: Number(data.limits.weekly.maxPoints)
        },
        monthly: {
          enabled: Boolean(data.limits.monthly.enabled),
          maxPoints: Number(data.limits.monthly.maxPoints)
        },
        sources: {
          attendance: {
            daily: {
              enabled: Boolean(data.limits.sources.attendance.daily.enabled),
              maxPoints: Number(data.limits.sources.attendance.daily.maxPoints)
            }
          },
          task: {
            daily: {
              enabled: Boolean(data.limits.sources.task.daily.enabled),
              maxPoints: Number(data.limits.sources.task.daily.maxPoints)
            }
          }
        }
      }
    };

    console.log(configData);

    updateConfigMutation.mutate(configData, {
      onSuccess: () => {
        toast.success('Configuration updated successfully!');
        navigate('/platform-admin/dashboard/scholarship-points');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to update configuration');
      }
    });
  };

  // Show loading state when fetching configuration
  if (isLoadingConfig || !isFormReady) {
    return (
      <Flex justify="center" align="center">
        <Loader />
      </Flex>
    );
  }

  return (
    <div className="pb-8 mx-auto space-y-6 max-w-4xl">
      {/* Header */}
      <PageHeader
        title="Edit Point Configuration"
        description="Create a new version of the point configuration. Changes will be applied system-wide."
        backButton
      >
        <Button
          type="submit"
          color="grass"
          disabled={updateConfigMutation.isPending}
          onClick={handleSubmit(onSubmit)}
        >
          <Save size={16} />
          {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
        </Button>
      </PageHeader>

      <Callout.Root variant='surface' color='blue'>
        <Callout.Icon>
          <InfoIcon size={16} />
        </Callout.Icon>
        <Callout.Text>
          Updating configuration will create version {(activeConfig?.version || 0) + 1}. This affects all future point transactions.
        </Callout.Text>
      </Callout.Root>

      {updateConfigMutation.isError && (
        <ErrorCallout
          errorMessage={updateConfigMutation.error?.response?.data?.message || updateConfigMutation.error?.message || 'Failed to update configuration'}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Attendance Points Section */}
        <FormSection title="Attendance Points">
          <Box className="space-y-6">
            <label>
              <Text size="2" weight="medium" className="block mb-1">Daily Check-in Points</Text>
              <TextField.Root
                type="number"
                {...register('activityPoints.attendance.dailyCheckIn', {
                  required: 'Daily check-in points required',
                  min: { value: 0, message: 'Must be 0 or greater' }
                })}
              />
              <Text as="p" size="1" color="gray" mt="1">
                Points awarded for daily attendance check-in
              </Text>
              <FormFieldErrorMessage errors={errors} field="activityPoints.attendance.dailyCheckIn" />
            </label>

            <Box>
              <Text size="2" weight="medium" className="block mb-2">Streak Bonus</Text>
              <Text as="label" size="2">
                <Flex align="center" gap="2" mb="2">
                  <Controller
                    name='activityPoints.attendance.streak.enabled'
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Switch checked={value} onCheckedChange={onChange} />
                    )}
                  />
                  Enable streak bonus
                </Flex>
              </Text>

              <Flex gap="2" className="flex-col sm:flex-row">
                <Box className="flex-1">
                  <Text size="1" className="block mb-1">Interval (days)</Text>
                  <TextField.Root
                    type="number"
                    {...register('activityPoints.attendance.streak.interval', {
                      required: 'Interval required',
                      min: { value: 1, message: 'Must be at least 1' }
                    })}
                  />
                  <FormFieldErrorMessage errors={errors} field="activityPoints.attendance.streak.interval" />
                </Box>
                <Box className="flex-1">
                  <Text size="1" className="block mb-1">Bonus Points</Text>
                  <TextField.Root
                    type="number"
                    {...register('activityPoints.attendance.streak.bonus', {
                      required: 'Bonus points required',
                      min: { value: 0, message: 'Must be 0 or greater' }
                    })}
                  />
                  <FormFieldErrorMessage errors={errors} field="activityPoints.attendance.streak.bonus" />
                </Box>
              </Flex>
            </Box>

            <Box>
              <Text size="2" weight="medium" className="block mb-2">Perfect Week Bonus</Text>
              <Text as='label' size={'2'}>
                <Flex align="center" gap="2" mb="2">
                  <Controller
                    name='activityPoints.attendance.perfectWeek.enabled'
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Switch checked={value} onCheckedChange={onChange} />
                    )}
                  />
                  Enable perfect week bonus
                </Flex>
              </Text>

              <label>
                <Text size="1" className="block mb-1">Bonus Points</Text>
                <TextField.Root
                  type="number"
                  {...register('activityPoints.attendance.perfectWeek.bonus', {
                    required: 'Bonus points required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                />
                <FormFieldErrorMessage errors={errors} field="activityPoints.attendance.perfectWeek.bonus" />
              </label>
            </Box>
          </Box>
        </FormSection>

        {/* Task Points Section */}
        <FormSection title="Task Points">
          <Box>
            <Heading size="3" mb="3">Task Categories</Heading>
            <Text as="p" size="1" color="gray" mb="3">
              Set default point values for different task categories
            </Text>

            <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {['homework', 'quiz', 'exam', 'project', 'reading', 'practice'].map((category) => (
                <label key={category}>
                  <Text size="2" weight="medium" className="block mb-1 capitalize">{category}</Text>
                  <TextField.Root
                    type="number"
                    {...register(`activityPoints.tasks.categories.${category}`, {
                      required: `${category} points required`,
                      min: { value: 0, message: 'Must be 0 or greater' }
                    })}
                  />
                  <FormFieldErrorMessage errors={errors} field={`activityPoints.tasks.categories.${category}`} />
                </label>
              ))}
            </Box>
          </Box>

          <Box>
            <Heading size="3" mb="3">Difficulty Multipliers</Heading>
            <Text as="p" size="1" color="gray" mb="3">
              Multipliers applied to task points based on difficulty level
            </Text>

            <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['easy', 'medium', 'hard'].map((difficulty) => (
                <label key={difficulty}>
                  <Text size="2" weight="medium" className="block mb-1 capitalize">{difficulty}</Text>
                  <TextField.Root
                    type="number"
                    step="0.05"
                    {...register(`activityPoints.tasks.difficultyMultipliers.${difficulty}`, {
                      required: `${difficulty} multiplier required`,
                      min: { value: 0.1, message: 'Must be at least 0.1' }
                    })}
                  />
                  <FormFieldErrorMessage errors={errors} field={`activityPoints.tasks.difficultyMultipliers.${difficulty}`} />
                </label>
              ))}
            </Box>
          </Box>
        </FormSection>

        {/* Badge Points Section */}
        <FormSection title="Badge Points">
          <Box className="space-y-6">
            <label>
              <Text size="2" weight="medium" className="block mb-1">Default Badge Points</Text>
              <TextField.Root
                type="number"
                {...register('activityPoints.badges.default', {
                  required: 'Default badge points required',
                  min: { value: 0, message: 'Must be 0 or greater' }
                })}
              />
              <Text as="p" size="1" color="gray" mt="1">
                Default points awarded for earning a badge
              </Text>
              <FormFieldErrorMessage errors={errors} field="activityPoints.badges.default" />
            </label>

            <Box>
              <Text size="2" weight="medium" className="block mb-3">Special Badges</Text>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label>
                  <Text size="1" className="block mb-1">Perfect Month</Text>
                  <TextField.Root
                    type="number"
                    {...register('activityPoints.badges.special.perfect_month', {
                      required: 'Perfect month points required',
                      min: { value: 0, message: 'Must be 0 or greater' }
                    })}
                  />
                  <FormFieldErrorMessage errors={errors} field="activityPoints.badges.special.perfect_month" />
                </label>

                <label>
                  <Text size="1" className="block mb-1">Top Performer</Text>
                  <TextField.Root
                    type="number"
                    {...register('activityPoints.badges.special.top_performer', {
                      required: 'Top performer points required',
                      min: { value: 0, message: 'Must be 0 or greater' }
                    })}
                  />
                  <FormFieldErrorMessage errors={errors} field="activityPoints.badges.special.top_performer" />
                </label>
              </Box>
            </Box>
          </Box>
        </FormSection>

        {/* Behavior Points Section */}
        <FormSection title="Behavior Points">
          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>
              <Text size="2" weight="medium" className="block mb-1">Positive Behavior</Text>
              <TextField.Root
                type="number"
                {...register('activityPoints.behavior.positive', {
                  required: 'Positive behavior points required',
                  min: { value: 0, message: 'Must be 0 or greater' }
                })}
              />
              <Text as="p" size="1" color="gray" mt="1">
                Points awarded for positive behavior
              </Text>
              <FormFieldErrorMessage errors={errors} field="activityPoints.behavior.positive" />
            </label>

            <label>
              <Text size="2" weight="medium" className="block mb-1">Negative Behavior</Text>
              <TextField.Root
                type="number"
                {...register('activityPoints.behavior.negative', {
                  required: 'Negative behavior points required',
                  max: { value: 0, message: 'Must be 0 or negative' }
                })}
              />
              <Text as="p" size="1" color="gray" mt="1">
                Points deducted for negative behavior (should be negative)
              </Text>
              <FormFieldErrorMessage errors={errors} field="activityPoints.behavior.negative" />
            </label>
          </Box>
        </FormSection>

        {/* Point Limits Section */}
        <FormSection title="Point Limits">
          <Box className="space-y-6">
            <Box>
              <Text size="2" weight="medium" className="block mb-2">Daily Limits</Text>
              <Text as="label" size="2">
                <Flex align="center" gap="2" mb="2">
                  <Controller
                    name='limits.daily.enabled'
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Switch checked={value} onCheckedChange={onChange} />
                    )}
                  />
                  Enable daily limit
                </Flex>
              </Text>
              <TextField.Root
                type="number"
                placeholder="Max daily points"
                {...register('limits.daily.maxPoints', {
                  required: 'Daily max points required',
                  min: { value: 1, message: 'Must be at least 1' }
                })}
              />
              <FormFieldErrorMessage errors={errors} field="limits.daily.maxPoints" />
            </Box>

            <Box>
              <Text size="2" weight="medium" className="block mb-2">Weekly Limits</Text>
              <Text as="label" size="2">
                <Flex align="center" gap="2" mb="2">
                  <Controller
                    name='limits.weekly.enabled'
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Switch checked={value} onCheckedChange={onChange} />
                    )}
                  />
                  Enable weekly limit
                </Flex>
              </Text>
              <TextField.Root
                type="number"
                placeholder="Max weekly points"
                {...register('limits.weekly.maxPoints', {
                  required: 'Weekly max points required',
                  min: { value: 1, message: 'Must be at least 1' }
                })}
              />
              <FormFieldErrorMessage errors={errors} field="limits.weekly.maxPoints" />
            </Box>

            <Box>
              <Text size="2" weight="medium" className="block mb-2">Monthly Limits</Text>
              <Text as="label" size="2">
                <Flex align="center" gap="2" mb="2">
                  <Controller
                    name='limits.monthly.enabled'
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Switch checked={value} onCheckedChange={onChange} />
                    )}
                  />
                  Enable monthly limit
                </Flex>
              </Text>
              <TextField.Root
                type="number"
                placeholder="Max monthly points"
                {...register('limits.monthly.maxPoints', {
                  required: 'Monthly max points required',
                  min: { value: 1, message: 'Must be at least 1' }
                })}
              />
              <FormFieldErrorMessage errors={errors} field="limits.monthly.maxPoints" />
            </Box>

            <Box>
              <Text size="2" weight="medium" className="block mb-3">Source-Specific Limits</Text>
              <Text as="p" size="1" color="gray" mb="3">
                Set maximum points that can be earned from specific sources per day
              </Text>

              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Box>
                  <Text size="1" className="block mb-2 font-medium">Attendance Daily Limit</Text>
                  <Text as="label" size="1">
                    <Flex align="center" gap="2" mb="2">
                      <Controller
                        name='limits.sources.attendance.daily.enabled'
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Switch checked={value} onCheckedChange={onChange} />
                        )}
                      />
                      Enable attendance daily limit
                    </Flex>
                  </Text>
                  <TextField.Root
                    type="number"
                    {...register('limits.sources.attendance.daily.maxPoints', {
                      required: 'Attendance daily limit required',
                      min: { value: 1, message: 'Must be at least 1' }
                    })}
                  />
                  <FormFieldErrorMessage errors={errors} field="limits.sources.attendance.daily.maxPoints" />
                </Box>

                <Box>
                  <Text size="1" className="block mb-2 font-medium">Task Daily Limit</Text>
                  <Text as="label" size="1">
                    <Flex align="center" gap="2" mb="2">
                      <Controller
                        name='limits.sources.task.daily.enabled'
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Switch checked={value} onCheckedChange={onChange} />
                        )}
                      />
                      Enable task daily limit
                    </Flex>
                  </Text>
                  <TextField.Root
                    type="number"
                    {...register('limits.sources.task.daily.maxPoints', {
                      required: 'Task daily limit required',
                      min: { value: 1, message: 'Must be at least 1' }
                    })}
                  />
                  <FormFieldErrorMessage errors={errors} field="limits.sources.task.daily.maxPoints" />
                </Box>
              </Box>
            </Box>
          </Box>
        </FormSection>
      </form>
    </div>
  );
}

export default EditConfiguration;