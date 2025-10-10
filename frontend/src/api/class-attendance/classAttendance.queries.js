import { getClassAttendanceInfo, getDayAttendance, getMonthAttendance, getStudentClassAttendanceInfo, getWeekAttendance } from "./classAttendance.api"
import { keepPreviousData, useQuery } from '@tanstack/react-query'

const useGetStudentClassAttendanceInfo = ({classId, studentId, options = {}}) => {
  return useQuery({
    queryKey: ['class-attendance', 'student', classId, studentId],
    queryFn: () => getStudentClassAttendanceInfo({classId, studentId}),
    enabled: !!classId && !!studentId,
    ...options
  })
}

const useGetClassAttendanceInfo = ({classId, date, enabled = false, options = {}}) => {
  return useQuery({
    queryKey: ['class-attendance', 'info', classId, date],
    queryFn: () => getClassAttendanceInfo({classId}),
    enabled: enabled,
    ...options
  })
}

const useGetMonthAttendance = (classId, month, year, enabled = true) => {
  return useQuery({
    queryKey: ['class-attendance', 'month', classId, month, year],
    queryFn: () => getMonthAttendance(classId, month, year),
    placeholderData: keepPreviousData,
    enabled: enabled
  })
}

const useGetDayAttendance = (classId, date, enabled = true) => {
  return useQuery({
    queryKey: ['class-attendance', 'day', classId, date],
    queryFn: () => getDayAttendance(classId, date),
    placeholderData: keepPreviousData,
    enabled: enabled
  })
}

const useGetWeekAttendance = (classId, startDate, enabled = true) => {
  return useQuery({
    queryKey: ['class-attendance', 'week', classId, startDate],
    queryFn: () => getWeekAttendance(classId, startDate),
    placeholderData: keepPreviousData,
    enabled: enabled
  })
}

export {
  useGetClassAttendanceInfo,
  useGetMonthAttendance,
  useGetDayAttendance,
  useGetWeekAttendance,
  useGetStudentClassAttendanceInfo,
}