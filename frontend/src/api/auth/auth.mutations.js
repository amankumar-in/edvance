import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, register, verifyEmail } from "./auth.api";

/**
 * Hook for user registration
 */
const useRegister = () => {
  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      console.log("Registration successfull", data);
    },
  });
};

/**
 * Hook for email verification
 */
const useVerifyEmail = () => {
  return useMutation({
    mutationFn: verifyEmail,
    // onSuccess: (data) => {
    //   console.log('Email verification successful', data);
    // }
  });
};

/**
 * Hook for user login
 */
const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log("Login successful", data);
    },
  });
};

export { useRegister, useVerifyEmail, useLogin };
