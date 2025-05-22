import { useMutation } from "@tanstack/react-query";
import { createStudentProfile, updateStudentProfile, linkWithParent, unlinkFromParent, requestParentLink, requestSchoolLink, linkWithSchool, unlinkFromSchool, cancelLinkRequest } from "./student.api";

export const useCreateStudentProfile = () => {
  return useMutation({
    mutationFn: createStudentProfile,
  });
};

export const useUpdateStudentProfile = () => {
  return useMutation({
    mutationFn: updateStudentProfile,
  });
};

export const useLinkWithParent = () => {
  return useMutation({
    mutationFn: linkWithParent,
  });
};

export const useUnlinkFromParent = () => {
  return useMutation({
    mutationFn: unlinkFromParent,
  });
};

export const useRequestParentLink = () => {
  return useMutation({
    mutationFn: requestParentLink,
  });
};

export const useRequestSchoolLink = () => {
  return useMutation({
    mutationFn: requestSchoolLink,
  });
};

export const useLinkWithSchool = () => {
  return useMutation({
    mutationFn: linkWithSchool,
  });
};

export const useUnlinkFromSchool = () => {
  return useMutation({
    mutationFn: unlinkFromSchool,
  });
};

export const useCancelLinkRequest = () => {
  return useMutation({
    mutationFn: cancelLinkRequest,
  });
};
