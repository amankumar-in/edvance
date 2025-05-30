import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, toggleTaskVisibility } from "./task.api";

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
}

export const useToggleTaskVisibility = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toggleTaskVisibility,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
}
