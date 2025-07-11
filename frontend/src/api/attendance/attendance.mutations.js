import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  checkInAttendance,
  recordAttendance,
  recordBulkAttendance
} from './attendance.api';
import { attendanceKeys } from './attendance.queries';

// Student check-in mutation
export const useCheckInAttendance = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkInAttendance,
    onSuccess: () => {
      // TODO: update the cache manually using setQueryData for instant UI feedback
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.all
      });
    },
    ...options,
  });
};

// Record attendance mutation (for teachers/admins)
export const useRecordAttendance = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordAttendance,
    onSuccess: (data, variables) => {
      toast.success('Attendance recorded successfully');

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.student(variables.studentId)
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.all
      });

      if (variables.classId) {
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.todayAttendance(variables.classId)
        });
      }
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to record attendance';
      toast.error(message);
    },
    ...options,
  });
};

// Record bulk attendance mutation
export const useRecordBulkAttendance = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordBulkAttendance,
    onSuccess: (data) => {
      const { success = [], failed = [] } = data?.data?.data || {};

      if (success.length > 0) {
        toast.success(`${success.length} attendance records processed successfully`);
      }

      if (failed.length > 0) {
        toast.warning(`${failed.length} records failed to process`);
      }

      // Invalidate all attendance queries
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.all
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to process bulk attendance';
      toast.error(message);
    },
    ...options,
  });
}; 