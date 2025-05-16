import { useQuery } from "@tanstack/react-query";
import { getStudentByUserId } from "./student.api";


export const useStudentByUserId = (userId, fetchNow = false) => {
  return useQuery({
    queryKey: ["students", userId],
    queryFn: () => getStudentByUserId(userId),
    enabled: !!userId && fetchNow,
  });
};