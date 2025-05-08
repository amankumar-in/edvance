import { useMutation } from "@tanstack/react-query";
import { createStudentProfile } from "./student.api";

export const useCreateStudentProfile = () => {
  return useMutation({
    mutationFn: createStudentProfile,
  });
};
