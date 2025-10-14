import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordClassAttendance, teacherMarkAttendance } from "./classAttendance.api";

const useRecordClassAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordClassAttendance,
    onSuccess: () => {
      // const { studentId, classId } = variables;
      // TODO: invalidate selective queries only not all.
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["class-attendance"] }),
        queryClient.invalidateQueries({queryKey:["points"]})
      ])
    }
  });
};

const useTeacherMarkClassAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherMarkAttendance,
    onSuccess: () => {
      // const { studentId, classId } = variables;
      // TODO: invalidate selective queries only not all.
      return queryClient.invalidateQueries({ queryKey: ["class-attendance"] });
    }
  });
};

export {
  useRecordClassAttendance,
  useTeacherMarkClassAttendance
};

