import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "./user.api";

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: updateUserProfile,
  });
}; 