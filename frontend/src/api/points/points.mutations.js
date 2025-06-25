import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOrUpdateLevel, deleteLevel } from "./points.api";

// Add or update a level
export const useAddOrUpdateLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addOrUpdateLevel,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["points", "levels"] });
    },
  });
};

// Delete a level
export const useDeleteLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLevel,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["points", "levels"] });
    },
  });
}; 