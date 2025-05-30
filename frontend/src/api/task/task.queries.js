import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTask, getTasks } from "./task.api";

export const useGetTask = (id, options = {}) => {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => getTask(id),
    ...options,
  });
};

export const useGetTasks = (params = {}) => {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => getTasks(params),
    placeholderData: keepPreviousData
  });
};
