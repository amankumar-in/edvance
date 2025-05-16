import { useQuery } from "@tanstack/react-query";
import { getSocialWorkerProfileById } from "./socialWorker.api";

export const useGetSocialWorkerProfileById = (id, fetchNow = true) => {
  return useQuery({
    queryKey: ["socialWorkers", id],
    queryFn: () => getSocialWorkerProfileById(id),
    enabled: !!id && fetchNow,
  });
};
