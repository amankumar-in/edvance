import {
  Box,
  Button,
  Flex,
  Heading,
  RadioGroup,
  Select,
  Separator,
  Text,
  TextArea,
  TextField,
  Tooltip
} from '@radix-ui/themes';
import {
  ArrowLeft,
  Eye,
  Plus,
  Upload
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Container } from '../../components';

const CreateReward = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
    getValues,
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
    },
  });

  // watch form values
  const limitedQuantity = watch('limitedQuantity');
  const category = watch('category');
  const subcategory = watch('subcategory');

  // preview reward form
  const [previewRewardFormOpen, setPreviewRewardFormOpen] = useState(false);

  // Mock category data - replace with actual API call
  const mockCategories = [
    {
      _id: '1',
      name: 'Family Privileges',
      type: 'family',
      subcategoryType: 'privilege',
      description: 'Special privileges and rewards earned at home',
      minPointValue: 10,
      maxPointValue: 100
    },
    {
      _id: '2',
      name: 'School Store Items',
      type: 'school',
      subcategoryType: 'item',
      description: 'Physical items available from the school store',
      minPointValue: 25,
      maxPointValue: 250
    },
    {
      _id: '3',
      name: 'Digital Rewards',
      type: 'sponsor',
      subcategoryType: 'digital',
      description: 'Online content, games, and digital subscriptions',
      minPointValue: 50,
      maxPointValue: 500
    },
    {
      _id: '4',
      name: 'School Experiences',
      type: 'school',
      subcategoryType: 'experience',
      description: 'Special activities and experiences at school',
      minPointValue: 75,
      maxPointValue: 300
    },
    {
      _id: '5',
      name: 'Family Time',
      type: 'family',
      subcategoryType: 'experience',
      description: 'Quality time activities with family members',
      minPointValue: 100,
      maxPointValue: 400
    },
    {
      _id: '6',
      name: 'Learning Materials',
      type: 'school',
      subcategoryType: 'item',
      description: 'Educational books, supplies, and learning tools',
      minPointValue: 30,
      maxPointValue: 150
    }
  ];

  // Set suggested point value based on category
  useEffect(() => {
    const categoryId = watch('categoryId');
    if (mockCategories && categoryId) {
      const selectedCategory = mockCategories.find(cat => cat._id === categoryId);
      if (selectedCategory) {
        setValue('pointsCost', selectedCategory.minPointValue);
        setValue('category', selectedCategory.type);
        setValue('subcategory', selectedCategory.subcategoryType);
      }
    }
  }, [watch('categoryId'), mockCategories, setValue]);

  // on submit
  const onSubmit = async (data) => {
    // Convert form data to match backend schema
    const rewardData = {
      title: data.title,
      description: data.description,
      pointsCost: parseInt(data.pointsCost),
      categoryId: data.categoryId,
      category: data.category,
      subcategory: data.subcategory,
      limitedQuantity: data.limitedQuantity,
      quantity: data.limitedQuantity ? parseInt(data.quantity) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : undefined,
      image: data.image,
      redemptionInstructions: data.redemptionInstructions,
      restrictions: data.restrictions,
      schoolId: data.schoolId,
      classId: data.classId,
      metadata: {}
    };

    console.log('Creating reward:', rewardData);

    // Mock API call - replace with actual implementation
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Reward created successfully');
      navigate('/platform-admin/dashboard/rewards');
    } catch (error) {
      toast.error('Failed to create reward');
    }
  };

  return (
    <Container>
      <div className="pb-8 space-y-8">
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
              {/* Preview Reward Button */}
              <Tooltip content={!isValid ? "Fill required fields to enable preview" : "Preview reward before creating"}>
                <Button
                  type='button'
                  variant='outline'
                  color='gray'
                  disabled={!isValid}
                  onClick={() => setPreviewRewardFormOpen(true)}
                >
                  <Eye size={16} /> Preview Reward
                </Button>
              </Tooltip>

              {/* Create Reward Button */}
              <Button
                type="submit"
                color="grass"
                onClick={handleSubmit(onSubmit)}
              >
                <Plus size={16} /> Create Reward
              </Button>
            </Flex>
          </Flex>
        </Box>
        <Text as="p" size="1" color="gray" className='italic'>
          * Required fields
        </Text>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-10">
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
                {errors.title && (
                  <Text size="1" color="red" className="mt-1">
                    {errors.title.message}
                  </Text>
                )}
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
                />
                {errors.description && (
                  <Text size="1" color="red" className="mt-1">
                    {errors.description.message}
                  </Text>
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
                    min: { value: 1, message: 'Points cost must be at least 1' }
                  })}
                  className="mt-2"
                />
                {errors.pointsCost && (
                  <Text size="1" color="red" className="mt-1">
                    {errors.pointsCost.message}
                  </Text>
                )}
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
                      <Select.Trigger placeholder="Select category" className="w-full mt-2" />
                      <Select.Content>
                        {mockCategories.map((category) => (
                          <Select.Item key={category._id} value={category._id}>
                            {category.name} ({category.minPointValue}-{category.maxPointValue} pts)
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors?.categoryId && (
                  <Text size="1" color="red" className="mt-1">
                    {errors.categoryId.message}
                  </Text>
                )}
              </div>

              {/* Category Info Display */}
              {watch('categoryId') && (
                <div className="p-4 bg-[--gray-2] rounded-md">
                  <Text size="2" weight="medium" className="block mb-2">
                    Category Details
                  </Text>
                  {(() => {
                    const selectedCategory = mockCategories.find(cat => cat._id === watch('categoryId'));
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
                  {errors.quantity && (
                    <Text size="1" color="red" className="mt-1">
                      {errors.quantity.message}
                    </Text>
                  )}
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
            </div>
          </FormSection>

          {/* Additional Details */}
          <FormSection title="Additional Details">
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <Text as="label" size="2" weight="medium" htmlFor="image">
                  Reward Image (Optional)
                </Text>
                <div className="mt-2 border-2 border-dashed border-[--gray-6] rounded-lg p-6 text-center">
                  <Upload size={24} className="mx-auto mb-2 text-[--gray-9]" />
                  <Text size="2" color="gray">
                    Upload an image or enter image URL
                  </Text>
                  <TextField.Root
                    id="image"
                    placeholder="https://example.com/image.jpg"
                    {...register('image')}
                    className="mt-2"
                  />
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
                />
              </div>

              {/* Restrictions */}
              <div>
                <Text as="label" size="2" weight="medium" htmlFor="restrictions">
                  Restrictions
                </Text>
                <TextArea
                  id="restrictions"
                  placeholder="Any restrictions or conditions for this reward?"
                  {...register('restrictions')}
                  className="mt-2"
                  rows={3}
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
    <div className="space-y-4">
      <div>
        <Heading as="h3" size="4" weight="medium" className="text-[--gray-12]">
          {title}
        </Heading>
        <Separator size="4" className="mt-2" />
      </div>
      {children}
    </div>
  );
};

export default CreateReward; 