import { Button, Callout, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { AlertTriangle, CircleAlert, Info } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRegister } from '../../api/auth/auth.mutations';

const CreateSubAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'sub_admin',
    }
  });

  const password = watch('password');
  const { mutate: registerUser, isPending, isError, error, reset: resetRegisterError } = useRegister();

  const onSubmit = (data) => {
    // Remove confirmPassword as it's not needed in the API call
    const { confirmPassword, role, ...userData } = data;

    // Set roles as array with the selected role
    userData.roles = ['sub_admin'];

    registerUser(userData, {
      onSuccess: (response) => {
        toast.success('Sub Admin created successfully.');
        reset();
        setIsOpen(false);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || error?.message || 'Failed to create Sub Admin account'
        );
      }
    });
  };


  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => {
      if (!o) {
        reset();
        resetRegisterError();
      }
      setIsOpen(o);
    }}>
      <Dialog.Trigger>
        <Button onClick={() => setIsOpen(true)}>
          Create Sub Admin
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="650px">
        <Dialog.Title>Create Sub Admin</Dialog.Title>
        <Dialog.Description size="2" mb="4" color='gray'>
          Create a new Sub Admin account with full administrative privileges. A verification email will be sent to complete the account setup.
        </Dialog.Description>


        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Callout.Root variant='surface' color="blue" >
            <Callout.Icon>
              <Info size={16} />
            </Callout.Icon>
            <Callout.Text>
              Sub Admins have full administrative privileges identical to Platform Admins, with one limitation: they cannot create other admin accounts. They can manage all users, content, system settings, etc.
            </Callout.Text>
          </Callout.Root>

          {isError && <Callout.Root
            color="red"
          >
            <Callout.Icon>
              <CircleAlert size={16} />
            </Callout.Icon>
            <Callout.Text>
              {error?.response?.data?.message ||
                "Error occured while creating account."}
            </Callout.Text>
          </Callout.Root>
}

          <Flex gap="4" className='flex-col md:flex-row'>
            <div className="flex-1">
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  First Name
                </Text>
                <TextField.Root
                  {...register("firstName", {
                    required: "First name is required"
                  })}
                  placeholder="Enter first name"
                  className="w-full"
                />
              </label>
              {errors.firstName && (
                <Text
                  as="p"
                  size="2"
                  className="mt-1 text-[--red-8] flex items-center gap-1"
                >
                  <Info size={14} /> {errors.firstName.message}
                </Text>
              )}
            </div>

            <div className="flex-1">
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Last Name
                </Text>
                <TextField.Root
                  {...register("lastName", {
                    required: "Last name is required"
                  })}
                  placeholder="Enter last name"
                  className="w-full"
                />
              </label>
              {errors.lastName && (
                <Text
                  as="p"
                  size="2"
                  className="mt-1 text-[--red-8] flex items-center gap-1"
                >
                  <Info size={14} /> {errors.lastName.message}
                </Text>
              )}
            </div>
          </Flex>

          <div className="flex-1">
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                Email
              </Text>
              <TextField.Root
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Please enter a valid email"
                  }
                })}
                placeholder="Enter email address"
                className="w-full"
              />
            </label>
            {errors.email && (
              <Text
                as="p"
                size="2"
                className="mt-1 text-[--red-8] flex items-center gap-1"
              >
                <Info size={14} /> {errors.email.message}
              </Text>
            )}
            <Text as="p" size="1" color="gray" mt="1" >
              A verification email will be sent to this address. The account will remain inactive until verified.
            </Text>
          </div>

          <Flex gap="4" className='flex-col md:flex-row'>
            <div className="flex-1">
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Password
                </Text>
                <TextField.Root
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    }
                  })}
                  placeholder="Enter password"
                  className="w-full"
                />
              </label>
              {errors.password && (
                <Text
                  as="p"
                  size="2"
                  className="mt-1 text-[--red-8] flex items-center gap-1"
                >
                  <Info size={14} /> {errors.password.message}
                </Text>
              )}
              <Text as="p" size="1" color="gray" mt="1" >
                Password must be at least 8 characters
              </Text>
            </div>

            <div className="flex-1">
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Confirm Password
                </Text>
                <TextField.Root
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match"
                  })}
                  placeholder="Confirm password"
                  className="w-full"
                />
              </label>
              {errors.confirmPassword && (
                <Text
                  as="p"
                  size="2"
                  className="mt-1 text-[--red-8] flex items-center gap-1"
                >
                  <Info size={14} /> {errors.confirmPassword.message}
                </Text>
              )}
            </div>
          </Flex>

          <Callout.Root variant='surface' color="amber" size="1">
            <Callout.Icon>
              <AlertTriangle size={14} />
            </Callout.Icon>
            <Callout.Text>
              The Sub Admin will need to verify their email before accessing their account.
            </Callout.Text>
          </Callout.Root>

          <Flex gap="4" justify="end" wrap="wrap">
            <Button
              type="submit"
              color="grass"
              className="flex-1 min-w-max"
              disabled={isPending}
            >
              {isPending ? 'Creating...' : 'Create'}
            </Button>
            <Dialog.Close>
              <Button
                variant="soft"
                color="gray"
                className="flex-1"
                disabled={isPending}
              >
                Cancel
              </Button>
            </Dialog.Close>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CreateSubAdmin; 