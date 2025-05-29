import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as taskManagementApi from './taskManagement.api';

// ==================== QUERY KEYS ====================
export const TASK_MANAGEMENT_KEYS = {
  all: ['taskManagement'],
  tasks: () => [...TASK_MANAGEMENT_KEYS.all, 'tasks'],
  task: (id) => [...TASK_MANAGEMENT_KEYS.tasks(), id],
  assignments: (taskId) => [...TASK_MANAGEMENT_KEYS.task(taskId), 'assignments'],
  visibility: (taskId) => [...TASK_MANAGEMENT_KEYS.task(taskId), 'visibility'],
  studentTasks: (studentId) => [...TASK_MANAGEMENT_KEYS.all, 'studentTasks', studentId],
  analytics: () => [...TASK_MANAGEMENT_KEYS.all, 'analytics'],
};

// ==================== TASK QUERIES ====================

export const useTasks = (params = {}) => {
  return useQuery({
    queryKey: [...TASK_MANAGEMENT_KEYS.tasks(), params],
    queryFn: () => taskManagementApi.getTasks(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTask = (id) => {
  return useQuery({
    queryKey: TASK_MANAGEMENT_KEYS.task(id),
    queryFn: () => taskManagementApi.getTaskById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTaskAssignments = (taskId, params = {}) => {
  return useQuery({
    queryKey: [...TASK_MANAGEMENT_KEYS.assignments(taskId), params],
    queryFn: () => taskManagementApi.getTaskAssignments(taskId, params),
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTaskVisibilityControls = (taskId, params = {}) => {
  return useQuery({
    queryKey: [...TASK_MANAGEMENT_KEYS.visibility(taskId), params],
    queryFn: () => taskManagementApi.getTaskVisibilityControls(taskId, params),
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useStudentTasks = (studentId, params = {}) => {
  return useQuery({
    queryKey: [...TASK_MANAGEMENT_KEYS.studentTasks(studentId), params],
    queryFn: () => taskManagementApi.getStudentTasks(studentId, params),
    enabled: !!studentId,
    staleTime: 1 * 60 * 1000, // 1 minute for real-time feel
  });
};

export const useStudentTaskVisibility = (taskId, studentId, params = {}) => {
  return useQuery({
    queryKey: [...TASK_MANAGEMENT_KEYS.visibility(taskId), 'student', studentId, params],
    queryFn: () => taskManagementApi.checkStudentTaskVisibility(taskId, studentId, params),
    enabled: !!(taskId && studentId),
    staleTime: 30 * 1000, // 30 seconds for real-time visibility
  });
};

export const useAssignmentAnalytics = (params = {}) => {
  return useQuery({
    queryKey: [...TASK_MANAGEMENT_KEYS.analytics(), 'assignments', params],
    queryFn: () => taskManagementApi.getAssignmentAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useVisibilityAnalytics = (params = {}) => {
  return useQuery({
    queryKey: [...TASK_MANAGEMENT_KEYS.analytics(), 'visibility', params],
    queryFn: () => taskManagementApi.getVisibilityAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ==================== TASK MUTATIONS ====================

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: taskManagementApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.tasks() });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.analytics() });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => taskManagementApi.updateTask(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.task(variables.id) });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.tasks() });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: taskManagementApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.tasks() });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.analytics() });
    },
  });
};

// ==================== ASSIGNMENT MUTATIONS ====================

export const useAssignTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, data }) => taskManagementApi.assignTaskToStudents(taskId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.assignments(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.task(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.studentTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.analytics() });
    },
  });
};

export const useUnassignTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, data }) => taskManagementApi.unassignTaskFromStudents(taskId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.assignments(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.task(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.studentTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.analytics() });
    },
  });
};

export const useBulkAssignTasks = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: taskManagementApi.bulkAssignTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.tasks() });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.studentTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.analytics() });
    },
  });
};

// ==================== VISIBILITY MUTATIONS ====================

export const useSetTaskVisibility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, data }) => taskManagementApi.setTaskVisibility(taskId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.visibility(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.studentTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.analytics() });
    },
  });
};

export const useBulkSetVisibility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: taskManagementApi.bulkSetVisibility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.visibility() });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.studentTasks() });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.analytics() });
    },
  });
};

// ==================== PARENT-SPECIFIC HOOKS ====================

export const useSetParentVisibilityControl = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, parentId, childrenIds, isVisible, reason }) => 
      taskManagementApi.setParentVisibilityControl(taskId, parentId, childrenIds, isVisible, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.visibility(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.studentTasks() });
    },
  });
};

// ==================== SCHOOL-SPECIFIC HOOKS ====================

export const useSetSchoolVisibilityControl = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, schoolId, studentIds, isVisible, reason }) => 
      taskManagementApi.setSchoolVisibilityControl(taskId, schoolId, studentIds, isVisible, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.visibility(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.studentTasks() });
    },
  });
};

export const useSetClassVisibilityControl = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, classId, studentIds, isVisible, reason }) => 
      taskManagementApi.setClassVisibilityControl(taskId, classId, studentIds, isVisible, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.visibility(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_MANAGEMENT_KEYS.studentTasks() });
    },
  });
}; 