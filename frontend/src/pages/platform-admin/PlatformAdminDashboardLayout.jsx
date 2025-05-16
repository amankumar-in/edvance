import React, { useState } from 'react'
import { Flex, Theme } from '@radix-ui/themes'
import { Outlet } from 'react-router'
import { Header, SideBar } from '../../components/platform-admin'
import { Container } from '../../components'
import { ThemeProvider } from 'next-themes'

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
      <Theme accentColor="blue" grayColor="slate">
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
      </Theme>
    </ThemeProvider>
  )
}

export default PlatformAdminDashboardLayout
