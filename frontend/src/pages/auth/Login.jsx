import {
  Button,
  Callout,
  Checkbox,
  Flex,
  IconButton,
  Text,
  TextField
} from "@radix-ui/themes";
import { Eye, EyeOff, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from 'sonner';
import { useLogin, useLoginWithPhone, useSendOtp } from '../../api/auth/auth.mutations';
import MyButton from "../../components/MyButton";
import { useAuth } from "../../Context/AuthContext";
import { buildSelectionList } from "../../utils/helperFunctions";

const OTP_TIMER = 45;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { loading, fetchProfile, setToken, setIsAuthenticated } = useAuth()
  const [loginMode, setLoginMode] = useState("email");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const { mutate: sendOtp, isPending: isSendingOtp, isError: isSendOtpError, error: sendOtpError } = useSendOtp();

  // Initialize React Hook Form with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Login mutation from TanStack Query
  const {
    mutateAsync: loginUser,
    isPending: isLoggingIn,
    isError: isLoginError,
    error: loginError,
  } = useLogin();

  const { mutate: loginWithPhone, isPending: isPhoneLoggingIn, isError: isPhoneLoginError, error: phoneLoginError } = useLoginWithPhone();

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
  const handleSendOtp = () => {
    if (!phone.match( /^\+?[1-9]\d{7,14}$/)) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    sendOtp({ phoneNumber: phone.startsWith('+') ? phone : `+91${phone}` }, {
      onSuccess: () => {
        setOtpSent(true);
        setOtpTimer(OTP_TIMER); // 60 seconds before resend allowed
        toast.success("OTP sent to your phone!");
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  const handlePhoneLogin = (e) => {
    e.preventDefault();

    // Validate phone number and OTP
    if (!phone.match(/^\d{10}$/)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    // Login with phone number and OTP
    loginWithPhone({ phoneNumber: phone.startsWith('+') ? phone : `+91${phone}`, otp },
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
    <div
      className="relative z-10 w-full max-w-sm space-y-6 text-white rounded-2xl "
    >
      {/* Header Text */}
      < div className="text-center" >
        <Text as="p" size={"8"} weight={"bold"}>
          Welcome Back
        </Text>
        <Text as="p" size={"4"} mt={"4"}>
          Log in to your account
        </Text>
      </div >

      <div className="flex p-1  rounded-lg bg-[--gray-a3] shadow-lg">
        <button
          onClick={() => setLoginMode("email")}
          type="button"
          className={`flex-1 py-2  rounded-md ${loginMode === "email" ? "bg-[--gray-1] text-[--gray-12]" : ""}`}
        >
          Email
        </button>
        <button
          onClick={() => setLoginMode("phone")}
          type="button"
          className={`flex-1 py-2  rounded-md ${loginMode === "phone" ? "bg-[--gray-1] text-[--gray-12]" : ""}`}
        >
          Phone
        </button>
      </div>


      {/* Error Message Display */}
      {
        (isLoginError || isPhoneLoginError || isSendOtpError) && (
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
              {loginError?.response?.data?.message ||
                phoneLoginError?.response?.data?.message ||
                sendOtpError?.response?.data?.message ||
                "Invalid email or password."}
            </Callout.Text>
          </Callout.Root>
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

            {/* Remember Me & Forgot Password Options */}
            <div className="flex items-center justify-between text-white">
              <Text as="label" size="2">
                <Flex gap="2">
                  <Checkbox checked={rememberMe} onCheckedChange={setRememberMe} />
                  Remember me
                </Flex>
              </Text>
              <Link to={"/forgot-password"} className="underline">
                <Text as="span" weight={"medium"} size={"2"}>
                  Forgot password?
                </Text>
              </Link>
            </div>
          </div>

          {/* Login Button with Loading State */}
          <div className="flex justify-center w-full">
            <MyButton
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logging in..." : "Log In"}
            </MyButton>
          </div>

          {/* Registration Link */}
          <Text as="div" align={"center"}>
            Don't have an account?{" "}
            <Link to={"/role-selection"} className="underline">
              <Text as="span" weight={"medium"}>
                Register
              </Text>
            </Link>
          </Text>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handlePhoneLogin}>
          <div className="space-y-6">
            {/* Phone Number Field */}
            <div className="space-y-1">
              <label>
                <Text as="div" size="2" mb="1" weight="medium">
                  Mobile Number
                </Text>
                <TextField.Root
                  size={"3"}
                  type="tel"
                  radius="large"
                  placeholder="Enter your mobile number"
                  className="h-12"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/, ""))}
                  maxLength={14}
                />
              </label>
            </div>

            {/* Send OTP Button */}
            {!otpSent ? (
              <div className="flex justify-end">
                <MyButton
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || !phone.match(/^\+?[1-9]\d{7,14}$/)}
                >
                  {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                </MyButton>
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
                      type="text"
                      radius="large"
                      placeholder="Enter OTP"
                      className="h-12"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/, ""))}
                      maxLength={6}
                    />
                  </label>
                  <Text as="p" size={"1"} pt={"1"} className="text-[--gray-1]">
                    Enter the 6 digit OTP sent to your phone number
                  </Text>
                </div>
                {/* Resend OTP and Timer */}
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpTimer > 0 || isSendingOtp}
                    variant="ghost"
                    className="text-[--gray-1]"
                  >
                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Login Button */}
          {otpSent && <div className="flex justify-center w-full">
            <MyButton
              type="submit"
              disabled={!otpSent || !otp || isPhoneLoggingIn}
            >
              {isPhoneLoggingIn ? "Logging in..." : "Log In"}
            </MyButton>
          </div>}

          {/* Registration Link */}
          <Text as="div" align={"center"}>
            Don't have an account?{" "}
            <Link to={"/role-selection"} className="underline">
              <Text as="span" weight={"medium"}>
                Register
              </Text>
            </Link>
          </Text>
        </form>
      )}
    </div >
  );
}
