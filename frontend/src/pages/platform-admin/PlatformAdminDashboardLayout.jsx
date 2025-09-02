import { Flex } from '@radix-ui/themes'
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
      defaultTheme='light'
    >
      <div className="min-h-screen  bg-[--gray-background]">
        <Flex className=''>
          <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <Flex direction='column' className='flex-1' style={{ minWidth: 0 }}>
            <Header toggleSidebar={toggleSidebar} />
            <div className="container flex-1 pt-4 pb-12 md:pt-8" >
              <Outlet />
            </div>
          </Flex>
        </Flex>

      </div>
    </ThemeProvider>
  )
}

export default PlatformAdminDashboardLayout
