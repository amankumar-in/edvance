import { useQuery } from "@tanstack/react-query";
import { getBalance } from "./pointAccount.api";

export const useGetBalance = (studentId) => {
  return useQuery({ queryKey: ["balance", studentId], queryFn: () => getBalance(studentId) });
};
