import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordClassAttendance } from "./classAttendance.api";

const useRecordClassAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordClassAttendance,
    onSuccess: (data, variables) => {
      const { studentId, classId } = variables;
      // TODO: invalidate selective queries only not all.
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["class-attendance"] }),
        queryClient.invalidateQueries({ queryKey: ["student", "class", "attendance", studentId, classId] }),
      ])
    }
  });
};

export {
  useRecordClassAttendance,
};
