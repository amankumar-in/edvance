import React from 'react'
import { Route, Routes } from 'react-router'
import { CreateTeacherProfile, TeacherDashboard } from '../pages'

function TeacherRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<TeacherDashboard />} />
      <Route path="create-profile" element={<CreateTeacherProfile />} />
    </Routes>
  )
}

export default TeacherRoutes
