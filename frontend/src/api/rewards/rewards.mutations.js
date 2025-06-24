import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDefaultRewardCategories,
  createRewardCategory,
  deleteRewardCategory,
  updateRewardCategory,
  createReward,
  updateReward,
  deleteReward,
  redeemReward,
  cancelRedemption,
  fulfillRedemption,
  addToWishlist,
  removeFromWishlist
} from "./rewards.api";
import { REWARD_CATEGORIES_QUERY_KEY, REWARDS_QUERY_KEY, REDEMPTIONS_QUERY_KEY } from "./rewards.queries";

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

/**
 * Create a new reward
 */
const useCreateReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REWARDS_QUERY_KEY.all });
    },
  });
};

/**
 * Update an existing reward
 */
const useUpdateReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReward,
    onSuccess: (data, variables) => {
      Promise.all([
        // Invalidate the list query
        queryClient.invalidateQueries({ queryKey: REWARDS_QUERY_KEY.all }),
        // Invalidate the specific reward query
        queryClient.invalidateQueries({ queryKey: REWARDS_QUERY_KEY.detail(variables.id) }),
      ]);
    },
  });
};

/**
 * Delete a reward
 */
const useDeleteReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReward,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: REWARDS_QUERY_KEY.all });
    },
  });
};


/** 
 * Redeem a reward
 */
const useRedeemReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: redeemReward,
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: REWARDS_QUERY_KEY.all }),
        queryClient.invalidateQueries({ queryKey: ['points'] }),
        queryClient.invalidateQueries({ queryKey: REDEMPTIONS_QUERY_KEY.all }),
      ])
    },
  });
};

/**
 * Cancel a redemption
 */
const useCancelRedemption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelRedemption,
    onSuccess: (data, variables) => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: REDEMPTIONS_QUERY_KEY.all }),
        queryClient.invalidateQueries({ queryKey: REDEMPTIONS_QUERY_KEY.detail(variables.id) }),
        queryClient.invalidateQueries({ queryKey: ['points'] }),
      ])
    },
  });
};

/**
 * Fulfill a redemption
 */
const useFulfillRedemption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fulfillRedemption,
    onSuccess: (data, variables) => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: REDEMPTIONS_QUERY_KEY.all }),
        queryClient.invalidateQueries({ queryKey: REDEMPTIONS_QUERY_KEY.detail(variables.id) }),
      ])
    },
  });
};

/**
 * Add reward to wishlist
 */
const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => {
      // Invalidate rewards queries to update isInWishlist status
      queryClient.invalidateQueries({
        queryKey: REWARDS_QUERY_KEY.all
      });
    },
  });
};

/**
 * Remove reward from wishlist
 */
const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => {
      // Invalidate rewards queries to update isInWishlist status
      queryClient.invalidateQueries({
        queryKey: REWARDS_QUERY_KEY.all
      });
    },
  });
};

export {
  useCreateDefaultRewardCategories,
  useCreateRewardCategory,
  useDeleteRewardCategory,
  useUpdateRewardCategory,
  useCreateReward,
  useUpdateReward,
  useDeleteReward,
  useRedeemReward,
  useCancelRedemption,
  useFulfillRedemption,
  useRemoveFromWishlist,
  useAddToWishlist,
};
