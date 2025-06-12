import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDefaultRewardCategories,
  createRewardCategory,
  deleteRewardCategory,
  updateRewardCategory
} from "./rewards.api";
import { REWARD_CATEGORIES_QUERY_KEY } from "./rewards.queries";

/**
 * Create a new reward category
 */
const useCreateRewardCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRewardCategory,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: REWARD_CATEGORIES_QUERY_KEY.all });
    },
  });
};

/**
 * Update an existing reward category
 */
const useUpdateRewardCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRewardCategory,
    onSuccess: (data, variables) => {
      Promise.all([
        // Invalidate the list query
        queryClient.invalidateQueries({ queryKey: REWARD_CATEGORIES_QUERY_KEY.all }),
        // Invalidate the specific category query
        queryClient.invalidateQueries({ queryKey: REWARD_CATEGORIES_QUERY_KEY.detail(variables.id) }),
      ]);
    },
  });
};

/**
 * Delete a reward category
 */
const useDeleteRewardCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRewardCategory,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: REWARD_CATEGORIES_QUERY_KEY.all });
    },
  });
};

/**
 * Create default reward categories
 */
const useCreateDefaultRewardCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDefaultRewardCategories,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: REWARD_CATEGORIES_QUERY_KEY.all });
    },
  });
};

export {
  useCreateDefaultRewardCategories, useCreateRewardCategory, useDeleteRewardCategory, useUpdateRewardCategory
};
