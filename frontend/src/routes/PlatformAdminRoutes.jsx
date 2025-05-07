import React from 'react'
import { Route, Routes } from 'react-router'
import { PlatformAdminDashboard } from '../pages'

function PlatformAdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<PlatformAdminDashboard />} />
    </Routes>
  )
}

export default PlatformAdminRoutes
