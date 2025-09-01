import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  updateSchoolProfile, 
  respondToJoinRequest,
  addTeacher,
  removeTeacher,
  addAdministrator,
  removeAdministrator,
  importStudents,
  createSchoolProfile,
  updateSchoolById
} from "./school.api";
import { SCHOOL_QUERY_KEYS } from "./school.queries";

// Hook to create school profile
export const useCreateSchoolProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSchoolProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SCHOOL_QUERY_KEYS.profile(),
      });
    },
  });
};

// Hook to update school profile
export const useUpdateSchoolProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSchoolProfile,
    onSuccess: () => {
      // Invalidate and refetch school profile
      queryClient.invalidateQueries({
        queryKey: SCHOOL_QUERY_KEYS.profile(),
      });
    },
  });
};

// Hook to respond to join request
export const useRespondToJoinRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: respondToJoinRequest,
    onSuccess: () => {
      // Invalidate and refetch join requests
      queryClient.invalidateQueries({
        queryKey: SCHOOL_QUERY_KEYS.joinRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: ['school-students']
      });
    },
  });
};

export const useAddTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['school-teachers']
      });
    },
  });
};

export const useRemoveTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['school-teachers'],
      });
    },
  });
};

export const useAddAdministrator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAdministrator,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SCHOOL_QUERY_KEYS.allAdministrators,
      });
    },
  });
};

export const useRemoveAdministrator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeAdministrator,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SCHOOL_QUERY_KEYS.allAdministrators,
      });
    },
  });
};

export const useImportStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SCHOOL_QUERY_KEYS.students(),
      });
    },
  });
};

// Hook to update school by ID (for platform admin)
export const useUpdateSchoolById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSchoolById,
    onSuccess: () => {
      // Invalidate all schools list to refresh the data
      queryClient.invalidateQueries({
        queryKey: SCHOOL_QUERY_KEYS.all,
      });
    },
  });
}; 