import { useQuery } from "@tanstack/react-query";
import { getChildren, getOutgoingLinkRequests, getParentByUserId, getParentProfile, getPendingLinkRequests } from "./parent.api";

export const useGetParentByUserId = (userId, fetchNow = false) => {
  return useQuery({
    queryKey: ["parents", userId],
    queryFn: () => getParentByUserId(userId),
    enabled: !!userId && fetchNow,
  });
};

export const useParentProfile = () => {
  return useQuery({
    queryKey: ["parents", "profile"],
    queryFn: getParentProfile,
  });
};

export const useChildren = () => {
  return useQuery({
    queryKey: ["parents", "children"],
    queryFn: getChildren,
  });
};

export const usePendingLinkRequests = () => {
  return useQuery({
    queryKey: ["parents", "link-requests"],
    queryFn: getPendingLinkRequests,
  });
};

export const useOutgoingLinkRequests = () => {
  return useQuery({
    queryKey: ["parents", "outgoing-requests"],
    queryFn: getOutgoingLinkRequests,
  });
};


