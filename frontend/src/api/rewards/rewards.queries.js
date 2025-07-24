import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getRewardCategories, getRewardCategoryById, getRewardCategoryHierarchy, getRewards, getRewardById, getRedemptionHistory, getRedemptionById, getParentRewards, getStudentRewards, getPendingRedemptions } from "./rewards.api";

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
  parent: (params) => ['rewards', 'parent', params],
  student: (params) => ['rewards', 'student', params],
  list: (params) => ['rewards', params],
  detail: (id) => ['rewards', id],
}

/**
 * Query keys for redemptions
 */
export const REDEMPTIONS_QUERY_KEY = {
  all: ['redemptions'],
  history: (params) => ['redemptions', 'history', params],
  pending: (params) => ['redemptions', 'pending', params],
  detail: (id) => ['redemptions', id],
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
export const useGetRewards = (params = {}, options = {}) => {
  return useQuery({
    queryKey: REWARDS_QUERY_KEY.list(params),
    queryFn: () => getRewards(params),
    placeholderData: keepPreviousData,
    ...options
  });
};

/**
 * Get all rewards(for infinite scroll)
 */
export const useGetAllRewardsInfinite = (params = {}) => {
  return useInfiniteQuery({
    queryKey: REWARDS_QUERY_KEY.list(params),
    queryFn: ({ pageParam = 1 }) => getRewards({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.data?.pagination?.page;
      const totalPages = lastPage?.data?.pagination?.pages;

      if (currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });
}

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

/**
 * Get redemption history
 */
export const useGetRedemptionHistory = (params = {}) => {
  return useQuery({
    queryKey: REDEMPTIONS_QUERY_KEY.history(params),
    queryFn: () => getRedemptionHistory(params),
    placeholderData: keepPreviousData
  });
};

/**
 * Get redemptions with pagination (for platform admin)
 */
export const useGetRedemptions = (params = {}) => {
  return useQuery({
    queryKey: REDEMPTIONS_QUERY_KEY.history(params),
    queryFn: () => getRedemptionHistory(params),
    placeholderData: keepPreviousData
  });
};

/**
 * Get redemption history with infinite scroll
 */
export const useGetRedemptionHistoryInfinite = (params = {}) => {
  return useInfiniteQuery({
    queryKey: REDEMPTIONS_QUERY_KEY.history(params),
    queryFn: ({ pageParam = 1 }) => getRedemptionHistory({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.data?.pagination?.page;
      const totalPages = lastPage?.data?.pagination?.pages;

      if (currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });
};

/**
 * Get redemption by ID
 */
export const useGetRedemptionById = (id) => {
  return useQuery({
    queryKey: REDEMPTIONS_QUERY_KEY.detail(id),
    queryFn: () => getRedemptionById(id),
    enabled: !!id,
  });
};

/**
 * Get parent rewards
 */
export const useGetParentRewards = (params = {}) => {
  return useInfiniteQuery({
    queryKey: REWARDS_QUERY_KEY.parent(params),
    queryFn: ({ pageParam = 1 }) => getParentRewards({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.data?.pagination?.page;
      const totalPages = lastPage?.data?.pagination?.pages;

      if (currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });
};

/**
 * Get student rewards
 */
export const useGetStudentRewards = (params = {}) => {
  return useInfiniteQuery({
    queryKey: REWARDS_QUERY_KEY.student(params),
    queryFn: ({ pageParam = 1 }) => getStudentRewards({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.data?.pagination?.page;
      const totalPages = lastPage?.data?.pagination?.pages;

      if (currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });
};

/**
 * Get pending redemptions for fulfillment
 */
export const useGetPendingRedemptions = (params = {}) => {
  return useInfiniteQuery({
    queryKey: REDEMPTIONS_QUERY_KEY.pending(params),
    queryFn: ({ pageParam = 1 }) => getPendingRedemptions({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.data?.pagination?.page;
      const totalPages = lastPage?.data?.pagination?.pages;

      if (currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });
};
