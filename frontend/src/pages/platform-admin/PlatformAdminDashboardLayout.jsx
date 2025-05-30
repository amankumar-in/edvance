import { Flex, Theme } from '@radix-ui/themes'
import { ThemeProvider } from 'next-themes'
import React, { useState } from 'react'
import { Outlet } from 'react-router'
import { Header, SideBar } from '../../components/platform-admin'

function PlatformAdminDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  return (
    <ThemeProvider
      attribute={'class'}
      disableTransitionOnChange
      defaultTheme='dark'
    >
      <Theme accentColor="blue" grayColor="slate">
        <div className="flex flex-col min-h-screen">
          <Header toggleSidebar={toggleSidebar} />

          <Flex className="flex-1">
            <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex-1" style={{ minWidth: 0 }}>
              <Outlet />
            </div>
          </Flex>
        </div>
      </Theme>
    </ThemeProvider>
  )
}

export default PlatformAdminDashboardLayout
