import { Button, Card, Checkbox, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { isValidPhoneNumber } from 'libphonenumber-js';
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Link, useNavigate } from "react-router";
import { toast } from 'sonner';
import { useLogin, useLoginWithPhone, useSendOtp } from '../../api/auth/auth.mutations';
import { ErrorCallout, FormFieldErrorMessage } from "../../components";
import { useAuth } from "../../Context/AuthContext";
import { APP_NAME, BRAND_COLOR, OTP_TIMER } from "../../utils/constants";
import { buildSelectionList } from "../../utils/helperFunctions";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { loading, fetchProfile, setToken, setIsAuthenticated, setActiveRole } = useAuth()
  const [loginMode, setLoginMode] = useState("email");
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const { mutate: sendOtp, isPending: isSendingOtp, isError: isSendOtpError, error: sendOtpError, reset: resetSendOtp } = useSendOtp();

  // Initialize React Hook Form with validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, },
    reset: resetLoginForm
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched"
  });

  // Phone number form state
  const { control, register: registerPhone, handleSubmit: handleSubmitPhone, formState: { errors: errorsPhone, isValid: isValidPhone }, reset: resetLoginWithPhoneForm } = useForm({
    defaultValues: {
      phoneNumber: "",
      otp: "",
    },
    mode: "onTouched"
  });

  // Login mutation from TanStack Query
  const {
    mutateAsync: loginUser,
    isPending: isLoggingIn,
    isError: isLoginError,
    error: loginError,
    reset: resetLogin
  } = useLogin();

  const { mutate: loginWithPhone, isPending: isPhoneLoggingIn, isError: isPhoneLoginError, error: phoneLoginError, reset: resetLoginWithPhone } = useLoginWithPhone();

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpTimer]);

  /**
   * Send OTP to phone number
   */
  const handleSendOtp = (data) => {
    const { phoneNumber } = data;

    sendOtp({ phoneNumber }, {
      onSuccess: () => {
        setOtpSent(true);
        setOtpTimer(OTP_TIMER);
        toast.success("Check your phone", {
          description: "Enter the 6-digit code we just sent you",
        });
      },
      onError: (error) => {
        console.error("Send OTP failed:", error?.response?.data?.message || error?.message || "error sending OTP");
      },
    });
  };

  const handlePhoneLogin = (data) => {
    const { phoneNumber, otp } = data;

    // Login with phone number and OTP
    loginWithPhone({ phoneNumber, otp },
      {
        onSuccess: async (response) => {
          await handlePostLoginSuccess(response, response.data?.user?.phoneNumber || "User");
        },
        onError: (error) => {
          console.log(error);
        },
      });
  };

  /**
   * Handles post-login success logic for both email and phone login
   */
  const handlePostLoginSuccess = async (response, userIdentifier = "User") => {
    toast.success("Login successful", {
      description: `Welcome back, ${userIdentifier}!`,
    });

    const { data } = response;
    const { accessToken } = data ?? {};

    setToken(accessToken);
    setIsAuthenticated(true);

    const profileData = await fetchProfile();
    const { user, profiles } = profileData ?? {};

    const selectionList = buildSelectionList(user, profiles);

    if (selectionList.length === 0) {
      toast.error("No valid roles or profiles found.");
      return;
    }

    if (selectionList.length === 1) {
      const onlyOption = selectionList[0];
      setActiveRole(onlyOption.value);
      localStorage.setItem('activeRole', onlyOption.value);
      navigate(onlyOption.route);
    } else {
      navigate("/select-profile", { state: { selectionList } });
    }

    // Store remember me preference if selected
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    }
  };

  /**
   * Handle form submission for login
   * - Shows success toast on successful login
   * - Stores user preference if "Remember me" is checked
   * - Navigates to dashboard on success
   */
  const handleLogin = async (data) => {
    loginUser(data, {
      onSuccess: async (response) => {
        await handlePostLoginSuccess(response, response.data?.user?.email || "User");
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  return (
    <div className="flex justify-center w-full" >
      <Card size={'3'} className="space-y-6 w-full max-w-lg shadow-lg shadow-black/20">
        <div
          className="relative z-10 space-y-6"
        >
          {/* Header Text */}
          <Link to='/' className="space-y-2 text-center" >
            <Text as="p" size={"8"} weight={"bold"} className="text-transparent bg-clip-text bg-gradient-to-r from-[--blue-9] to-[--purple-9] drop-shadow">
              {APP_NAME}
            </Text>
            {/* <Text as="p" color="gray">
              Login to your account
            </Text> */}
          </Link >

          <div className="flex p-1 rounded-lg shadow-md border border-[--gray-a6]">
            <button
              onClick={() => {
                resetSendOtp();
                setOtpSent(false);
                setOtpTimer(0);
                setLoginMode("email");
                resetLoginWithPhone()
                resetLoginWithPhoneForm()
              }}
              type="button"
              className={`flex-1 py-2  rounded-md ${loginMode === "email" ? "bg-[--accent-9] text-[--accent-contrast]" : ""}`}
            >
              Email
            </button>
            <button
              onClick={() => {
                setOtpSent(false);
                resetSendOtp();
                setOtpTimer(0);
                setLoginMode("phone")
                resetLoginForm();
                resetLogin()
              }}
              type="button"
              className={`flex-1 py-2  rounded-md ${loginMode === "phone" ? "bg-[--accent-9] text-[--accent-contrast]" : ""}`}
            >
              Phone
            </button>
          </div>

          {/* Error Message Display */}
          {
            (isLoginError || isPhoneLoginError || isSendOtpError) && (
              <ErrorCallout
                errorMessage={loginError?.response?.data?.message || loginError?.message ||
                  phoneLoginError?.response?.data?.message || phoneLoginError?.message ||
                  sendOtpError?.response?.data?.message || sendOtpError?.message ||
                  "Unable to send verification code right now. Please try again."}
              />
            )
          }

          {loginMode === "email" ? (
            <form
              onSubmit={handleSubmit(handleLogin)} className="space-y-6">
              <div className="space-y-3">
                {/* Email Field with Validation */}
                <div className="space-y-1">
                  <label>
                    <Text as="div" size="2" mb="1" weight="medium">
                      Email
                    </Text>
                    <TextField.Root
                      size={"3"}
                      type="email"
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
                      color={errors.email ? "red" : undefined}
                    >
                      <TextField.Slot side="left">
                        <Mail size={16} />
                      </TextField.Slot>
                    </TextField.Root>
                  </label>
                  <FormFieldErrorMessage errors={errors} field={"email"} />
                </div>

                {/* Password Field with Toggle Visibility */}
                <div className="space-y-1">
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
                      })}
                      className="h-12"
                      placeholder="Password"
                      color={errors.password ? "red" : undefined}
                    >
                      <TextField.Slot side="left"><Lock size={16} /></TextField.Slot>
                      <TextField.Slot side="right">
                        <IconButton
                          type="button"
                          title={showPassword ? "Hide password" : "Show password"}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((prev) => !prev)}
                          variant="ghost"
                          color="gray"
                          radius="full"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      </TextField.Slot>
                    </TextField.Root>
                  </label>
                  <FormFieldErrorMessage errors={errors} field={"password"} />
                </div>

                {/* Remember Me & Forgot Password Options */}
                <div className="flex justify-between items-center">
                  <Text as="label" size={"2"}>
                    <Flex gap="2" align={"center"}>
                      <Checkbox checked={rememberMe} onCheckedChange={setRememberMe} />
                      Remember me
                    </Flex>
                  </Text>
                  <Text as="span" weight={"medium"} size={"2"} color={BRAND_COLOR}>
                    <Link to={"/forgot-password"} className="hover:underline">
                      Forgot password?
                    </Link>
                  </Text>
                </div>
              </div>

              {/* Login Button with Loading State */}
              <div className="flex justify-center w-full">
                <Button
                  size={'4'}
                  className="w-full shadow-md"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Logging in..." : "Log In"}
                </Button>
              </div>
            </form>
          ) : (
            // TODO: Refactor this to use separate forms for send OTP and login
            <form className="space-y-6"
              onSubmit={otpSent ? handleSubmitPhone(handlePhoneLogin) : handleSubmitPhone(handleSendOtp)}
            >
              <div className="space-y-6">
                {/* Phone Number Field */}
                <div className='flex-1'>

                  <label className='flex-1'>
                    <Text as="div" size="2" mb="1" weight="medium">
                      Phone Number
                    </Text>

                    <Controller
                      control={control}
                      name="phoneNumber"
                      rules={{
                        required: "Phone number is required",
                        validate: (value) => {
                          if (value) {
                            return isValidPhoneNumber(value) || 'Invalid phone number'
                          }
                        }
                      }}
                      render={({ field }) => (
                        <PhoneInput
                          placeholder="Enter phone number"
                          value={field.value || ''}
                          onChange={field.onChange}
                          defaultCountry=""
                          className="flex px-4 w-full text-[--font-size-3] bg-[--color-surface] ring-1 ring-[--gray-a7] focus-within:ring-[1.5px] focus-within:outline-none focus-within:ring-[--focus-8] rounded-[--radius-3] h-[46px]"
                          numberInputProps={{
                            className: "flex-1 border-0 bg-transparent outline-none placeholder:text-[--gray-a9] placeholder:text-[16px]"
                          }}
                        />
                      )}
                    />
                  </label>
                  <FormFieldErrorMessage errors={errorsPhone} field="phoneNumber" />
                </div>

                {/* Send OTP Button */}
                {!otpSent ? (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleSubmitPhone(handleSendOtp)}
                      disabled={isSendingOtp}
                      size={'4'}
                      className="w-full shadow-md"
                    >
                      {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* OTP Field */}
                    <div className="mt-2 space-y-1">
                      <label>
                        <Text as="div" size="2" mb="1" weight="medium">
                          Enter OTP
                        </Text>
                        <TextField.Root
                          size={"3"}
                          radius="large"
                          placeholder="Enter OTP"
                          className="h-12"
                          {...registerPhone("otp", {
                            required: "OTP is required",
                            pattern: {
                              value: /^\d{6}$/,
                              message: "OTP must be 6 digits"
                            },
                            maxLength: { value: 6, message: "OTP must be 6 digits" },
                            minLength: { value: 6, message: "OTP must be 6 digits" }
                          })}
                          maxLength={6}
                        >
                          <TextField.Slot side="left">
                            <Lock size={16} />
                          </TextField.Slot>
                        </TextField.Root>

                      </label>
                      <Text as="p" size={"1"} pt={"1"} color="gray">
                        Enter the 6 digit OTP sent to your phone number
                      </Text>
                    </div>
                    {/* Resend OTP and Timer */}
                    <div className="flex justify-end items-center">
                      <Button
                        type="button"
                        onClick={handleSubmitPhone(handleSendOtp)}
                        disabled={otpTimer > 0 || isSendingOtp}
                        variant="ghost"
                      >
                        {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Login Button */}
              {otpSent && <div className="flex justify-center w-full">
                <Button
                  type="submit"
                  disabled={!otpSent || isPhoneLoggingIn}
                  size={'4'}
                  className="w-full shadow-md"
                >
                  {isPhoneLoggingIn ? "Logging in..." : "Log In"}
                </Button>
              </div>}
            </form>
          )}
        </div>

        {/* Registration Link */}
        <Text as="div" align={"center"} size={'2'}>
          Don't have an account?{" "}
          <Text as="span" weight={"medium"} color={BRAND_COLOR}>
            <Link to={"/role-selection"} className="hover:underline">
              Register
            </Link>
          </Text>
        </Text>
      </Card>
    </div>
  );
}
