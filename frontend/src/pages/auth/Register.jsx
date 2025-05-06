import { Button, Callout, Flex, IconButton, Text, TextField } from '@radix-ui/themes'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { roleFields } from '../../utils/roleFields';
import { useForm } from 'react-hook-form';
import { useRegister } from '../../api/auth/auth.mutations'
import MyButton from '../../components/MyButton'
import { Eye, EyeOff, Info } from "lucide-react";

const validRoles = [
  "STUDENT",
  "PARENT",
  "SOCIAL_WORKER",
  "TEACHER",
  "SCHOOL",
  "DONOR",
];

function Register() {
  const [showPassword, setShowPassword] = useState(false);

  // Get search parameters from URL
  const [searchParams] = useSearchParams();

  // Get the 'role' parameter from the URL query string
  const roleParam = searchParams.get("role");
  const navigate = useNavigate();

  // Normalize the role to uppercase to maintain consistency
  const normalizedRole = roleParam?.toUpperCase();

  useEffect(() => {
    // If no role is provided or if the role is invalid, redirect to the role selection page
    if (!normalizedRole || !validRoles.includes(normalizedRole)) {
      navigate("/role-selection", { replace: true });
    }
  }, [normalizedRole, navigate]);

  // If the role is invalid or not provided, prevent rendering of the component
  if (!normalizedRole || !validRoles.includes(normalizedRole)) return null;

  // Get the fields for the selected role
  const fieldsForRole = roleFields[normalizedRole];

  // Get the icon and gradient for the selected role
  const { icon: RoleIcon, gradient } = fieldsForRole;

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const { mutate: registerUser, isPending, isError, error } = useRegister();

  // Handle form submission
  const onSubmit = async (data) => {
    console.log("Form submitted:", data);

    const { confirmPassword, ...userData } = data;
    userData.roles = [normalizedRole?.toLowerCase()];

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
    <div className="relative z-10 w-full max-w-xl space-y-6 text-[--gray-1] rounded-2xl ">
      <div className="text-center">
        <Text as="p" size={"8"} weight={"bold"} className="capitalize">
          Create Your {normalizedRole?.toLowerCase().replace("_", " ")} Account
        </Text>
        <Text as="p" size={"4"} mt={"4"}>
          Fill in your information to get started
        </Text>
      </div>

      {/* Role-specific icon and gradient circle */}
      <div
        className="flex items-center justify-center w-20 h-20 mx-auto rounded-full"
        style={{ background: `linear-gradient(to bottom right, ${gradient[0]}, ${gradient[1]})` }}
      >
        <RoleIcon size={40} color="#fff" />
      </div>

      {/* Error Message Display */}
      {isError && (
        <Callout.Root
          color="red"
          variant="surface"
          highContrast
          className=" bg-[--red-a4] text-[--red-8] font-medium"
        >
          <Callout.Icon>
            <Info />
          </Callout.Icon>
          <Callout.Text>
            {error?.response?.data?.message ||
              "Something went wrong. Please try again."}
          </Callout.Text>
        </Callout.Root>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
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
                className="h-12 "
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
                className="h-12 "
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
              className="h-12 "
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
                <TextField.Slot side="right">
                  <IconButton
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    variant="ghost"
                    radius="full"
                  >
                    {showPassword ? <EyeOff size={"20"} /> : <Eye size={"20"} />}
                  </IconButton>
                </TextField.Slot>
              </TextField.Root>
            </label>
            <Text as='p' size={'2'} className='text-[--gray-6]'>
              Must be at least 8 characters
            </Text>
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
                <TextField.Slot side="right">
                  <IconButton
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    variant="ghost"
                    radius="full"
                  >
                    {showPassword ? <EyeOff size={"20"} /> : <Eye size={"20"} />}
                  </IconButton>
                </TextField.Slot>
              </TextField.Root>
            </label>
            {errors.confirmPassword && (
              <Text
                as="p"
                size={"2"}
                className="mt-1 text-[--red-8] flex items-center gap-1"
              >
                <Info size={14} /> {errors.confirmPassword.message}
              </Text>
            )}
          </div>

        </Flex>

        <div className='text-center'>
          <MyButton
            mt={'3'}
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Processing...' : 'Register'}
          </MyButton>
        </div>
      </form>

      <div className='text-center '>
        <Button
          radius='full'
          size={'3'}
          className=' text-[--gray-6] font-medium'
          variant='ghost'
          asChild
        >
          <Link to={"/role-selection"}>Back to Role Selection</Link>
        </Button>
      </div>

      <Text as="div" align={"center"}>
        Already have an account?{" "}
        <Link to={"/login"} className="underline">
          <Text as="span" weight={"medium"}>
            Login
          </Text>
        </Link>
      </Text>
    </div>
  );
}

export default Register;
