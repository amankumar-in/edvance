import { Box, Button, Callout, Dialog, Flex, Heading, Inset, Switch, Tabs, Text, TextField } from '@radix-ui/themes';
import { InfoIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useUpdateConfiguration } from '../../../api/points/points.mutations';
import { FormFieldErrorMessage } from '../../../components/FormFieldErrorMessage';

const getFormValues = (activeConfig) => ({
  // Attendance points - Aligned with backend model defaults
  'activityPoints.attendance.dailyCheckIn': activeConfig?.activityPoints?.attendance?.dailyCheckIn ?? 5,
  'activityPoints.attendance.streak.enabled': activeConfig?.activityPoints?.attendance?.streak?.enabled ?? true,
  'activityPoints.attendance.streak.interval': activeConfig?.activityPoints?.attendance?.streak?.interval ?? 5,
  'activityPoints.attendance.streak.bonus': activeConfig?.activityPoints?.attendance?.streak?.bonus ?? 5,
  'activityPoints.attendance.perfectWeek.enabled': activeConfig?.activityPoints?.attendance?.perfectWeek?.enabled ?? true,
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
  'limits.daily.enabled': activeConfig?.limits?.daily?.enabled ?? true,
  'limits.daily.maxPoints': activeConfig?.limits?.daily?.maxPoints ?? 100,
  'limits.weekly.enabled': activeConfig?.limits?.weekly?.enabled ?? true,
  'limits.weekly.maxPoints': activeConfig?.limits?.weekly?.maxPoints ?? 500,
  'limits.monthly.enabled': activeConfig?.limits?.monthly?.enabled ?? false,
  'limits.monthly.maxPoints': activeConfig?.limits?.monthly?.maxPoints ?? 2000,
  'limits.sources.attendance.daily.enabled': activeConfig?.limits?.sources?.attendance?.daily?.enabled ?? true,
  'limits.sources.attendance.daily.maxPoints': activeConfig?.limits?.sources?.attendance?.daily?.maxPoints ?? 10,
  'limits.sources.task.daily.enabled': activeConfig?.limits?.sources?.task?.daily?.enabled ?? true,
  'limits.sources.task.daily.maxPoints': activeConfig?.limits?.sources?.task?.daily?.maxPoints ?? 50,
})

// TODO: Remove this dialog and create a separate route/page for updating configuration 
function UpdateConfigurationDialog({ configDialogOpen, setConfigDialogOpen, children = null, activeConfig }) {
  const [activeTab, setActiveTab] = useState('attendance');
  const updateConfigMutation = useUpdateConfiguration();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues: getFormValues(activeConfig)
  });

  useEffect(() => {
    if (configDialogOpen && activeConfig) {
      reset(getFormValues(activeConfig));
    }
  }, [configDialogOpen, activeConfig, reset]);


  const onSubmit = (data) => {
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

    updateConfigMutation.mutate(configData, {
      onSuccess: () => {
        toast.success('Configuration updated successfully!');
        setConfigDialogOpen(false);
        reset();
        setActiveTab('attendance');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to update configuration');
      }
    });
  };

  return (
    <div>
      {/* Configuration Update Dialog */}
      <Dialog.Root open={configDialogOpen} onOpenChange={o => {
        if (!o) {
          setTimeout(() => {
            reset();
            setActiveTab('attendance')
          }, 0)
        }
        setConfigDialogOpen(o);
      }}>
        {children && (
          <Dialog.Trigger>
            {children}
          </Dialog.Trigger>
        )}
        <Dialog.Content style={{ maxWidth: '700px' }}>
          <Dialog.Title>Update Point Configuration</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Create a new version of the point configuration. Changes will be applied system-wide.
          </Dialog.Description>

          <Callout.Root className="my-4" variant='surface' color='blue'>
            <Callout.Icon>
              <InfoIcon size={16} />
            </Callout.Icon>
            <Callout.Text>
              Updating configuration will create version {(activeConfig?.version || 0) + 1}. This affects all future point transactions.
            </Callout.Text>
          </Callout.Root>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Tabs.List wrap={'wrap'}>
                <Tabs.Trigger value="attendance">Attendance</Tabs.Trigger>
                <Tabs.Trigger value="tasks">Tasks</Tabs.Trigger>
                <Tabs.Trigger value="badges">Badges</Tabs.Trigger>
                <Tabs.Trigger value="behavior">Behavior</Tabs.Trigger>
                <Tabs.Trigger value="limits">Limits</Tabs.Trigger>
              </Tabs.List>

              <Inset py='current'>
                <div className='max-h-[45vh] overflow-y-auto scrollbar_thin_stable_both'>
                  <Box p={'4'}>
                    <Tabs.Content value="attendance" forceMount hidden={activeTab !== 'attendance'}>
                      <Box>
                        <Heading size="3" mb="3">Attendance Points</Heading>

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

                            <Flex gap="2">
                              <Box className="flex-1">
                                <Text size="1" className="block mb-1">Interval (days)</Text>
                                <TextField.Root
                                  type="number"
                                  {...register('activityPoints.attendance.streak.interval', {
                                    required: 'Interval required',
                                    min: { value: 1, message: 'Must be at least 1' }
                                  })}
                                />
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
                            </label>
                          </Box>
                        </Box>
                      </Box>
                    </Tabs.Content>

                    <Tabs.Content value="tasks" className="space-y-6" forceMount hidden={activeTab !== 'tasks'}>
                      <Box>
                        <Heading size="3" mb="3">Task Categories</Heading>

                        <Box className="grid grid-cols-2 gap-3">
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

                        <Box className="grid grid-cols-3 gap-3">
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
                    </Tabs.Content>

                    <Tabs.Content value="badges" forceMount hidden={activeTab !== 'badges'}>
                      <Box>
                        <Heading size="3" mb="3">Badge Points</Heading>

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
                            <FormFieldErrorMessage errors={errors} field="activityPoints.badges.default" />
                          </label>

                          <Box className=''>
                            <Text size="2" weight="medium" className="block mb-2">Special Badges</Text>
                            <Box className="space-y-4">
                              <div>
                                <label>
                                  <Text size="1" className="block mb-1">Perfect Month</Text>
                                  <TextField.Root
                                    type="number"
                                    {...register('activityPoints.badges.special.perfect_month', {
                                      required: 'Perfect month points required',
                                      min: { value: 0, message: 'Must be 0 or greater' }
                                    })}
                                  />
                                </label>
                              </div>

                              <div>
                                <label>
                                  <Text size="1" className="block mb-1">Top Performer</Text>
                                  <TextField.Root
                                    type="number"
                                    {...register('activityPoints.badges.special.top_performer', {
                                      required: 'Top performer points required',
                                      min: { value: 0, message: 'Must be 0 or greater' }
                                    })}
                                  />
                                </label>
                              </div>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Tabs.Content>

                    <Tabs.Content value="behavior" forceMount hidden={activeTab !== 'behavior'}>
                      <Box>
                        <Heading size="3" mb="3">Behavior Points</Heading>

                        <Box className="grid grid-cols-2 gap-3">
                          <label>
                            <Text size="2" weight="medium" className="block mb-1">Positive Behavior</Text>
                            <TextField.Root
                              type="number"
                              {...register('activityPoints.behavior.positive', {
                                required: 'Positive behavior points required',
                                min: { value: 0, message: 'Must be 0 or greater' }
                              })}
                            />
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
                            <FormFieldErrorMessage errors={errors} field="activityPoints.behavior.negative" />
                          </label>
                        </Box>
                      </Box>
                    </Tabs.Content>

                    <Tabs.Content value="limits" className="space-y-4" forceMount hidden={activeTab !== 'limits'}>
                      <Box>
                        <Heading size="3" mb="3">Point Limits</Heading>

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
                          </Box>

                          <Box>
                            <Text size="2" weight="medium" className="block mb-2">Source-Specific Limits</Text>
                            <Box className="space-y-3">
                              <Box>
                                <Text size="1" className="block mb-1">Attendance Daily Limit</Text>
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
                              </Box>
                              <Box>
                                <Text size="1" className="block mb-1">Task Daily Limit</Text>
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
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Tabs.Content>
                  </Box>
                </div>
              </Inset>
            </Tabs.Root>

            <Flex gap="3" justify="end" className="pt-4   border-t border-[--gray-a6]">
              <Dialog.Close>
                <Button
                  variant="soft"
                  color="gray"
                  type="button"
                  disabled={updateConfigMutation.isPending}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={updateConfigMutation.isPending}
              >
                {updateConfigMutation.isPending ? 'Updating...' : 'Update Configuration'}
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}

export default UpdateConfigurationDialog
