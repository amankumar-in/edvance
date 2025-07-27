import { Button, Callout, Card, Flex, Text, TextField } from '@radix-ui/themes';
import { Info } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useCreateParentProfile } from '../../api/parent/parent.mutations';
import { useUpdateUserProfile } from '../../api/user/user.mutations';
import { Container, ProfilePictureUpload } from '../../components';
import { useAuth } from '../../Context/AuthContext';
import { isValidPhoneNumber } from 'libphonenumber-js';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

function calculateAge(dateString) {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function CreateParentProfile() {
  const { user, setUser, profiles } = useAuth();
  const { firstName, lastName, email } = user ?? {};
  const navigate = useNavigate();
  const parentProfile = profiles?.['parent'];


  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      dateOfBirth: '',
      phoneNumber: '',
    },
  });

  const {
    mutateAsync: updateUserProfile,
    isPending: isUpdatingUserProfile,
    isError: isErrorUpdatingUserProfile,
    error: errorUpdatingUserProfile,
  } = useUpdateUserProfile();

  const {
    mutateAsync: createParentProfile,
    isPending: isCreatingProfile,
    isError: isErrorCreatingProfile,
    error: errorCreatingProfile,
  } = useCreateParentProfile();

  const onSubmit = async (data) => {
    try {
      await updateUserProfile(data);
      try {
        await createParentProfile({});

        toast.success('Profile created successfully');

        if (data.phoneNumber) {
          setUser({ ...user, phoneNumber: data.phoneNumber });
        }

        navigate('/parent/dashboard', { replace: true });
      } catch (error) {
        // error handled below
        console.error('Failed to create parent profile', error)
      }
    } catch (error) {
      // error handled below
      console.error('Failed to update user profile', error)
    }
  };

  // If parent profile already exists, redirect to dashboard
  if (parentProfile) {
    return <Navigate to="/parent/dashboard" replace />
  }

  return (
    <Container>
      <Card size='3' className='mx-auto w-full max-w-2xl shadow-md'>
        <div className="relative z-10 space-y-6">
          <div className="text-center">
            <Text as="p" size="8" weight="bold">Create Parent Profile</Text>
            <Text as="p" size="4" mt="4">Complete your parent profile to get started</Text>
          </div>
          {/* Error Message Display */}
          {(isErrorCreatingProfile || isErrorUpdatingUserProfile) && (
            <Callout.Root color="red" variant="surface">
              <Callout.Icon>
                <Info size={16} />
              </Callout.Icon>
              <Callout.Text>
                {errorCreatingProfile?.response?.data?.message ||
                  errorUpdatingUserProfile?.response?.data?.message ||
                  "Failed to create profile."}
              </Callout.Text>
            </Callout.Root>
          )}

          {/* Profile Picture Upload Component */}
          <ProfilePictureUpload />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name and Last Name */}
            <Flex gap={'4'} className='flex-col sm:flex-row'>
              <label className='flex-1'>
                <Text as="div" size="2" mb="1" weight="medium">
                  First Name
                </Text>
                <TextField.Root
                  size={"3"}
                  defaultValue={firstName}
                  radius="large"
                  placeholder="First name"
                  readOnly
                />
              </label>
              <label className='flex-1'>
                <Text as="div" size="2" mb="1" weight="medium">
                  Last Name
                </Text>
                <TextField.Root
                  readOnly
                  defaultValue={lastName}
                  size={"3"}
                  radius="large"
                  placeholder="Last Name"
                />
              </label>
            </Flex>
            {/* Email */}
            <div>
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Email
                </Text>
                <TextField.Root
                  size={"3"}
                  defaultValue={email}
                  radius="large"
                  placeholder="Email"
                  readOnly
                />
              </label>
            </div>
            {/* Date of birth and Phone number */}
            <Flex gap={'4'} className='flex-col sm:flex-row'>
              <div className='flex-1'>
                <label >
                  <Text as="div" size="2" mb="1" weight="medium">
                    Date of Birth {" "}
                    <Text as='span' color='gray' size='2' weight={'regular'}>
                      (optional)
                    </Text>
                  </Text>
                  <TextField.Root
                    type='date'
                    size={"3"}
                    {...register('dateOfBirth', {
                      validate: (value) => {
                        if (value) {
                          const age = calculateAge(value);
                          if (isNaN(age) || age < 0) return 'Enter a valid date';
                          return true;
                        }
                      },
                    })}
                    radius="large"
                  />
                </label>
                {errors.dateOfBirth && (
                  <Text
                    as="p"
                    size={"2"}
                    color='red'
                    className="flex gap-1 items-center mt-1"
                  >
                    <Info size={14} /> {errors.dateOfBirth.message}
                  </Text>
                )}
              </div>
              <div className='flex-1'>
                <label className='flex-1'>
                  <Text as="div" size="2" mb="1" weight="medium">
                    Phone Number
                  </Text>
                  <Controller
                    control={control}
                    name="phoneNumber"
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
                </label>
                {errors.phoneNumber && (
                  <Text
                    as="p"
                    size={"2"}
                    color='red'
                    className="flex gap-1 items-center mt-1"
                  >
                    <Info size={14} /> {errors.phoneNumber.message}
                  </Text>
                )}
              </div>
            </Flex>
            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                size="3"
                className="w-full"
                disabled={isCreatingProfile || isUpdatingUserProfile}
              >
                {(isCreatingProfile || isUpdatingUserProfile) ? 'Creating...' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </Container>
  );
}

export default CreateParentProfile;
