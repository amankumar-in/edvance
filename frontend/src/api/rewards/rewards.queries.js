import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRewardCategories, getRewardCategoryById, getRewardCategoryHierarchy, getRewards, getRewardById } from "./rewards.api";

/**
 * Query keys for reward categories
 */
export const REWARD_CATEGORIES_QUERY_KEY = {
  all: ['reward-categories'],
  list: (params) => ['reward-categories', params],
  detail: (id) => ['reward-categories', id],
  hierarchy: (params) => ['reward-categories', 'hierarchy', params],
}

/**
 * Query keys for rewards
 */
export const REWARDS_QUERY_KEY = {
  all: ['rewards'],
  list: (params) => ['rewards', params],
  detail: (id) => ['rewards', id],
}

/**
 * Get all reward categories
 */
export const useGetRewardCategories = (params = {}) => {
  return useQuery({
    queryKey: REWARD_CATEGORIES_QUERY_KEY.list(params),
    queryFn: () => getRewardCategories(params),
    placeholderData: keepPreviousData
  });
};

/**
 * Get reward category by ID
 */
export const useGetRewardCategoryById = (id) => {
  return useQuery({
    queryKey: REWARD_CATEGORIES_QUERY_KEY.detail(id),
    queryFn: () => getRewardCategoryById(id),
    enabled: !!id,
  });
};

/**
 * Get reward category hierarchy
 */
export const useGetRewardCategoryHierarchy = (params = {}) => {
  return useQuery({
    queryKey: REWARD_CATEGORIES_QUERY_KEY.hierarchy(params),
    queryFn: () => getRewardCategoryHierarchy(params),
    placeholderData: keepPreviousData
  });
};

/**
 * Get all rewards
 */
export const useGetRewards = (params = {}) => {
  return useQuery({
    queryKey: REWARDS_QUERY_KEY.list(params),
    queryFn: () => getRewards(params),
    placeholderData: keepPreviousData
  });
};

/**
 * Get reward by ID
 */
export const useGetRewardById = (id) => {
  return useQuery({
    queryKey: REWARDS_QUERY_KEY.detail(id),
    queryFn: () => getRewardById(id),
    enabled: !!id,
  });
};
