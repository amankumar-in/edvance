import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordAttendance } from "./classAttendance.api";

const useRecordAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordAttendance,
    onSuccess: () => {
      // TODO: invalidate selective queries only not all.
      queryClient.invalidateQueries({ queryKey: ["class-attendance"] });
    }
  });
};

export default useRecordAttendance;
