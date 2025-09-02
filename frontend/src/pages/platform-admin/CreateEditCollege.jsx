import { Badge, Button, Flex, Select, Switch, Text, TextArea, TextField } from '@radix-ui/themes'
import { Plus, Save, Upload, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useCreateCollege, useUpdateCollege } from '../../api/college/college.mutations'
import { useGetCollegeById } from '../../api/college/college.queries'
import ErrorCallout from '../../components/ErrorCallout'
import { FormFieldErrorMessage } from '../../components/FormFieldErrorMessage'
import Loader from '../../components/Loader'
import PageHeader from '../../components/PageHeader'
import FormSection from './components/FormSection'

const CreateEditCollege = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [isFormReady, setIsFormReady] = useState(!isEdit)
  const [logoPreview, setLogoPreview] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [courseInput, setCourseInput] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
    setValue,
    reset,
    getValues
  } = useForm({
    defaultValues: {
      name: '',
      location: '',
      shortDescription: '',
      description: '',
      logo: '',
      bannerImage: '',
      courses: [],
      website: '',
      contactEmail: '',
      contactPhone: '',
      tier: '',
      isFeatured: false,
      status: 'draft',
      highlight1: '',
      highlight2: '',
      highlight3: ''
    },
  })

  // Watch form values
  const courses = watch('courses')
  const status = watch('status')
  const isFeatured = watch('isFeatured')

  // Mutations
  const { mutate: createCollege, isPending: isCreating, isError: isCreateError, error: createError } = useCreateCollege()
  const { mutate: updateCollege, isPending: isUpdating, isError: isUpdateError, error: updateError } = useUpdateCollege()

  // Get college for editing
  const { data: collegeData, isLoading: isLoadingCollege } = useGetCollegeById(id)
  const { data: college } = collegeData ?? {}

  const isPending = isCreating || isUpdating
  const isError = isCreateError || isUpdateError
  const error = createError || updateError

  // Populate form when editing
  useEffect(() => {
    if (isEdit && college && !isLoadingCollege) {
      const formData = {
        name: college.name || '',
        location: college.location || '',
        shortDescription: college.shortDescription || '',
        description: college.description || '',
        logo: college.logo || '',
        bannerImage: college.bannerImage || '',
        courses: college.courses || [],
        website: college.website || '',
        contactEmail: college.contactEmail || '',
        contactPhone: college.contactPhone || '',
        tier: college.tier || '',
        isFeatured: college.isFeatured || false,
        status: college.status || 'draft',
        highlight1: college.highlight1 || '',
        highlight2: college.highlight2 || '',
        highlight3: college.highlight3 || ''
      }

      reset(formData)
      setLogoPreview(college.logo)
      setBannerPreview(college.bannerImage)
      setIsFormReady(true)
    }
  }, [isEdit, college, isLoadingCollege, reset])

  // Handle course management
  const addCourse = () => {
    if (courseInput.trim() && !courses.includes(courseInput.trim())) {
      setValue('courses', [...courses, courseInput.trim()])
      setCourseInput('')
    }
  }

  const removeCourse = (index) => {
    setValue('courses', courses.filter((_, i) => i !== index))
  }

  const handleCourseKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCourse()
    }
  }

  // Handle image uploads
  const handleImageUpload = (file, type) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return;
    }

    // Revoke old preview URL (avoid memory leaks)
    if (type === 'logo' && logoPreview && typeof logoPreview === 'string') {
      URL.revokeObjectURL(logoPreview);
    }
    if (type === 'banner' && bannerPreview && typeof bannerPreview === 'string') {
      URL.revokeObjectURL(bannerPreview);
    }

    const url = URL.createObjectURL(file)
    if (type === 'logo') {
      setLogoPreview(url)
      setValue('logo', file)
    } else if (type === 'banner') {
      setBannerPreview(url)
      setValue('bannerImage', file)
    }
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [logoPreview, bannerPreview]);

  // Form submission
  const onSubmit = async (data) => {
    const collegeData = {
      ...data,
      courses: data.courses || []
    }

    const successMessage = isEdit ? 'College updated successfully' : 'College created successfully'
    const errorMessage = isEdit ? 'Failed to update college' : 'Failed to create college'
    const mutation = isEdit ? updateCollege : createCollege
    const mutationData = isEdit ? { id, data: collegeData } : collegeData

    mutation(mutationData, {
      onSuccess: () => {
        toast.success(successMessage)
        navigate('/platform-admin/dashboard/colleges')
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || errorMessage)
      }
    })
  }

  // Show loading state when fetching college for editing
  if (isEdit && (isLoadingCollege || !isFormReady)) {
    return (
      <Flex justify="center">
        <Loader />
      </Flex>
    )
  }

  return (
    <div className="pb-8 mx-auto space-y-6 max-w-6xl">
      {/* Header */}
      <PageHeader
        title={isEdit ? 'Edit College' : 'Create New College'}
        description={isEdit
          ? 'Modify the existing college details and information.'
          : 'Add a new college to the platform with comprehensive information.'
        }
        backButton
      >
        <Flex gap='2' align='center' wrap='wrap'>
          {/* Save Draft Button */}
          <Button
            type="button"
            variant="outline"
            color="gray"
            disabled={isPending}
            onClick={handleSubmit((data) => onSubmit({ ...data, status: 'draft' }))}
          >
            <Save size={16} />
            Save Draft
          </Button>

          {/* Publish Button */}
          <Button
            type="submit"
            color="grass"
            disabled={isPending || !isValid}
            onClick={handleSubmit((data) => onSubmit({ ...data, status: 'published' }))}
          >
            <Plus size={16} />
            {isPending
              ? (isEdit ? 'Updating...' : 'Creating...')
              : (isEdit ? 'Update & Publish' : 'Create & Publish')
            }
          </Button>
        </Flex>
      </PageHeader>

      <Text as="p" size="1" color="gray" className='italic'>
        * Required fields
      </Text>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {isError && (
          <ErrorCallout
            errorMessage={error?.response?.data?.message || "Failed to save college."}
          />
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-6 xl:col-span-2">
            {/* Basic Information */}
            <FormSection title="Basic Information">
              <div className="space-y-4">
                {/* College Name */}
                <div>
                  <label>
                    <Text as="div" size="2" mb="2" weight="medium">
                      College Name *
                    </Text>
                    <TextField.Root
                      placeholder="Enter college name"
                      className="w-full"
                      {...register('name', {
                        required: "College name is required"
                      })}
                    />
                    <FormFieldErrorMessage errors={errors} field="name" />
                  </label>
                </div>

                {/* Location */}
                <div>
                  <label>
                    <Text as="div" size="2" mb="2" weight="medium">
                      Location
                    </Text>
                    <TextField.Root
                      placeholder="City, State, Country"
                      className="w-full"
                      {...register('location')}
                    />
                    <Text as="p" size="1" color="gray" mt="1">
                      Enter the college's location (e.g., "Boston, MA, USA")
                    </Text>
                  </label>
                </div>

                {/* Short Description */}
                <div>
                  <label>
                    <Text as="div" size="2" mb="2" weight="medium">
                      Short Description
                    </Text>
                    <TextArea
                      placeholder="Brief description of the college"
                      resize="vertical"
                      rows={3}
                      {...register("shortDescription")}
                      className="w-full"
                    />
                    <Text as="p" size="1" color="gray" mt="1">
                      A brief overview that will appear in college listings
                    </Text>
                  </label>
                </div>
              </div>
            </FormSection>

            {/* Content */}
            <FormSection title="Content">
              <div className="space-y-4">
                {/* Description - WYSIWYG Editor placeholder */}
                <div>
                  <label>
                    <Text as="div" size="2" mb="2" weight="medium">
                      Detailed Description
                    </Text>
                    <TextArea
                      placeholder="Detailed description of the college, programs, facilities, etc."
                      resize="vertical"
                      rows={8}
                      {...register("description")}
                      className="w-full"
                    />
                    <Text as="p" size="1" color="gray" mt="1">
                      Comprehensive information about the college
                    </Text>
                  </label>
                </div>

                {/* Courses */}
                <div>
                  <Text as="div" size="2" mb="2" weight="medium">
                    Courses Offered
                  </Text>
                  <Flex gap="2" mb="2">
                    <TextField.Root
                      placeholder="Enter course name"
                      value={courseInput}
                      onChange={(e) => setCourseInput(e.target.value)}
                      onKeyDown={handleCourseKeyPress}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addCourse} disabled={!courseInput.trim()}>
                      <Plus size={16} />
                      Add
                    </Button>
                  </Flex>

                  {courses.length > 0 && (
                    <Flex gap="2" wrap="wrap" mt="2">
                      {courses.map((course, index) => (
                        <Badge key={index} variant='surface'>
                          <Text size="2">{course}</Text>
                          <Button
                            type="button"
                            variant="ghost"
                            size="1"
                            onClick={() => removeCourse(index)}
                          >
                            <X size={12} />
                          </Button>
                        </Badge>
                      ))}
                    </Flex>
                  )}
                  <Text as="p" size="1" color="gray" mt="1">
                    Add courses and programs offered by the college
                  </Text>
                </div>

                {/* Highlights */}
                <div>
                  <Text as="div" size="2" mb="2" weight="medium">
                    College Highlights
                  </Text>
                  <div className="space-y-3">
                    <div>
                      <TextField.Root
                        placeholder="First highlight (e.g., 'Top 10 Engineering School')"
                        className="w-full"
                        {...register('highlight1')}
                      />
                    </div>
                    <div>
                      <TextField.Root
                        placeholder="Second highlight (e.g., '95% Job Placement Rate')"
                        className="w-full"
                        {...register('highlight2')}
                      />
                    </div>
                    <div>
                      <TextField.Root
                        placeholder="Third highlight (e.g., '50+ Industry Partners')"
                        className="w-full"
                        {...register('highlight3')}
                      />
                    </div>
                  </div>
                  <Text as="p" size="1" color="gray" mt="1">
                    Add key highlights that will be displayed as feature cards on the college details page
                  </Text>
                </div>
              </div>
            </FormSection>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Media */}
            <FormSection title="Media">
              <div className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <Text as="div" size="2" mb="2" weight="medium">
                    College Logo
                  </Text>
                  {logoPreview && (
                    <div className="mb-2">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="object-cover w-20 h-20 rounded border border-[--gray-a6]"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'logo')}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button type="button" variant="outline" asChild>
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload size={16} />
                      Upload Logo
                    </label>
                  </Button>
                  <Text as="p" size="1" color="gray" mt="1">
                    Recommended: Square image, 200x200px minimum
                  </Text>
                </div>

                {/* Banner Upload */}
                <div>
                  <Text as="div" size="2" mb="2" weight="medium">
                    Banner Image
                  </Text>
                  {bannerPreview && (
                    <div className="mb-2">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="object-contain w-full rounded border border-[--gray-a6] aspect-[3/1]"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
                    className="hidden"
                    id="banner-upload"
                  />
                  <Button type="button" variant="outline" asChild>
                    <label htmlFor="banner-upload" className="cursor-pointer">
                      <Upload size={16} />
                      Upload Banner
                    </label>
                  </Button>
                  <Text as="p" size="1" color="gray" mt="1">
                    Recommended: 16:9 aspect ratio, 1200x675px minimum
                  </Text>
                </div>
              </div>
            </FormSection>

            {/* Contact Information */}
            <FormSection title="Contact Information">
              <div className="space-y-4">
                {/* Website */}
                <div>
                  <label>
                    <Text as="div" size="2" mb="2" weight="medium">
                      Website
                    </Text>
                    <TextField.Root
                      placeholder="https://college-website.edu"
                      className="w-full"
                      {...register('website', {
                        pattern: {
                          value: /^https?:\/\/.+/,
                          message: "Please enter a valid URL starting with http:// or https://"
                        }
                      })}
                    />
                    <FormFieldErrorMessage errors={errors} field="website" />
                  </label>
                </div>

                {/* Contact Email */}
                <div>
                  <label>
                    <Text as="div" size="2" mb="2" weight="medium">
                      Contact Email
                    </Text>
                    <TextField.Root
                      type="email"
                      placeholder="admissions@college.edu"
                      className="w-full"
                      {...register('contactEmail', {
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address"
                        }
                      })}
                    />
                    <FormFieldErrorMessage errors={errors} field="contactEmail" />
                  </label>
                </div>

                {/* Contact Phone */}
                <div>
                  <label>
                    <Text as="div" size="2" mb="2" weight="medium">
                      Contact Phone
                    </Text>
                    <TextField.Root
                      placeholder="+1 (555) 123-4567"
                      className="w-full"
                      {...register('contactPhone')}
                    />
                  </label>
                </div>
              </div>
            </FormSection>

            {/* Settings */}
            <FormSection title="Settings">
              <div className="space-y-4">
                {/* Tier */}
                <div>
                  <label>
                    <Text as="div" size="2" mb="2" weight="medium">
                      College Tier *
                    </Text>
                    <Controller
                      name="tier"
                      control={control}
                      rules={{ required: "College tier is required" }}
                      render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange}>
                          <Select.Trigger placeholder='Select Tier' className="w-full" />
                          <Select.Content variant="soft" position="popper">
                            <Select.Item value="Ivy League">Ivy League</Select.Item>
                            <Select.Item value="tier1">Tier 1</Select.Item>
                            <Select.Item value="tier2">Tier 2</Select.Item>
                            <Select.Item value="tier3">Tier 3</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                    <FormFieldErrorMessage errors={errors} field="tier" />
                    <Text as="p" size="1" color="gray" mt="1">
                      Select the appropriate tier classification for this college
                    </Text>
                  </label>
                </div>

                {/* Status */}
                <div>
                  <label>
                    <Text as="div" size="2" mb="2" weight="medium">
                      Status
                    </Text>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange}>
                          <Select.Trigger className="w-full" />
                          <Select.Content variant="soft" position="popper">
                            <Select.Item value="draft">Draft</Select.Item>
                            <Select.Item value="published">Published</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                    <Text as="p" size="1" color="gray" mt="1">
                      Draft colleges are not visible to the public
                    </Text>
                  </label>
                </div>

                {/* Featured */}
                <div>
                  <Flex align="center" justify="between">
                    <div>
                      <Text as="div" size="2" weight="medium">
                        Featured College
                      </Text>
                      <Text as="p" size="1" color="gray">
                        Show this college in featured sections
                      </Text>
                    </div>
                    <Controller
                      name="isFeatured"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </Flex>
                </div>
              </div>
            </FormSection>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateEditCollege
