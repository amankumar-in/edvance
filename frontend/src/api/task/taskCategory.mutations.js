import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getTaskCategories,
    getTaskCategoryById,
    createTaskCategory,
    updateTaskCategory,
    deleteTaskCategory,
    getTaskCategoriesByContext,
    createDefaultTaskCategories,
    migrateTaskCategoryIcons
} from "./taskCategory.api";

// Query keys
export const TASK_CATEGORY_KEYS = {
    all: ['taskCategories'],
    lists: () => [...TASK_CATEGORY_KEYS.all, 'list'],
    list: (filters) => [...TASK_CATEGORY_KEYS.lists(), filters],
    details: () => [...TASK_CATEGORY_KEYS.all, 'detail'],
    detail: (id) => [...TASK_CATEGORY_KEYS.details(), id],
    context: (context) => [...TASK_CATEGORY_KEYS.all, 'context', context],
};

// Queries
export const useTaskCategories = (params = {}) => {
    return useQuery({
        queryKey: TASK_CATEGORY_KEYS.list(params),
        queryFn: () => getTaskCategories(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    });
};

export const useTaskCategory = (id) => {
    return useQuery({
        queryKey: TASK_CATEGORY_KEYS.detail(id),
        queryFn: () => getTaskCategoryById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useTaskCategoriesByContext = (context) => {
    return useQuery({
        queryKey: TASK_CATEGORY_KEYS.context(context),
        queryFn: () => getTaskCategoriesByContext(context),
        enabled: !!context,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Mutations
export const useCreateTaskCategory = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createTaskCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASK_CATEGORY_KEYS.all });
        },
    });
};

export const useUpdateTaskCategory = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }) => updateTaskCategory(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: TASK_CATEGORY_KEYS.all });
            queryClient.setQueryData(TASK_CATEGORY_KEYS.detail(variables.id), data);
        },
    });
};

export const useDeleteTaskCategory = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteTaskCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASK_CATEGORY_KEYS.all });
        },
    });
};

export const useCreateDefaultTaskCategories = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createDefaultTaskCategories,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASK_CATEGORY_KEYS.all });
        },
    });
};

export const useMigrateTaskCategoryIcons = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: migrateTaskCategoryIcons,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASK_CATEGORY_KEYS.all });
        },
    });
}; 