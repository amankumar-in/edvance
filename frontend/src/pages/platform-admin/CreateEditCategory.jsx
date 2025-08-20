import { Badge, Box, Button, Card, Flex, Heading, Select, Separator, Text, TextArea, TextField } from '@radix-ui/themes';
import { Activity, ArrowLeft, Book, Calculator, Calendar, Droplet, Eye, EyeOff, Home, Info, Microscope, Music, Pen, Save, Settings, ThumbsUp, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useCreateTaskCategory, useDeleteTaskCategory, useUpdateTaskCategory } from '../../api/task-category/taskCategory.mutations';
import { useGetTaskCategories, useGetTaskCategoryById } from '../../api/task-category/taskCategory.queries';
import { ConfirmationDialog, Loader } from '../../components';

// Icon mapping for categories
const iconMap = {
  calculator: Calculator,
  book: Book,
  microscope: Microscope,
  pen: Pen,
  home: Home,
  droplet: Droplet,
  'thumbs-up': ThumbsUp,
  calendar: Calendar,
  activity: Activity,
  music: Music,
  settings: Settings,
};

const CreateEditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { data: category, isFetching: isLoadingCategory } = useGetTaskCategoryById(id);
  const { data: taskCategories } = useGetTaskCategories({ role: 'platform_admin' });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      icon: 'settings',
      color: '#4285F4',
      type: '',
      defaultPointValue: 10,
      visibility: 'private',
      displayOrder: 0,
      parentCategory: '',
      subject: '',
      gradeLevel: '',
      schoolId: '',
      role: 'platform_admin',
    },
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { mutate: createTaskCategory, isPending: isCreating } = useCreateTaskCategory();
  const { mutate: updateTaskCategory, isPending: isUpdating } = useUpdateTaskCategory();
  const { mutate: deleteTaskCategory, isPending: isDeleting } = useDeleteTaskCategory();

  // Watch form values for preview
  const formData = watch();

  // Grade options - exactly like in CreateStudentProfile
  const gradeOptions = [
    'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade',
    '11th Grade', '12th Grade'
  ];

  // Options
  const typeOptions = [
    { value: 'academic', label: 'Academic' },
    { value: 'home', label: 'Home' },
    { value: 'behavior', label: 'Behavior' },
    { value: 'extracurricular', label: 'Extracurricular' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'custom', label: 'Custom' },
  ];

  const visibilityOptions = [
    { value: 'private', label: 'Private' },
    { value: 'family', label: 'Family' },
    { value: 'class', label: 'Class' },
    { value: 'school', label: 'School' },
    { value: 'public', label: 'Public' },
  ];

  const iconPresets = [
    { value: 'calculator', label: 'Calculator', category: 'academic' },
    { value: 'book', label: 'Book', category: 'academic' },
    { value: 'microscope', label: 'Microscope', category: 'academic' },
    { value: 'pen', label: 'Pen', category: 'academic' },
    { value: 'home', label: 'Home', category: 'home' },
    { value: 'droplet', label: 'Droplet', category: 'home' },
    { value: 'thumbs-up', label: 'Thumbs Up', category: 'behavior' },
    { value: 'calendar', label: 'Calendar', category: 'attendance' },
    { value: 'activity', label: 'Activity', category: 'extracurricular' },
    { value: 'music', label: 'Music', category: 'extracurricular' },
    { value: 'settings', label: 'Settings', category: 'custom' },
  ];

  const colorPresets = [
    { color: '#4285F4', name: 'Blue', category: 'academic' },
    { color: '#34A853', name: 'Green', category: 'academic' },
    { color: '#FBBC05', name: 'Yellow', category: 'academic' },
    { color: '#EA4335', name: 'Red', category: 'academic' },
    { color: '#8E44AD', name: 'Purple', category: 'home' },
    { color: '#3498DB', name: 'Light Blue', category: 'home' },
    { color: '#2ECC71', name: 'Emerald', category: 'behavior' },
    { color: '#F39C12', name: 'Orange', category: 'attendance' },
    { color: '#E74C3C', name: 'Crimson', category: 'extracurricular' },
    { color: '#9B59B6', name: 'Violet', category: 'extracurricular' },
  ];

  // Load data for editing
  useEffect(() => {
    if (isEdit && !isLoadingCategory && category) {
      reset({ ...category.data });

      setTimeout(() => {
        setValue('type', category.data.type);
        setValue('visibility', category.data.visibility);
        setValue('gradeLevel', category.data.gradeLevel);
        setValue('parentCategory', category.data.parentCategory?._id);
      }, 0);
    }
  }, [isEdit, isLoadingCategory, category, reset, setValue]);

  // Submit form
  const onSubmit = async (data) => {
    // If mode is edit, update the category
    if (isEdit) {
      updateTaskCategory({ id, data }, {
        onSuccess: () => {
          toast.success('Category updated successfully');
          navigate('/platform-admin/dashboard/task-categories');
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || error?.message || 'Failed to update category');
        }
      });
    } else {
      // else, create the category
      createTaskCategory(data, {
        onSuccess: () => {
          toast.success('Category created successfully');
          navigate('/platform-admin/dashboard/task-categories');
        },
        onError: (error) => {
          console.error('Failed to create category:', error);
          toast.error(error?.response?.data?.message || error?.message || 'Failed to create category');
        }
      });
    }
  };

  const handleDelete = () => {
    if (!id) return;
    deleteTaskCategory(id, {
      onSuccess: () => {
        toast.success('Category deleted successfully');
        navigate('/platform-admin/dashboard/task-categories');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to delete category');
      }
    });
  };

  const renderIcon = (iconName, size = 20) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={size} /> : <Settings size={size} />;
  };

  const filteredIcons = iconPresets.filter(icon =>
    formData.type === 'custom' || icon.category === formData.type || icon.category === 'academic'
  );

  const filteredColors = colorPresets.filter(color =>
    formData.type === 'custom' || color.category === formData.type || color.category === 'academic'
  );

  if (isLoadingCategory) {
    return (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="6">
        {/* Header */}
        <Flex justify="between" align="center" gap="4" wrap="wrap">
          <div className='space-y-3'>
            <Button
              type="button"
              variant="ghost"
              color="gray"
              asChild
            >
              <Link to="/platform-admin/dashboard/task-categories">
                <ArrowLeft size={16} />
                Back to Categories
              </Link>
            </Button>
            <div className='space-y-1'>
              <Heading size="6" weight="medium">
                {isEdit ? 'Edit Category' : 'Create New Category'}
              </Heading>
              <Text as="p" color="gray" size="2">
                {isEdit ? 'Modify category settings and properties' : 'Define a new task category for the system'}
              </Text>
            </div>
          </div>

          <Flex align="center" gap="2" wrap="wrap">
            <Button
              type="button"
              variant="soft"
              color="gray"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              color='grass'
            >
              <Save size={16} />
              {isCreating || isUpdating ? 'Saving...' : (isEdit ? 'Update Category' : 'Create Category')}
            </Button>
            {isEdit && (
              <>
                <Button
                  type="button"
                  color="red"
                  variant="soft"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 size={16} /> Delete
                </Button>
                <ConfirmationDialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                  title="Delete Category"
                  description={"Are you sure you want to delete this category? This action cannot be undone. Any tasks using this category will need to be reassigned."}
                  onConfirm={handleDelete}
                  confirmText="Delete Category"
                  confirmColor="red"
                  isLoading={isDeleting}
                  confirmIcon={<Trash2 size={16} />}
                />
              </>
            )}
          </Flex>
        </Flex>

        {/* Preview Card */}
        {showPreview && (
          <Card className='max-w-4xl'>
            <Box p={'2'}>
              <Text as="p" size="2" weight="medium" mb="4">Category Preview</Text>
              <Flex align="start" gap="3">
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: formData.color,
                    borderRadius: '8px',
                    color: 'white'
                  }}
                >
                  {renderIcon(formData.icon, 24)}
                </Flex>
                <Box>
                  <Text weight="bold" size="4">
                    {formData.name || 'Category Name'}
                  </Text>
                  <Text size="2" color="gray" style={{ display: 'block' }}>
                    {formData.description || 'Category description will appear here'}
                  </Text>
                  <Flex gap="2" mt="2">
                    <Badge color="blue" variant="soft" size="1">
                      {formData.type}
                    </Badge>
                    <Badge color="green" variant="soft" size="1">
                      {formData.defaultPointValue} pts
                    </Badge>
                    <Badge
                      color={formData.visibility === 'public' ? 'green' : 'gray'}
                      variant="soft"
                      size="1"
                    >
                      {formData.visibility}
                    </Badge>
                  </Flex>
                </Box>
              </Flex>
            </Box>
          </Card>
        )}

        {/* Main Form */}
        <Flex direction="column" gap="8" className='max-w-4xl'>
          {/* Basic Information */}
          <Flex direction="column" gap="4">
            <Flex align="center" gap="2">
              <Text size="4" weight="medium">Basic Information</Text>
              <Badge color="red" variant="surface" size="1">Required</Badge>
            </Flex>
            <Separator size='4' />
            <div className='space-y-4'>
              <Flex gap="3" align={'center'} className='flex-col sm:flex-row'>
                {/* Category Name */}
                <Box className='w-full'>
                  <label>
                    <Text size="2" weight="medium" mb="2">Category Name *</Text>
                    <TextField.Root
                      placeholder="Enter category name"
                      color={errors.name ? 'red' : undefined}
                      {...register('name', {
                        required: 'Category name is required',
                        minLength: {
                          value: 2,
                          message: 'Category name must be at least 2 characters'
                        },
                        maxLength: {
                          value: 50,
                          message: 'Category name must be less than 50 characters'
                        }
                      })}
                    />
                    <Text size="1" color="gray">A short, descriptive name for this category.</Text>
                    {errors.name && (
                      <Text as="p" size="1" color="red" className='flex gap-1 items-center mt-1'>
                        <Info size={12} /> {errors.name.message}
                      </Text>
                    )}
                  </label>
                </Box>

                {/* Category Type */}
                <Box className='w-full'>
                  <label className='w-full'>
                    <Text as='p' size="2" weight="medium" mb="1">Type *</Text>
                    <Controller
                      name="type"
                      control={control}
                      rules={{ required: 'Category type is required' }}
                      render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange}>
                          <Select.Trigger placeholder='Select Type' className='w-full' />
                          <Select.Content variant='soft' position='popper'>
                            {typeOptions.map(option => (
                              <Select.Item key={option.value} value={option.value}>
                                {option.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                    <Text size="1" color="gray">Choose the main purpose for this category.</Text>
                    {errors.type && (
                      <Text as="p" size="1" color="red" className='flex gap-1 items-center mt-1'>
                        <Info size={12} /> {errors.type.message}
                      </Text>
                    )}
                  </label>
                </Box>
              </Flex>

              <div>
                <label>
                  <Text as='p' size="2" weight="medium" mb="1">Description</Text>
                  <TextArea
                    placeholder="Describe the purpose and scope of this category"
                    rows={3}
                    {...register('description', {
                      maxLength: {
                        value: 500,
                        message: 'Description must be less than 500 characters'
                      }
                    })}
                  />
                  <Text size="1" color="gray" mt="1">Optional. Add details to help others understand this category.</Text>
                  {errors.description && (
                    <Text as="p" size="1" color="red" className='flex gap-1 items-center mt-1'>
                      <Info size={12} /> {errors.description.message}
                    </Text>
                  )}
                </label>
              </div>
            </div>
          </Flex>

          {/* Visual Appearance */}
          <Box>
            <Flex direction="column" gap="4">
              <Text size="4" weight="medium">Visual Appearance</Text>
              <Separator size='4' />
              <div className='space-y-4'>
                <Box>
                  <Text size="2" weight="medium" mb="2">Icon</Text>
                  <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                      <Flex gap="2" wrap="wrap">
                        {filteredIcons.map(icon => (
                          <button
                            key={icon.value}
                            type="button"
                            onClick={() => field.onChange(icon.value)}
                            style={{
                              padding: '8px',
                              backgroundColor: field.value === icon.value ? 'var(--accent-3)' : 'var(--gray-2)',
                              border: field.value === icon.value ? '1px solid var(--accent-9)' : '1px solid var(--gray-6)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                              minWidth: '60px'
                            }}
                          >
                            {renderIcon(icon.value, 20)}
                            <Text size="1">{icon.label}</Text>
                          </button>
                        ))}
                      </Flex>
                    )}
                  />
                  <Text size="1" color="gray" mt="1">Pick an icon to visually represent this category.</Text>
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2">Color</Text>
                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <Flex gap="2" align="center" wrap="wrap">
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          style={{
                            width: '40px',
                            height: '40px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        />
                        {filteredColors.map(color => (
                          <button
                            key={color.color}
                            type="button"
                            onClick={() => field.onChange(color.color)}
                            style={{
                              width: '32px',
                              height: '32px',
                              backgroundColor: color.color,
                              border: field.value === color.color ? '3px solid var(--accent-9)' : '1px solid var(--gray-6)',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            title={color.name}
                          />
                        ))}
                      </Flex>
                    )}
                  />
                  <Text size="1" color="gray" mt="1">Choose a color for the category icon background.</Text>
                </Box>
              </div>
            </Flex>
          </Box>

          {/* Configuration */}
          <Box>
            <Flex direction="column" gap="4">
              <Text size="4" weight="medium">Configuration</Text>
              <Separator size='4' />
              <div className='space-y-4'>
                <Box>
                  <label>
                    <Text as='p' size="2" weight="medium" mb="1">Parent Category</Text>
                    <Controller
                      name="parentCategory"
                      control={control}
                      render={({ field }) => (
                        <Select.Root
                          value={field.value || "none"}
                          onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                        >
                          <Select.Trigger className='w-full' />
                          <Select.Content variant='soft' position='popper'>
                            <Select.Item value="none">No Parent (Top-level Category)</Select.Item>
                            {taskCategories?.data?.filter(category => category._id !== id).map((category) => (
                              <Select.Item key={category._id} value={category._id}>
                                {category.name}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                    <Text as='p' size="1" color="gray" mt="1">
                      Select a parent to create a sub-category. Leave blank for a top-level category.
                    </Text>
                  </label>
                </Box>

                <Flex gap="3" className='flex-col sm:flex-row'>
                  <div>
                    <label>
                      <Text as='p' size="2" weight="medium" mb="1">Default Point Value *</Text>
                      <TextField.Root
                        type="number"
                        placeholder="10"
                        min="1"
                        max="1000"
                        color={errors.defaultPointValue ? 'red' : undefined}
                        {...register('defaultPointValue', {
                          required: 'Default point value is required',
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: 'Point value must be at least 1'
                          },
                          max: {
                            value: 1000,
                            message: 'Point value must be less than 1000'
                          }
                        })}
                      />
                      <Text size="1" color="gray" mt="1">Points awarded by default for tasks in this category.</Text>
                      {errors.defaultPointValue && (
                        <Text as="p" size="1" color="red" className='flex gap-1 items-center mt-1'>
                          <Info size={12} /> {errors.defaultPointValue.message}
                        </Text>
                      )}
                    </label>
                  </div>

                  <div>
                    <label>
                      <Text as='p' size="2" weight="medium" mb="1">Display Order</Text>
                      <TextField.Root
                        type="number"
                        placeholder="0"
                        min="0"
                        {...register('displayOrder', {
                          valueAsNumber: true,
                          min: {
                            value: 0,
                            message: 'Display order must be 0 or greater'
                          }
                        })}
                      />
                      <Text size="1" color="gray" mt="1">Lower numbers appear first in lists.</Text>
                      {errors.displayOrder && (
                        <Text as="p" size="1" color="red" className='flex gap-1 items-center mt-1'>
                          <Info size={12} /> {errors.displayOrder.message}
                        </Text>
                      )}
                    </label>
                  </div>
                </Flex>

                <Box>
                  <label>
                    <Text as='p' size="2" weight="medium" mb="1">Visibility *</Text>
                    <Controller
                      name="visibility"
                      control={control}
                      rules={{ required: 'Visibility is required' }}
                      render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange}>
                          <Select.Trigger className='w-full' />
                          <Select.Content variant='soft' position='popper'>
                            {visibilityOptions.map(option => (
                              <Select.Item key={option.value} value={option.value}>
                                {option.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                    <Text size="1" color="gray" mt="1">Who can see and use this category.</Text>
                    {errors.visibility && (
                      <Text as="p" size="1" color="red" className='flex gap-1 items-center mt-1'>
                        <Info size={12} /> {errors.visibility.message}
                      </Text>
                    )}
                  </label>
                </Box>
              </div>
            </Flex>
          </Box>

          {/* Academic Settings */}
          {(formData.type === 'academic' || formData.type === 'custom') && (
            <Box>
              <Flex direction="column" gap="4">
                <Text size="4" weight="medium">Academic Settings</Text>
                <Separator size='4' />
                <Flex gap="3" className='flex-col sm:flex-row'>
                  <Box className='w-full'>
                    <label>
                      <Text as='p' size="2" weight="medium" mb="1">Subject</Text>
                      <TextField.Root
                        placeholder="e.g., Mathematics, English, Science"
                        {...register('subject', {
                          maxLength: {
                            value: 50,
                            message: 'Subject must be less than 50 characters'
                          }
                        })}
                      />
                      <Text size="1" color="gray" mt="1">Optional. Specify a subject for academic categories.</Text>
                      {errors.subject && (
                        <Text as="p" size="1" color="red" className='flex gap-1 items-center mt-1'>
                          <Info size={12} /> {errors.subject.message}
                        </Text>
                      )}
                    </label>
                  </Box>

                  <Box className='w-full'>
                    <label>
                      <Text as='p' size="2" weight="medium" mb="1">Grade Level</Text>
                      <Controller
                        name="gradeLevel"
                        control={control}
                        render={({ field }) => (
                          <Select.Root value={field.value} onValueChange={field.onChange}>
                            <Select.Trigger placeholder='Select Grade' className='w-full' />
                            <Select.Content variant='soft' position='popper'>
                              {gradeOptions.map((grade) => (
                                <Select.Item key={grade} value={grade} className='capitalize'>
                                  {grade}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        )}
                      />
                      <Text size="1" color="gray" mt="1">Optional. Select a grade level for this category.</Text>
                      {errors.gradeLevel && (
                        <Text as="p" size="1" color="red" className='flex gap-1 items-center mt-1'>
                          <Info size={12} /> {errors.gradeLevel.message}
                        </Text>
                      )}
                    </label>
                  </Box>
                </Flex>
              </Flex>
            </Box>
          )}

          {/* School Settings */}
          <Box>
            <Flex direction="column" gap="4">
              <Text size="4" weight="medium">School Settings</Text>
              <Separator size='4' />
              <Box>
                <label>
                  <Text as='p' size="2" weight="medium" mb="1">School ID</Text>
                  <TextField.Root
                    placeholder="Leave empty for system-wide categories"
                    {...register('schoolId', {
                      maxLength: {
                        value: 50,
                        message: 'School ID must be less than 50 characters'
                      }
                    })}
                  />
                  <Text size="1" color="gray" mt="1">Optional. Assign to a specific school if needed.</Text>
                  {errors.schoolId && (
                    <Text as="p" size="1" color="red" className='flex gap-1 items-center mt-1'>
                      <Info size={12} /> {errors.schoolId.message}
                    </Text>
                  )}
                </label>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </form>
  );
};

export default CreateEditCategory; 