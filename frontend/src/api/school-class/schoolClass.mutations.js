import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SCHOOL_QUERY_KEYS } from "../school-admin/school.queries";
import {
  addStudentToClass,
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
      queryClient.invalidateQueries({ queryKey: SCHOOL_QUERY_KEYS.allClasses });
    },
  });
};

// Update class mutation
export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHOOL_QUERY_KEYS.allClasses });
    },
  });
};

// Delete class mutation
export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: SCHOOL_QUERY_KEYS.allClasses });
    },
  });
};

// Generate join code mutation
export const useGenerateJoinCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateJoinCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHOOL_QUERY_KEYS.allClasses });
    },
  });
};

// Add student to class mutation
export const useAddStudentToClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStudentToClass,
    onSuccess: (data, variables) => {
      toast.success("Student added to class successfully");
      // Invalidate class students and details
      queryClient.invalidateQueries({ queryKey: SCHOOL_CLASS_QUERY_KEYS.students(variables.classId) });
      queryClient.invalidateQueries({ queryKey: SCHOOL_CLASS_QUERY_KEYS.details(variables.classId) });
      queryClient.invalidateQueries({ queryKey: ["schools", "classes"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to add student to class");
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
      queryClient.invalidateQueries({ queryKey: SCHOOL_CLASS_QUERY_KEYS.students(variables.classId) });
      queryClient.invalidateQueries({ queryKey: SCHOOL_CLASS_QUERY_KEYS.details(variables.classId) });
      queryClient.invalidateQueries({ queryKey: ["schools", "classes"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to remove student from class");
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
