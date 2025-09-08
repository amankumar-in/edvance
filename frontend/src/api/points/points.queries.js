import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { 
  getAllLevels, 
  getPointsDetailsById, 
  getStudentTransactions, 
  getStudentTransactionSummary, 
  getActiveConfiguration, 
  getConfigurationHistory, 
  getConfigurationVersion 
} from './points.api'

const usePointsDetailsById = (studentId) => {
  return useQuery({
    queryKey: ['points', studentId],
    queryFn: () => getPointsDetailsById(studentId),
    enabled: !!studentId
  });
}

const useGetAllLevels = () => {
  return useQuery({
    queryKey: ['points', 'levels'],
    queryFn: getAllLevels
  });
}

const useGetStudentTransaction = (studentId, params = {}) => {
  return useInfiniteQuery({
    queryKey: ['points', 'transactions', studentId, params],
    queryFn: ({ pageParam = 1 }) => getStudentTransactions({ studentId, params: { ...params, page: pageParam } }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.data?.pagination?.page;
      const totalPages = lastPage?.data?.pagination?.pages;

      if (currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    placeholderData: keepPreviousData,
    keepPreviousData: true, 
    enabled: !!studentId
  })
}

const useGetStudentTransactionSummary = (studentId) => {
  return useQuery({
    queryKey: ['points', 'transactions', 'summary', studentId],
    queryFn: () => getStudentTransactionSummary(studentId),
    enabled: !!studentId
  })
}

const useGetActiveConfiguration = () => {
  return useQuery({
    queryKey: ['points', 'configuration', 'active'],
    queryFn: getActiveConfiguration
  });
}

const useGetConfigurationHistory = () => {
  return useQuery({
    queryKey: ['points', 'configuration', 'history'],
    queryFn: getConfigurationHistory
  });
}

const useGetConfigurationVersion = (version) => {
  return useQuery({
    queryKey: ['points', 'configuration', 'version', version],
    queryFn: () => getConfigurationVersion(version),
    enabled: !!version
  });
}

export {
  usePointsDetailsById,
  useGetAllLevels,
  useGetStudentTransaction,
  useGetStudentTransactionSummary,
  useGetActiveConfiguration,
  useGetConfigurationHistory,
  useGetConfigurationVersion
}