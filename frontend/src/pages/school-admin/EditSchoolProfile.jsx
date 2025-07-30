import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Grid,
  Separator,
  Text,
  TextField
} from '@radix-ui/themes';
import {
  Info,
  Save
} from 'lucide-react';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useCreateSchoolProfile, useUpdateSchoolProfile } from '../../api/school-admin/school.mutations';
import { useGetSchoolProfile } from '../../api/school-admin/school.queries';
import { FormFieldErrorMessage, Loader } from '../../components';
import PageHeader from './components/PageHeader';
import { useAuth } from '../../Context/AuthContext';
import { isValidPhoneNumber } from 'libphonenumber-js';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

function EditSchoolProfile() {
  const navigate = useNavigate();
  const { profiles, setProfiles } = useAuth();
  const school = profiles?.school;

  const { data: schoolProfile, isLoading, isError, error } = useGetSchoolProfile({
    enabled: !!school?._id
  });
  const { mutate: updateSchoolProfile, isPending: isUpdating } = useUpdateSchoolProfile();
  const { mutate: createSchoolProfile, isPending: isCreating } = useCreateSchoolProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      logo: '',
    },
  });

  // Load school data when available
  useEffect(() => {
    if (schoolProfile?.success && schoolProfile?.data) {
      const school = schoolProfile.data;
      reset({
        name: school.name || '',
        address: school.address || '',
        city: school.city || '',
        state: school.state || '',
        zipCode: school.zipCode || '',
        country: school.country || '',
        phone: school.phone || '',
        email: school.email || '',
        website: school.website || '',
        logo: school.logo || '',
      });
    }
  }, [schoolProfile, reset]);

  const onSubmit = async (data) => {
    // Remove empty fields
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== '')
    );

    if (!school) {
      createSchoolProfile(cleanData, {
        onSuccess: ({ data }) => {
          toast.success('School profile created successfully');
          setProfiles({
            ...profiles,
            school: data
          });
          navigate('/school-admin/profile');
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to create school profile');
        },
      });
    } else {
      updateSchoolProfile(cleanData, {
        onSuccess: () => {
          toast.success('School profile updated successfully');
          navigate('/school-admin/profile');
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to update school profile');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center">
        <Loader />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Callout.Root color="red" variant="surface">
        <Callout.Icon>
          <Info size={16} />
        </Callout.Icon>
        <Callout.Text>
          {error?.response?.data?.message || 'Failed to load school profile. Please try again.'}
        </Callout.Text>
      </Callout.Root>
    );
  }

  return (
    <Box className='mx-auto space-y-6 max-w-3xl'>
      {/* Header */}
      <PageHeader
        title={school ? 'Edit School Profile' : 'Create School Profile'}
        description={school ? 'Update your school information' : 'Create a school profile to get started'}
        backButton
        backLink='/school-admin/profile'
      >
        <Flex gap="3" justify="end">
          <Button
            type="button"
            variant="soft"
            color="gray"
            onClick={() => navigate('/school-admin/profile')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isUpdating || isCreating}
            onClick={handleSubmit(onSubmit)}
          >
            <Save size={16} />
            {isUpdating || isCreating ? 'Saving...' : 'Save Changes'}
          </Button>
        </Flex>
      </PageHeader>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <FormSection title='School Information'>
          {/* School Name */}
          <Box>
            <Text htmlFor='name' as="label" size="2" weight="medium" mb="2" className="block">
              School Name
            </Text>
            <TextField.Root
              size='3'
              id='name'
              placeholder="Enter school name"
              {...register('name', {
                required: 'School name is required',
                minLength: {
                  value: 2,
                  message: 'School name must be at least 2 characters'
                }
              })}
            />
            <FormFieldErrorMessage errors={errors} field='name' />
          </Box>

          {/* School Logo */}
          <Box>
            <Text htmlFor='logo' as="label" size="2" weight="medium" mb="2" className="block">
              School Logo
            </Text>
            <TextField.Root
              size='3'
              id='logo'
              placeholder="Enter school logo"
              {...register('logo')}
            />
            <FormFieldErrorMessage errors={errors} field='logo' />
          </Box>
        </FormSection>

        {/* Address Information */}
        <FormSection title='Address Information'>
          <Grid columns={{ initial: '1', xs: '2' }} gap="4" className="space-y-0">
            {/* Street Address */}
            <Box gridColumn={{ xs: '1 / -1' }}>
              <Text htmlFor='address' as="label" size="2" weight="medium" mb="2" className="block">
                Street Address
              </Text>
              <TextField.Root
                size='3'
                id='address'
                placeholder="Enter street address"
                {...register('address')}
              />
            </Box>

            {/* City */}
            <Box>
              <Text as="label" size="2" weight="medium" mb="2" className="block" htmlFor='city'>
                City
              </Text>
              <TextField.Root
                size='3'
                id='city'
                placeholder="Enter city"
                {...register('city')}
              />
            </Box>

            {/* State */}
            <Box>
              <Text as="label" size="2" weight="medium" mb="2" className="block" htmlFor='state'>
                State
              </Text>
              <TextField.Root
                size='3'
                id='state'
                placeholder="Enter state"
                {...register('state')}
              />
            </Box>

            {/* ZIP Code */}
            <Box>
              <Text as="label" size="2" weight="medium" mb="2" className="block" htmlFor='zipCode'>
                ZIP Code
              </Text>
              <TextField.Root
                size='3'
                id='zipCode'
                placeholder="Enter ZIP code"
                {...register('zipCode', {
                  pattern: {
                    value: /^[A-Z0-9\s-]{2,12}$/i,
                    message: 'Please enter a valid ZIP code'
                  }
                })}
              />
              <FormFieldErrorMessage errors={errors} field='zipCode' />
            </Box>

            {/* Country */}
            <Box>
              <Text as="label" size="2" weight="medium" mb="2" className="block" htmlFor='country'>
                Country
              </Text>
              <TextField.Root
                size='3'
                id='country'
                placeholder="Enter country"
                {...register('country')}
              />
            </Box>
          </Grid>
        </FormSection>

        {/* Contact Information */}
        <FormSection title='Contact Information'>
          <Grid columns={{ initial: '1', xs: '2' }} gap="4">
            {/* Phone */}
            <Box>
              <Text as="label" size="2" weight="medium" mb="2" className="block" htmlFor='phone'>
                Phone Number
              </Text>
              <Controller
                control={control}
                name="phone"
                rules={{
                  validate: (value) => {
                    if (value) {
                      return isValidPhoneNumber(value) || 'Invalid phone number'
                    }
                  }
                }}
                render={({ field }) => (
                  <PhoneInput
                    placeholder="Enter phone number"
                    value={field.value || ''}
                    onChange={field.onChange}
                    defaultCountry=""
                    className="flex px-4 w-full bg-[--color-surface] ring-1 ring-[--gray-a7] focus-within:ring-[1.5px] focus-within:outline-none focus-within:ring-[--focus-8] rounded-md h-[38px]"
                    numberInputProps={{
                      className: "flex-1 border-0 bg-transparent outline-none placeholder:text-[--gray-a9] placeholder:text-[16px]"
                    }}
                  />
                )}
              />

              <FormFieldErrorMessage errors={errors} field='phone' />
            </Box>

            {/* Email */}
            <Box>
              <Text as="label" size="2" weight="medium" mb="2" className="block" htmlFor='email'>
                Email Address
              </Text>
              <TextField.Root
                size='3'
                id='email'
                type="email"
                placeholder="Enter email address"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
              />
              <FormFieldErrorMessage errors={errors} field='email' />
            </Box>

            {/* Website */}
            <Box gridColumn={{ xs: '1 / -1' }}>
              <Text as="label" size="2" weight="medium" mb="2" className="block" htmlFor='website'>
                Website
              </Text>

              <TextField.Root
                size='3'
                id='website'
                type="url"
                placeholder="Enter website URL"
                {...register('website', {
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                    message: 'Please enter a valid website URL'
                  }
                })}
              />
              <FormFieldErrorMessage errors={errors} field='website' />
            </Box>
          </Grid>
        </FormSection>
      </form>
    </Box>
  );
}

export default EditSchoolProfile;

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