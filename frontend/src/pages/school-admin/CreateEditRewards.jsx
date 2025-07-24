import { Badge, Box, Button, Card, Flex, RadioGroup, Select, Separator, Text, TextArea, TextField } from '@radix-ui/themes';
import { Plus, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useCreateReward, useUpdateReward } from '../../api/rewards/rewards.mutations';
import { useGetRewardById, useGetRewardCategories } from '../../api/rewards/rewards.queries';
import { useGetSchoolProfile } from '../../api/school-admin/school.queries';
import { ErrorCallout, FormFieldErrorMessage, Loader, PageHeader } from '../../components';

const CreateReward = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { data, isLoading: isSchoolLoading, isError: isSchoolError, error: schoolError } = useGetSchoolProfile()
  const schoolId = data?.data?._id
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
      schoolId: schoolId,
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
    // Create FormData for file upload
    const formData = new FormData();

    // Add form fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('pointsCost', parseInt(data.pointsCost));
    formData.append('categoryId', data.categoryId);
    formData.append('limitedQuantity', data.limitedQuantity);
    formData.append('role', 'school_admin');
    formData.append('schoolId', schoolId);

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
        navigate('/school-admin/rewards');
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
      <div className='mx-auto space-y-6 max-w-3xl'>
        <CreateEditRewardPageHeader isEdit={isEdit} />
        <Flex justify="center">
          <Loader />
        </Flex>
      </div>
    );
  }

  if (isSchoolError) {
    return (
      <div className="mx-auto space-y-6 max-w-3xl">
        <CreateEditRewardPageHeader isEdit={isEdit} />
        <ErrorCallout errorMessage={schoolError?.response?.data?.message || schoolError?.message || 'Failed to load school'} />
      </div>
    )
  }

  return (
    <div className="mx-auto space-y-6 max-w-3xl">
      <CreateEditRewardPageHeader isEdit={isEdit} />

      <Text size={'1'} className='italic' color='gray' as='p'>
        * Required fields
      </Text>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <FormSection title='Basic Information'>
          {/* Title */}
          <Box>
            <label>
              <Text as="p" size="2" weight="medium" mb="2">
                Reward Title *
              </Text>
              <TextField.Root
                placeholder="e.g., Skip one homework"
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
                placeholder="Describe what your students will get or be able to do"
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
        </FormSection>

        {/* Category & Points */}
        <FormSection title='Category & Points'>
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

          </Flex>

          <Flex gap="4" direction={{ initial: 'column', xs: 'row' }}>
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
        </FormSection>

        {/* Availability Settings */}
        <FormSection title='Availability & Visibility'>
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

        </FormSection>

        {/* Additional Details */}
        <FormSection title='Additional Details'>

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
                placeholder="Explain how your students should redeem this reward (e.g., 'Show this to teacher')"
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
        </FormSection>

        {/* Actions */}
        <Flex justify="end" gap="3">
          <Button variant="soft" color="gray" asChild>
            <Link to="/school-admin/rewards">Cancel</Link>
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

function CreateEditRewardPageHeader({ isEdit }) {
  return (
    <PageHeader
      title={isEdit ? 'Edit Reward' : 'Create Reward'}
      description={isEdit ? 'Update your reward details' : 'Create a reward that your school students can redeem with their points'}
      backButton
    />
  )
}

export const FormSection = ({ title, children }) => {
  return (
    <Card size='3' className='shadow-md'>
      <Flex direction={'column'} gap={'3'} mb={'4'}>
        <Text as='p' size="4" weight="medium">
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