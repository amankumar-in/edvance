import { Box, Button, Callout, Card, Flex, Heading, Radio, Select, Separator, Text, TextArea, TextField, Tooltip } from '@radix-ui/themes';
import { ArrowLeft, Eye, Info, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';
import AsyncSelect from 'react-select/async';
import { toast } from 'sonner';
import { searchParents, searchStudents } from '../../api/search/search.api';
import { useGetTaskCategories } from '../../api/task-category/taskCategory.queries';
import { useCreateTask, useUpdateTask } from '../../api/task/task.mutations';
import { useGetTaskById } from '../../api/task/task.queries';
import { Container, FileUpload, FormFieldErrorMessage, Loader } from '../../components';
import PreviewTaskForm from './components/PreviewTaskForm';

const CreateTask = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [isFormReady, setIsFormReady] = useState(!isEdit);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
    getValues,
    setValue,
    reset
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      pointValue: 10,
      dueDate: '',
      requiresApproval: true,
      approverType: 'system',
      subCategory: '',
      selectedPeople: [],
      assigned: '',
      difficulty: 'easy',
      externalResource: {
        platform: '',
        resourceId: '',
        url: ''
      },
      attachments: [],
      existingAttachments: [],
      schoolId: '',
      classId: ''
    },
  });

  // watch form values
  const requiresApproval = watch('requiresApproval') === 'true';
  const assigned = watch('assigned')
  const subCategory = watch('subCategory')
  const externalResourcePlatform = watch('externalResource.platform')
  const externalResourceResourceId = watch('externalResource.resourceId')
  const externalResourceUrl = watch('externalResource.url')
  const [schoolId, classId] = watch(['schoolId', 'classId'])

  // preview task form
  const [previewTaskFormOpen, setPreviewTaskFormOpen] = useState(false);

  // create and update task
  const { mutate: createTask, isPending: isCreating, isError: isCreateError, error: createError } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating, isError: isUpdateError, error: updateError } = useUpdateTask();

  // get task for editing
  const { data: taskData, isLoading: isLoadingTask } = useGetTaskById(id);
  const { data: task } = taskData ?? {};

  const isPending = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;

  // get all task categories
  const { data: taskCategories } = useGetTaskCategories({ role: 'platform_admin' })

  // Set point value based on category
  useEffect(() => {
    if (taskCategories?.data && subCategory) {
      const selectedCategory = taskCategories.data.find(cat => cat.name === subCategory);
      if (selectedCategory) {
        setValue('pointValue', selectedCategory.defaultPointValue || 10);
      }
    }
  }, [subCategory, taskCategories, setValue]);

  // set approver type based on assigned
  useEffect(() => {
    if (assigned === 'school') setValue('approverType', 'teacher');
    if (assigned === 'student' || assigned === 'parent') setValue('approverType', 'parent');
  }, [assigned]);

  // populate form when editing
  useEffect(() => {
    if (isEdit && task && !isLoadingTask) {

      // Prepare all form data with proper formatting
      const formData = {
        title: task.title || '',
        description: task.description || '',
        pointValue: task.pointValue || undefined,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
        requiresApproval: task.requiresApproval ? 'true' : 'false',
        approverType: task.approverType || 'system',
        subCategory: task.subCategory || '',
        selectedPeople: [], // We'll handle this separately
        assigned: task.assignedTo?.role || '',
        difficulty: task.difficulty || '',
        externalResource: {
          platform: task.externalResource?.platform || '',
          resourceId: task.externalResource?.resourceId || '',
          url: task.externalResource?.url || ''
        },
        attachments: [], // New attachments to be uploaded
        existingAttachments: task.attachments || [], // Existing attachments from the task
        schoolId: task.schoolId || '',
        classId: task.classId || ''
      };

      // Reset with all data at once - this should work better
      reset(formData);
      setIsFormReady(true);
    }
  }, [isEdit, task, isLoadingTask, reset, setValue])

  // Handle file changes from FileUpload component
  const handleFileChange = (newAttachments, existingAttachments = []) => {
    setValue('attachments', newAttachments);
    setValue('existingAttachments', existingAttachments);
  };

  // Form submission handler
  const onSubmit = async (data) => {
    const formData = new FormData();

    // 1. BASIC TASK INFORMATION
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('pointValue', parseInt(data.pointValue));
    formData.append('role', 'platform_admin');

    // 2. DUE DATE HANDLING
    if (data.dueDate && data.dueDate.trim() !== '') {
      formData.append('dueDate', new Date(data.dueDate).toISOString());
    } else if (isEdit) {
      formData.append('dueDate', ''); // Clear due date when editing
    }

    // 3. APPROVAL SETTINGS
    const requiresApproval = data.requiresApproval === 'true';
    formData.append('requiresApproval', requiresApproval);

    /* 
      - If approval is required:
      - For rewards assigned to a school, a teacher is set as the approver, and both schoolId and classId are included.
      - For rewards assigned to a student or a parent, a parent is set as the approver.
    */
    if (requiresApproval) {
      if (assigned === 'school') {
        formData.append('approverType', 'teacher');
        formData.append('schoolId', schoolId || '');
        formData.append('classId', classId || '');
      }
      if (assigned === 'student') {
        formData.append('approverType', 'parent');
      }
      if (assigned === 'parent') {
        formData.append('approverType', 'parent');
      }
    }

    // 4. ASSIGNMENT DATA
    const assignedTo = {
      role: assigned,
      selectedPeopleIds: data.selectedPeople.length > 0
        ? data.selectedPeople.map(person => person.value)
        : []
    };
    formData.append('assignedTo', JSON.stringify(assignedTo));

    // 5. CATEGORY INFORMATION
    const categoryData = taskCategories?.data.filter(cat => cat.name === subCategory)?.[0];
    if (categoryData) {
      formData.append('category', categoryData.type);
      formData.append('subCategory', subCategory);
    }

    // 6. EXTERNAL RESOURCE HANDLING
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
    } else if (isEdit) {
      formData.append('externalResource', JSON.stringify({})); // Clear external resource when editing
    }

    // 7. DIFFICULTY LEVEL
    if (data.difficulty) {
      formData.append('difficulty', data.difficulty);
    }

    // 8. FILE ATTACHMENTS
    // Add new attachments
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach(attachment => {
        if (attachment.file) {
          formData.append('attachments', attachment.file);
        }
      });
    }

    // Handle existing attachments (for updates)
    if (isEdit) {
      const existingAttachments = data.existingAttachments && data.existingAttachments.length > 0
        ? data.existingAttachments
        : [];
      formData.append('existingAttachments', JSON.stringify(existingAttachments));
    }

    // 9. SUBMIT TO API
    const successMessage = isEdit ? 'Task updated successfully' : 'Task created successfully';
    const errorMessage = isEdit ? 'Failed to update task' : 'Failed to create task';
    const mutation = isEdit ? updateTask : createTask;
    const mutationData = isEdit ? { id, data: formData } : formData;

    mutation(mutationData, {
      onSuccess: () => {
        toast.success(successMessage);
        navigate('/platform-admin/dashboard/tasks');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || errorMessage);
      }
    });
  };

  // load options for async select
  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];

    // search students
    if (assigned === 'student') {
      const response = await searchStudents({ email: inputValue });
      console.log(response.data.students);
      return response.data.students.map((student) => ({
        label: `${student?.user?.email}, ${student?.user?.firstName} ${student?.user?.lastName}`,
        value: student._id,
      }));
    }
    // search parents
    if (assigned === 'parent') {
      const response = await searchParents({ email: inputValue });
      return response.data.parents.map((parent) => ({
        label: `${parent?.user?.email}, ${parent?.user?.firstName} ${parent?.user?.lastName}`,
        value: parent._id,
      }));
    }
  }

  // Show loading state when fetching task for editing or when form is not ready
  if (isEdit && (isLoadingTask || !isFormReady)) {
    return (
      <Container>
        <Flex justify="center">
          <Loader />
        </Flex>
      </Container>
    );
  }

  return (
    <Container>
      <div className="pb-8 mx-auto space-y-6 max-w-4xl">
        {/* Header */}
        <Box>
          <Button
            variant="ghost"
            color="gray"
            asChild
            size="2"
            className="mb-4"
          >
            <Link to={'/platform-admin/dashboard/tasks'}>
              <ArrowLeft size={16} /> Back to Tasks
            </Link>
          </Button>
          <Flex justify={'between'} align={'start'} wrap='wrap' gap='2'>
            <Flex direction={'column'}>
              <Heading as="h1" size="6" weight="medium">
                {isEdit ? 'Edit Task' : 'Create New Task'}
              </Heading>
              <Text color="gray" size="2" className="mt-1">
                {isEdit
                  ? 'Modify the existing task details and settings.'
                  : 'Create a new task for students to complete and earn scholarship points.'
                }
              </Text>
            </Flex>

            <Flex gap='2' align='center' wrap='wrap' >
              {/* Preview Task Button */}
              <Tooltip content={!isValid ? "Fill required fields to enable preview" : "Preview task before creating"}>
                <Button
                  type='button'
                  variant='outline'
                  color='gray'
                  disabled={!isValid}
                  onClick={() => setPreviewTaskFormOpen(true)}
                >
                  <Eye size={16} /> Preview Task
                </Button>
              </Tooltip>

              {/* Create/Update Task Button */}
              <Button
                type="submit"
                color="grass"
                disabled={isPending}
                onClick={handleSubmit(onSubmit)}
              >
                <Plus size={16} />
                {isPending
                  ? (isEdit ? 'Updating...' : 'Creating...')
                  : (isEdit ? 'Update Task' : 'Create Task')
                }
              </Button>
            </Flex>
          </Flex>
        </Box>
        <Text as="p" size="1" color="gray" className='italic'>
          * Required fields
        </Text>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {
            (isError) && (
              <Callout.Root
                color="red"
                variant="surface"
              >
                <Callout.Icon>
                  <Info size={16} />
                </Callout.Icon>
                <Callout.Text>
                  {error?.response?.data?.message ||
                    "Failed to create task."}
                </Callout.Text>
              </Callout.Root>
            )
          }
          {/* Task Info - title, description, scholarship points, due date */}
          <FormSection title={'Task Info'} >
            <Flex gap="4" className="flex-col md:flex-row">
              {/* Task title */}
              <div className="flex-1">
                <label>
                  <Text as="div" size="2" mb="2" weight="medium">
                    Task Title *
                  </Text>
                  <TextField.Root placeholder="Enter task title" className="w-full" {...register('title', {
                    required: "Task title is required"
                  })} />
                  <Text as="p" size="1" color="gray" mt="1">
                    Choose a clear, descriptive title that explains what students need to do
                  </Text>
                  <FormFieldErrorMessage errors={errors} field="title" />
                </label>
              </div>

              {/* Due date */}
              <div className="flex-1">
                <label>
                  <Text as="div" size="2" mb="2" weight="medium">
                    Due Date
                  </Text>
                  <TextField.Root type="datetime-local" className='w-max' {...register('dueDate', {
                    validate: (value) => {
                      if (!value || value.trim() === '') return true;

                      const dateValue = new Date(value);
                      if (isNaN(dateValue.getTime())) return "Please enter a valid date";

                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // zero out time
                      return dateValue >= today || "Due date must be today or in the future";
                    },
                  })} />
                  <Text as="p" size="1" color="gray" mt="1">
                    Set a reasonable deadline that gives students enough time to complete the task
                  </Text>
                  <FormFieldErrorMessage errors={errors} field="dueDate" />
                </label>
              </div>


            </Flex>
            <Flex gap="4" className="flex-col md:flex-row">
              {/* Task description */}
              <div className='flex-1'>
                <label>
                  <Text as="div" size="2" mb="2" weight="medium">
                    Task Description
                  </Text>
                  <TextArea placeholder="Enter task description"
                    resize={'vertical'}
                    {...register("description")}
                    className="w-full" />
                  <Text as="p" size="1" color="gray" mt="1">
                    Provide clear instructions and all details needed to complete the task successfully
                  </Text>
                </label>
              </div>

            </Flex>
          </FormSection>

          {/* Categorization - category, difficulty */}
          <FormSection title={'Categorization'}>
            <Flex gap="4" className="flex-col md:flex-row">
              {/* Task Category */}
              <div className='flex-1'>
                <label>
                  <Text as="div" size="2" mb="2" weight="medium">
                    Task Category *
                  </Text>
                  <Controller
                    name="subCategory"
                    control={control}
                    rules={{ required: 'Please select a category' }}
                    render={({ field }) => {
                      // Group categories by type
                      const groupedCategories = taskCategories?.data?.reduce((acc, category) => {
                        const type = category.type || 'Other';
                        if (!acc[type]) {
                          acc[type] = [];
                        }
                        acc[type].push(category);
                        return acc;
                      }, {}) || {};

                      return (
                        <Select.Root value={field.value} onValueChange={field.onChange}>
                          <Select.Trigger placeholder="Select category" className="w-full" />
                          <Select.Content variant="soft" position="popper">
                            {Object.entries(groupedCategories).map(([type, categories], index) => (
                              <Select.Group key={type}>
                                <Select.Label className='text-xs capitalize'>
                                  {type}
                                </Select.Label>
                                {categories.map((category) => (
                                  <Select.Item key={category._id} value={category.name} className='capitalize'>
                                    {category.name}
                                  </Select.Item>
                                ))}
                                <Select.Separator className={index === Object.entries(groupedCategories).length - 1 ? 'hidden' : ''} />
                              </Select.Group>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      );
                    }}
                  />
                </label>
                <Text as="p" size="1" color="gray" mt="1">
                  Select the category that best describes the task
                </Text>
                <FormFieldErrorMessage errors={errors} field="subCategory" />
              </div>

              {/* Difficulty Level */}
              <div className='flex-1'>
                <label>
                  <Text as="div" size="2" mb="2" weight="medium">
                    Difficulty Level
                  </Text>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <Select.Root value={field.value} onValueChange={field.onChange}>
                        <Select.Trigger placeholder="Select difficulty" className="w-full" />
                        <Select.Content variant="soft" position="popper">
                          <Select.Item value="easy">Easy</Select.Item>
                          <Select.Item value="medium">Medium</Select.Item>
                          <Select.Item value="hard">Hard</Select.Item>
                          <Select.Item value="challenging">Challenging</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    )}
                  />
                  <Text as="p" size="1" color="gray" mt="1">
                    Set the difficulty level to help students understand the task complexity
                  </Text>
                </label>
              </div>
            </Flex>

            <Flex gap="4" className="flex-col md:flex-row">
              {/* Scholarship points */}
              <div className="flex-1">
                <label>
                  <Text as="div" size="2" mb="2" weight="medium">
                    Scholarship Points *
                  </Text>
                  <TextField.Root type="number" placeholder="Enter points" className="w-full" {...register('pointValue', {
                    valueAsNumber: true,
                    required: "Scholarship points are required",
                    min: {
                      value: 1,
                      message: "Points must be greater than 0"
                    }
                  })} />
                  <Text as="p" size="1" color="gray" mt="1">
                    This field will automatically fill based on the Task category selected
                  </Text>
                  <FormFieldErrorMessage errors={errors} field="pointValue" />
                </label>
              </div>
            </Flex>
          </FormSection>

          {/* Resources & Attachments */}
          <FormSection title={'Resources & Attachments'}>
            {/* External Resource */}
            <div className="space-y-4">
              <Text as="div" size="3" weight="medium">
                External Resource
              </Text>
              <Text as="p" size="1" color="gray">
                Link to external platforms or resources (e.g., Khan Academy, YouTube, etc.)
              </Text>

              <Flex gap="4" className="flex-col md:flex-row">
                <div className="flex-1">
                  <label>
                    <Text as="div" size="2" mb="2" weight="medium">
                      Platform Name
                    </Text>
                    <TextField.Root
                      placeholder="e.g., Khan Academy, YouTube"
                      className="w-full"
                      {...register('externalResource.platform', {
                        required: {
                          value: (externalResourceUrl && externalResourceUrl.trim() !== ''),
                          message: 'Platform name is required when URL is provided'
                        }
                      })}
                    />
                  </label>
                  <FormFieldErrorMessage errors={errors} field="externalResource.platform" />
                </div>

                <div className="flex-1">
                  <label>
                    <Text as="div" size="2" mb="2" weight="medium">
                      Resource ID
                    </Text>
                    <TextField.Root
                      placeholder="e.g., video ID, lesson ID"
                      className="w-full"
                    />
                  </label>
                  <FormFieldErrorMessage errors={errors} field="externalResource.resourceId" />
                </div>
              </Flex>

              <div>
                <label>
                  <Text as="div" size="2" mb="2" weight="medium">
                    Resource URL
                  </Text>
                  <TextField.Root
                    placeholder="https://..."
                    className="w-full"
                    {...register('externalResource.url', {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: "Please enter a valid URL starting with http:// or https://"
                      },
                      required: {
                        value: (externalResourcePlatform && externalResourcePlatform.trim() !== ''),
                        message: 'Resource URL is required when Platform is provided'
                      }
                    })}
                  />
                  <FormFieldErrorMessage errors={errors} field="externalResource.url" />
                </label>
              </div>
            </div>

            {/* File Attachments */}
            <div className="space-y-4">
              <Text as="div" size="3" weight="medium">
                File Attachments
              </Text>
              <Text as="p" size="1" color="gray">
                Upload supporting materials, instructions, or examples (Max 5 files, 10MB each)
              </Text>

              <FileUpload
                onFilesChange={handleFileChange}
                existingAttachments={watch('existingAttachments') || []}
              />
            </div>
          </FormSection>

          {/* Assignment - assigned to */}
          <FormSection title={'Assignment'}>
            {/* Assigned to */}
            <Flex gap="4" className="flex-col lg:flex-row">
              <div className="flex-1">
                <Text as="label" htmlFor='assigned' size="2" weight="medium">
                  Assign To *
                </Text>
                <div className='mt-2'>
                  <Flex align="start" gap="4">

                    <Flex asChild gap="2">
                      <Text as="label" size="2">
                        <Radio id='assigned' {...register('assigned', {
                          required: "Assigned to is required"
                        })} value="student" />
                        All Students
                      </Text>
                    </Flex>

                    <Flex asChild gap="2">
                      <Text as="label" size="2">
                        <Radio
                          id='assigned'
                          {...register('assigned', {
                            required: "Assigned to is required"
                          })}
                          value="parent"
                        />
                        Parents
                      </Text>
                    </Flex>

                    <Flex asChild gap="2">
                      <Text as="label" size="2">
                        <Radio id='assigned' {...register('assigned', {
                          required: "Assigned to is required"
                        })} value="school" />
                        School
                      </Text>
                    </Flex>
                  </Flex>
                  <FormFieldErrorMessage errors={errors} field="assigned" />
                </div>
              </div>
              {!!assigned && assigned !== 'school' && (
                <div className='flex-1'>
                  <Callout.Root variant='surface' color='blue'>
                    <Callout.Icon>
                      <Info size={16} />
                    </Callout.Icon>
                    <Callout.Text>
                      This task will be visible to all {assigned}s.
                      To assign it to specific {assigned}s only, select them from the list below.
                    </Callout.Text>
                  </Callout.Root>
                  <div className='mt-4'>
                    <Controller
                      name="selectedPeople"
                      control={control}
                      defaultValue={[]}
                      render={({ field }) => (
                        <AsyncSelect
                          {...field}
                          isMulti
                          defaultOptions={false}
                          loadOptions={loadOptions}
                          onChange={field.onChange}
                          value={field.value}
                          placeholder={`Search and select ${assigned}s...`}
                        />
                      )}
                    />
                  </div>
                </div>
              )}
            </Flex>

            {/* School ID and Class ID */}
            {assigned === 'school' && <Flex gap="4" className="flex-col lg:flex-row">
              {/* School ID */}
              <div className="flex-1">
                <label>
                  <Text as="div" size="2" mb="2" weight="medium">
                    School ID
                  </Text>
                  <TextField.Root
                    placeholder="Enter school ID"
                    className="w-full"
                    {...register('schoolId', {
                      required: 'School ID is required',
                    })}
                  />
                  <Text as="p" size="1" color="gray" mt="1">
                    Leave empty for general tasks
                  </Text>
                  <FormFieldErrorMessage errors={errors} field="schoolId" />
                </label>
              </div>

              {/* Class ID */}
              <div className="flex-1">
                <label>
                  <Text as="div" size="2" mb="2" weight="medium">
                    Class ID
                  </Text>
                  <TextField.Root
                    placeholder="Enter class ID"
                    className="w-full"
                    {...register('classId')}
                  />
                  <Text as="p" size="1" color="gray" mt="1">
                    Leave empty for school-wide tasks
                  </Text>
                  <FormFieldErrorMessage errors={errors} field="classId" />
                </label>
              </div>
            </Flex>}
          </FormSection>

          {/* Approval settings - requires approval, who can approve this task */}
          <FormSection title={'Approval Settings'}>
            <Flex gap="4" className="flex-col md:flex-row">
              {/* Requires approval */}
              <div className="flex-1">
                <label>
                  <Text as="div" size="2" mb="2" weight="medium">
                    Requires Approval *
                  </Text>
                  <Flex align="start" gap="4">
                    <Flex asChild gap="2">
                      <Text as="label" size="2">
                        <Radio {...register('requiresApproval')} value={true} defaultChecked />
                        Yes
                      </Text>
                    </Flex>

                    <Flex asChild gap="2">
                      <Text as="label" size="2">
                        <Radio {...register('requiresApproval')} value={false} />
                        No
                      </Text>
                    </Flex>
                  </Flex>
                </label>
                <Text as="p" size="1" color="gray" mt="1">
                  Select whether the task requires approval or not
                </Text>
              </div>
            </Flex>
          </FormSection>
        </form>

        <PreviewTaskForm
          open={previewTaskFormOpen}
          setOpen={setPreviewTaskFormOpen}
          task={getValues()}
        />
      </div >
    </Container >
  );
};

export default CreateTask;

// This component is used to create a section in the form
export const FormSection = ({ title, children }) => {
  return (
    <Card className='shadow-md outline-none' size='3'>
      <Flex direction={'column'} gap={'3'} mb={'4'}>
        <Text size="4" weight="medium">
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
