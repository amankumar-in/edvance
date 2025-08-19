import { BookOpenCheck, GraduationCap, HandHelping, Landmark, UsersRound } from 'lucide-react';

export const roleFields = {
  STUDENT: {
    fields: [
      { label: "First Name", name: "firstName", type: "text", required: true, placeholder: "First name" },
      { label: "Last Name", name: "lastName", type: "text", required: true, placeholder: "Last name" },
      { label: "Email", name: "email", type: "email", required: true, placeholder: "Email" },
      { label: "Password", name: "password", type: "password", required: true, placeholder: "Password" },
      { label: "Confirm Password", name: "confirmPassword", type: "password", required: true, placeholder: "Confirm password" },
    ],
    icon: GraduationCap,
    gradient: ['#FF8DA1', '#FF6B85'],
  },
  PARENT: {
    fields: [
      { label: "First Name", name: "firstName", type: "text", required: true, placeholder: "First name" },
      { label: "Last Name", name: "lastName", type: "text", required: true, placeholder: "Last name" },
      { label: "Email", name: "email", type: "email", required: true, placeholder: "Email" },
      { label: "Password", name: "password", type: "password", required: true, placeholder: "Password" },
      { label: "Confirm Password", name: "confirmPassword", type: "password", required: true, placeholder: "Confirm password" },
    ],
    icon: UsersRound,
    gradient: ['#FFC2BA', '#FFAD9F'],
  },
  SOCIAL_WORKER: {
    fields: [
      { label: "First Name", name: "firstName", type: "text", required: true, placeholder: "First name" },
      { label: "Last Name", name: "lastName", type: "text", required: true, placeholder: "Last name" },
      { label: "Email", name: "email", type: "email", required: true, placeholder: "Email" },
      { label: "Password", name: "password", type: "password", required: true, placeholder: "Password" },
      { label: "Confirm Password", name: "confirmPassword", type: "password", required: true, placeholder: "Confirm password" },
    ],
    icon: HandHelping,
    gradient: ['#64B5F6', '#2196F3'],
  },
  TEACHER: {
    fields: [
      { label: "First Name", name: "firstName", type: "text", required: true, placeholder: "First name" },
      { label: "Last Name", name: "lastName", type: "text", required: true, placeholder: "Last name" },
      { label: "Email", name: "email", type: "email", required: true, placeholder: "Email" },
      { label: "Password", name: "password", type: "password", required: true, placeholder: "Password" },
      { label: "Confirm Password", name: "confirmPassword", type: "password", required: true, placeholder: "Confirm password" },
    ],
    icon: BookOpenCheck,
    gradient: ['#FF9CE9', '#FF7DE0'],
  },
  SCHOOL_ADMIN: {
    fields: [
      { label: "School Name", name: "schoolName", type: "text", required: true, placeholder: "School name" },
      { label: "School Email", name: "schoolEmail", type: "email", required: true, placeholder: "School email" },
      { label: "Password", name: "password", type: "password", required: true, placeholder: "Password" },
      { label: "Confirm Password", name: "confirmPassword", type: "password", required: true, placeholder: "Confirm password" },
    ],
    icon: Landmark,
    gradient: ['#AD56C4', '#9548A8'],
  },
}