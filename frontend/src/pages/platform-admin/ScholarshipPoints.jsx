import { Badge, Box, Button, Callout, Dialog, DropdownMenu, Flex, Heading, IconButton, Table, Tabs, Text, TextField } from '@radix-ui/themes';
import { AlertCircleIcon, BarChart3, Edit, MoreVertical, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import { useAddOrUpdateLevel, useDeleteLevel } from '../../api/points/points.mutations';
import { useGetAllLevels } from '../../api/points/points.queries';
import { ConfirmationDialog, EmptyStateCard, Loader } from '../../components';
import { FormFieldErrorMessage } from '../../components/FormFieldErrorMessage';

// Levels Management Component
const LevelsManagement = () => {
  const [addLevelDialogOpen, setAddLevelDialogOpen] = useState(false);
  const [editLevelDialogOpen, setEditLevelDialogOpen] = useState(false);
  const [deleteLevelDialogOpen, setDeleteLevelDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  // API hooks
  const { data: levelsData, isLoading: isLevelsLoading, isError: isLevelsError, error, isFetching, refetch } = useGetAllLevels();
  const addOrUpdateLevelMutation = useAddOrUpdateLevel();
  const deleteLevelMutation = useDeleteLevel();

  // Extract data from API response
  const levels = levelsData?.data?.levels || [];
  const maxLevel = levelsData?.data?.maxLevel || 10;

  // React Hook Form for Add Level
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: errorsAdd },
    reset: resetAdd,
    watch: watchAdd
  } = useForm({
    defaultValues: {
      level: maxLevel + 1,
      threshold: '',
      name: `Level ${maxLevel + 1} Scholar`
    }
  });

  // React Hook Form for Edit Level
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    setValue: setValueEdit
  } = useForm();

  const handleEditLevel = (level) => {
    setSelectedLevel(level);
    setValueEdit('name', level.name);
    setValueEdit('threshold', level.threshold);
    setEditLevelDialogOpen(true);
  };

  const handleDeleteLevel = (level) => {
    setSelectedLevel(level);
    setDeleteLevelDialogOpen(true);
  };

  // Form submission handlers
  const onSubmitAddLevel = (data) => {
    addOrUpdateLevelMutation.mutate({
      level: parseInt(data.level),
      threshold: parseInt(data.threshold),
      name: data.name
    }, {
      onSuccess: () => {
        setAddLevelDialogOpen(false);
        resetAdd();
        toast.success('Level added successfully!');
      },
      onError: (error) => {
        console.error(error);
        toast.error(error?.response?.data?.message || error?.message || 'Failed to add level');
      }
    });
  };

  const onSubmitEditLevel = (data) => {
    if (!selectedLevel) return;

    addOrUpdateLevelMutation.mutate({
      level: selectedLevel.level,
      threshold: parseInt(data.threshold),
      name: data.name
    }, {
      onSuccess: () => {
        setEditLevelDialogOpen(false);
        resetEdit();
        setSelectedLevel(null);
        toast.success('Level updated successfully!');
      },
      onError: (error) => {
        console.error(error);
        toast.error(error?.response?.data?.message || error?.message || 'Failed to update level');
      }
    });
  };

  const confirmDeleteLevel = () => {
    if (!selectedLevel) return;

    deleteLevelMutation.mutate(selectedLevel.level, {
      onSuccess: () => {
        setDeleteLevelDialogOpen(false);
        setSelectedLevel(null);
        toast.success('Level deleted successfully!');
      },
      onError: (error) => {
        console.error(error);
        toast.error(error?.response?.data?.message || error?.message || 'Failed to delete level');
      }
    });
  };

  // Reset form when maxLevel changes
  useEffect(() => {
    resetAdd({
      level: maxLevel + 1,
      threshold: '',
      name: `Level ${maxLevel + 1} Scholar`
    });
  }, [maxLevel, resetAdd]);

  // Loading and error states
  if (isLevelsLoading) {
    return (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  }

  if (isLevelsError) {
    return (
      <Callout.Root color="red">
        <Callout.Icon>
          <AlertCircleIcon size={16} />
        </Callout.Icon>
        <Callout.Text>
          {error?.response?.data?.message || error?.message || 'Failed to load rewards'}
        </Callout.Text>
      </Callout.Root>
    );
  }

  return (
    <Box className="space-y-4">
      {/* Loading bar for mutations */}
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
          <Heading size="4" weight='medium' >Level Progression</Heading>
          <Badge color="blue" variant="soft">{levels.length} Levels</Badge>
          <Badge color="green" variant="outline">Max Level {maxLevel}</Badge>
        </Flex>
        <Button
          onClick={() => setAddLevelDialogOpen(true)}
          disabled={addOrUpdateLevelMutation.isPending}
        >
          <Plus size={16} />
          Add Level
        </Button>
      </Flex>

      {levels.length === 0 ? (
        <EmptyStateCard
          icon={<BarChart3 size={24} />}
          title="No levels configured"
          description="Create your first level to start the progression system"
          action={
            <Button onClick={() => setAddLevelDialogOpen(true)}>
              <Plus size={16} />
              Add First Level
            </Button>
          }
        />
      ) : (
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell className='font-medium'>Level</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className='font-medium'>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className='font-medium'>Threshold</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className='font-medium text-nowrap'>Points Needed</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="80px" className='font-medium'>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {levels.map((levelData, index) => {
              const pointsNeeded = index === 0 ? 0 : levelData.threshold - (levels[index - 1]?.threshold || 0);
              return (
                <Table.Row key={levelData.level} className="hover:bg-[--gray-a2]">
                  <Table.Cell>
                    <Flex align="center" gap="2">
                      <Badge color="blue" variant="soft" size="1" highContrast>
                        {levelData.level}
                      </Badge>
                      {levelData.level === 1 && (
                        <Badge color="green" variant="outline" size="1">Starting</Badge>
                      )}
                      {levelData.level === maxLevel && (
                        <Badge color="purple" variant="outline" size="1">Max</Badge>
                      )}
                    </Flex>
                  </Table.Cell>
                  <Table.Cell className='font-medium text-nowrap'>
                    {levelData.name}
                  </Table.Cell>
                  <Table.Cell>
                    {levelData.threshold.toLocaleString()} pts
                  </Table.Cell>
                  <Table.Cell>
                    {index === 0 ? 'Starting level' : `+${pointsNeeded.toLocaleString()} pts`}
                  </Table.Cell>
                  <Table.Cell>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <IconButton
                          variant="ghost"
                          color="gray"
                          disabled={addOrUpdateLevelMutation.isPending || deleteLevelMutation.isPending}
                        >
                          <MoreVertical size={14} />
                        </IconButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content variant="soft">
                        <DropdownMenu.Item onClick={() => handleEditLevel(levelData)}>
                          <Edit size={14} />
                          Edit Level
                        </DropdownMenu.Item>
                        {levelData.level > 10 && (
                          <DropdownMenu.Item color="red" onClick={() => handleDeleteLevel(levelData)}>
                            <X size={14} />
                            Delete Level
                          </DropdownMenu.Item>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      )}

      {/* Add Level Dialog */}
      <Dialog.Root open={addLevelDialogOpen} onOpenChange={setAddLevelDialogOpen}>
        <Dialog.Content style={{ maxWidth: '500px' }}>
          <Dialog.Title>Add New Level</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Create a new level above the current maximum level ({maxLevel}).
          </Dialog.Description>

          <form onSubmit={handleSubmitAdd(onSubmitAddLevel)} className="flex flex-col gap-4">
            <label>
              <Text size="2" weight="medium" className="block mb-1">Level Number</Text>
              <TextField.Root
                type="number"
                {...registerAdd('level', {
                  required: 'Level number is required',
                  min: { value: maxLevel + 1, message: `Level must be greater than ${maxLevel}` },
                  max: { value: 100, message: 'Level cannot exceed 100' },
                  valueAsNumber: true
                })}
              />
              <FormFieldErrorMessage errors={errorsAdd} field="level" />
            </label>

            <label>
              <Text size="2" weight="medium" className="block mb-1">Level Name</Text>
              <TextField.Root
                {...registerAdd('name', {
                  required: 'Level name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  maxLength: { value: 50, message: 'Name cannot exceed 50 characters' }
                })}
              />
              <FormFieldErrorMessage errors={errorsAdd} field="name" />
            </label>

            <label>
              <Text size="2" weight="medium" className="block mb-1">Points Threshold</Text>
              <TextField.Root
                type="number"
                {...registerAdd('threshold', {
                  required: 'Points threshold is required',
                  min: {
                    value: (levels[levels.length - 1]?.threshold || 0) + 1,
                    message: `Must be greater than ${levels[levels.length - 1]?.threshold?.toLocaleString() || 0} pts`
                  },
                  valueAsNumber: true
                })}
              />
              <FormFieldErrorMessage errors={errorsAdd} field="threshold" />
              <Text size="1" color="gray" className="mt-1">
                Must be greater than {levels[levels.length - 1]?.threshold?.toLocaleString() || 0} pts
              </Text>
            </label>

            <Flex gap="3" justify="end">
              <Dialog.Close>
                <Button
                  variant="soft"
                  color="gray"
                  type="button"
                  disabled={addOrUpdateLevelMutation.isPending}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={addOrUpdateLevelMutation.isPending}
              >
                {addOrUpdateLevelMutation.isPending ? 'Adding...' : 'Add Level'}
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit Level Dialog */}
      <Dialog.Root open={editLevelDialogOpen} onOpenChange={setEditLevelDialogOpen}>
        <Dialog.Content style={{ maxWidth: '500px' }}>
          <Dialog.Title>Edit Level {selectedLevel?.level}</Dialog.Title>
          <Dialog.Description>
            Update the threshold and name for this level.
          </Dialog.Description>

          <form onSubmit={handleSubmitEdit(onSubmitEditLevel)} className="mt-4 space-y-4">
            <Box>
              <Text size="2" weight="medium" className="block mb-2">Level Name</Text>
              <TextField.Root
                {...registerEdit('name', {
                  required: 'Level name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  maxLength: { value: 50, message: 'Name cannot exceed 50 characters' }
                })}
              />
              <FormFieldErrorMessage errors={errorsEdit} field="name" />
            </Box>

            <Box>
              <Text size="2" weight="medium" className="block mb-2">Points Threshold</Text>
              <TextField.Root
                type="number"
                {...registerEdit('threshold', {
                  required: 'Points threshold is required',
                  min: {
                    value: selectedLevel?.level === 1 ? 0 :
                      (levels.find(l => l.level === selectedLevel?.level - 1)?.threshold || 0) + 1,
                    message: selectedLevel?.level === 1 ? 'Starting level threshold must be 0 or greater' :
                      `Must be greater than ${levels.find(l => l.level === selectedLevel?.level - 1)?.threshold?.toLocaleString() || 0} pts (previous level)`
                  },
                  max: selectedLevel?.level === maxLevel ? undefined : {
                    value: (levels.find(l => l.level === selectedLevel?.level + 1)?.threshold || Infinity) - 1,
                    message: `Must be less than ${levels.find(l => l.level === selectedLevel?.level + 1)?.threshold?.toLocaleString() || 'infinity'} pts (next level)`
                  },
                  valueAsNumber: true
                })}
              />
              <FormFieldErrorMessage errors={errorsEdit} field="threshold" />
              <Text size="1" color="gray" className="mt-1">
                {selectedLevel?.level === 1
                  ? 'Starting level (can be 0 or greater)'
                  : selectedLevel?.level === maxLevel
                    ? `Must be greater than ${levels.find(l => l.level === selectedLevel?.level - 1)?.threshold?.toLocaleString() || 0} pts`
                    : `Must be between ${(levels.find(l => l.level === selectedLevel?.level - 1)?.threshold || 0) + 1} and ${(levels.find(l => l.level === selectedLevel?.level + 1)?.threshold || Infinity) - 1} pts`
                }
              </Text>
            </Box>

            <Flex gap="3" justify="end" className="mt-6">
              <Dialog.Close>
                <Button
                  variant="soft"
                  color="gray"
                  type="button"
                  disabled={addOrUpdateLevelMutation.isPending}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={addOrUpdateLevelMutation.isPending}
              >
                {addOrUpdateLevelMutation.isPending ? 'Updating...' : 'Update Level'}
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete Level Dialog */}
      <ConfirmationDialog
        open={deleteLevelDialogOpen}
        onOpenChange={setDeleteLevelDialogOpen}
        onConfirm={confirmDeleteLevel}
        title={`Delete Level ${selectedLevel?.level}`}
        description={`Are you sure you want to delete "${selectedLevel?.name}"? This action cannot be undone.`}
        confirmText="Delete Level"
        confirmColor="red"
        isLoading={deleteLevelMutation.isPending}
      />
    </Box >
  );
};

// Main ScholarshipPoints Component
const ScholarshipPoints = () => {
  const [activeTab, setActiveTab] = useState('levels');

  return (
    <Box className="px-4 py-8 space-y-6 lg:px-8 xl:px-12">
      <div>
        <Heading as='h1' size='6' weight='medium'>Scholarship Points System</Heading>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          {/* TODO: <Tabs.Trigger value="configuration">
            <Settings size={16} />
            Point Configuration
          </Tabs.Trigger> */}
          <Tabs.Trigger value="levels">
            Level Management
          </Tabs.Trigger>
          {/* TODO: <Tabs.Trigger value="transactions">
            <History size={16} />
            Transaction History
          </Tabs.Trigger> */}
          {/* TODO: <Tabs.Trigger value="analytics">
            <BarChart3 size={16} />
            Analytics
          </Tabs.Trigger> */}
        </Tabs.List>

        <Box className="mt-6">
          {/* TODO: <Tabs.Content value="configuration">
            <PointConfiguration />
          </Tabs.Content> */}

          <Tabs.Content value="levels">
            <LevelsManagement />
          </Tabs.Content>
          {/* TODO: 
          <Tabs.Content value="transactions">
            <TransactionHistory />
          </Tabs.Content>

          {/* TODO: <Tabs.Content value="analytics">
            <ScholarshipPointsAnalytics />
          </Tabs.Content> */}
        </Box>
      </Tabs.Root>
    </Box>
  );
};

export default ScholarshipPoints; 