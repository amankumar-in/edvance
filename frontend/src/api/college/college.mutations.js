import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCollege, updateCollege, deleteCollege, toggleCollegeFeaturedStatus, updateCollegeStatus } from "./college.api";
import { COLLEGE_QUERY_KEYS } from "./college.queries";

// Hook to create college
export const useCreateCollege = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCollege,
    onSuccess: () => {
      // Invalidate and refetch colleges list
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.all });
    },
  });
};

// Hook to update college
export const useUpdateCollege = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCollege,
    onSuccess: (data, variables) => {
      // Invalidate and refetch colleges list
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.all });
      // Invalidate specific college
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.collegeById(variables.id) });
    },
  });
};

// Hook to delete college
export const useDeleteCollege = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCollege,
    onSuccess: () => {
      // Invalidate and refetch colleges list
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.all });
    },
  });
};

// Hook to toggle featured status
export const useToggleCollegeFeaturedStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleCollegeFeaturedStatus,
    onSuccess: (data, collegeId) => {
      // Invalidate and refetch colleges list
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.all });
      // Invalidate specific college
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.collegeById(collegeId) });
      // Invalidate featured colleges
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.featured() });
    },
  });
};

// Hook to update college status
export const useUpdateCollegeStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCollegeStatus,
    onSuccess: (data, variables) => {
      // Invalidate and refetch colleges list
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.all });
      // Invalidate specific college
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.collegeById(variables.id) });
    },
  });
};