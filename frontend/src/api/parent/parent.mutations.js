import { useMutation } from "@tanstack/react-query";
import { createParentProfile, updateParentProfile } from "./parent.api";

export const useCreateParentProfile = () => {
  return useMutation({
    mutationFn: createParentProfile,
  });
};

export const useUpdateParentProfile = () => {
  return useMutation({
    mutationFn: updateParentProfile,
  });
};
