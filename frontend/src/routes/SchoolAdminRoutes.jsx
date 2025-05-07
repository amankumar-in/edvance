import React from 'react'
import { Route, Routes } from 'react-router'
import { SchoolAdminDashboard } from '../pages'

function SchoolAdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<SchoolAdminDashboard />} />
    </Routes>
  )
}

export default SchoolAdminRoutes
