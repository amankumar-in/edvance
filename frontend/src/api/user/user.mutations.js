import { useMutation } from "@tanstack/react-query";
import { updateUserProfile, uploadAvatar } from "./user.api";

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: updateUserProfile,
  });
};

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: uploadAvatar,
  });
}; 