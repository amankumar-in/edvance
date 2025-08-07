import { Badge, Box, Button, Callout, Card, Flex, Select, Text, TextArea, TextField } from '@radix-ui/themes';
import { Info, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useChildren } from '../../api/parent/parent.queries';
import { useGetTaskCategories } from '../../api/task-category/taskCategory.queries';
import { useCreateTask, useUpdateTask } from '../../api/task/task.mutations';
import { useGetTaskById } from '../../api/task/task.queries';
import { FileUpload, FormFieldErrorMessage, Loader, PageHeader } from '../../components';

const CreateTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Get clone data from navigation state
  const cloneData = location.state?.cloneData;

  const [isFormReady, setIsFormReady] = useState(!isEdit);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: cloneData ? {
      title: cloneData.title || '',
      description: cloneData.description || '',
      pointValue: cloneData.pointValue || 10,
      dueDate: cloneData.dueDate ? new Date(cloneData.dueDate).toISOString().slice(0, 16) : '',
      subCategory: cloneData.subCategory || '',
      difficulty: cloneData.difficulty || 'easy',
      externalResource: {
        platform: cloneData.externalResource?.platform || '',
        resourceId: cloneData.externalResource?.resourceId || '',
        url: cloneData.externalResource?.url || ''
      },
      attachments: [],
      existingAttachments: cloneData.attachments || [] // Show original attachments when cloning
    } : {
      title: '',
      description: '',
      pointValue: 10,
      dueDate: '',
      subCategory: '',
      difficulty: 'easy',
      externalResource: {
        platform: '',
        resourceId: '',
        url: ''
      },
      attachments: [],
      existingAttachments: []
    },
  });

  // Watch form values
  const subCategory = watch('subCategory');
  const externalResourcePlatform = watch('externalResource.platform');
  const externalResourceResourceId = watch('externalResource.resourceId');
  const externalResourceUrl = watch('externalResource.url');

  // Get children for assignment dropdown
  const { data: childrenData } = useChildren();
  const { data: children = [] } = childrenData ?? {};
  const childrenIds = Array.isArray(children)
    ? children.map(child => child?._id).filter(Boolean)
    : [];

  // Get task categories for parents
  const { data: taskCategories, isLoading: isLoadingCategories } = useGetTaskCategories({
    role: 'parent'
  });

  // Get task for editing
  const { data: taskData, isLoading: isLoadingTask } = useGetTaskById(id, 'parent', { enabled: isEdit });
  const { data: task } = taskData ?? {};

  // Create and update task mutations
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask('parent');

  // Handle file changes from FileUpload component
  const handleFileChange = (newAttachments, existingAttachments = []) => {
    setValue('attachments', newAttachments);
    setValue('existingAttachments', existingAttachments);
  };

  // Populate form when editing
  useEffect(() => {
    if (isEdit && task && !isLoadingTask) {
      const formData = {
        title: task.title || '',
        description: task.description || '',
        pointValue: task.pointValue || 10,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
        subCategory: task.subCategory || '',
        difficulty: task.difficulty || 'easy',
        externalResource: {
          platform: task.externalResource?.platform || '',
          resourceId: task.externalResource?.resourceId || '',
          url: task.externalResource?.url || ''
        },
        attachments: [],
        existingAttachments: task.attachments || []
      };

      reset(formData);
      setIsFormReady(true);
    }
  }, [isEdit, task, isLoadingTask, reset]);

  // Set point value based on category
  useEffect(() => {
    if (taskCategories?.data && subCategory) {
      const selectedCategory = taskCategories.data.find(cat => cat.name === subCategory);
      if (selectedCategory) {
        setValue('pointValue', selectedCategory.defaultPointValue || 10);
      }
    }
  }, [subCategory, taskCategories, setValue]);

  // Form submission handler
  const onSubmit = async (data) => {
    const formData = new FormData();

    // Basic task information
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('pointValue', parseInt(data.pointValue));
    formData.append('role', 'parent');

    // Due date
    formData.append('dueDate', data.dueDate ? new Date(data.dueDate).toISOString() : '');

    // Category and assignment
    const assignedTo = {
      role: 'student',
      selectedPeopleIds: childrenIds
    };
    formData.append('assignedTo', JSON.stringify(assignedTo));

    const categoryData = taskCategories?.data?.find(cat => cat.name === data.subCategory);
    if (categoryData) {
      formData.append('category', categoryData.type);
      formData.append('subCategory', data.subCategory);
    }

    // External resource - simplified for parents
    const { platform, resourceId, url } = data.externalResource;
    const hasExternalResource =
      (platform && platform.trim() !== '') ||
      (resourceId && resourceId.trim() !== '') ||
      (url && url.trim() !== '');

    if (hasExternalResource) {
      const cleanExternalResource = {};
      if (platform && platform.trim() !== '') cleanExternalResource.platform = platform.trim();
      if (resourceId && resourceId.trim() !== '') cleanExternalResource.resourceId = resourceId.trim();
      if (url && url.trim() !== '') cleanExternalResource.url = url.trim();
      formData.append('externalResource', JSON.stringify(cleanExternalResource));
    } else {
      // For updates: explicitly send empty object to clear external resource
      formData.append('externalResource', JSON.stringify({}));
    }

    // Attachments
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach(attachment => {
        if (attachment.file) {
          formData.append('attachments', attachment.file);
        }
      });
    }

    // Other settings
    formData.append('difficulty', data.difficulty);
    formData.append('requiresApproval', true);
    formData.append('approverType', 'parent');
    formData.append('isFeatured', false);

    if (isEdit) {
      const existingAttachments = data.existingAttachments && data.existingAttachments.length > 0
        ? data.existingAttachments
        : [];
      formData.append('existingAttachments', JSON.stringify(existingAttachments));
    } else if (cloneData && data.existingAttachments && data.existingAttachments.length > 0) {
      // For cloning, download and re-upload files as new files
      try {
        for (const attachment of data.existingAttachments) {
          if (attachment.url) {
            const response = await fetch(attachment.url);
            const blob = await response.blob();
            const file = new File([blob], attachment.name || 'cloned-file', {
              type: attachment.contentType || blob.type
            });
            formData.append('attachments', file);
          }
        }
      } catch (error) {
        console.error('Error cloning attachments:', error);
        toast.error('Some attachments could not be cloned');
      }
    }

    // Submit to API
    const successMessage = isEdit ? 'Task updated successfully!' : cloneData ? 'Task copy created successfully!' : 'Task created successfully!';
    const errorMessage = isEdit ? 'Failed to update task' : cloneData ? 'Failed to create task copy' : 'Failed to create task';
    const mutation = isEdit ? updateTask : createTask;
    const mutationData = isEdit ? { id, data: formData } : formData;

    mutation(mutationData, {
      onSuccess: ({ data }) => {
        const { _id } = data;

        toast.success(successMessage);
        if (isEdit) {
          navigate(`/parent/tasks/${id}`);
        } else {
          navigate(`/parent/tasks/${_id}`);
        }
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || errorMessage);
      }
    });
  };

  // Group categories by type for better organization
  const groupedCategories = taskCategories?.data?.reduce((acc, category) => {
    const type = category.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(category);
    return acc;
  }, {}) || {};

  if (isEdit && (isLoadingTask || !isFormReady)) {
    return (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  }

  return (
    <div className="mx-auto space-y-4 max-w-2xl">

      {/* Header */}
      <CreateTaskPageHeader isEdit={isEdit} isClone={cloneData} />

      {/* Clone Info Callout */}
      {cloneData && (
        <Callout.Root variant='surface' color="blue" mb="4">
          <Callout.Icon>
            <Info size={16} />
          </Callout.Icon>
          <Callout.Text>
            You're creating a copy of "{cloneData.title}".
            Modify any fields as needed and save to create the new task.
          </Callout.Text>
        </Callout.Root>
      )}

      <Text size={'1'} className='italic' color='gray' as='p'>
        * Required fields
      </Text>

      {/* Form */}
      <Card size={{ initial: '2', xs: '3' }} className='shadow-md'>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Box className="space-y-4">
            {/* Title & Description */}
            <Flex gap="4" direction={{ initial: 'column', md: 'row' }}>
              <Box className="flex-1">
                <label>
                  <Text as="p" size="2" weight="medium" mb="2">
                    Task Title *
                  </Text>
                  <TextField.Root
                    id="title"
                    placeholder="e.g., Clean your room"
                    {...register('title', { required: 'Task title is required' })}
                  />
                </label>
                <FormFieldErrorMessage errors={errors} field="title" />
                {/* Clone helper text */}
                {cloneData && (
                  <Text size="1" color="gray" mt="1">
                    Consider updating the title to differentiate from the original task
                  </Text>
                )}
              </Box>

            </Flex>

            {/* Description */}
            <Box>
              <label>
                <Text as="p" size="2" weight="medium" mb="2">
                  Description
                </Text>
                <TextArea
                  placeholder="What needs to be done?"
                  resize="vertical"
                  rows={2}
                  {...register('description')}
                />
              </label>
            </Box>
          </Box>

          {/* Category & Settings */}
          <Box className="space-y-4">
            <Flex gap="4" direction={{ initial: 'column', xs: 'row' }}>
              {/* Category */}
              <Box className="flex-1">
                <label className='w-full'>
                  <Text as="p" size="2" weight="medium" mb="2">
                    Category *
                  </Text>
                  <Controller
                    name="subCategory"
                    control={control}
                    rules={{ required: 'Please select a category' }}
                    render={({ field }) => (
                      <Select.Root value={field.value} onValueChange={field.onChange}>
                        <Select.Trigger className='w-full' placeholder="Select category" />
                        <Select.Content variant="soft" position="popper">
                          {Object.entries(groupedCategories).map(([type, categories]) => (
                            <Select.Group key={type}>
                              <Select.Label className="text-xs font-medium capitalize">
                                {type}
                              </Select.Label>
                              {categories.map((category) => (
                                <Select.Item key={category._id} value={category.name}>
                                  <Flex align="center" gap="2">
                                    <Text className="capitalize">{category.name}</Text>
                                    <Badge variant="soft" size="1" color="gray">
                                      {category.defaultPointValue} pts
                                    </Badge>
                                  </Flex>
                                </Select.Item>
                              ))}
                            </Select.Group>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    )}
                  />
                </label>
                <FormFieldErrorMessage errors={errors} field="subCategory" />
              </Box>

              {/* Difficulty */}
              <Box className="flex-1">
                <label className='w-full'>
                  <Text as="p" size="2" weight="medium" mb="2">
                    Difficulty
                  </Text>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <Select.Root value={field.value} onValueChange={field.onChange}>
                        <Select.Trigger className='w-full' />
                        <Select.Content variant="soft" position="popper">
                          <Select.Item value="easy">Easy</Select.Item>
                          <Select.Item value="medium">Medium</Select.Item>
                          <Select.Item value="hard">Hard</Select.Item>
                          <Select.Item value="challenging">Challenging</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    )}
                  />
                </label>
                <FormFieldErrorMessage errors={errors} field="difficulty" />
              </Box>
            </Flex>

            {/* Due Date */}
            <Box className="flex-1">
              <label>
                <Text as="p" size="2" weight="medium" mb="2">
                  Due Date
                </Text>
                <TextField.Root
                  type="datetime-local"
                  className='w-fit'
                  {...register('dueDate', {
                    validate: (value) => {
                      if (!value) return true;
                      const dateValue = new Date(value);
                      const now = new Date();
                      return dateValue >= now || "Due date must be in the future";
                    }
                  })}
                />
              </label>
              <FormFieldErrorMessage errors={errors} field="dueDate" />
            </Box>
          </Box>

          {/* Resources & Files */}
          <Box className="space-y-4">
            <Text as='p' weight="medium">Additional Resources</Text>

            {/* External Resource */}
            <div>
              <Text as="p" size="2" weight="medium" mb="2">
                Helpful Link
              </Text>
              <Flex gap="3" direction={{ initial: 'column', xs: 'row' }}>
                <Box className='flex-1'>
                  <TextField.Root
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...register('externalResource.url', {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: "Please enter a valid URL"
                      },
                      required: {
                        value: (externalResourcePlatform && externalResourcePlatform.trim() !== '') || (externalResourceResourceId && externalResourceResourceId.trim() !== ''),
                        message: 'Link is required when Platform or Resource ID is provided'
                      }
                    })}
                  />
                  <FormFieldErrorMessage errors={errors} field="externalResource.url" />
                </Box>

                <Box className="flex-1">
                  <TextField.Root
                    placeholder="Platform (e.g., YouTube)"
                    {...register('externalResource.platform', {
                      required: {
                        value: (externalResourceUrl && externalResourceUrl.trim() !== '') || (externalResourceResourceId && externalResourceResourceId.trim() !== ''),
                        message: 'Platform name is required'
                      }
                    })}
                  />
                  <FormFieldErrorMessage errors={errors} field="externalResource.platform" />
                </Box>
              </Flex>
            </div>

            {/* File Attachments */}
            <Box>
              <Text as="p" size="2" weight="medium" mb="2">
                Attachments
              </Text>
              <FileUpload
                onFilesChange={handleFileChange}
                existingAttachments={watch('existingAttachments') || []}
                maxFiles={3}
                maxSizePerFile={10}
                showDetailedHelp={false}
              />
            </Box>
          </Box>

          {/* Info */}
          <Callout.Root variant="surface" color="blue">
            <Callout.Icon>
              <Info size={16} />
            </Callout.Icon>
            <Callout.Text>
              Good to know:
            </Callout.Text>
            <Text as="p" size="2">
              • Tasks will require your approval when completed<br />
              • You can manage task visibility in your task list<br />
              • Points will be awarded after approval<br />
              • Links and files help children understand what to do
            </Text>
          </Callout.Root>

          {/* Actions */}
          <Flex justify="end" gap="3">
            <Button variant="soft" color="gray" asChild>
              <Link to="/parent/tasks">Cancel</Link>
            </Button>
            <Button
              color='grass'
              type="submit"
              disabled={isCreating || isUpdating}
              className='shadow-md'
            >
              <Plus size={16} />
              {isCreating || isUpdating
                ? (isEdit ? 'Updating...' : 'Creating...')
                : cloneData
                  ? 'Create Copy'
                  : (isEdit ? 'Update Task' : 'Create Task')
              }
            </Button>
          </Flex>
        </form>
      </Card>
    </div>
  );
};

export default CreateTask;

function CreateTaskPageHeader({ isEdit, isClone }) {
  return (
    <PageHeader
      title={isEdit ? 'Edit Task' : isClone ? 'Clone Task' : 'Create Task'}
      description={isEdit
        ? 'Update the task details and settings'
        : isClone
          ? 'Create a new task based on an existing one'
          : 'Create a task for your child to complete and earn points'
      }
      backButton
    />
  )
}