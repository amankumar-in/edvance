import { Button, Text, TextField, Select, TextArea } from '@radix-ui/themes'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

// Mock user data - in a real app, this would come from authentication context or API
const mockUserData = {
  role: 'STUDENT',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com'
}

const profileFields = {
  STUDENT: [
    { label: "Date of Birth", name: "dateOfBirth", type: "date", required: true, placeholder: "Date of birth" },
    { label: "Phone Number", name: "phoneNumber", type: "tel", required: true, placeholder: "Phone number" },
    { label: "School/University", name: "institution", type: "text", required: true, placeholder: "School name" },
    { label: "Course/Major", name: "course", type: "text", required: true, placeholder: "Your major" },
    { label: "Year of Study", name: "yearOfStudy", type: "select", options: ["1", "2", "3", "4", "5+"], required: true, placeholder: "Select year" },
    { label: "Student ID", name: "studentId", type: "text", required: true, placeholder: "Student ID" },
    { label: "Bio", name: "bio", type: "textarea", required: false, placeholder: "Tell us about yourself" },
    { label: "Profile Picture", name: "profilePicture", type: "file", required: false, accept: "image/*" },
  ],
  PARENT: [
    { label: "Phone Number", name: "phoneNumber", type: "tel", required: true, placeholder: "Phone number" },
    { label: "Address", name: "address", type: "text", required: true, placeholder: "Address" },
    { label: "City", name: "city", type: "text", required: true, placeholder: "City" },
    { label: "State/Province", name: "state", type: "text", required: true, placeholder: "State" },
    { label: "Postal Code", name: "postalCode", type: "text", required: true, placeholder: "Postal code" },
    { label: "Country", name: "country", type: "text", required: true, placeholder: "Country" },
    { label: "Student Name", name: "studentName", type: "text", required: true, placeholder: "Student name" },
    { label: "Relationship to Student", name: "relationship", type: "select", options: ["Parent", "Guardian", "Other"], required: true, placeholder: "Select relationship" },
  ],
  SOCIAL_WORKER: [
    { label: "Phone Number", name: "phoneNumber", type: "tel", required: true, placeholder: "Phone number" },
    { label: "Organization", name: "organization", type: "text", required: true, placeholder: "Organization" },
    { label: "Job Title", name: "jobTitle", type: "text", required: true, placeholder: "Job title" },
    { label: "License Number", name: "licenseNumber", type: "text", required: true, placeholder: "License number" },
    { label: "Years of Experience", name: "yearsOfExperience", type: "number", required: true, placeholder: "Experience" },
    { label: "Areas of Expertise", name: "expertise", type: "text", required: false, placeholder: "Your expertise" },
    { label: "Professional ID", name: "professionalId", type: "file", required: true, accept: ".pdf,.jpg,.jpeg,.png" },
  ],
  TEACHER: [
    { label: "Phone Number", name: "phoneNumber", type: "tel", required: true, placeholder: "Phone number" },
    { label: "School/Institution", name: "institution", type: "text", required: true, placeholder: "School name" },
    { label: "Subject(s) Taught", name: "subjectsTaught", type: "text", required: true, placeholder: "Subjects" },
    { label: "Grade Level(s)", name: "gradeLevels", type: "text", required: true, placeholder: "Grade levels" },
    { label: "Years of Experience", name: "yearsOfExperience", type: "number", required: true, placeholder: "Experience" },
    { label: "Teacher ID", name: "teacherId", type: "text", required: true, placeholder: "Teacher ID" },
    { label: "Teaching Credential", name: "credential", type: "file", required: true, accept: ".pdf,.jpg,.jpeg,.png" },
  ],
  SCHOOL: [
    { label: "Phone Number", name: "phoneNumber", type: "tel", required: true, placeholder: "Phone number" },
    { label: "School Type", name: "schoolType", type: "select", options: ["Public", "Private", "Charter", "Technical/Vocational", "Other"], required: true, placeholder: "Select type" },
    { label: "Website", name: "website", type: "url", required: false, placeholder: "Website URL" },
    { label: "Address", name: "address", type: "text", required: true, placeholder: "Address" },
    { label: "City", name: "city", type: "text", required: true, placeholder: "City" },
    { label: "State/Province", name: "state", type: "text", required: true, placeholder: "State" },
    { label: "Postal Code", name: "postalCode", type: "text", required: true, placeholder: "Postal code" },
    { label: "Country", name: "country", type: "text", required: true, placeholder: "Country" },
    { label: "Administrator Name", name: "adminName", type: "text", required: true, placeholder: "Admin name" },
    { label: "Administrator Position", name: "adminPosition", type: "text", required: true, placeholder: "Admin position" },
    { label: "School Certificate", name: "certificate", type: "file", required: true, accept: ".pdf,.jpg,.jpeg,.png" },
  ],
  DONOR: [
    { label: "Phone Number", name: "phoneNumber", type: "tel", required: false, placeholder: "Phone number" },
    { label: "Donation Type", name: "donorType", type: "select", options: ["Individual", "Organization", "Corporate"], required: true, placeholder: "Select type" },
    { label: "Organization Name", name: "organizationName", type: "text", required: false, placeholder: "If applicable" },
    { label: "Preferred Contact Method", name: "contactPreference", type: "select", options: ["Email", "Phone", "Mail"], required: true, placeholder: "Contact method" },
    { label: "Address", name: "address", type: "text", required: false, placeholder: "Address" },
    { label: "City", name: "city", type: "text", required: false, placeholder: "City" },
    { label: "State/Province", name: "state", type: "text", required: false, placeholder: "State" },
    { label: "Postal Code", name: "postalCode", type: "text", required: false, placeholder: "Postal code" },
    { label: "Country", name: "country", type: "text", required: false, placeholder: "Country" },
    { label: "Display Donations Publicly", name: "displayDonations", type: "checkbox", required: false },
  ],
}

function CreateProfile() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [user, setUser] = useState(mockUserData)
  
  // In a real app, you would fetch the current user data
  useEffect(() => {
    // Example API call to get user data
    // const fetchUserData = async () => {
    //   const response = await fetch('/api/user/me')
    //   const userData = await response.json()
    //   setUser(userData)
    // }
    // fetchUserData()
  }, [])
  
  const fieldsForRole = profileFields[user.role] || []
  const donorType = watch('donorType')
  
  const onSubmit = async (data) => {
    console.log('Form submitted:', data)
    // Handle form submission (e.g., file uploads and API calls)
    try {
      // Example API call
      // await fetch('/api/user/profile', {
      //   method: 'POST',
      //   body: JSON.stringify(data),
      //   headers: { 'Content-Type': 'application/json' }
      // })
      
      // Redirect to dashboard or profile page
      navigate('/dashboard')
    } catch (error) {
      console.error('Error submitting profile:', error)
    }
  }

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto p-6 space-y-8 text-[--gray-1]">
      <div className="text-center">
        <Text as="p" size={'8'} weight={'bold'}>
          Complete Your Profile
        </Text>
        <Text as="p" size={'4'} mt={'4'} className="text-[--gray-6]">
          Tell us more about yourself so we can personalize your experience
        </Text>
      </div>

      <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-purple-600">
        <Text as="span" size={'6'} weight={'bold'} className="text-white">
          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
        </Text>
      </div>

      <div className="p-6 bg-white border border-gray-100 shadow-sm md:p-8 rounded-2xl">
        <div className="mb-6">
          <Text as="p" size={'5'} weight={'bold'}>
            {user.firstName} {user.lastName}
          </Text>
          <Text as="p" size={'2'} className="text-[--gray-6]">
            {user.email} • <span className="capitalize">{user.role.toLowerCase().replace('_', ' ')}</span>
          </Text>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fieldsForRole.map((field) => {
              // Skip conditional fields that shouldn't be shown
              if (field.name === 'organizationName' && donorType === 'Individual') {
                return null;
              }

              // For textarea and file inputs, use full width
              const isFullWidth = ['textarea', 'file'].includes(field.type);

              return (
                <div key={field.name} className={`space-y-1 ${isFullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
                  <label className="block mb-2 text-sm font-medium">
                    {field.label}
                    {field.required && <span className="ml-1 text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <Select.Root
                      {...register(field.name, { required: field.required && `${field.label} is required` })}
                      placeholder={field.placeholder}
                    >
                      <Select.Trigger className="w-full h-12" radius="large" />
                      <Select.Content>
                        {field.options.map(option => (
                          <Select.Item key={option} value={option}>
                            {option}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  ) : field.type === 'textarea' ? (
                    <TextArea
                      {...register(field.name, { required: field.required && `${field.label} is required` })}
                      placeholder={field.placeholder}
                      className="w-full"
                      size="3"
                      radius="large"
                      rows={5}
                    />
                  ) : field.type === 'file' ? (
                    <div className="w-full p-3 transition-colors border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100">
                      <input
                        type="file"
                        {...register(field.name, { required: field.required && `${field.label} is required` })}
                        accept={field.accept}
                        className="w-full"
                      />
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center mt-3">
                      <input
                        type="checkbox"
                        {...register(field.name)}
                        className="w-4 h-4 mr-2 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <Text size="2">{field.placeholder || field.label}</Text>
                    </div>
                  ) : (
                    <TextField.Root
                      {...register(field.name, { required: field.required && `${field.label} is required` })}
                      size={'3'}
                      radius='large'
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full"
                    />
                  )}

                  {errors[field.name] && (
                    <Text as="p" size={"1"} color="red" className="mt-1">
                      {errors[field.name].message}
                    </Text>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-6 text-center">
            <Button
              type="submit"
              radius="full"
              size={'4'}
              className="w-full max-w-sm bg-gradient-to-r from-purple-500 to-purple-700"
            >
              Complete Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProfile 