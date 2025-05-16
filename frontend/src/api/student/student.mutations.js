import { useMutation } from "@tanstack/react-query";
import { createStudentProfile, updateStudentProfile } from "./student.api";

export const useCreateStudentProfile = () => {
  return useMutation({
    mutationFn: createStudentProfile,
  });
};

export const useUpdateStudentProfile = () => {
  return useMutation({
    mutationFn: updateStudentProfile,
  });
};

