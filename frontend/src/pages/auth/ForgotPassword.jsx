import { Button, Callout, Text, TextField } from "@radix-ui/themes";
import { ArrowLeft, Info, AlertCircle, CircleCheck } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { useForgotPassword } from "../../api/auth/auth.mutations";
import { toast } from "sonner";

function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const {
    mutate: sendResetEmail,
    isPending: isSending,
    isError: isError,
    error: resetError,
  } = useForgotPassword();

  const onSubmit = (data) => {
    sendResetEmail(
      { email: data.email },
      {
        onSuccess: () => {
          setEmailSent(true);
          setSentToEmail(data.email);
          toast.success("Reset instructions sent", {
            description:
              "Check your email for instructions to reset your password",
          });
        },
        onError: (error) => {
          setEmailSent(true);
          setSentToEmail(data.email);
          console.error("Error sending reset email:", error);
        },
      }
    );
  };

  // If email was sent successfully, show success view
  if (emailSent) {
    return (
      <div className="relative z-10 w-full max-w-lg space-y-6 rounded-2xl text-[--gray-1]">
        <div className="text-center">
          <Text as="p" size={"8"} weight={"bold"}>
            Check Your Email
          </Text>
          <Text as="p" size={"4"} mt={"4"}>
            Password reset instructions sent
          </Text>
        </div>
        <div className="p-6 space-y-6 rounded-xl bg-[--gray-a6]">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 rounded-full bg-[--green-a8]">
              <CircleCheck size={32} color="var(--gray-1)" />
            </div>
            <Text as="p" size={"5"} weight={"medium"}>
              Email Sent
            </Text>
            <Text as="p" align="center">
              We've sent instructions to:
            </Text>
            <Text as="p" weight={"medium"}>
              {sentToEmail}
            </Text>
            <Text as="p" size={"2"} className="text-center text-[--gray-6]">
              Please check your inbox (and spam folder) for a link to reset your
              password. The link will expire after 24 hours.
            </Text>
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

  return (
    <div className="relative z-10 w-full max-w-lg space-y-6 rounded-2xl text-[--gray-1]">
      <div className="text-center">
        <Text as="p" size={"8"} weight={"bold"}>
          Forgot Password
        </Text>
        <Text as="p" size={"4"} mt={"4"}>
          Enter your email to reset your password
        </Text>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 space-y-6 rounded-xl bg-[--gray-a6]"
      >
        <div className="space-y-2">
          <label>
            <Text as="div" size="2" mb="1" weight="medium">
              Email
            </Text>
            <TextField.Root
              radius="large"
              className="h-12"
              size={"3"}
              placeholder="Email"
              color={errors.email ? "red" : undefined}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
          </label>
          {errors.email && (
            <Text as="p" size={"1"} color="red">
              {errors.email.message}
            </Text>
          )}
          <Text as="p" size={"1"} className="text-[--gray-6]">
            Enter the email address you used to register
          </Text>
        </div>

        {isError && (
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
                "Failed to send reset email. Please try again."}
            </Callout.Text>
          </Callout.Root>
        )}

        <div className="text-center">
          <Button
            radius="full"
            size={"4"}
            className="w-full max-w-sm"
            type="submit"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send Reset Instructions"}
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
            <Info size={"20"} color="var(--gray-1)" />
          </Callout.Icon>
          <Callout.Text>
            You will receive an email with a link to reset your password. The
            link will expire after 24 hours.
          </Callout.Text>
        </Callout.Root>
      </form>
    </div>
  );
}

export default ForgotPassword;
