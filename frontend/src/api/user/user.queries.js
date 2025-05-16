import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getUsersByRole, getTotalUserCount, getUserById } from "./user.api";

export const useUsersByRole = ({
  role,
  page = 1,
  limit = 10,
  sort = "firstName",
  order = "asc",
  options = {}
} = {}) => {

  return useQuery({
    queryKey: ["users", { role, page, limit, sort, order }],
    queryFn: () => getUsersByRole({ role, page, limit, sort, order }),
    placeholderData: keepPreviousData,
    enabled: !!role,
    ...options
  });
};

export const useTotalUserCount = () => {
  return useQuery({
    queryKey: ["users", "count"],
    queryFn: getTotalUserCount
  });
}; 

export const useUserById = (id) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getUserById(id)
  })
}