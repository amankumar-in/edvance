import { useQuery } from "@tanstack/react-query";
import { getClassDetails, getClassStudents, getPendingJoinRequests } from "./schoolClass.api";

// Query keys for school class
export const SCHOOL_CLASS_QUERY_KEYS = {
  all: ["school-classes"],
  details: (classId) => ["school-classes", "details", classId],
  students: (classId) => ["school-classes", "students", classId],
  joinRequests: (classId) => ["school-classes", "join-requests", classId],
};

// Hook to get class details
export const useClassDetails = (classId) => {
  return useQuery({
    queryKey: SCHOOL_CLASS_QUERY_KEYS.details(classId),
    queryFn: () => getClassDetails(classId),
    enabled: !!classId,
  });
};

// Hook to get class students
export const useClassStudents = (classId) => {
  return useQuery({
    queryKey: SCHOOL_CLASS_QUERY_KEYS.students(classId),
    queryFn: () => getClassStudents(classId),
    enabled: !!classId,
  });
};

// Hook to get pending join requests for class
export const usePendingJoinRequests = (classId) => {
  return useQuery({
    queryKey: SCHOOL_CLASS_QUERY_KEYS.joinRequests(classId),
    queryFn: () => getPendingJoinRequests(classId),
    enabled: !!classId,
  });
};
