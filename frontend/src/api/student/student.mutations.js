import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStudentProfile, updateStudentProfile, linkWithParent, unlinkFromParent, requestParentLink, requestSchoolLink, linkWithSchool, unlinkFromSchool, cancelLinkRequest, respondToParentLinkRequest } from "./student.api";

export const useCreateStudentProfile = () => {
  return useMutation({
    mutationFn: createStudentProfile,
  });
};

export const useUpdateStudentProfile = () => {
  return useMutation({
    mutationFn: updateStudentProfile,
  });
};

export const useLinkWithParent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: linkWithParent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["linkRequests", "pending"] });
    }
  });
};

export const useUnlinkFromParent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: unlinkFromParent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", "profile"] });
    }
  });
};

export const useRequestParentLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: requestParentLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkRequests", "pending"] });
    }
  });
};

export const useRequestSchoolLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: requestSchoolLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkRequests", "pending"] });
    }
  });
};

export const useLinkWithSchool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: linkWithSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", "profile"] });
    }
  });
};

export const useUnlinkFromSchool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: unlinkFromSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", "profile"] });
    }
  });
};

export const useCancelLinkRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cancelLinkRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkRequests", "pending"] });
    }
  });
};

export const useRespondToParentLinkRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: respondToParentLinkRequest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["linkRequests", "parent"] });
      
      // If the request was approved, also update the student profile
      if (variables.action === 'approve') {
        queryClient.invalidateQueries({ queryKey: ["students", "profile"] });
      }
    }
  });
};
