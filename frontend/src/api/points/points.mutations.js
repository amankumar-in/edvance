import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateConfigurationVersion, addOrUpdateLevel, deleteLevel, updateConfiguration } from "./points.api";

export const useUpdateConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateConfiguration,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["points", "configuration"] });
    },
  });
};

export const useActivateConfigurationVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateConfigurationVersion,
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["points", "levels"] }),
        queryClient.invalidateQueries({ queryKey: ["points", "configuration"] })
      ]);
    },
  });
};

export const useAddOrUpdateLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addOrUpdateLevel,
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["points", "levels"] }),
        queryClient.invalidateQueries({ queryKey: ["points", "configuration"] })
      ]);
    },
  });
};

export const useDeleteLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLevel,
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["points", "levels"] }),
        queryClient.invalidateQueries({ queryKey: ["points", "configuration"] })
      ]);
    },
  });
}; 