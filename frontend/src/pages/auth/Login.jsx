import {
  Callout,
  Checkbox,
  Flex,
  IconButton,
  Text,
  TextField
} from "@radix-ui/themes";
import { Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from 'sonner';
import { useLogin } from '../../api/auth/auth.mutations';
import MyButton from "../../components/MyButton";
import { MdPerson } from '../../icons/index'
import { useAuth } from "../../Context/AuthContext";
import { buildSelectionList } from "../../utils/helperFunctions";


export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { loading, fetchProfile, setToken, setIsAuthenticated } = useAuth()


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

  /**
   * Handle form submission for login
   * - Shows success toast on successful login
   * - Stores user preference if "Remember me" is checked
   * - Navigates to dashboard on success
   */
  const handleLogin = async (data) => {
    loginUser(data, {
      onSuccess: async (response) => {
        // Show toast
        toast.success("Login successful", {
          description: `Welcome back, ${response.data?.user?.email || "User"}!`,
        });

        const { data } = response;
        const { accessToken } = data ?? {};

        setToken(accessToken);
        setIsAuthenticated(true)

        const profileData = await fetchProfile();
        const { user, profiles } = profileData;

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
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(handleLogin)}
      className="relative z-10 w-full max-w-sm space-y-6 text-white rounded-2xl "
    >
      {/* Header Text */}
      <div className="text-center">
        <Text as="p" size={"8"} weight={"bold"}>
          Welcome Back
        </Text>
        <Text as="p" size={"4"} mt={"4"}>
          Log in to your account
        </Text>
      </div>

      {/* Logo Placeholder */}
      <div className="flex items-center justify-center w-20 h-20 mx-auto bg-[--purple-9] rounded-full">
        <MdPerson className='size-10' />
        {/* <MdAccountCircle size={36} /> */}
      </div>

      {/* Error Message Display */}
      {isLoginError && (
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
              "Invalid email or password."}
          </Callout.Text>
        </Callout.Root>
      )}

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
  );
}
