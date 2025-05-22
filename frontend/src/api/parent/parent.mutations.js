import { useMutation } from "@tanstack/react-query";
import { createParentProfile, updateParentProfile, generateLinkCode, unlinkChild, addChild, respondToLinkRequest } from "./parent.api";

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

export const useGenerateLinkCode = () => {
  return useMutation({
    mutationFn: generateLinkCode,
  });
};

export const useUnlinkChild = () => {
  return useMutation({
    mutationFn: unlinkChild,
  });
};

export const useAddChild = () => {
  return useMutation({
    mutationFn: addChild,
  });
};

export const useRespondToLinkRequest = () => {
  return useMutation({
    mutationFn: respondToLinkRequest,
  });
};
