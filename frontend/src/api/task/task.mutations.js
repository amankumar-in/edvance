import { useMutation } from "@tanstack/react-query";
import { createTask } from "./task.api";

export const useCreateTask = () => {
    return useMutation({
        mutationFn: createTask,
    });
}
