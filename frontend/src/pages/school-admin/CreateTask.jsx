import { Badge, Box, Button, Card, ChevronDownIcon, Flex, Select, Separator, Text, TextArea, TextField } from '@radix-ui/themes';
import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { useGetSchoolProfile } from '../../api/school-admin/school.queries';
import { useGetTaskCategories } from '../../api/task-category/taskCategory.queries';
import { useCreateTask, useUpdateTask } from '../../api/task/task.mutations';
import { useGetTaskById } from '../../api/task/task.queries';
import { ErrorCallout, FileUpload, FormFieldErrorMessage, Loader } from '../../components';
import PageHeader from './components/PageHeader';
import SelectClassDialog from './components/SelectClassDialog';

const CreateTask = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const cloneId = searchParams.get('cloneId');
  
  const isEdit = Boolean(id);
  const isClone = Boolean(cloneId);

  const [isSelectClassDialogOpen, setIsSelectClassDialogOpen] = useState(false);

  const { data, isLoading: isSchoolLoading, isError: isSchoolError, error: schoolError } = useGetSchoolProfile()
  const schoolId = data?.data?._id

  const [isFormReady, setIsFormReady] = useState(!isEdit && !isClone);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
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
      existingAttachments: [],
      classDetails: null,
    },
  });
  const classDetails = watch('classDetails');
  const className = classDetails?.name || 'Select class';

  // Watch form values
  const subCategory = watch('subCategory');

  // Get task categories for school admins
  const { data: taskCategories, isLoading: isLoadingCategories, isError: isCategoriesError, error: categoriesError } = useGetTaskCategories({
    role: 'school_admin'
  });

  useEffect(() => {
    if (isCategoriesError) {
      return toast.error(categoriesError?.response?.data?.message || categoriesError?.message || 'Failed to load task categories');
    }
  }, [isCategoriesError, categoriesError])

  // Get task for editing
  const { data: taskData, isLoading: isLoadingTask } = useGetTaskById(id, 'school_admin', { enabled: isEdit });
  const { data: task } = taskData ?? {};

  // Get task for cloning
  const { data: cloneTaskData, isLoading: isLoadingCloneTask } = useGetTaskById(cloneId, 'school_admin', { enabled: isClone });
  const { data: cloneTask } = cloneTaskData ?? {};

  // Create and update task mutations
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask('school_admin');

  // Handle file changes from FileUpload component
  const handleFileChange = (newAttachments, existingAttachments = []) => {
    setValue('attachments', newAttachments);
    setValue('existingAttachments', existingAttachments);
  };

  // Populate form when editing or cloning
  useEffect(() => {
    let sourceTask = null;
    let isReady = false;

    if (isEdit && task && !isLoadingTask) {
      sourceTask = task;
      isReady = true;
    } else if (isClone && cloneTask && !isLoadingCloneTask) {
      sourceTask = cloneTask;
      isReady = true;
    }

    if (sourceTask && isReady) {
      const formData = {
        title: isClone ? `Copy of ${sourceTask.title}` : sourceTask.title || '',
        description: sourceTask.description || '',
        pointValue: sourceTask.pointValue || 10,
        dueDate: isClone ? '' : (sourceTask.dueDate ? new Date(sourceTask.dueDate).toISOString().slice(0, 16) : ''),
        subCategory: sourceTask.subCategory || '',
        difficulty: sourceTask.difficulty || 'easy',
        externalResource: {
          platform: sourceTask.externalResource?.platform || '',
          resourceId: sourceTask.externalResource?.resourceId || '',
          url: sourceTask.externalResource?.url || ''
        },
        attachments: [],
        existingAttachments: sourceTask.attachments || [],
        classDetails: sourceTask.class || null,
      };

      reset(formData);
      setIsFormReady(true);
    }
  }, [isEdit, isClone, task, cloneTask, isLoadingTask, isLoadingCloneTask, reset]);

  // Set point value based on category (only for new tasks, not clones)
  useEffect(() => {
    if (!isEdit && !isClone && taskCategories?.data && subCategory) {
      const selectedCategory = taskCategories.data.find(cat => cat.name === subCategory);
      if (selectedCategory) {
        setValue('pointValue', selectedCategory.defaultPointValue || 10);
      }
    }
  }, [isEdit, isClone, subCategory, taskCategories, setValue]);

  // Form submission handler
  const onSubmit = async (data) => {
    const formData = new FormData();

    // Basic task information
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('pointValue', parseInt(data.pointValue));
    formData.append('role', 'school_admin');

    if (schoolId) {
      formData.append('schoolId', schoolId);
    } else {
      return toast.error('School ID is required');
    }

    // Due date
    formData.append('dueDate', data.dueDate ? new Date(data.dueDate).toISOString() : '');

    // Assignment and approval logic
    const approverType = 'teacher'; // Default for school admin tasks
    const assignedTo = {
      role: 'school',
      selectedPeopleIds: []
    };

    formData.append('assignedTo', JSON.stringify(assignedTo));

    // Category
    const categoryData = taskCategories?.data?.find(cat => cat.name === data.subCategory);
    if (categoryData) {
      formData.append('category', categoryData.type);
      formData.append('subCategory', data.subCategory);
    }

    // External resource
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
    formData.append('approverType', approverType);
    formData.append('isFeatured', false);
    formData.append('classId', data.classDetails?._id || '');

    if (isEdit) {
      const existingAttachments = data.existingAttachments && data.existingAttachments.length > 0
        ? data.existingAttachments
        : [];
      formData.append('existingAttachments', JSON.stringify(existingAttachments));
    } else if (isClone && data.existingAttachments && data.existingAttachments.length > 0) {
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
    const successMessage = isEdit ? 'Task updated successfully!' : 'Task created successfully!';
    const errorMessage = isEdit ? 'Failed to update task' : 'Failed to create task';
    const mutation = isEdit ? updateTask : createTask;
    const mutationData = isEdit ? { id, data: formData } : formData;


    mutation(mutationData, {
      onSuccess: ({ data }) => {
        const { _id } = data;
        toast.success(successMessage);
        navigate(`/school-admin/tasks`);
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

  const handleSelectClass = (classDetails) => {
    setValue('classDetails', classDetails);
    setValue('classDetails.name', classDetails?.name || '');
  }

  if ((isEdit && (isLoadingTask || !isFormReady)) || (isClone && (isLoadingCloneTask || !isFormReady))) {
    return (
      <div className="mx-auto space-y-6 max-w-3xl">
        <CreateTaskPageHeader isEdit={isEdit} isClone={isClone} />
        <Flex justify="center" align="center">
          <Loader />
        </Flex>
      </div>
    );
  }

  if (isSchoolError) {
    return (
      <div className="mx-auto space-y-6 max-w-3xl">
        <CreateTaskPageHeader isEdit={isEdit} isClone={isClone} />
        <ErrorCallout errorMessage={schoolError?.response?.data?.message || schoolError?.message || 'Failed to load school'} />
      </div>
    )
  }

  return (
    <div className="mx-auto space-y-6 max-w-3xl">
      {/* Header */}
      <CreateTaskPageHeader isEdit={isEdit} isClone={isClone} />

      <Text size={'1'} className='italic' color='gray' as='p'>
        * Required fields
      </Text>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic Information */}
        <FormSection title='Basic Information'>
          {/* Title & Description */}
          <Box>
            <label>
              <Text as="p" size="2" weight="medium" mb="2">
                Task Title *
              </Text>
              <TextField.Root
                id="title"
                placeholder="e.g., Complete math worksheet"
                {...register('title', { required: 'Task title is required' })}
              />
            </label>
            {/* Clone helper text */}
            {isClone && (
              <Text size="1" color="gray" mt="1">
                Consider updating the title to differentiate from the original task
              </Text>
            )}
            <FormFieldErrorMessage errors={errors} field="title" />
          </Box>

          {/* Description */}
          <Box>
            <label>
              <Text as="p" size="2" weight="medium" mb="2">
                Description
              </Text>
              <TextArea
                placeholder="What needs to be done?"
                resize="vertical"
                rows={3}
                {...register('description')}
              />
            </label>
          </Box>
        </FormSection>

        {/* Category & Settings */}
        <FormSection title='Category & Settings'>
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
            </Box>
          </Flex>

          {/* Points and Due Date */}
          <Flex gap="4" direction={{ initial: 'column', xs: 'row' }}>
            {/* Due Date */}
            <Box className="flex-1">
              <label>
                <Text as="p" size="2" weight="medium" mb="2">
                  Due Date
                </Text>
                <TextField.Root
                  className='w-max'
                  type="datetime-local"
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

            <Box className='flex-1'>
              <label>
                <Text as="p" size="2" weight="medium" mb="2">
                  Class
                </Text>
                {/* Select class dialog */}
                <SelectClassDialog
                  open={isSelectClassDialogOpen}
                  onOpenChange={setIsSelectClassDialogOpen}
                  onSelectClass={handleSelectClass}
                  classDetails={watch('classDetails')}
                >
                  <Button
                    className='flex justify-between font-normal w-full bg-[--color-surface] text-[--color-text]'
                    variant='outline'
                    color='gray'
                    onClick={() => setIsSelectClassDialogOpen(true)}
                  >
                    {classDetails?._id ? `${className} (${classDetails?.grade})` : (
                      <Text className='text-[--gray-10]'>
                        Select class
                      </Text>
                    )}
                    <ChevronDownIcon />
                  </Button>
                </SelectClassDialog>
              </label>
            </Box>
          </Flex>
        </FormSection>

        {/* Resources & Files */}
        <FormSection title='Additional Resources'>
          {/* External Resource */}
          <Text as="p" size="2" weight="medium" mb="2">
            External Resource
          </Text>
          <Flex gap="3" direction={{ initial: 'column', xs: 'row' }}>
            <Box className="flex-1">
              <TextField.Root
                placeholder="Platform (e.g., Khan Academy)"
                {...register('externalResource.platform')}
              />
            </Box>

            <Box className="flex-1">
              <TextField.Root
                placeholder="Resource ID (optional)"
                {...register('externalResource.resourceId')}
              />
            </Box>
          </Flex>

          <Box className='flex-1'>
            <TextField.Root
              placeholder="https://www.khanacademy.org/..."
              {...register('externalResource.url', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "Please enter a valid URL"
                }
              })}
            />
            <FormFieldErrorMessage errors={errors} field="externalResource.url" />
          </Box>

          {/* File Attachments */}
          <Box>
            <Text as="p" size="2" weight="medium" mb="2">
              Attachments
            </Text>
            <FileUpload
              onFilesChange={handleFileChange}
              existingAttachments={watch('existingAttachments') || []}
              maxFiles={5}
              maxSizePerFile={10}
              showDetailedHelp={true}
            />
          </Box>
        </FormSection>

        {/* Actions */}
        <Flex justify="end" gap="3">
          <Button variant="soft" color="gray" asChild>
            <Link to="/school-admin/tasks">Cancel</Link>
          </Button>
          <Button color='green' type="submit" disabled={isCreating || isUpdating}>
            <Plus size={16} />
            {isCreating || isUpdating
              ? (isEdit ? 'Updating...' : 'Creating...')
              : isClone
                ? 'Create Copy'
                : (isEdit ? 'Update Task' : 'Create Task')
            }
          </Button>
        </Flex>
      </form>
    </div>
  );
};

export default CreateTask;

function CreateTaskPageHeader({ isEdit, isClone }) {
  return (
    <PageHeader
      title={isEdit ? 'Edit Task' : isClone ? 'Clone Task' : 'Create New Task'}
      description={isEdit 
        ? 'Update the task details and settings' 
        : isClone 
          ? 'Create a new task based on an existing one'
          : 'Create a task for students to complete and earn points'
      }
      backButton={true}
    />
  )
}

export const FormSection = ({ title, children }) => {
  return (
    <Card size='3' className='shadow-md'>
      <Flex direction={'column'} gap={'3'} mb={'4'}>
        <Text size="4" weight="medium" as='p'>
          {title}
        </Text>
        <Separator size={'4'} />
      </Flex>
      <div className='space-y-4'>
        {children}
      </div>
    </Card>
  )
}