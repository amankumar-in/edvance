import { useQuery } from "@tanstack/react-query";
import { getTeacherById } from "./teacher.api";

export const useGetTeacherById = (id, fetchNow = false) => {
  return useQuery({
    queryKey: ["teachers", id],
    queryFn: () => getTeacherById(id),
    enabled: !!id && fetchNow,
  });
}; 