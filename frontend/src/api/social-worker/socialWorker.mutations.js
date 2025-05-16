import { useMutation } from "@tanstack/react-query";
import { createSocialWorkerProfile, updateSocialWorkerProfile } from "./socialWorker.api";

export const useCreateSocialWorkerProfile = (options) => {
  return useMutation({
    mutationFn: createSocialWorkerProfile,
    ...options,
  });
};

export const useUpdateSocialWorkerProfile = () => {
  return useMutation({
    mutationFn: updateSocialWorkerProfile,
  });
};
