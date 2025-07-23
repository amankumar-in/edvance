import { useQuery } from "@tanstack/react-query";
import { getTeacherById, getTeacherClasses } from "./teacher.api";

export const useGetTeacherById = (id, fetchNow = false) => {
  return useQuery({
    queryKey: ["teachers", id],
    queryFn: () => getTeacherById(id),
    enabled: !!id && fetchNow,
  });
}; 

export const useGetTeacherClasses = (options = {}) => {
  return useQuery({
    queryKey: ["teacher", "classes"],
    queryFn: getTeacherClasses,
    ...options
  });
};