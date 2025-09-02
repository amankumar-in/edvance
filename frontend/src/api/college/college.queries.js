import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAllColleges, getCollegeById, getFeaturedColleges } from "./college.api";

// Query keys for colleges
export const COLLEGE_QUERY_KEYS = {
  all: ["colleges"],
  allColleges: (params) => ["colleges", "all", params],
  collegeById: (id) => ["colleges", id],
  featured: (params) => ["colleges", "featured", params],
};

// Hook to get all colleges with pagination and filters
export const useAllColleges = (params = {}, options = {}) => {
  return useQuery({
    queryKey: COLLEGE_QUERY_KEYS.allColleges(params),
    queryFn: () => getAllColleges(params),
    placeholderData: keepPreviousData,
    ...options
  });
};

// Hook to get college by ID
export const useGetCollegeById = (id, options = {}) => {
  return useQuery({
    queryKey: COLLEGE_QUERY_KEYS.collegeById(id),
    queryFn: () => getCollegeById(id),
    enabled: !!id,
    ...options
  });
};

// Hook to get featured colleges
export const useFeaturedColleges = (params = {}, options = {}) => {
  return useQuery({
    queryKey: COLLEGE_QUERY_KEYS.featured(params),
    queryFn: () => getFeaturedColleges(params),
    ...options
  });
};