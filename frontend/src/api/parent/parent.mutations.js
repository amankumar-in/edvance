import { useMutation } from "@tanstack/react-query";
import { createParentProfile } from "./parent.api";

export const useCreateParentProfile = () => {
  return useMutation({
    mutationFn: createParentProfile,
  });
}; 