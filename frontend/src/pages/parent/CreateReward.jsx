import { Badge, Box, Button, Callout, Flex, Heading, RadioGroup, Select, Text, TextArea, TextField } from '@radix-ui/themes';
import { ArrowLeft, Info, Plus, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useChildren } from '../../api/parent/parent.queries';
import { useCreateReward, useUpdateReward } from '../../api/rewards/rewards.mutations';
import { useGetRewardCategories, useGetRewardById } from '../../api/rewards/rewards.queries';
import { FormFieldErrorMessage, Loader } from '../../components';

const CreateReward = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

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
    defaultValues: {
      title: '',
      description: '',
      pointsCost: 50,
      categoryId: '',
      limitedQuantity: false,
      quantity: undefined,
      expiryDate: '',
      redemptionInstructions: '',
      restrictions: '',
    },
  });

  // Image upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Watch form values
  const limitedQuantity = watch('limitedQuantity');
  const categoryId = watch('categoryId');

  // Get children for validation
  const { data: childrenData } = useChildren();
  const { data: children = [] } = childrenData ?? {};

  // Get reward categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetRewardCategories();
  const rewardCategories = categoriesData?.data?.categories || categoriesData?.categories || [];

  // Get reward for editing
  const { data: rewardData, isLoading: isLoadingReward } = useGetRewardById(id, { enabled: isEdit });
  const { data: reward } = rewardData ?? {};

  // Create and update reward mutations
  const { mutate: createReward, isPending: isCreating } = useCreateReward();
  const { mutate: updateReward, isPending: isUpdating } = useUpdateReward();

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

  // Populate form when editing
  useEffect(() => {
    if (isEdit && reward && !isLoadingReward) {
      const formData = {
        title: reward.title || '',
        description: reward.description || '',
        pointsCost: reward.pointsCost || 50,
        categoryId: reward.categoryId?._id || '',
        limitedQuantity: reward.limitedQuantity || false,
        quantity: reward.quantity || undefined,
        expiryDate: reward.expiryDate ? new Date(reward.expiryDate).toISOString().slice(0, 10) : '',
        redemptionInstructions: reward.redemptionInstructions || '',
        restrictions: reward.restrictions || '',
      };

      reset(formData);

      // Set existing image if available
      if (reward.image) {
        setPreviewUrl(reward.image);
      }

      setIsFormReady(true);
    }
  }, [isEdit, reward, isLoadingReward, reset]);

  // Set suggested point value based on category (only for new rewards)
  useEffect(() => {
    if (!isEdit && rewardCategories && categoryId) {
      const selectedCategory = rewardCategories.find(cat => cat._id === categoryId);
      if (selectedCategory) {
        setValue('pointsCost', selectedCategory.minPointValue);
      }
    }
  }, [isEdit, categoryId, rewardCategories, setValue]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Form submission handler
  const onSubmit = async (data) => {
    // Validate that parent has children
    if (!children || children.length === 0) {
      toast.error('You need to have registered children to create rewards');
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();

    // Add form fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('pointsCost', parseInt(data.pointsCost));
    formData.append('categoryId', data.categoryId);
    formData.append('limitedQuantity', data.limitedQuantity);
    formData.append('role', 'parent');

    if (data.limitedQuantity && data.quantity) {
      formData.append('quantity', parseInt(data.quantity));
    }

    // expiry date
    formData.append('expiryDate', data.expiryDate ? new Date(data.expiryDate).toISOString() : '');

    if (data.redemptionInstructions) {
      formData.append('redemptionInstructions', data.redemptionInstructions);
    }

    if (data.restrictions) {
      formData.append('restrictions', data.restrictions);
    }

    // Add image file if selected
    formData.append('image', selectedFile ? selectedFile : '');

    // Submit to API
    const successMessage = isEdit ? 'Reward updated successfully!' : 'Reward created successfully!';
    const errorMessage = isEdit ? 'Failed to update reward' : 'Failed to create reward';
    const mutation = isEdit ? updateReward : createReward;
    const mutationData = isEdit ? { id, formData } : formData;

    mutation(mutationData, {
      onSuccess: () => {
        toast.success(successMessage);
        navigate('/parent/rewards');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || errorMessage);
      }
    });
  };

  // Group categories by type for better organization
  const groupedCategories = rewardCategories?.reduce((acc, category) => {
    const type = category.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(category);
    return acc;
  }, {}) || {};

  if (isEdit && (isLoadingReward || !isFormReady)) {
    return (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  }

  return (
    <div className="space-y-4 max-w-xl">
      <Button asChild variant='ghost' color='gray' size='2'>
        <Link to="/parent/rewards">
          <ArrowLeft size={18} />
          Back to Rewards
        </Link>
      </Button>

      {/* Header */}
      <Box>
        <Heading as="h1" size="6" weight="bold" mb="1">
          {isEdit ? 'Edit Family Reward' : 'Create Family Reward'}
        </Heading>
        <Text as='p' color="gray" size="2">
          {isEdit
            ? 'Update your family reward details'
            : 'Create a reward that your children can redeem with their scholarship points'
          }
        </Text>
      </Box>

      {/* Info Callout */}
      <Callout.Root variant='surface' color="blue" size="1">
        <Callout.Icon>
          <Info size={16} />
        </Callout.Icon>
        <Callout.Text>
          Family rewards are only visible to your children and can be redeemed using their earned points.
        </Callout.Text>
      </Callout.Root>

      <Text size={'1'} className='italic' color='gray' as='p'>
        * Required fields
      </Text>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Box className="space-y-4">
          {/* Title */}
          <Box>
            <label>
              <Text as="p" size="2" weight="medium" mb="2">
                Reward Title *
              </Text>
              <TextField.Root
                placeholder="e.g., Extra 30 minutes screen time"
                {...register('title', {
                  required: 'Reward title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' }
                })}
              />
            </label>
            <FormFieldErrorMessage errors={errors} field="title" />
          </Box>

          {/* Description */}
          <Box>
            <label>
              <Text as="p" size="2" weight="medium" mb="2">
                Description *
              </Text>
              <TextArea
                placeholder="Describe what your child will get or be able to do"
                resize="vertical"
                rows={3}
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Description must be at least 10 characters' }
                })}
              />
            </label>
            <FormFieldErrorMessage errors={errors} field="description" />
          </Box>
        </Box>

        {/* Category & Points */}
        <Box className="space-y-4">
          <Flex gap="4" direction={{ initial: 'column', xs: 'row' }}>
            {/* Category */}
            <Box className='flex-1'>
              <label className='w-full'>
                <Text as="p" size="2" weight="medium" mb="2">
                  Category *
                </Text>
                <Controller
                  name="categoryId"
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
                              <Select.Item key={category._id} value={category._id}>
                                <Flex align="center" gap="2">
                                  <Text className="capitalize">{category.name}</Text>
                                  <Badge variant="soft" size="1" color="gray">
                                    {category.minPointValue}+ pts
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
              <FormFieldErrorMessage errors={errors} field="categoryId" />
            </Box>

            {/* Points Cost */}
            <Box>
              <label>
                <Text as="p" size="2" weight="medium" mb="2">
                  Points Cost *
                </Text>
                <TextField.Root
                  type="number"
                  min="1"
                  placeholder="50"
                  {...register('pointsCost', {
                    required: 'Points cost is required',
                    min: { value: 1, message: 'Points cost must be at least 1' }
                  })}
                />
              </label>
              <FormFieldErrorMessage errors={errors} field="pointsCost" />
            </Box>

            {/* Expiry Date */}
            <Box>
              <label>
                <Text as="p" size="2" weight="medium" mb="2">
                  Expiry Date (Optional)
                </Text>
                <TextField.Root
                  type="date"
                  {...register('expiryDate', {
                    validate: (value) => {
                      if (!value) return true;
                      const dateValue = new Date(value);
                      const now = new Date();
                      return dateValue >= now || "Expiry date must be in the future";
                    }
                  })}
                />
              </label>
              <FormFieldErrorMessage errors={errors} field="expiryDate" />
            </Box>
          </Flex>

          {/* Category Info Display */}
          {categoryId && rewardCategories && (
            <div className="p-3 bg-[--gray-2] rounded-md">
              <Text as='p' size="2" weight="medium" className="block mb-1">
                Category Details
              </Text>
              {(() => {
                const selectedCategory = rewardCategories.find(cat => cat._id === categoryId);
                return selectedCategory ? (
                  <div className="space-y-1">
                    <Text as='p' size="1" color="gray">
                      Type: {selectedCategory.type}
                    </Text>
                    <Text as='p' size="1" color="gray">
                      {selectedCategory.description}
                    </Text>
                    <Text as='p' size="1" color="gray">
                      Suggested range: {selectedCategory.minPointValue}-{selectedCategory.maxPointValue || '∞'} points
                    </Text>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </Box>

        {/* Availability Settings */}
        <Box className="space-y-4">
          <Text as='p' weight="medium">Availability & Visibility</Text>

          {/* Limited Quantity */}
          <Box>
            <label>
              <Text as="p" size="2" weight="medium" mb="2">
                Quantity Type
              </Text>
              <Controller
                name="limitedQuantity"
                control={control}
                render={({ field }) => (
                  <RadioGroup.Root
                    value={field.value ? 'limited' : 'unlimited'}
                    onValueChange={(value) => field.onChange(value === 'limited')}
                  >
                    <div className="space-y-2">
                      <Flex align="center" gap="2">
                        <RadioGroup.Item value="unlimited" id="unlimited" />
                        <Text as="label" htmlFor="unlimited" size="2">
                          Unlimited - Can be redeemed multiple times
                        </Text>
                      </Flex>
                      <Flex align="center" gap="2">
                        <RadioGroup.Item value="limited" id="limited" />
                        <Text as="label" htmlFor="limited" size="2">
                          Limited - Set a specific number available
                        </Text>
                      </Flex>
                    </div>
                  </RadioGroup.Root>
                )}
              />
            </label>
          </Box>

          {/* Quantity Input */}
          {limitedQuantity && (
            <Box>
              <label>
                <Text as="p" size="2" weight="medium" mb="2">
                  Available Quantity *
                </Text>
                <TextField.Root
                  type="number"
                  placeholder="How many times can this be redeemed?"
                  {...register('quantity', {
                    required: limitedQuantity ? 'Quantity is required when limited' : false,
                    min: { value: 1, message: 'Quantity must be at least 1' }
                  })}
                />
              </label>
              <FormFieldErrorMessage errors={errors} field="quantity" />
            </Box>
          )}

        </Box>

        {/* Additional Details */}
        <Box className="space-y-4">
          <Text as='p' weight="medium">Additional Details</Text>

          {/* Image Upload */}
          <Box>
            <Text as="p" size="2" weight="medium" mb="2">
              Reward Image (Optional)
            </Text>
            <div className="space-y-3">
              {/* Image Preview */}
              {previewUrl ? (
                <div className="relative w-full max-w-sm">
                  <img
                    src={previewUrl}
                    alt="Reward preview"
                    className="w-full aspect-video object-cover rounded-lg border border-[--gray-6]"
                  />
                  <Button
                    type="button"
                    variant="solid"
                    color="red"
                    size="1"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[--gray-6] rounded-lg p-6 text-center">
                  <Upload size={24} className="mx-auto mb-2 text-[--gray-9]" />
                  <Text size="2" color="gray" className="block mb-2">
                    Add an image to make your reward more appealing
                  </Text>
                  <Button
                    type="button"
                    variant="outline"
                    size="2"
                    asChild
                    className="cursor-pointer"
                  >
                    <label>
                      <Upload size={16} />
                      Choose Image
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

              {selectedFile && (
                <div className="p-2 bg-[--gray-2] rounded-md">
                  <Text size="1" color="gray">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Text>
                </div>
              )}

              <Text size="1" color="gray">
                Supported formats: JPG, PNG, GIF, WebP (max 5MB)
              </Text>
            </div>
          </Box>

          {/* Redemption Instructions */}
          <Box>
            <label>
              <Text as="p" size="2" weight="medium" mb="2">
                How to Redeem (Optional)
              </Text>
              <TextArea
                placeholder="Explain how your child should redeem this reward (e.g., 'Show this to mom or dad')"
                resize="vertical"
                rows={2}
                {...register('redemptionInstructions')}
              />
            </label>
          </Box>

          {/* Restrictions */}
          <Box>
            <label>
              <Text as="p" size="2" weight="medium" mb="2">
                Rules & Restrictions (Optional)
              </Text>
              <TextArea
                placeholder="Any rules or restrictions for this reward (e.g., 'Only on weekends', 'After homework is done')"
                resize="vertical"
                rows={2}
                {...register('restrictions')}
              />
            </label>
          </Box>
        </Box>

        {/* Helper Info */}
        <Callout.Root variant="surface" color="blue">
          <Callout.Icon>
            <Info size={16} />
          </Callout.Icon>
          <Callout.Text>
            Tips for great family rewards:
          </Callout.Text>
          <Text as="div" size='2'>
            • Make rewards meaningful and motivating for your child<br />
            • Consider both privileges (screen time, later bedtime) and items<br />
            • Set appropriate point costs based on effort required<br />
            • Be clear about when and how rewards can be used
          </Text>
        </Callout.Root>

        {/* Actions */}
        <Flex justify="end" gap="3" pt="4">
          <Button variant="soft" color="gray" asChild>
            <Link to="/parent/rewards">Cancel</Link>
          </Button>
          <Button color='grass' type="submit" disabled={isCreating || isUpdating}>
            <Plus size={16} />
            {isCreating || isUpdating
              ? (isEdit ? 'Updating...' : 'Creating...')
              : (isEdit ? 'Update Reward' : 'Create Reward')
            }
          </Button>
        </Flex>
      </form>
    </div>
  );
};

export default CreateReward; 