import { Box } from '@radix-ui/themes'
import React from 'react'
import PageHeader from '../../../components/PageHeader'
import ProfileContent from '../components/profile/ProfileContent'

// Main User Profile Component
export default function UserProfile() {
  return (
    <Box className='space-y-6 max-w-4xl'>
      <UserProfileHeader />
      <ProfileContent />
    </Box>
  )
}

// User Profile Header Component
function UserProfileHeader() {
  return (
    <PageHeader
      title={"User Profile"}
      titleSize={"6"}
      description={"Manage your profile information and settings"}
      descriptionSize={"2"}
    />
  )
}