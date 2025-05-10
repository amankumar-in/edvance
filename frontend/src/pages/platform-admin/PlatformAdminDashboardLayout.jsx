import React, { useState } from 'react'
import { Flex } from '@radix-ui/themes'
import { Outlet } from 'react-router'
import Header from '../../components/platform-admin/Header'
import SideBar from '../../components/platform-admin/SideBar'
import { Container } from '../../components'

function PlatformAdminDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleSidebar={toggleSidebar} />
      
      <Flex className="flex-1">
        <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        <div className="flex-1">
          <Container>
            <Outlet />
          </Container>
        </div>
      </Flex>
    </div>
  )
}

export default PlatformAdminDashboardLayout
