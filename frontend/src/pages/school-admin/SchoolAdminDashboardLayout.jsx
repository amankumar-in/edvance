import { Flex } from '@radix-ui/themes'
import { ThemeProvider } from 'next-themes'
import React, { useState } from 'react'
import { Outlet } from 'react-router'
import { Container } from '../../components'
import { Header, SideBar } from '../../components/school-admin'

function SchoolAdminDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768)

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  return (
    <ThemeProvider
      attribute={'class'}
      disableTransitionOnChange
      defaultTheme='light'
    >
      <div className="flex flex-col min-h-screen bg-[--gray-2]">

        <Flex className="flex-1">
          <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

          <div
            className={`flex-1 bg-[--color-surface] overflow-hidden transition-all duration-300 ease-in-out md:rounded-2xl md:shadow-md md:m-3 ${isSidebarOpen && 'md:ml-[290px]'}`}
            style={{ minWidth: 0 }}
          >
            <Header toggleSidebar={toggleSidebar} />
            <Container>
              <Outlet />
            </Container>
          </div>
        </Flex>
      </div>
    </ThemeProvider>
  )
}

export default SchoolAdminDashboardLayout 