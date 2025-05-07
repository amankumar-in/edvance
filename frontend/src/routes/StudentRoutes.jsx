import React from 'react'
import { Route, Routes } from 'react-router'
import { CreateStudentProfile, StudentDashboard } from '../pages'

function StudentRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="create-profile" element={<CreateStudentProfile />} />
    </Routes>
  )
}

export default StudentRoutes
