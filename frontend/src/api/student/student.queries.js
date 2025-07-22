import { useQuery } from "@tanstack/react-query";
import { getStudentByUserId, getStudentProfile, getPendingLinkRequests, getParentLinkRequests, getStudentClasses, getStudentClassAttendanceDetails } from "./student.api";


export const useStudentByUserId = (userId, fetchNow = false) => {
  return useQuery({
    queryKey: ["students", userId],
    queryFn: () => getStudentByUserId(userId),
    enabled: !!userId && fetchNow,
  });
};

export const useStudentProfile = () => {
  return useQuery({
    queryKey: ["students", "profile"],
    queryFn: getStudentProfile,
  });
};

export const useGetPendingLinkRequests = () => {
  return useQuery({
    queryKey: ["linkRequests", "pending"],
    queryFn: getPendingLinkRequests,
  });
};

export const useGetParentLinkRequests = () => {
  return useQuery({
    queryKey: ["linkRequests", "parent"],
    queryFn: getParentLinkRequests,
  });
};

export const useGetStudentClasses = (id) => {
  return useQuery({
    queryKey: ["student", "classes", id],
    queryFn: () => getStudentClasses(id),
    enabled: !!id,
  });
};

export const useGetStudentClassAttendanceDetails = ({studentId, classId}) => {
  return useQuery({
    queryKey: ["student", "class", "attendance", studentId, classId],
    queryFn: () => getStudentClassAttendanceDetails({studentId, classId}),
    enabled: !!studentId && !!classId,
  });
};