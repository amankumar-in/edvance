import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  RadioGroup,
  Select,
  Separator,
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes';
import {
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Upload,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useCreateReward } from '../../api/rewards/rewards.mutations';
import { useGetRewardCategories } from '../../api/rewards/rewards.queries';
import { Container, FormFieldErrorMessage } from '../../components';

const CreateReward = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      pointsCost: undefined,
      categoryId: '',
      category: '',
      subcategory: '',
      limitedQuantity: false,
      quantity: undefined,
      expiryDate: '',
      image: '',
      redemptionInstructions: '',
      restrictions: '',
      schoolId: '',
      classId: '',
      isFeatured: false,
    },
  });

  // watch form values
  const limitedQuantity = watch('limitedQuantity');

  // Image upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Get reward categories from API
  const { data, isLoading: categoriesLoading, isError: categoriesError, error: categoriesErrorDetails } = useGetRewardCategories();

  // Safely extract categories with fallback
  const rewardCategories = data?.data?.categories || data?.categories || [];

  // Create reward mutation
  const { mutate: createReward, isPending, isError, error } = useCreateReward();

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG, JPEG, PNG, GIF, or WebP files are allowed');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Set suggested point value based on category
  useEffect(() => {
    const categoryId = watch('categoryId');
    if (rewardCategories && categoryId) {
      const selectedCategory = rewardCategories.find(cat => cat._id === categoryId);
      if (selectedCategory) {
        setValue('pointsCost', selectedCategory.minPointValue);
        setValue('category', selectedCategory.type);
        setValue('subcategory', selectedCategory.subcategoryType);
      }
    }
  }, [watch('categoryId'), rewardCategories, setValue]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // on submit
  const onSubmit = async (data) => {
    // Create FormData for file upload
    const formData = new FormData();

    // Add form fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('pointsCost', parseInt(data.pointsCost));
    formData.append('categoryId', data.categoryId);
    formData.append('limitedQuantity', data.limitedQuantity);
    formData.append('isFeatured', data.isFeatured);
    formData.append('role', 'platform_admin');

    if (data.limitedQuantity && data.quantity) {
      formData.append('quantity', parseInt(data.quantity));
    }

    if (data.expiryDate) {
      formData.append('expiryDate', new Date(data.expiryDate).toISOString());
    }

    if (data.redemptionInstructions) {
      formData.append('redemptionInstructions', data.redemptionInstructions);
    }

    if (data.restrictions) {
      formData.append('restrictions', data.restrictions);
    }

    if (data.schoolId) {
      formData.append('schoolId', data.schoolId);
    }

    if (data.classId) {
      formData.append('classId', data.classId);
    }

    // Add image file if selected
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    // Create reward using API
    createReward(formData, {
      onSuccess: () => {
        toast.success('Reward created successfully');
        navigate('/platform-admin/dashboard/rewards');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to create reward');
      }
    });
  };

  return (
    <Container>
      <div className="pb-8 space-y-6">
        {/* Header */}
        <Box>
          <Button
            variant="ghost"
            color="gray"
            asChild
            size="2"
            className="mb-4"
          >
            <Link to={'/platform-admin/dashboard/rewards'}>
              <ArrowLeft size={16} /> Back to Rewards
            </Link>
          </Button>
          <Flex justify={'between'} align={'start'} wrap='wrap' gap='2'>
            <Flex direction={'column'}>
              <Heading as="h1" size="6" weight="medium">Create New Reward</Heading>
              <Text color="gray" size="2" className="mt-1">
                Create a new reward that students can redeem with their scholarship points.
              </Text>
            </Flex>

            <Flex gap='2' align='center' wrap='wrap'>
              {/* Create Reward Button */}
              <Button
                type="submit"
                color="grass"
                disabled={isPending}
                onClick={handleSubmit(onSubmit)}
              >
                <Plus size={16} /> {isPending ? 'Creating...' : 'Create Reward'}
              </Button>
            </Flex>
          </Flex>
        </Box>
        <Text as="p" size="1" color="gray" className='italic'>
          * Required fields
        </Text>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
          {/* Basic Information */}
          <FormSection title="Basic Information">
            <div className="grid grid-cols-1 gap-6">
              {/* Title */}
              <div>
                <Text as="label" size="2" weight="medium" htmlFor="title">
                  Reward Title *
                </Text>
                <TextField.Root
                  id="title"
                  placeholder="Enter reward title"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' }
                  })}
                  className="mt-2"
                />
                <FormFieldErrorMessage errors={errors} field="title" />
              </div>

              {/* Description */}
              <div>
                <Text as="label" size="2" weight="medium" htmlFor="description">
                  Description *
                </Text>
                <TextArea
                  id="description"
                  placeholder="Describe the reward in detail"
                  {...register('description', {
                    required: 'Description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' }
                  })}
                  className="mt-2"
                  rows={4}
                  resize={'vertical'}
                />
                <FormFieldErrorMessage errors={errors} field="description" />
              </div>
            </div>
          </FormSection>

          {/* Category Information */}
          <FormSection title="Category">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Category Selection */}
              <div>
                <Text as="label" size="2" weight="medium">
                  Category *
                </Text>
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <Select.Root
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <Select.Trigger placeholder="Select category" className="mt-2 w-full" />
                      <Select.Content variant='soft' position='popper'>
                        {rewardCategories && rewardCategories.length > 0 ? (
                          rewardCategories.map((category) => (
                            <Select.Item key={category._id} value={category._id}>
                              {category.name} ({category.minPointValue}-{category.maxPointValue || '∞'} pts)
                            </Select.Item>
                          ))
                        ) : null}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                <FormFieldErrorMessage errors={errors} field="categoryId" />
              </div>

              {/* Category Info Display */}
              {watch('categoryId') && rewardCategories && (
                <div className="p-4 bg-[--gray-2] rounded-md">
                  <Text size="2" weight="medium" className="block mb-2">
                    Category Details
                  </Text>
                  {(() => {
                    const selectedCategory = rewardCategories.find(cat => cat._id === watch('categoryId'));
                    return selectedCategory ? (
                      <div>
                        <Text size="1" color="gray" className="block">
                          Type: {selectedCategory.type} - {selectedCategory.subcategoryType}
                        </Text>
                        <Text size="1" color="gray" className="block">
                          {selectedCategory.description}
                        </Text>
                        <Text size="1" color="gray" className="block">
                          Suggested range: {selectedCategory.minPointValue}-{selectedCategory.maxPointValue} points
                        </Text>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
            {/* Points Cost */}
            <div>
              <Text as="label" size="2" weight="medium" htmlFor="pointsCost">
                Points Cost *
              </Text>
              <TextField.Root
                id="pointsCost"
                type="number"
                placeholder="Enter points cost"
                {...register('pointsCost', {
                  required: 'Points cost is required',
                  min: { value: 1, message: 'Points cost must be at least 1' },
                })}
                className="mt-2"
              />
              <FormFieldErrorMessage errors={errors} field="pointsCost" />
            </div>

          </FormSection>

          {/* Availability Settings */}
          <FormSection title="Availability">
            <div className="space-y-6">
              {/* Limited Quantity */}
              <div>
                <Text as="label" size="2" weight="medium">
                  Quantity Type
                </Text>
                <Controller
                  name="limitedQuantity"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup.Root
                      value={field.value ? 'limited' : 'unlimited'}
                      onValueChange={(value) => field.onChange(value === 'limited')}
                      className="mt-2"
                    >
                      <div className="space-y-2">
                        <Flex align="center" gap="2">
                          <RadioGroup.Item value="unlimited" id="unlimited" />
                          <Text as="label" htmlFor="unlimited" size="2">
                            Unlimited quantity
                          </Text>
                        </Flex>
                        <Flex align="center" gap="2">
                          <RadioGroup.Item value="limited" id="limited" />
                          <Text as="label" htmlFor="limited" size="2">
                            Limited quantity
                          </Text>
                        </Flex>
                      </div>
                    </RadioGroup.Root>
                  )}
                />
              </div>

              {/* Quantity Input */}
              {limitedQuantity && (
                <div>
                  <Text as="label" size="2" weight="medium" htmlFor="quantity">
                    Available Quantity *
                  </Text>
                  <TextField.Root
                    id="quantity"
                    type="number"
                    placeholder="Enter available quantity"
                    {...register('quantity', {
                      required: limitedQuantity ? 'Quantity is required when limited' : false,
                      min: { value: 1, message: 'Quantity must be at least 1' }
                    })}
                    className="mt-2"
                  />
                  <FormFieldErrorMessage errors={errors} field="quantity" />
                </div>
              )}

              {/* Expiry Date */}
              <div>
                <Text as="label" size="2" weight="medium" htmlFor="expiryDate">
                  Expiry Date (Optional)
                </Text>
                <TextField.Root
                  id="expiryDate"
                  type="date"
                  {...register('expiryDate')}
                  className="mt-2"
                />
                <Text size="1" color="gray" className="mt-1">
                  Leave empty for no expiry date
                </Text>
              </div>

              {/* Featured Reward */}
              <div>
                <Text as="label" size="2" weight="medium">
                  Featured Reward
                </Text>
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup.Root
                      value={field.value ? 'featured' : 'normal'}
                      onValueChange={(value) => field.onChange(value === 'featured')}
                      className="mt-2"
                    >
                      <div className="space-y-2">
                        <Flex align="center" gap="2">
                          <RadioGroup.Item value="normal" id="normal" />
                          <Text as="label" htmlFor="normal" size="2">
                            Normal reward
                          </Text>
                        </Flex>
                        <Flex align="center" gap="2">
                          <RadioGroup.Item value="featured" id="featured" />
                          <Text as="label" htmlFor="featured" size="2">
                            Featured reward
                          </Text>
                        </Flex>
                      </div>
                    </RadioGroup.Root>
                  )}
                />
                <Text size="1" color="gray" className="mt-1">
                  Featured rewards are highlighted and shown prominently to students
                </Text>
              </div>
            </div>
          </FormSection>

          {/* Additional Details */}
          <FormSection title="Additional Details">
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <Text as="label" size="2" weight="medium">
                  Reward Image (Optional)
                </Text>
                <div className="mt-2 space-y-4">
                  {/* Image Preview */}
                  {previewUrl ? (
                    <div className="relative w-full max-w-md">
                      <img
                        src={previewUrl}
                        alt="Reward preview"
                        className="w-full h-48 object-cover rounded-lg border border-[--gray-6]"
                      />
                      <IconButton
                        type="button"
                        variant="solid"
                        color="red"
                        size="1"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X size={14} />
                      </IconButton>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[--gray-6] rounded-lg p-8 text-center">
                      <ImageIcon size={32} className="mx-auto mb-3 text-[--gray-9]" />
                      <Text size="2" color="gray" className="block mb-3">
                        Select an image file to upload
                      </Text>
                      <Button
                        type="button"
                        variant="outline"
                        asChild
                        className="cursor-pointer"
                      >
                        <label>
                          <Upload size={16} />
                          Choose File
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </Button>
                    </div>
                  )}

                  {/* File Info */}
                  {selectedFile && (
                    <div className="p-3 bg-[--gray-2] rounded-md">
                      <Text size="1" color="gray">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </Text>
                    </div>
                  )}

                  <Text size="1" color="gray">
                    Supported formats: JPG, PNG, GIF, WebP (max 5MB)
                  </Text>
                </div>
              </div>

              {/* Redemption Instructions */}
              <div>
                <Text as="label" size="2" weight="medium" htmlFor="redemptionInstructions">
                  Redemption Instructions
                </Text>
                <TextArea
                  id="redemptionInstructions"
                  placeholder="How should students redeem this reward?"
                  {...register('redemptionInstructions')}
                  className="mt-2"
                  rows={3}
                  resize={'vertical'}
                />
              </div>

              {/* Restrictions */}
              <div>
                <Text as="label" size="2" weight="medium" htmlFor="restrictions">
                  Restrictions
                </Text>
                <TextArea
                  id="restrictions"
                  placeholder="Any restrictions or requirements for this reward?"
                  {...register('restrictions')}
                  className="mt-2"
                  rows={3}
                  resize={'vertical'}
                />
              </div>
            </div>
          </FormSection>

          {/* School/Class Assignment (for school admins/teachers) */}
          <FormSection title="Assignment (Optional)">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Text as="label" size="2" weight="medium" htmlFor="schoolId">
                  School ID
                </Text>
                <TextField.Root
                  id="schoolId"
                  placeholder="Enter school ID (if applicable)"
                  {...register('schoolId')}
                  className="mt-2"
                />
                <Text size="1" color="gray" className="mt-1">
                  Leave empty for general rewards
                </Text>
              </div>

              <div>
                <Text as="label" size="2" weight="medium" htmlFor="classId">
                  Class ID
                </Text>
                <TextField.Root
                  id="classId"
                  placeholder="Enter class ID (if applicable)"
                  {...register('classId')}
                  className="mt-2"
                />
                <Text size="1" color="gray" className="mt-1">
                  Leave empty for school-wide rewards
                </Text>
              </div>
            </div>
          </FormSection>

        </form>
      </div>

    </Container>
  );
};

export const FormSection = ({ title, children }) => {
  return (
    <Card className='shadow-md' size='3'>
      <div className="space-y-4">
        <div>
          <Heading as="h3" size="4" weight="medium" className="text-[--gray-12]">
            {title}
          </Heading>
          <Separator size="4" className="mt-2" />
        </div>
        {children}
      </div>
    </Card>
  );
};

export default CreateReward; 