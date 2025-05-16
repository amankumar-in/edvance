import { useQuery } from "@tanstack/react-query";
import { getParentByUserId } from "./parent.api";

export const useGetParentByUserId = (userId, fetchNow = false) => {
  return useQuery({
    queryKey: ["parents", userId],
    queryFn: () => getParentByUserId(userId),
    enabled: !!userId && fetchNow,
  });
};


