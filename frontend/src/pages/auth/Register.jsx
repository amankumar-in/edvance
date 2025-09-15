import { Button, Card, Flex, IconButton, Text, TextField } from '@radix-ui/themes';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useRegister } from '../../api/auth/auth.mutations';
import { ErrorCallout, FormFieldErrorMessage } from '../../components';
import { APP_NAME, BRAND_COLOR } from '../../utils/constants';

const validRoles = [
  "student",
  "parent",
  "social_worker",
  "teacher",
  "school_admin",
];

function Register() {
  const [showPassword, setShowPassword] = useState(false);

  // Get search parameters from URL
  const [searchParams] = useSearchParams();

  // Get the 'role' parameter from the URL query string
  const roleParam = searchParams.get("role");
  const navigate = useNavigate();

  // Normalize the role to uppercase to maintain consistency
  const normalizedRole = roleParam?.toLowerCase();

  useEffect(() => {
    // If no role is provided or if the role is invalid, redirect to the role selection page
    if (!normalizedRole || !validRoles.includes(normalizedRole)) {
      navigate("/role-selection", { replace: true });
    }
  }, [normalizedRole, navigate]);

  // If the role is invalid or not provided, prevent rendering of the component
  if (!normalizedRole || !validRoles.includes(normalizedRole)) return null;

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({ mode: "onTouched" });
  const password = watch('password');

  const { mutate: registerUser, isPending, isError, error } = useRegister();

  // Handle form submission
  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    userData.roles = [normalizedRole];

    registerUser(userData, {
      onSuccess: ({ data }) => {
        // Redirect to the profile creation page
        navigate("/email-verification", { state: data });
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  return (
    <div className="relative z-10 space-y-6 w-full max-w-2xl">
      <Card size={'3'} className='space-y-6 shadow-lg shadow-black/20'>
        <div className="text-center">
          <Text as="p" size={"8"} weight={"bold"} className="text-transparent bg-clip-text bg-gradient-to-r from-[--brand-blue] to-[--brand-purple] drop-shadow">
            {APP_NAME}
          </Text>
          <Text as="p" mt={"4"} className='capitalize'>
            Create Your {normalizedRole?.replace("_", " ")} Account
          </Text>
        </div>

        {/* Error Message Display */}
        {isError && (
          <ErrorCallout
            errorMessage={error?.response?.data?.message || error?.message || "Something went wrong. Please try again."}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-3'>
          <Flex gap={'4'} className='flex-col sm:flex-row'>
            <div className="flex-1 space-y-1">
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  First Name
                </Text>
                <TextField.Root
                  size={"3"}
                  {...register("firstName", {
                    required: "First Name is required",
                  })}
                  radius="large"
                  placeholder="First name"
                  className="h-12"
                >
                  <TextField.Slot side="left">
                    <User size={16} />
                  </TextField.Slot>
                </TextField.Root>
              </label>
              <FormFieldErrorMessage errors={errors} field={"firstName"} />
            </div>

            <div className="flex-1 space-y-1">
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Last Name
                </Text>
                <TextField.Root
                  size={"3"}
                  {...register("lastName", {
                    required: "Last Name is required",
                  })}
                  radius="large"
                  placeholder="Last Name"
                  className="h-12"
                >
                  <TextField.Slot side="left"> <User size={16} /> </TextField.Slot>
                </TextField.Root>
              </label>
              <FormFieldErrorMessage errors={errors} field={"lastName"} />
            </div>
          </Flex>

          <div className="flex-1 space-y-1">
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                Email
              </Text>
              <TextField.Root
                size={"3"}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Please enter a valid email",
                  },
                })}
                radius="large"
                placeholder="Email"
                className="h-12"
              >
                <TextField.Slot side="left">
                  <Mail size={16} />
                </TextField.Slot>
              </TextField.Root>
            </label>
            <FormFieldErrorMessage errors={errors} field={"email"} />
          </div>

          <Flex gap={'4'} className='flex-col sm:flex-row'>
            <div className="flex-1 space-y-1">
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Password
                </Text>
                <TextField.Root
                  size={"3"}
                  type={showPassword ? "text" : "password"}
                  radius="large"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                  })}
                  className="h-12"
                  placeholder="Password"
                >
                  <TextField.Slot side="left">
                    <Lock size={16} />
                  </TextField.Slot>
                  <TextField.Slot side="right">
                    <IconButton
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      variant="ghost"
                      radius="full"
                      color='gray'
                    >
                      {showPassword ? <EyeOff size={"16"} /> : <Eye size={"16"} />}
                    </IconButton>
                  </TextField.Slot>
                </TextField.Root>
              </label>
              <FormFieldErrorMessage errors={errors} field={"password"} />
              <Text as='p' size={'1'} color='gray'>
                Must be at least 8 characters
              </Text>
            </div>

            <div className="flex-1 space-y-1">
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Confirm Password
                </Text>
                <TextField.Root
                  size={"3"}
                  type={showPassword ? "text" : "password"}
                  radius="large"
                  {...register("confirmPassword", {
                    required: "Confirm Password is required",
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                  className="h-12"
                  placeholder="Confirm Password"
                >
                  <TextField.Slot side="left">
                    <Lock size={16} />
                  </TextField.Slot>
                  <TextField.Slot side="right">
                    <IconButton
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      variant="ghost"
                      radius="full"
                      color='gray'
                    >
                      {showPassword ? <EyeOff size={"16"} /> : <Eye size={"16"} />}
                    </IconButton>
                  </TextField.Slot>
                </TextField.Root>
              </label>
              <FormFieldErrorMessage errors={errors} field={"confirmPassword"} />
            </div>
          </Flex>

          <div className='pt-3 text-center'>
            <Button
              type="submit"
              size={'4'}
              className='w-full shadow-md'
              disabled={isPending}
            >
              {isPending ? 'Processing...' : 'Register'}
            </Button>
          </div>
        </form>



        <Text as="div" align={"center"} size={'2'}>
          Already have an account?{" "}
          <Text as="span" weight={"medium"} color={BRAND_COLOR}>
            <Link to={"/login"} className="hover:underline">
              Login
            </Link>
          </Text>
        </Text>
        <Flex justify='center'>
          <Button
            variant='ghost'
            size={'1'}
            asChild
            color='gray'
          >
            <Link to={"/role-selection"}>
              <ArrowLeft size={14} />
              Back to role selection
            </Link>
          </Button>
        </Flex>
      </Card>

    </div>
  );
}

export default Register;
