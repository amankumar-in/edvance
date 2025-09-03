import { keepPreviousData, useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { getParentTasks, getStudentTaskById, getStudentTasks, submitTask, getTasks, getTasksForApproval, getTaskById } from "./task.api";

// Get all tasks(for platform admin, school admin, teacher)
export const useGetTasks = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => getTasks(params),
    placeholderData: keepPreviousData, 
    ...options
  });
};

// Get all tasks(for student)
export const useGetStudentTasks = (params = {}) => {
  return useQuery({
    queryKey: ["tasks", "student", params],
    queryFn: () => getStudentTasks(params),
    placeholderData: keepPreviousData
  });
};

// Get all tasks(for student) with infinite scroll
export const useGetStudentTasksInfinite = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ["tasks", "student", params],
    queryFn: ({ pageParam = 1 }) => getStudentTasks({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.pagination?.page;
      const totalPages = lastPage?.pagination?.pages;

      if (currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });
};


// Get a task by id(for student)
export const useGetStudentTaskById = (id) => {
  return useQuery({
    queryKey: ["task", "student", id],
    queryFn: () => getStudentTaskById(id),
    enabled: !!id,
  });
};

// Get a task by id (for admin roles)
export const useGetTaskById = (id, role, options = {}) => {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => getTaskById(id, role),
    enabled: !!id,
    ...options,
  });
};

// Submit a task(for student)
export const useSubmitTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, submissionData }) => submitTask(taskId, submissionData),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch task data
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["task", "student", variables.taskId] }),
        queryClient.invalidateQueries({ queryKey: ["tasks", "student"] })
      ])
    },
  });
};

// Get all tasks(for parent)
export const useGetParentTasks = (params = {}) => {
  return useQuery({
    queryKey: ["tasks", "parent", params],
    queryFn: () => getParentTasks(params),
    placeholderData: keepPreviousData
  });
};

// Get all tasks(for parent) with infinite scroll
export const useGetParentTasksInfinite = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ["tasks", "parent", params],
    queryFn: ({ pageParam = 1 }) => getParentTasks({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.pagination?.page;
      const totalPages = lastPage?.pagination?.pages;

      if (currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });
};

// Get all tasks for approval
export const useGetTasksForApproval = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ["tasks", "approval", params],
    queryFn: ({ pageParam = 1 }) => getTasksForApproval({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => { lastPage?.data?.nextPage || null },
    placeholderData: keepPreviousData,
    keepPreviousData: true
  });
};

export const useGetTaskClaimsPaginated = (params = {}) => {
  return useQuery({
    queryKey: ["tasks", "approval", params],
    queryFn: () => getTasksForApproval(params),
    placeholderData: keepPreviousData,
  });
};
