import { Avatar, Badge, Button, Callout, CheckboxGroup, DataList, Flex, Heading, IconButton, Separator, Skeleton, Text, TextField, Tooltip } from '@radix-ui/themes'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircleIcon, ArrowLeft, PencilIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { useGetParentByUserId } from '../../api/parent/parent.queries'
import { useGetSocialWorkerProfileById } from '../../api/social-worker/socialWorker.queries'
import { useStudentByUserId } from '../../api/student/student.queries'
import { useGetTeacherById } from '../../api/teacher/teacher.queries'
import { useAdminUpdateUserProfile } from '../../api/user/user.mutations'
import { useUserById } from '../../api/user/user.queries'
import { Loader } from '../../components'
import { ParentDetails, SocialWorkerDetails, StudentDetails, TeacherDetails } from '../../components/platform-admin/user-details'

const roleFields = ['student', 'parent', 'teacher', 'social_worker', 'school_admin']

function UserDetails() {
  const { id } = useParams()
  const [isAccountEditing, setIsAccountEditing] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm()

  // Get User Account details
  const {
    data: user,
    isLoading,
    isError,
    error,
    isRefetching
  } = useUserById(id)
  const {
    email = '',
    roles = [],
    firstName = '',
    lastName = '',
    dateOfBirth,
    avatar,
    phoneNumber = '',
    createdAt,
    isActive = false,
    isVerified = false,
    loginAttempts = 0,
  } = user?.data ?? {};

  // Get Student Details
  const {
    data: student,
    isLoading: studentLoading,
    isError: isStudentError,
    error: studentError
  } = useStudentByUserId(id, roles?.includes('student'));

  // Get Parent Details 
  const {
    data: parent,
    isLoading: parentLoading,
    isError: isParentError,
    error: parentError
  } = useGetParentByUserId(id, roles?.includes('parent'));

  // Get Teacher Details
  const {
    data: teacher,
    isLoading: teacherLoading,
    isError: isTeacherError,
    error: teacherError
  } = useGetTeacherById(id, roles?.includes('teacher'));

  // Get Social Worker Details
  const {
    data: socialWorker,
    isLoading: socialWorkerLoading,
    isError: isSocialWorkerError,
    error: socialWorkerError
  } = useGetSocialWorkerProfileById(id, roles?.includes('social_worker'));

  const queryClient = useQueryClient();

  // Update User Account
  const { mutate: updateAccount, isPending: isUpdatingAccount } = useAdminUpdateUserProfile();

  // Function to handle Update User Account
  const handleUpdateUserAccount = (data) => {
    updateAccount(
      { id, data },
      {
        onSuccess: (response) => {
          setIsAccountEditing(false);
          toast.success('User account updated successfully');
          queryClient.setQueryData(['users', id], () => response);
          // OR: queryClient.invalidateQueries({ queryKey: ['users', id] });
        },
        onError: (error) => {
          console.log(error);
          toast.error(
            error?.response?.data?.message ||
            error?.message ||
            'Something went wrong while updating user account'
          );
        }
      });
  }

  useEffect(() => {
    if (user?.data) {
      reset({
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth: dateOfBirth
          ? new Date(dateOfBirth).toISOString().split('T')[0]
          : '',
        roles,
      });
    }
  }, [user]);


  if (isLoading) return (
    <Flex justify='center' align='center'>
      <Loader className='size-8' borderWidth={2} borderColor='var(--accent-9)' />
    </Flex>
  );


  if (isError) return (
    <Callout.Root color='red'>
      <Callout.Icon>
        <AlertCircleIcon />
      </Callout.Icon>
      <Callout.Text>
        {error?.response?.data?.message || error?.message || 'Something went wrong while fetching user details'}
      </Callout.Text>
    </Callout.Root>
  );

  return (
    <div className='mb-6 space-y-6'>
      <Button
        variant='ghost'
        color='gray'
        asChild
      >
        <Link to={-1}>
          <ArrowLeft size={16} /> Back
        </Link>
      </Button>
      <Flex gap='4' align='center' justify='between' wrap='wrap'>
        <Flex gap='4' align='center' wrap='wrap'>
          <Skeleton loading={isLoading} className='rounded-full'>
            <Avatar
              src={avatar}
              size='5'
              radius='full'
              fallback={firstName?.charAt(0)}
            />
          </Skeleton>
          <div>
            <Skeleton loading={isLoading} className='w-full h-7'>
              <Text as='p' size='5' weight='medium' className='capitalize'>
                {firstName} {lastName}
              </Text>
            </Skeleton>
            <Text as='p' size='2' color='gray'>
              ID: {id}
            </Text>
          </div>
        </Flex>


        <Flex gap='4' align='center' wrap='wrap'>
          <Button
            variant='outline'
            color='gray'
          >
            Reset Password
          </Button>
          <Button
            variant='soft'
            color='red'
          >
            Delete User
          </Button>
        </Flex>
      </Flex>


      <form onSubmit={handleSubmit(handleUpdateUserAccount)} className='space-y-4'>
        <Flex align='center' gap='2' justify='between'>
          <Heading as='h2' size={'5'} weight={'medium'}>
            Account Details
          </Heading>
          <Tooltip content='Edit Account Details'>
            <IconButton
              type='button'
              size='1'
              variant='soft'
              color='gray'
              onClick={() => setIsAccountEditing(!isAccountEditing)}
            >
              <PencilIcon size={14} />
            </IconButton>
          </Tooltip>
        </Flex>
        <div className='flex flex-wrap justify-between gap-4'>
          <div className='flex-1 min-w-[240px]'>
            <DataList.Root>
              <DataList.Item>
                <DataList.Label minWidth="88px">Email</DataList.Label>
                <DataList.Value>
                  {email || '-'}
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Roles</DataList.Label>
                <DataList.Value className='flex flex-wrap gap-y-1'>
                  {isAccountEditing ? (
                    <Controller
                      name="roles"
                      control={control}
                      render={({ field }) => (
                        <CheckboxGroup.Root
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isUpdatingAccount}
                        >
                          {roleFields.map((role) => (
                            <CheckboxGroup.Item key={role} value={role}>
                              {role}
                            </CheckboxGroup.Item>
                          ))}
                        </CheckboxGroup.Root>
                      )}
                    />
                  ) : (
                    roles.map((role) => (
                      <Badge key={role} variant='surface' className='mr-1 capitalize'>
                        {role.split('_').join(' ')}
                      </Badge>
                    ))
                  )}
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Created At</DataList.Label>
                <DataList.Value>
                  {createdAt ? new Date(createdAt).toLocaleString("en-IN", {
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    dateStyle: "medium",
                    timeStyle: "long",
                  }) : '-'}
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Email Verified</DataList.Label>
                <DataList.Value>
                  {isVerified ? 'Yes' : 'No'}
                </DataList.Value>
              </DataList.Item>
            </DataList.Root>

          </div>
          <div className='flex-1 min-w-[240px]'>
            <DataList.Root>
              <DataList.Item>
                <DataList.Label minWidth="88px">Account Status</DataList.Label>
                <DataList.Value>
                  <Badge
                    color={isActive ? 'jade' : 'red'}
                    radius='full'
                  >
                    {isActive ? 'Active' : 'Deactivated'}
                  </Badge>
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Phone</DataList.Label>
                <DataList.Value>
                  {isAccountEditing ? (
                    <TextField.Root
                      type='tel'
                      autoFocus
                      aria-label='Phone'
                      placeholder='Phone'
                      {...register('phoneNumber')}
                      className='w-full'
                      disabled={isUpdatingAccount}
                    />
                  ) : (
                    phoneNumber || '-'
                  )}
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Date of Birth </DataList.Label>
                <DataList.Value>
                  {
                    isAccountEditing ? (
                      <TextField.Root
                        type='date'
                        aria-label='Date of Birth'
                        placeholder='Date of Birth'
                        {...register('dateOfBirth')}
                        disabled={isUpdatingAccount}
                      />
                    ) : (
                      dateOfBirth ? new Date(dateOfBirth).toLocaleString("en-IN", {
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        dateStyle: "medium",
                      }) : '-'
                    )
                  }
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Login Attempts</DataList.Label>
                <DataList.Value>
                  {loginAttempts}
                </DataList.Value>
              </DataList.Item>
            </DataList.Root>

          </div>
          <div className='flex-1 min-w-[240px]'>
            <DataList.Root>
              <DataList.Item>
                <DataList.Label minWidth="88px">First Name</DataList.Label>
                <DataList.Value>
                  {
                    isAccountEditing ? (
                      <TextField.Root
                        aria-label='First Name'
                        placeholder='First Name'
                        className='w-full'
                        {...register('firstName')}
                        disabled={isUpdatingAccount}
                      />
                    ) : (
                      firstName || '-'
                    )
                  }
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Last Name</DataList.Label>
                <DataList.Value>
                  {
                    isAccountEditing ? (
                      <TextField.Root
                        aria-label='Last Name'
                        placeholder='Last Name'
                        {...register('lastName')}
                        className='w-full'
                        disabled={isUpdatingAccount}
                      />
                    ) : (
                      lastName || '-'
                    )
                  }
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Avatar</DataList.Label>
                <DataList.Value>
                  {avatar ? avatar : "-"}
                </DataList.Value>
              </DataList.Item>
            </DataList.Root>

          </div>
        </div>
        {isAccountEditing && (
          <Flex gap='2' justify='end' align='center'>
            <Button
              type='button'
              variant='soft'
              color='gray'
              onClick={() => {
                setIsAccountEditing(false)
                reset()
              }}
              disabled={isUpdatingAccount}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              color='green'
              disabled={isUpdatingAccount}
            >
              {isUpdatingAccount ? 'Saving...' : 'Save'}
            </Button>
          </Flex>
        )}
      </form>

      <Separator size={'4'} />

      <section className='space-y-4'>
        <Heading as='h2' size={'5'} weight={'medium'}>
          Profile Details
        </Heading>
        {
          roles?.includes('student') &&
          (
            studentLoading ? (
              <Flex justify='center' align='center'>
                <Loader className='size-8' borderWidth={2} borderColor='var(--accent-9)' />
              </Flex>
            ) : isStudentError ? (
              <Callout.Root color='red'>
                <Callout.Icon>
                  <AlertCircleIcon />
                </Callout.Icon>
                <Callout.Text>
                  {studentError?.response?.data?.message || studentError?.message || 'Something went wrong while fetching student details'}
                </Callout.Text>
              </Callout.Root>
            ) : (
              <StudentDetails data={student?.data} />
            )
          )
        }
        {
          roles?.includes('parent') && (
            parentLoading ? (
              <Flex justify='center' align='center'>
                <Loader className='size-8' borderWidth={2} borderColor='var(--accent-9)' />
              </Flex>
            ) : isParentError ? (
              <Callout.Root color='red'>
                <Callout.Icon>
                  <AlertCircleIcon />
                </Callout.Icon>
                <Callout.Text>
                  {parentError?.response?.data?.message || parentError?.message || 'Something went wrong while fetching parent details'}
                </Callout.Text>
              </Callout.Root>
            ) : (
              <ParentDetails data={parent?.data} />
            )
          )
        }
        {
          roles?.includes('teacher') && (
            teacherLoading ? (
              <Flex justify='center' align='center'>
                <Loader className='size-8' borderWidth={2} borderColor='var(--accent-9)' />
              </Flex>
            ) : isTeacherError ? (
              <Callout.Root color='red'>
                <Callout.Icon>
                  <AlertCircleIcon />
                </Callout.Icon>
                <Callout.Text>
                  {teacherError?.response?.data?.message || teacherError?.message || 'Something went wrong while fetching teacher details'}
                </Callout.Text>
              </Callout.Root>
            ) : (
              <TeacherDetails data={teacher?.data} />
            )
          )
        }
        {
          roles?.includes('social_worker') && (
            socialWorkerLoading ? (
              <Flex justify='center' align='center'>
                <Loader className='size-8' borderWidth={2} borderColor='var(--accent-9)' />
              </Flex>
            ) : isSocialWorkerError ? (
              <Callout.Root color='red'>
                <Callout.Icon>
                  <AlertCircleIcon />
                </Callout.Icon>
                <Callout.Text>
                  {socialWorkerError?.response?.data?.message || socialWorkerError?.message || 'Something went wrong while fetching social worker details'}
                </Callout.Text>
              </Callout.Root>
            ) : (
              <SocialWorkerDetails data={socialWorker?.data} />
            )
          )
        }
      </section>
    </div>
  )
}

export default UserDetails
