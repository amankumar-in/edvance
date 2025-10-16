import { useQuery } from "@tanstack/react-query"
import { getDashboardOverview, getSystemHealth } from "./analytics.api"

const useGetDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: getDashboardOverview
  })
}

const useGetSystemHealth = () => {
  return useQuery({
    queryKey: ['systemHealth'],
    queryFn: getSystemHealth
  })
}

export {
  useGetDashboardOverview,
  useGetSystemHealth
}