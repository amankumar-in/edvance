import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAllPendingJoinRequests, getSchoolById, getSchoolProfile, getStudents, getTeachers, getClasses, getAdministrators, getAllSchools } from "./school.api";

// Query keys for school admin
export const SCHOOL_QUERY_KEYS = {
  all: ["schools"],
  allSchools: (params) => ["schools", "all", params],
  allAdministrators:  ["schools", "administrators"],
  allClasses: ["schools", "classes"],
  allClassesFiltered: (params) => ["schools", "classes", params],
  administrators: (id, params) => ["schools", "administrators", id, params],
  schoolById: (id) => ["schools", id],
  profile: () => ["schools", "profile"],
  joinRequests: () => ["schools", "join-requests"]
};

// Hook to get school by id
export const useGetSchoolById = (id, fetchNow = false) => {
  return useQuery({
    queryKey: SCHOOL_QUERY_KEYS.schoolById(id),
    queryFn: () => getSchoolById(id),
    enabled: !!id && fetchNow,
  });
};

// Hook to get school profile
export const useGetSchoolProfile = (options = {}) => {
  return useQuery({
    queryKey: SCHOOL_QUERY_KEYS.profile(),
    queryFn: getSchoolProfile,
    ...options
  });
};

// Hook to get all pending join requests
export const useGetAllPendingJoinRequests = (options = {}) => {
  return useQuery({
    queryKey: SCHOOL_QUERY_KEYS.joinRequests(),
    queryFn: getAllPendingJoinRequests,
    ...options
  });
};

export const useSchoolProfile = ( options = {} ) => {
  return useQuery({
    queryKey: ['school-profile'],
    queryFn: getSchoolProfile,
    ...options
  });
};

export const useAllPendingJoinRequests = () => {
  return useQuery({
    queryKey: ['pending-join-requests'],
    queryFn: getAllPendingJoinRequests,
  });
};

export const useStudents = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['school-students', params],
    queryFn: () => getStudents(params),
    placeholderData: keepPreviousData,
    ...options
  });
};

export const useTeachers = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['school-teachers', params],
    queryFn: () => getTeachers(params),
    placeholderData: keepPreviousData,
    ...options
  });
};

export const useClasses = (params = {}, options = {}) => {
  return useQuery({
    queryKey: SCHOOL_QUERY_KEYS.allClassesFiltered(params),
    queryFn: () => getClasses(params),
    placeholderData: keepPreviousData,
    ...options
  });
};

export const useAdministrators = (id, params = {}, options = {}) => {
  return useQuery({
    queryKey: SCHOOL_QUERY_KEYS.administrators(id, params),
    queryFn: () => getAdministrators(id, params),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
};

export const useAllSchools = (params = {}, options = {}) => {
  return useQuery({
    queryKey: SCHOOL_QUERY_KEYS.allSchools(params),
    queryFn: () => getAllSchools(params),
    placeholderData: keepPreviousData,
    ...options
  });
};
