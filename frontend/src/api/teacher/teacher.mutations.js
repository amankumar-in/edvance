import { useMutation } from "@tanstack/react-query";
import { createTeacherProfile, updateTeacherProfile } from "./teacher.api";

export const useCreateTeacherProfile = () => {
  return useMutation({
    mutationFn: createTeacherProfile,
  });
};

export const useUpdateTeacherProfile = () => {
  return useMutation({
    mutationFn: updateTeacherProfile,
  });
};
