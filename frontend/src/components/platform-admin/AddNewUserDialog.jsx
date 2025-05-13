import React, { useState, useEffect } from 'react'
import { Dialog, Button, Flex, TextField, Text, Select, ScrollArea } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useRegister } from '../../api/auth/auth.mutations'
import { Info } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateStudentProfile } from '../../api/student/student.mutations'
import { useCreateTeacherProfile } from '../../api/teacher/teacher.mutations'
import { useCreateParentProfile } from '../../api/parent/parent.mutations'
import { useCreateSocialWorkerProfile } from '../../api/social-worker/socialWorker.mutations'

function AddNewUserDialog() {
  const [role, setRole] = useState('student');
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    clearErrors
  } = useForm({
    defaultValues: {
      // Common fields for all users
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      
      // Optional role-specific fields
      grade: '',             // Student
      schoolId: '',          // Student & Teacher
      subjectsTaught: '',    // Teacher
      organization: '',      // Social Worker
      caseloadLimit: ''      // Social Worker
    }
  });

  // Reset form and clear errors when role changes
  useEffect(() => {
    reset({
      // Common fields for all users
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      
      // Optional role-specific fields
      grade: '',             // Student
      schoolId: '',          // Student & Teacher
      subjectsTaught: '',    // Teacher
      organization: '',      // Social Worker
      caseloadLimit: ''      // Social Worker
    });
    clearErrors();
  }, [role, reset, clearErrors]);

  const { mutate: registerUser, isPending, isError, error } = useRegister();
  const { mutate: createStudentProfile } = useCreateStudentProfile();
  const { mutate: createTeacherProfile } = useCreateTeacherProfile();
  const { mutate: createParentProfile } = useCreateParentProfile();
  const { mutate: createSocialWorkerProfile } = useCreateSocialWorkerProfile();

  // Create profile based on role
  const createProfile = async (userId, data) => {
    try {
      setIsCreatingProfile(true);
      let profileData = {};
      
      // School admin doesn't use this function as they don't need a profile
      // This is handled in the onSubmit function by checking if role !== 'school_admin'
      
      // Prepare data based on role
      if (role === 'student') {
        profileData = { 
          userId,
          grade: data.grade || undefined,
          schoolId: data.schoolId || undefined
        };
        
        return new Promise((resolve) => {
          createStudentProfile(profileData, {
            onSuccess: () => {
              setIsCreatingProfile(false);
              resolve(true);
            },
            onError: (error) => {
              console.error('Error creating student profile:', error);
              setIsCreatingProfile(false);
              resolve(false);
            }
          });
        });
      } else if (role === 'teacher') {
        profileData = { 
          userId,
          subjectsTaught: data.subjectsTaught ? data.subjectsTaught.split(',').map(s => s.trim()) : [],
          schoolId: data.schoolId || undefined
        };
        
        return new Promise((resolve) => {
          createTeacherProfile(profileData, {
            onSuccess: () => {
              setIsCreatingProfile(false);
              resolve(true);
            },
            onError: (error) => {
              console.error('Error creating teacher profile:', error);
              setIsCreatingProfile(false);
              resolve(false);
            }
          });
        });
      } else if (role === 'parent') {
        profileData = { userId }; // Just need user ID for parent profile
        
        return new Promise((resolve) => {
          createParentProfile(profileData, {
            onSuccess: () => {
              setIsCreatingProfile(false);
              resolve(true);
            },
            onError: (error) => {
              console.error('Error creating parent profile:', error);
              setIsCreatingProfile(false);
              resolve(false);
            }
          });
        });
      } else if (role === 'social_worker') {
        profileData = { 
          userId,
          organization: data.organization || undefined,
          caseloadLimit: data.caseloadLimit ? parseInt(data.caseloadLimit) : undefined
        };
        
        return new Promise((resolve) => {
          createSocialWorkerProfile(profileData, {
            onSuccess: () => {
              setIsCreatingProfile(false);
              resolve(true);
            },
            onError: (error) => {
              console.error('Error creating social worker profile:', error);
              setIsCreatingProfile(false);
              resolve(false);
            }
          });
        });
      } else if (role === 'school_admin') {
        // School admin doesn't need a separate profile
        // This case should never be reached as onSubmit skips profile creation for school admins
        setIsCreatingProfile(false);
        return Promise.resolve(true);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setIsCreatingProfile(false);
      return Promise.resolve(false);
    }
  };

  const onSubmit = (data) => {
    // Prepare base userData object - only required fields for registration
    let userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      roles: [role]
    };

    registerUser(userData, {
      onSuccess: async (response) => {
        const userId = response.data?.user?._id;
        
        if (userId && role !== 'school_admin') {
          // Create profile for non-school admin roles
          const profileCreated = await createProfile(userId, data);
          
          if (profileCreated) {
            toast.success(`${role.split('_').join(' ')} account and profile created successfully!`);
          } else {
            toast.warning('Account created but failed to create profile. The user will need to create their profile later.');
          }
        } else {
          // For school admin, we just register without creating a profile
          toast.success(`${role.split('_').join(' ')} account created successfully!`);
        }
        setIsOpen(false);
        reset();
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to create account');
      }
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger>
        <Button onClick={() => setIsOpen(true)}>Add New User</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="768px" aria-describedby={undefined}>
        <Flex justify='between' align='center' wrap='wrap' gap='2' mb='4'>
          <Dialog.Title className='mb-0 capitalize' size={'6'} weight={'medium'}>
            Create {role.split('_').join(' ')} Account
          </Dialog.Title>

          <Select.Root value={role} onValueChange={setRole}>
            <Select.Trigger variant='ghost' />
            <Select.Content variant='soft' position='popper'>
              <Select.Item value="student">Student</Select.Item>
              <Select.Item value="teacher">Teacher</Select.Item>
              <Select.Item value='parent'>Parent</Select.Item>
              <Select.Item value="social_worker">Social Worker</Select.Item>
              <Select.Item value="school_admin">School Admin</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
        <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: '80vh' }} className='pr-2'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4 px-2'>
            {/* Common fields for all roles */}
            <Flex gap="4" wrap={'wrap'}>
              <div className='flex-1 min-w-[200px]'>
                <label>
                  <Text as="div" size="2" mb="1" weight="medium">
                    First Name *
                  </Text>
                  <TextField.Root
                    placeholder="Enter first name"
                    className='flex-1'
                    {...register("firstName", {
                      required: "First name is required"
                    })}
                  />
                </label>
                {errors.firstName && (
                  <Text
                    as="p"
                    size={"2"}
                    className="mt-1 text-[--red-8] flex items-center gap-1"
                  >
                    <Info size={14} /> {errors.firstName.message}
                  </Text>
                )}
              </div>
              <div className='flex-1 min-w-[200px]'>
                <label>
                  <Text as="div" size="2" mb="1" weight="medium">
                    Last Name *
                  </Text>
                  <TextField.Root
                    placeholder="Enter last name"
                    {...register("lastName", {
                      required: "Last name is required"
                    })}
                  />
                </label>
                {errors.lastName && (
                  <Text
                    as="p"
                    size={"2"}
                    className="mt-1 text-[--red-8] flex items-center gap-1"
                  >
                    <Info size={14} /> {errors.lastName.message}
                  </Text>
                )}
              </div>
            </Flex>

            <div className='flex-1'>
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Email *
                </Text>
                <TextField.Root
                  placeholder="Enter email address"
                  className='flex-1'
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email"
                    }
                  })}
                />
              </label>
              {errors.email && (
                <Text
                  as="p"
                  size={"2"}
                  className="mt-1 text-[--red-8] flex items-center gap-1"
                >
                  <Info size={14} /> {errors.email.message}
                </Text>
              )}
            </div>

            {/* Role-specific profile fields */}
            {role === 'student' && (
              <Flex gap="4" wrap={'wrap'}>
                <div className='flex-1 min-w-[200px]'>
                  <label>
                    <Text as="div" size="2" mb="1" weight="medium">
                      Grade
                    </Text>
                    <TextField.Root
                      placeholder="Enter grade (e.g., 9th)"
                      {...register("grade")}
                    />
                  </label>
                </div>
                <div className='flex-1 min-w-[200px]'>
                  <label>
                    <Text as="div" size="2" mb="1" weight="medium">
                      School ID
                    </Text>
                    <TextField.Root
                      placeholder="Enter school ID (optional)"
                      {...register("schoolId")}
                    />
                  </label>
                </div>
              </Flex>
            )}

            {/* Teacher-specific fields */}
            {role === 'teacher' && (
              <Flex gap="4" wrap={'wrap'}>
                <div className='flex-1 min-w-[200px]'>
                  <label>
                    <Text as="div" size="2" mb="1" weight="medium">
                      Subjects Taught
                    </Text>
                    <TextField.Root
                      placeholder="Enter subjects (comma separated)"
                      {...register("subjectsTaught")}
                    />
                  </label>
                  <Text as="p" size="1" className="mt-1 text-gray-500">
                    Enter subjects separated by commas (e.g., Math, Science, History)
                  </Text>
                </div>
                <div className='flex-1 min-w-[200px]'>
                  <label>
                    <Text as="div" size="2" mb="1" weight="medium">
                      School ID
                    </Text>
                    <TextField.Root
                      placeholder="Enter school ID (optional)"
                      {...register("schoolId")}
                    />
                  </label>
                </div>
              </Flex>
            )}

            {/* Social worker-specific fields */}
            {role === 'social_worker' && (
              <Flex gap="4" wrap={'wrap'}>
                <div className='flex-1 min-w-[200px]'>
                  <label>
                    <Text as="div" size="2" mb="1" weight="medium">
                      Organization
                    </Text>
                    <TextField.Root
                      placeholder="Enter organization name"
                      className='flex-1'
                      {...register("organization")}
                    />
                  </label>
                </div>
                <div className='flex-1 min-w-[200px]'>
                  <label>
                    <Text as="div" size="2" mb="1" weight="medium">
                      Caseload Limit
                    </Text>
                    <TextField.Root
                      type="number"
                      placeholder="Enter caseload limit"
                      {...register("caseloadLimit")}
                    />
                  </label>
                </div>
              </Flex>
            )}

            {/* Password field (for all roles) */}
            <div className='flex-1'>
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Password *
                </Text>
                <TextField.Root
                  type="password"
                  placeholder="Enter password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    }
                  })}
                />
              </label>
              {errors.password && (
                <Text
                  as="p"
                  size={"2"}
                  className="mt-1 text-[--red-8] flex items-center gap-1"
                >
                  <Info size={14} /> {errors.password.message}
                </Text>
              )}
            </div>

            <Text as="p" size="2" className="mt-1 italic text-gray-500">
              * Required fields
            </Text>

            <Flex gap="4" mt="4" justify="end" wrap={'wrap'}>
              <Button 
                type="submit"
                disabled={isPending || isCreatingProfile}
                className='flex-1 min-w-max'
              >
                {isPending || isCreatingProfile ? 'Creating...' : 'Create Account'}
              </Button>
              <Dialog.Close>
                <Button 
                  variant="soft" 
                  color="gray"
                  className='flex-1'
                  onClick={() => reset()}
                >
                  Cancel
                </Button>
              </Dialog.Close>
            </Flex>
          </form>
        </ScrollArea>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default AddNewUserDialog
