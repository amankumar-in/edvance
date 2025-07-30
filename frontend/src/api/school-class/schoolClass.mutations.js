import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SCHOOL_QUERY_KEYS } from "../school-admin/school.queries";
import {
  addStudentToClass,
  assignTeacherToClass,
  createClass,
  deleteClass,
  generateJoinCode,
  removeStudentFromClass,
  respondToJoinRequest,
  updateClass
} from "./schoolClass.api";
import { SCHOOL_CLASS_QUERY_KEYS } from "./schoolClass.queries";

// Create class mutation
export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: SCHOOL_QUERY_KEYS.allClasses }),
        queryClient.invalidateQueries({ queryKey: ['teacher', 'classes'] })
      ])
    },
  });
};

// Update class mutation
export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClass,
    onSuccess: (_, variables) => {
      const { classId } = variables;
      Promise.all([
        queryClient.invalidateQueries({ queryKey: SCHOOL_QUERY_KEYS.allClasses }),
        queryClient.invalidateQueries({ queryKey: SCHOOL_CLASS_QUERY_KEYS.details(classId) }),
        queryClient.invalidateQueries({ queryKey: ['teacher', 'classes'] })
      ])
    },
  });
};

// Delete class mutation
export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: SCHOOL_QUERY_KEYS.allClasses }),
        queryClient.invalidateQueries({ queryKey: ['teacher', 'classes'] })
      ])
    },
  });
};

// Generate join code mutation
export const useGenerateJoinCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateJoinCode,
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: SCHOOL_QUERY_KEYS.allClasses }),
        queryClient.invalidateQueries({ queryKey: ['teacher', 'classes'] })
      ])
    },
  });
};

// Add student to class mutation
export const useAddStudentToClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStudentToClass,
    onSuccess: () => {
      // Invalidate class students and details
      queryClient.invalidateQueries({ queryKey: SCHOOL_CLASS_QUERY_KEYS.all });
    },
  });
};

// Remove student from class mutation
export const useRemoveStudentFromClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeStudentFromClass,
    onSuccess: (data, variables) => {
      toast.success("Student removed from class successfully");
      // Invalidate class students and details
      queryClient.invalidateQueries({ queryKey: SCHOOL_CLASS_QUERY_KEYS.all });
    },
  });
};

// Respond to join request mutation
export const useRespondToJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: respondToJoinRequest,
    onSuccess: (data, variables) => {
      const action = variables.action === "approve" ? "approved" : "rejected";
      toast.success(`Join request ${action} successfully`);
      // Invalidate join requests and class data
      queryClient.invalidateQueries({ queryKey: SCHOOL_CLASS_QUERY_KEYS.joinRequests(variables.classId) });
      queryClient.invalidateQueries({ queryKey: SCHOOL_CLASS_QUERY_KEYS.students(variables.classId) });
      queryClient.invalidateQueries({ queryKey: SCHOOL_CLASS_QUERY_KEYS.details(variables.classId) });
      queryClient.invalidateQueries({ queryKey: ["schools", "classes"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to respond to join request");
    },
  });
};

export const useAssignTeacherToClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignTeacherToClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHOOL_CLASS_QUERY_KEYS.all });
    },
  });
};
