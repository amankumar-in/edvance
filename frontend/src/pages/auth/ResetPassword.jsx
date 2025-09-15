import { Button, Callout, Card, Flex, Text, TextField } from "@radix-ui/themes";
import {
  AlertTriangle,
  ArrowLeft,
  CircleCheck,
  Lock,
  Shield
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  useResetPassword,
  useVerifyResetToken,
} from "../../api/auth/auth.mutations";
import ErrorCallout from "../../components/ErrorCallout";
import { FormFieldErrorMessage } from "../../components/FormFieldErrorMessage";
import Loader from '../../components/Loader';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched"
  });

  // Watch password field for validation
  const newPassword = watch("newPassword");

  // Hooks for API calls
  const { mutate: verifyToken } = useVerifyResetToken();
  const {
    mutate: resetPasswordMutation,
    isPending: isResetting,
    isError: isResetError,
    error: resetError,
  } = useResetPassword();

  // Verify token when component mounts
  useEffect(() => {
    if (!token || !email) {
      const errorMessage = "Missing token or email. Please request a new password reset link."
      setIsVerifying(false);
      setTokenError(errorMessage);
      toast.error("Invalid reset link", {
        description: errorMessage,
      });
      return;
    }

    verifyToken(
      { email, token },
      {
        onSuccess: () => {
          setIsTokenValid(true);
          setIsVerifying(false);
          toast.success("Token verified", {
            description: "You can now reset your password.",
          });
        },
        onError: (error) => {
          setIsVerifying(false);
          const errorMessage =
            error?.response?.data?.message ||
            "Invalid or expired reset token. Please request a new password reset link.";
          setTokenError(errorMessage);
          toast.error("Invalid reset link", {
            description: errorMessage,
          });
        },
      }
    );
  }, [token, email, verifyToken]);

  // Handle password reset submission
  const onSubmit = (data) => {
    resetPasswordMutation(
      {
        email,
        token,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          setIsResetComplete(true);
          toast.success("Password reset successful", {
            description:
              "Your password has been reset. You can now log in with your new password.",
          });
          // Auto redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        },
        onError: (error) => {
          toast.error("Password reset failed", {
            description:
              error?.response?.data?.message ||
              "Failed to reset your password. Please try again.",
          });
        },
      }
    );
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="space-y-6 text-white">
        <Text as="p" size={"4"} align={"center"}>
          Verifying your reset link...
        </Text>
        <Loader color="white" center />
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid && !isResetComplete) {
    return (
      <div className="space-y-6 w-full max-w-lg">
        <Card size={'3'} className="space-y-6 shadow-lg shadow-black/20">
          <div className="text-center">
            <div className="p-4 mx-auto mb-4 bg-[--red-9] rounded-full w-fit animate-bounceCheck ">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>
          <Text align={"center"} color="red" as="p" size={"7"} weight={"bold"}>
            Invalid Reset Link
          </Text>

          {/* Error Callout */}
          <ErrorCallout errorMessage={tokenError} />

          {/* Request New Reset Link Button */}
          <div className="text-center">
            <Button
              size={"4"}
              className="w-full shadow-md"
              asChild
            >
              <Link to={"/forgot-password"}>Request New Reset Link</Link>
            </Button>
          </div>

          {/* Go to Login Button */}
          <div className="text-center">
            <Button size={'1'} variant="ghost" asChild color="gray">
              <Link to={"/login"}>
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Reset complete state
  if (isResetComplete) {
    return (
      <div className="space-y-6 w-full max-w-lg">
        <Card size={'3'} className="space-y-6 text-center shadow-lg shadow-black/20">
          <div className="flex flex-col justify-center items-center space-y-4">
            <div className="p-4 mx-auto mb-4 bg-[--green-a8] rounded-full w-fit animate-bounceCheck ">
              <CircleCheck className="w-10 h-10 text-white" />
            </div>
            <Text as="p" size={"6"} weight={"bold"} color="green">
              Password Reset Complete
            </Text>
            <Text as="p" size={"2"} align="center" color="gray">
              Your password has been reset successfully. You can now log in with your new password.
            </Text>
          </div>
          
          {/* Go to Login Button */}
          <Button
            asChild
            variant="ghost"
            color="gray"
            size={'1'}
          >
            <Link to="/login"><ArrowLeft size={14} /> Go to Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Default state - password reset form
  return (
    <div className="space-y-6 w-full max-w-lg">
      <div className="text-center text-white">
        <Text as="p" size={"7"} weight={"bold"}>
          Reset Password
        </Text>
        <Text as="p" mt={"2"}>
          Create a new password for your account
        </Text>
      </div>
      <Card size={'3'} className="space-y-6 shadow-lg shadow-black/20">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            {/* Error Callout */}
            {isResetError && (
              <ErrorCallout
                errorMessage={resetError?.response?.data?.message || resetError?.message ||
                  "Failed to reset password. Please try again."}
              />
            )}

            <div className="space-y-2">
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  New Password
                </Text>
                <TextField.Root
                  radius="large"
                  className="h-12"
                  size={"3"}
                  placeholder="New Password"
                  type={passwordVisible ? "text" : "password"}
                  color={errors.newPassword ? "red" : undefined}
                  {...register("newPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                >
                  <TextField.Slot side="left">
                    <Lock size={16} />
                  </TextField.Slot>
                </TextField.Root>
              </label>
              <FormFieldErrorMessage errors={errors} field="newPassword" />
              <Text as="p" size={"1"} color="gray">
                Must be at least 8 characters
              </Text>
            </div>
            <div className="space-y-2">
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Confirm Password
                </Text>
                <TextField.Root
                  radius="large"
                  className="h-12"
                  size={"3"}
                  placeholder="Confirm Password"
                  type={passwordVisible ? "text" : "password"}
                  color={errors.confirmPassword ? "red" : undefined}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                >
                  <TextField.Slot side="left">
                    <Lock size={16} />
                  </TextField.Slot>
                </TextField.Root>
              </label>
              <FormFieldErrorMessage errors={errors} field="confirmPassword" />
            </div>
          </div>

          {/* Reset Password Button */}
          <div className="text-center">
            <Button
              size={"4"}
              className="w-full shadow-md"
              type="submit"
              disabled={isResetting}
            >
              {isResetting ? "Resetting..." : "Reset Password"}
            </Button>
          </div>

          {/* Reset Password Callout */}
          <Callout.Root
            variant="surface"
            color="blue"
          >
            <Callout.Icon>
              <Shield size={16} />
            </Callout.Icon>
            <Callout.Text>
              For better security, create a strong password with a mix of letters,
              numbers, and special characters.
            </Callout.Text>
          </Callout.Root>
        </form>

        {/* Go to Login Button */}
        <Flex justify="center">
          <Button
            asChild
            variant="ghost"
            color="gray"
            size={'1'}
          >
            <Link to="/login"><ArrowLeft size={14} /> Go to Login</Link>
          </Button>
        </Flex>
      </Card>
    </div>
  );
}
