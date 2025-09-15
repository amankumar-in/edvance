import { Button, Callout, Card, Text, TextField } from "@radix-ui/themes";
import { ArrowLeft, CircleCheck, Info, Mail } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";
import { useForgotPassword } from "../../api/auth/auth.mutations";
import ErrorCallout from "../../components/ErrorCallout";
import { FormFieldErrorMessage } from "../../components/FormFieldErrorMessage";

function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      email: "",
    },
    mode: "onTouched"
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
      <div className="relative z-10 space-y-6 w-full max-w-lg rounded-2xl">
        <div className="text-center text-white">
          <Text as="p" size={"7"} weight={"bold"}>
            Check Your Email
          </Text>
          <Text as="p" mt={"2"}>
            Password reset instructions sent
          </Text>
        </div>
        <Card size={'3'} className="space-y-6 shadow-lg shadow-black/20">
          <div className="flex flex-col justify-center items-center space-y-3">
            <div className="p-3 rounded-full bg-[--green-8] animate-bounceCheck">
              <CircleCheck size={32} color="var(--gray-1)" />
            </div>
            <Text as="p" size={"5"} weight={"bold"}>
              Email Sent
            </Text>
            <Text as="p" align="center">
              We've sent instructions to:
            </Text>
            <Text as="p" weight={"medium"}>
              {sentToEmail}
            </Text>

            {/* Callout for success message */}
            <Callout.Root color="blue" variant="surface">
              <Callout.Icon>
                <Info size={16} />
              </Callout.Icon>
              <Callout.Text>
                Please check your inbox (and spam folder) for a link to reset your
                password. The link will expire after 24 hours.
              </Callout.Text>
            </Callout.Root>
          </div>
          <div className="text-center">
            <Button size={"1"} variant="ghost" asChild color="gray">
              <Link to={"/login"}>
                <ArrowLeft size={14} />
                Back to login
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative z-10 space-y-6 w-full max-w-lg">
      <div className="text-center text-white">
        <Text as="p" size={"7"} weight={"bold"}>
          Forgot Password
        </Text>
        <Text as="p" mt={"2"}>
          Enter your email to reset your password
        </Text>
      </div>
      <Card size={'3'} className="shadow-lg shadow-black/20">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Error Callout */}
          {isError && (
            <ErrorCallout
              errorMessage={resetError?.response?.data?.message || "Failed to send reset email. Please try again."}
            />
          )}

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
              >
                <TextField.Slot side="left">
                  <Mail size={18} />
                </TextField.Slot>
              </TextField.Root>
            </label>
            <FormFieldErrorMessage errors={errors} field={"email"} />
            <Text as="p" size={"1"} color="gray">
              Enter your email address and we'll send you a link to set a password.
            </Text>
          </div>

          <div className="text-center">
            <Button
              size={"4"}
              className="w-full shadow-md"
              type="submit"
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send Reset Instructions"}
            </Button>
          </div>

          <div className="text-center">
            <Button type="button" variant="ghost" asChild color="gray" size={'1'}>
              <Link to={"/login"}>
                <ArrowLeft size={14} />
                Back to login
              </Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ForgotPassword;
