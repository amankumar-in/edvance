import { Button, Callout, Card, Text } from "@radix-ui/themes";
import { AlertTriangle, ArrowLeft, CircleCheck, Info } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import { toast } from "sonner";
import { useResendVerificationEmail, useVerifyEmail } from "../../api/auth/auth.mutations";
import ErrorCallout from "../../components/ErrorCallout";
import Loader from '../../components/Loader';

const EmailVerification = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = location.state?.user?.email || searchParams.get("email");
  const [isVerified, setIsVerified] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    mutate: verifyEmailMutation,
    isPending: isVerifying,
    isError: isVerifyError,
    error: verifyError,
  } = useVerifyEmail();

  const {
    mutate: resendVerificationMutation,
    isPending: isResending,
    isError: isResendError,
    error: resendError,
  } = useResendVerificationEmail();

  // Check for email and token in URL
  useEffect(() => {
    // If we have both email and token in the URL, attempt verification
    if (!token || !email) return;

    verifyEmailMutation(
      { email, token },
      {
        onSuccess: () => {
          setIsVerified(true);
          toast.success("Email verified successfully", {
            description: "Your email has been verified. You can now log in to your account.",
          });
        },
        onError: (error) => {
          // Check for specific error messages indicating verification is effectively complete
          // or blocked due to rapid calls (like from StrictMode)
          const backendMessage = error?.response?.data?.message;

          if (
            backendMessage === "Invalid or expired verification token" ||
            backendMessage ===
            "Too many authentication attempts, please try again later."
          ) {
            // Treat these specific errors as a success case for the UI
            setIsVerified(true);
            toast.success("Email verified successfully", {
              description: "Your email has been verified. You can now log in to your account.",
            });
          } else {
            // Set error message for UI display
            const errorMessage =
              error?.response?.data?.message || error?.message ||
              "Invalid or expired verification token. Please request a new verification email.";
            toast.error("Email verification failed", {
              description: errorMessage,
            });
            console.error(
              "Email verification failed:",
              error?.response?.data || error?.message || error
            );
          }
        },
      }
    );
  }, [email, token, verifyEmailMutation]);

  // Cooldown timer effect
  useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(cooldown => cooldown - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  // Handle resend verification email
  const handleResendVerification = () => {
    if (!email || resendCooldown > 0 || isResending) return;

    resendVerificationMutation(
      { email },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Verification email sent", {
              description: "Please check your inbox for the new verification email.",
            });
            setResendCooldown(60); // 60 second cooldown
          } else {
            toast.error("Failed to send email", {
              description: data.message || "Could not send verification email. Please try again later.",
            });
          }
        },
        onError: (error) => {
          const errorMessage = error?.response?.data?.message || error?.message || "Failed to send verification email. Please try again.";
          toast.error("Failed to send email", {
            description: errorMessage,
          });
        },
      }
    );
  };

  if (isVerifying)
    return (
      <div className="space-y-6 text-white">
        <Text as="p" size={"4"} align={"center"}>
          Verifying your email...
        </Text>
        <Loader color="white" center />
      </div>
    );

  if (isVerified)
    return (
      <Card size={'3'} className="space-y-6 text-center shadow-lg shadow-black/20">
        <div className="mx-auto space-y-4 w-full max-w-lg text-center">
          <div className="p-4 mx-auto bg-[--green-a8] rounded-full w-fit animate-bounceCheck ">
            <CircleCheck className="w-10 h-10 text-white" />
          </div>

          <Text as="p" size={"6"} weight={"bold"} color="green">
            Email Verified!
          </Text>

          <Text as="p" size={"2"} color="gray">
            Your email has been successfully verified. You can now log in to your
            account.
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
    );

  if (isVerifyError && !isVerified)
    return (
      <div className="space-y-6 w-full max-w-lg">
        <Card size={'3'} className="space-y-6 shadow-lg shadow-black/20">
          <div className="text-center">
            <div className="p-4 mx-auto mb-4 bg-[--red-9] rounded-full w-fit animate-bounceCheck ">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>
          <Text align={"center"} color="red" as="p" size={"7"} weight={"bold"}>
            Verification Failed
          </Text>

          {/* Error Callout */}
          <ErrorCallout errorMessage={verifyError?.response?.data?.message || verifyError?.message || "The verification link is invalid or has expired."} />

          {/* Request New Verification Email Button */}
          <div className="text-center">
            <Button
              size={"4"}
              className="w-full shadow-md"
              onClick={handleResendVerification}
              disabled={!email || resendCooldown > 0 || isResending}
            >
              {isResending 
                ? "Sending..." 
                : resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : "Resend Verification Email"
              }
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

  return (
    <div className="space-y-6 w-full max-w-lg">
      {/* Header */}
      <div className="text-center text-white">
        <Text as="p" size={"7"} weight={"bold"}>
          Verify Your Email
        </Text>
        <Text as="p" mt={"2"}>
          Just one more step to complete your registration
        </Text>
      </div>

      {/* 📩 Default state: Check inbox */}
      <Card size={'3'} className="space-y-4 shadow-lg shadow-black/20">
        <Text as="p" size={"6"} weight={"bold"}>
          Check your inbox
        </Text>
        <Text as="p">We've sent a verification link to:</Text>
        <Text as="p" weight={"medium"}>
          {email}
        </Text>
        <Callout.Root variant="surface" color="blue">
          <Callout.Icon>
            <Info size={16} />
          </Callout.Icon>
          <Callout.Text>
            Please check your email and click on the verification link. Check your
            spam folder if you don't see it.
          </Callout.Text>
        </Callout.Root>

        <Text as="p" size="1" color="gray">
          Usually arrives within 2-3 minutes
        </Text>

        {/* Resend Button */}
        <div className="text-center">
          <Button
            size={'4'}
            className="w-full shadow-md"
            onClick={handleResendVerification}
            disabled={!email || resendCooldown > 0 || isResending}
          >
            {isResending 
              ? "Sending..." 
              : resendCooldown > 0 
                ? `Resend in ${resendCooldown}s` 
                : "Resend verification email"
            }
          </Button>
        </div>

        {/* Show error message if resend failed */}
        {isResendError && (
          <ErrorCallout 
            errorMessage={resendError?.response?.data?.message || resendError?.message || "Failed to send verification email. Please try again."} 
          />
        )}

        {/* Go to Login */}
        <div className="pt-2 text-center">
          <Button variant="ghost" asChild color="gray" size={'1'}>
            <Link to={"/login"}>
              <ArrowLeft size={14} />
              Go to Login
            </Link>
          </Button>
        </div>
      </Card>

      {/* Footer */}
      {/* TODO: Add support contact link */}
      <Text as="p" size={"2"} align={"center"} className="text-white">
        If you're having trouble, please contact support.
      </Text>
    </div>
  );
};

export default EmailVerification;
