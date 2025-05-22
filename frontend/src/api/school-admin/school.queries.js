import { useQuery } from "@tanstack/react-query";
import { getAllPendingJoinRequests, getSchoolById } from "./school.api";

// Query keys for school admin
export const SCHOOL_QUERY_KEYS = {
  all: ["schools"],
  schoolById: (id) => ["schools", id],
  joinRequests: () => ["schools", "join-requests"]
};

// Hook to get school by id
export const useGetSchoolById = (id, fetchNow = false) => {
  return useQuery({
    queryKey: SCHOOL_QUERY_KEYS.schoolById(id),
    queryFn: () => getSchoolById(id),
    enabled: !!id && fetchNow,
  });
};

// Hook to get all pending join requests
export const useGetAllPendingJoinRequests = () => {
  return useQuery({
    queryKey: SCHOOL_QUERY_KEYS.joinRequests(),
    queryFn: getAllPendingJoinRequests,
  });
};
