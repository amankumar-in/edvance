import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Grid,
  Text,
  TextField
} from '@radix-ui/themes';
import {
  Info,
  Save
} from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useUpdateSchoolProfile } from '../../api/school-admin/school.mutations';
import { useGetSchoolProfile } from '../../api/school-admin/school.queries';
import { FormFieldErrorMessage, Loader } from '../../components';
import PageHeader from './components/PageHeader';

function EditSchoolProfile() {
  const navigate = useNavigate();

  const { data: schoolProfile, isLoading, isError, error } = useGetSchoolProfile();
  const { mutate: updateSchoolProfile, isPending: isUpdating } = useUpdateSchoolProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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
      });
    }
  }, [schoolProfile, reset]);

  const onSubmit = async (data) => {
    // Remove empty fields
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== '')
    );

    updateSchoolProfile(cleanData, {
      onSuccess: () => {
        toast.success('School profile updated successfully');
        navigate('/school-admin/profile');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to update school profile');
      },
    });
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
    <Box className='mx-auto max-w-3xl'>
      {/* Header */}
      <PageHeader
        title="Edit School Profile"
        description="Update your school information"
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
            disabled={isUpdating}
            onClick={handleSubmit(onSubmit)}
          >
            <Save size={16} />
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </Flex>
      </PageHeader>

      {/* Form */}
      <Card mt='5' size='3'>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* School Name */}
          <Box>
            <Text htmlFor='name' as="label" size="2" weight="medium" mb="2" className="block">
              School Name
            </Text>
            <TextField.Root
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

          {/* Address Information */}
          <Box>
            <Text as="p" size="4" weight="bold" mb="4">
              Address Information
            </Text>

            <Grid columns={{ initial: '1', xs: '2' }} gap="4" className="space-y-0">
              {/* Street Address */}
              <Box gridColumn={{ xs: '1 / -1' }}>
                <Text htmlFor='address' as="label" size="2" weight="medium" mb="2" className="block">
                  Street Address
                </Text>
                <TextField.Root
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
                  id='zipCode'
                  placeholder="Enter ZIP code"
                  {...register('zipCode', {
                    pattern: {
                      value: /^\d{5}(-\d{4})?$/,
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
                  id='country'
                  placeholder="Enter country"
                  {...register('country')}
                />
              </Box>
            </Grid>
          </Box>

          {/* Contact Information */}
          <Box>
            <Text as="p" size="4" weight="bold" mb="4">
              Contact Information
            </Text>

            <Grid columns={{ initial: '1', xs: '2' }} gap="4">
              {/* Phone */}
              <Box>
                <Text as="label" size="2" weight="medium" mb="2" className="block" htmlFor='phone'>
                  Phone Number
                </Text>
                <TextField.Root
                  id='phone'
                  type="tel"
                  placeholder="Enter phone number"
                  {...register('phone', {
                    pattern: {
                      value: /^[\+]?[1-9][\d]{0,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                />
                <FormFieldErrorMessage errors={errors} field='phone' />
              </Box>

              {/* Email */}
              <Box>
                <Text as="label" size="2" weight="medium" mb="2" className="block" htmlFor='email'>
                  Email Address
                </Text>
                <TextField.Root
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
          </Box>
        </form>
      </Card>
    </Box>
  );
}

export default EditSchoolProfile; 