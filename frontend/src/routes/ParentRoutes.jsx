import React from 'react'
import { Route, Routes } from 'react-router'
import { CreateParentProfile, ParentDashboard } from '../pages'

function ParentRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<ParentDashboard />} />
      <Route path="create-profile" element={<CreateParentProfile />} />
    </Routes>
  )
}

export default ParentRoutes
