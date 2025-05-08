import { useMutation } from "@tanstack/react-query";
import { createSocialWorkerProfile } from "./socialWorker.api";

export const useCreateSocialWorkerProfile = (options) => {
  return useMutation({
    mutationFn: createSocialWorkerProfile,
    ...options,
  });
}; 