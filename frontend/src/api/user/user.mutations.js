import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUpdateUserProfile, updateUserProfile, uploadAvatar, changePassword } from "./user.api";

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", "profile"],
      });
    }
  });
};

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: uploadAvatar,
  });
};

export const useAdminUpdateUserProfile = () => {
  return useMutation({
    mutationFn: adminUpdateUserProfile,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};
