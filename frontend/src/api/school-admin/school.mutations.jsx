import { useMutation, useQueryClient } from "@tanstack/react-query";
import { respondToJoinRequest } from "./school.api";
import { SCHOOL_QUERY_KEYS } from "./school.queries";

// Hook to respond to join request
export const useRespondToJoinRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: respondToJoinRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHOOL_QUERY_KEYS.joinRequests() });
    }
  });
};