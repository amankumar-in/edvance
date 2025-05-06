import { Button, Text, TextField } from "@radix-ui/themes";
import React, { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { roleFields } from "../../utils/roleFields";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react";
import { useRegister } from "../../api/auth/auth.mutations";

const validRoles = [
  "STUDENT",
  "PARENT",
  "SOCIAL_WORKER",
  "TEACHER",
  "SCHOOL",
  "DONOR",
];

function Register() {
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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch("password");

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
    <div className="relative z-10 w-full max-w-md space-y-6 text-[--gray-1] rounded-2xl ">
      <div className="text-center">
        <Text as="p" size={"8"} weight={"bold"} className="capitalize">
          Create Your {normalizedRole?.toLowerCase().replace("_", " ")} Account
        </Text>
        <Text as="p" size={"4"} mt={"4"}>
          Fill in your information to get started
        </Text>
      </div>

      <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-purple-600"></div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Render fields directly */}
        {fieldsForRole?.map((field) => (
          <div key={field.name} className="mt-4">
            <label className="block mb-2 text-sm font-medium">
              {field.label}
              <TextField.Root
                {...register(field.name, {
                  required: field.required
                    ? `${field.label} is required`
                    : false,
                  pattern:
                    field.type === "email"
                      ? {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        }
                      : undefined,
                  minLength:
                    field.type === "password"
                      ? {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        }
                      : undefined,
                  validate:
                    field.name === "confirmPassword"
                      ? (value) =>
                          value === password || "Passwords do not match"
                      : undefined,
                })}
                className="h-12"
                size={"3"}
                radius="large"
                type={field.type}
                placeholder={field.placeholder}
              />
            </label>
            {errors[field.name] && (
              <Text
                as="p"
                size={"2"}
                className="mt-1 text-[--red-8] flex items-center gap-1"
              >
                <Info size={14} /> {errors[field.name].message}
              </Text>
            )}
          </div>
        ))}

        <div className="mt-6 text-center">
          <Button
            type="submit"
            radius="full"
            size={"4"}
            className="w-full max-w-sm disabled:bg-[--gray-8] text-[--accent-8]"
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Register"}
          </Button>
        </div>
      </form>

      <div className="text-center">
        <Button
          radius="full"
          size={"4"}
          className=" text-[--gray-6] font-medium"
          variant="ghost"
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
