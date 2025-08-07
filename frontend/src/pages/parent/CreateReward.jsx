import { Badge, Box, Button, Callout, Card, Flex, RadioGroup, Select, Text, TextArea, TextField } from '@radix-ui/themes';
import { Info, Plus, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { useChildren } from '../../api/parent/parent.queries';
import { useCreateReward, useUpdateReward } from '../../api/rewards/rewards.mutations';
import { useGetRewardById, useGetRewardCategories } from '../../api/rewards/rewards.queries';
import { FormFieldErrorMessage, Loader, PageHeader } from '../../components';

const CreateReward = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const cloneId = searchParams.get('cloneId');

  const isEdit = Boolean(id);
  const isClone = Boolean(cloneId);

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

  // Get reward for cloning
  const { data: cloneRewardData, isLoading: isLoadingCloneReward } = useGetRewardById(cloneId, { enabled: isClone });
  const { data: cloneReward } = cloneRewardData ?? {};

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

  // Populate form when editing or cloning
  useEffect(() => {
    let sourceReward = null;
    let isReady = false;

    if (isEdit && reward && !isLoadingReward) {
      sourceReward = reward;
      isReady = true;
    } else if (isClone && cloneReward && !isLoadingCloneReward) {
      sourceReward = cloneReward;
      isReady = true;
    }

    if (sourceReward && isReady) {
      const formData = {
        title: isClone ? `Copy of ${sourceReward.title}` : sourceReward.title || '',
        description: sourceReward.description || '',
        pointsCost: sourceReward.pointsCost || 50,
        categoryId: sourceReward.categoryId?._id || '',
        limitedQuantity: sourceReward.limitedQuantity || false,
        quantity: sourceReward.quantity || undefined,
        expiryDate: isClone ? '' : (sourceReward.expiryDate ? new Date(sourceReward.expiryDate).toISOString().slice(0, 10) : ''),
        redemptionInstructions: sourceReward.redemptionInstructions || '',
        restrictions: sourceReward.restrictions || '',
      };

      reset(formData);

      // Set existing image if available (for both edit and clone modes)
      if (sourceReward.image) {
        setPreviewUrl(sourceReward.image);
      }

      setIsFormReady(true);
    }
  }, [isEdit, isClone, reward, cloneReward, isLoadingReward, isLoadingCloneReward, reset]);

  // Set suggested point value based on category (only for new rewards, not clones)
  useEffect(() => {
    if (!isEdit && !isClone && rewardCategories && categoryId) {
      const selectedCategory = rewardCategories.find(cat => cat._id === categoryId);
      if (selectedCategory) {
        setValue('pointsCost', selectedCategory.minPointValue);
      }
    }
  }, [isEdit, isClone, categoryId, rewardCategories, setValue]);

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

    // Handle image file
    if (selectedFile) {
      // User uploaded a new file
      formData.append('image', selectedFile);
    } else if (isClone && cloneReward?.image && previewUrl) {
      // For cloning, download the original image and convert to file
      try {
        const response = await fetch(cloneReward.image);
        const blob = await response.blob();
        const fileExtension = cloneReward.image.split('.').pop() || 'jpg';
        const fileName = `cloned-reward-image.${fileExtension}`;
        const file = new File([blob], fileName, {
          type: blob.type || 'image/jpeg'
        });
        formData.append('image', file);
      } catch (error) {
        console.error('Error cloning image:', error);
        toast.error('Could not clone the image, continuing without it');
        formData.append('image', '');
      }
    } else if (isEdit && reward?.image && previewUrl && !selectedFile) {
      // For editing, preserve existing image if no new file uploaded
      // Don't append anything - backend will keep existing image
    } else {
      // No image or removing image
      formData.append('image', '');
    }

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

  if ((isEdit && (isLoadingReward || !isFormReady)) || (isClone && (isLoadingCloneReward || !isFormReady))) {
    return (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  }

  return (
    <div className="mx-auto space-y-4 max-w-2xl">
      {/* Header */}
      <CreateRewardPageHeader isEdit={isEdit} isClone={isClone} />

      {/* Info Callout */}
      {isClone ? (
        <Callout.Root variant='surface' color="amber">
          <Callout.Icon>
            <Info size={16} />
          </Callout.Icon>
          <Callout.Text>
            You're creating a copy of an existing reward. All details including the image have been pre-filled but you can modify them as needed.
          </Callout.Text>
        </Callout.Root>
      ) : (
        <Callout.Root variant='surface' color="blue">
          <Callout.Icon>
            <Info size={16} />
          </Callout.Icon>
          <Callout.Text>
            Family rewards are only visible to your children and can be redeemed using their earned points.
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
            {/* Title */}
            <Box>
              <label>
                <Text as="p" size="2" weight="medium" mb="1">
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
                <Text as="p" size="2" weight="medium" mb="1">
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
                  <Text as="p" size="2" weight="medium" mb="1">
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
                  <Text as="p" size="2" weight="medium" mb="1">
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
                  <Text as="p" size="2" weight="medium" mb="1">
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
            {/* Limited Quantity */}
            <Box>
              <label>
                <Text as="p" size="2" weight="medium" mb="1">
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
                  <Text as="p" size="2" weight="medium" mb="1">
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
              <Text as="p" size="2" weight="medium" mb="1">
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
                <Text as="p" size="2" weight="medium" mb="1">
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
                <Text as="p" size="2" weight="medium" mb="1">
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
          <Flex justify="end" gap="3">
            <Button variant="soft" color="gray" asChild>
              <Link to="/parent/rewards">Cancel</Link>
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
                : isClone
                  ? 'Create Copy'
                  : (isEdit ? 'Update Reward' : 'Create Reward')
              }
            </Button>
          </Flex>
        </form>
      </Card>
    </div>
  );
};

export default CreateReward;

function CreateRewardPageHeader({ isEdit, isClone }) {
  return (
    <PageHeader
      title={isEdit ? 'Edit Reward' : isClone ? 'Clone Reward' : 'Create Reward'}
      description={isEdit
        ? 'Update the reward details and settings'
        : isClone
          ? 'Create a new reward based on an existing one'
          : 'Create a reward for your child to earn and redeem with their points'
      }
      backButton
    />
  )
}