import { Button, Callout, Text, TextField } from "@radix-ui/themes";
import {
  ArrowLeft,
  Shield,
  AlertCircle,
  CircleCheck,
  Loader,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import {
  useResetPassword,
  useVerifyResetToken,
} from "../../api/auth/auth.mutations";
import { toast } from "sonner";

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
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
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
      setIsVerifying(false);
      setTokenError(
        "Missing token or email. Please request a new password reset link."
      );
      toast.error("Invalid reset link", {
        description:
          "Missing token or email. Please request a new password reset link.",
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
      <div className="relative z-10 w-full max-w-lg space-y-6 rounded-2xl text-[--gray-1]">
        <div className="text-center">
          <Text as="p" size={"8"} weight={"bold"}>
            Reset Password
          </Text>
          <Text as="p" size={"4"} mt={"4"}>
            Verifying your reset link...
          </Text>
        </div>
        <div className="flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid && !isResetComplete) {
    return (
      <div className="relative z-10 w-full max-w-lg space-y-6 rounded-2xl text-[--gray-1]">
        <div className="text-center">
          <Text as="p" size={"8"} weight={"bold"}>
            Invalid Reset Link
          </Text>
        </div>
        <div className="p-6 space-y-6 rounded-xl bg-[--gray-a6]">
          <Callout.Root
            variant="soft"
            color="red"
            className="text-[--gray-1] bg-[--red-a8]"
          >
            <Callout.Icon>
              <AlertCircle size={"20"} color="var(--gray-1)" />
            </Callout.Icon>
            <Callout.Text>{tokenError}</Callout.Text>
          </Callout.Root>
          <div className="text-center">
            <Button
              radius="full"
              size={"4"}
              className="w-full max-w-sm"
              asChild
            >
              <Link to={"/forgot-password"}>Request New Reset Link</Link>
            </Button>
          </div>
          <div className="text-center">
            <Button radius="full" size={"4"} variant="ghost" asChild>
              <Link to={"/login"}>
                <ArrowLeft color="var(--gray-1)" size={"20"} />
                <Text as="span" weight={"medium"} className="text-[--gray-1]">
                  Back to login
                </Text>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Reset complete state
  if (isResetComplete) {
    return (
      <div className="relative z-10 w-full max-w-lg space-y-6 rounded-2xl text-[--gray-1]">
        <div className="text-center">
          <Text as="p" size={"8"} weight={"bold"}>
            Password Reset Complete
          </Text>
        </div>
        <div className="p-6 space-y-6 rounded-xl bg-[--gray-a6]">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 rounded-full bg-[--green-a8]">
              <CircleCheck size={32} color="var(--gray-1)" />
            </div>
            <Text as="p" size={"5"} weight={"medium"}>
              Success!
            </Text>
            <Text as="p" align="center">
              Your password has been reset successfully.
            </Text>
            <Text as="p" size={"2"} className="text-center text-[--gray-6]">
              You can now log in with your new password.
            </Text>
          </div>
          <div className="text-center">
            <Button
              radius="full"
              size={"4"}
              className="w-full max-w-sm"
              asChild
            >
              <Link to={"/login"}>Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default state - password reset form
  return (
    <div className="relative z-10 w-full max-w-lg space-y-6 rounded-2xl text-[--gray-1]">
      <div className="text-center">
        <Text as="p" size={"8"} weight={"bold"}>
          Reset Password
        </Text>
        <Text as="p" size={"4"} mt={"4"}>
          Create a new password for your account
        </Text>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 space-y-6 rounded-xl bg-[--gray-a6]"
      >
        <div className="space-y-4">
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
              />
            </label>
            {errors.newPassword && (
              <Text as="p" size={"1"} color="red">
                {errors.newPassword.message}
              </Text>
            )}
            <Text as="p" size={"1"} className="text-[--gray-6]">
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
              />
            </label>
            {errors.confirmPassword && (
              <Text as="p" size={"1"} color="red">
                {errors.confirmPassword.message}
              </Text>
            )}
          </div>
        </div>

        {isResetError && (
          <Callout.Root
            variant="soft"
            color="red"
            className="text-[--gray-1] bg-[--red-a8]"
          >
            <Callout.Icon>
              <AlertCircle size={"20"} color="var(--gray-1)" />
            </Callout.Icon>
            <Callout.Text>
              {resetError?.response?.data?.message ||
                "Failed to reset password. Please try again."}
            </Callout.Text>
          </Callout.Root>
        )}

        <div className="text-center">
          <Button
            radius="full"
            size={"4"}
            className="w-full max-w-sm"
            type="submit"
            disabled={isResetting}
          >
            {isResetting ? "Resetting..." : "Reset Password"}
          </Button>
        </div>
        <div className="text-center">
          <Button radius="full" size={"4"} variant="ghost" asChild>
            <Link to={"/login"}>
              <ArrowLeft color="var(--gray-1)" size={"20"} />
              <Text as="span" weight={"medium"} className="text-[--gray-1]">
                Back to login
              </Text>
            </Link>
          </Button>
        </div>
        <Callout.Root
          variant="soft"
          color="purple"
          className="text-[--gray-1] bg-[--gray-a8]"
        >
          <Callout.Icon>
            <Shield size={"20"} color="var(--gray-1)" />
          </Callout.Icon>
          <Callout.Text>
            For better security, create a strong password with a mix of letters,
            numbers, and special characters.
          </Callout.Text>
        </Callout.Root>
      </form>
    </div>
  );
}
