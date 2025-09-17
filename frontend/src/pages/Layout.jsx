import React from 'react'
import { Outlet } from 'react-router'
import Footer from '../components/landing-page/Footer'
import Header from '../components/landing-page/Header'

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}

export default Layout