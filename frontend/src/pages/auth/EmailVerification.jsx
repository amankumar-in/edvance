import { Button, Callout, Text } from "@radix-ui/themes";
import { ArrowLeft, CircleCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import { useVerifyEmail } from "../../api/auth/auth.mutations";

const EmailVerification = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = location.state?.user?.email || searchParams.get("email");
  const [isVerified, setIsVerified] = useState(false);

  const {
    mutate: verifyEmailMutation,
    isPending: isVerifying,
    isError: isVerifyError,
    error: verifyError,
  } = useVerifyEmail();

  // Check for email and token in URL
  useEffect(() => {
    // // If we have both email and token in the URL, attempt verification
    if (!token || !email) return;

    verifyEmailMutation(
      { email, token },
      {
        onSuccess: () => {
          setIsVerified(true);
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
          } else {
            // Otherwise, log the actual error for debugging other potential issues
            console.error(
              "Email verification failed:",
              error?.response?.data || error?.message || error
            );
          }
        },
      }
    );
  }, [email, token, verifyEmailMutation]);

  if (isVerifying)
    return (
      <div className="w-full max-w-lg space-y-6 text-[--gray-1]">
        <Text as="p" size={"4"} align={"center"}>
          Verifying your email...
        </Text>
      </div>
    );

  if (isVerified)
    return (
      <div className="w-full max-w-md p-6 mx-auto text-center bg-white shadow-xl rounded-2xl">
        <div className="p-4 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-700 to-teal-500 w-fit">
          <CircleCheck className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-800">
          Email Verified!
        </h2>

        <p className="mt-2 text-gray-600">
          Your email has been successfully verified. You can now log in to your
          account.
        </p>

        <Button
          asChild
          className="mt-6 text-gray-800 transition border border-gray-300 bg-gradient-to-r from-white to-gray-100 hover:bg-gray-200"
        >
          <Link to="/login">Go to Login</Link>
        </Button>
      </div>
    );

  if (isVerifyError && !isVerified)
    return (
      <div className="w-full max-w-md p-6 mx-auto text-centershadow-xl rounded-2xl">
        <h2 className="text-2xl font-semibold text-red-600">
          Verification Failed
        </h2>
        <p className="mt-2 ">
          {verifyError?.message ||
            "The verification link is invalid or has expired."}
        </p>
        <Button asChild className="mt-6">
          <Link to="/login">Go to Login</Link>
        </Button>
      </div>
    );

  return (
    <div className="w-full max-w-lg space-y-6 text-[--gray-1]">
      {/* Header */}
      <div className="text-center">
        <Text as="p" size={"8"} weight={"bold"}>
          Verify Your Email
        </Text>
        <Text as="p" size={"4"} mt={"4"}>
          Just one more step to complete your registration
        </Text>
      </div>

      {/* 📩 Default state: Check inbox */}
      <div className="p-6 space-y-4 bg-[--gray-a6] rounded-xl">
        <Text as="p" size={"6"} weight={"medium"}>
          Check your inbox
        </Text>
        <Text as="p">We've sent a verification link to:</Text>
        <Text as="p" weight={"medium"}>
          {email}
        </Text>
        <Text as="p" className="text-[--gray-6]" size={"2"}>
          Please check your email and click on the verification link. Check your
          spam folder if you don't see it.
        </Text>
        {/* ✅ Success message */}
        {/* <Callout.Root variant='soft' className='text-[--gray-1] bg-[--green-a8]'>
          <Callout.Icon >
            <CircleCheck size={'20'} color='var(--gray-1)' />
          </Callout.Icon>
          <Callout.Text>
            Verification email resent successfully!
          </Callout.Text>
        </Callout.Root> */}

        {/* ❌ Error message */}
        {/* <div className="flex items-center space-x-2 text-red-400">
            <span>Failed to send verification email.</span>
          </div> */}

        {/* Resend Button */}
        <div className="text-center">
          <Button radius="full" size={"4"} className="w-full max-w-sm">
            Resend verification email
          </Button>
        </div>

        {/* Go to Login */}
        <div className="text-center">
          <Button radius="full" variant="ghost" asChild>
            <Link to={"/login"}>
              <ArrowLeft color="var(--gray-1)" size={"20"} />
              <Text as="span" weight={"medium"} className="text-[--gray-1]">
                Go to Login
              </Text>
            </Link>
          </Button>
        </div>
      </div>

      {/* 🛑 Error card (token expired or invalid) */}
      {/* <div className="p-6 space-y-4 bg-red-700/20 rounded-xl">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-red-600 rounded-full">
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center text-red-300">Verification Failed</h2>
          <p className="text-center text-red-200">The verification link is invalid or has expired.</p>
          <p className="text-sm text-center text-gray-300">Please try again or request a new verification email.</p>
        </div>
 */}
      {/* ✅ Success card */}
      {/* <div className="p-6 space-y-4 bg-green-700/20 rounded-xl">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-green-600 rounded-full">
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center text-green-300">Email Verified!</h2>
          <p className="text-center text-green-100">
            Your email has been successfully verified. You can now log in to your account.
          </p>
          <button className="w-full px-4 py-2 text-black transition bg-white rounded hover:bg-gray-100">
            Go to Login
          </button>
        </div> */}

      {/* Footer */}
      <Text as="p" size={"2"} align={"center"} className="text-[--gray-6]">
        If you're having trouble, please contact support.
      </Text>
    </div>
  );
};

export default EmailVerification;
