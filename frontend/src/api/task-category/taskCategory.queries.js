import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTaskCategories, getTaskCategoryById } from "./taskCategory.api";

// Get all task categories
export const useGetTaskCategories = (params = {}) => {
  return useQuery({
    queryKey: ["taskCategories", params],
    queryFn: () => getTaskCategories(params),
    placeholderData: keepPreviousData,
  });
};

// Get a task category by id
export const useGetTaskCategoryById = (id) => {
  return useQuery({
    queryKey: ["taskCategory", id],
    queryFn: () => getTaskCategoryById(id),
    enabled: !!id,
    staleTime: 0,
  });
};
