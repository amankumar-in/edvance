import React from 'react'
import { Route } from 'react-router'
import { CreateSocialWorkerProfile, SocialWorkerDashboard } from '../pages'

function SocialWorkerRoutes() {
  return (
    <Route>
      <Route path="dashboard" element={<SocialWorkerDashboard />} />
      <Route path="create-profile" element={<CreateSocialWorkerProfile />} />
    </Route>
  )
}

export default SocialWorkerRoutes
