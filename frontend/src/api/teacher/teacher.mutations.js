import { useMutation } from "@tanstack/react-query";
import { createTeacherProfile } from "./teacher.api";

export const useCreateTeacherProfile = () => {
  return useMutation({
    mutationFn: createTeacherProfile,
  });
}; 