import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createParentProfile, updateParentProfile, generateLinkCode, unlinkChild, addChild, respondToLinkRequest, cancelOutgoingRequest, createChildAccount } from "./parent.api";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateLinkCode,
    onSuccess: (data) => {
      const { linkCode } = data.data;
      // Update the parent profile with the new link code
      queryClient.setQueryData(["parents", "profile"], (prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          data: {
            ...prevData.data,
            linkCode
          }
        };
      });

      // Refetch parent profile to update the link code
      // queryClient.invalidateQueries({ queryKey: ["parents", "profile"] })
    }
  });
};

export const useUnlinkChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlinkChild,
    onSuccess: (data, variables) => {
      const { childId } = variables;

      // Update the children list by filtering out the unlinked child
      queryClient.setQueryData(["parents", "children"], (prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          data: prevData.data.filter((child) => child._id !== childId)
        };
      });

      // Also invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["parents", "children"] });
    }
  });
};

export const useAddChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addChild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents", "outgoing-requests"] });
    }
  });
};

export const useRespondToLinkRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: respondToLinkRequest,
    onSuccess: (data, variables) => {
      const { requestId, action } = variables;

      // Remove the request from the pending requests list
      queryClient.setQueryData(["parents", "link-requests"], (prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          data: prevData.data.filter((request) => request._id !== requestId)
        };
      });

      // If the request was approved, also update the children list
      if (action === 'approve') {
        queryClient.invalidateQueries({ queryKey: ["parents", "children"] });
      }

      // Also invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["parents", "link-requests"] });
    }
  });
};

export const useCancelOutgoingRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOutgoingRequest,
    onSuccess: (data, variables) => {
      const requestId = variables;

      // Remove the cancelled request from the outgoing requests list
      queryClient.setQueryData(["parents", "outgoing-requests"], (prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          data: prevData.data.filter((request) => request._id !== requestId)
        };
      });

      // Also invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["parents", "outgoing-requests"] });
    }
  });
};

export const useCreateChildAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChildAccount,
    onSuccess: () => {
      // New student profile is created; no linking yet. Refresh outgoing requests if any are generated later
      queryClient.invalidateQueries({ queryKey: ["parents", "children"] });
    }
  });
};
