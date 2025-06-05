import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDefaultTaskCategories, createTaskCategory, deleteTaskCategory, updateTaskCategory } from "./taskCategory.api";

// Create default task categories
export const useCreateDefaultTaskCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDefaultTaskCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskCategories"] });
    },
  });
};

// Create a new task category
export const useCreateTaskCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTaskCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskCategories"] });
    },
  });
};

// Update a task category
export const useUpdateTaskCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTaskCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskCategories"] });
    },
  });
};

// Delete a task category
export const useDeleteTaskCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTaskCategory,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["taskCategories"] });
    },
  });
};

