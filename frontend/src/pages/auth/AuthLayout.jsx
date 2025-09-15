import React from 'react'
import { Outlet } from 'react-router'

function AuthLayout({ children }) {
  return (
    <div className="flex overflow-hidden relative justify-center items-center px-4 py-8 min-h-screen bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90 -z-20">
      {/* Decorative circles */}
      <div className="fixed w-[600px] h-[600px] bg-[--brand-purple-light] rounded-full  opacity-10 -top-0 -translate-y-1/2 md:-translate-y-1/4 right-0 translate-x-1/4 -z-10 blur-sm"></div>
      <div className="fixed w-[500px] h-[500px] bg-[--brand-purple-light] rounded-full  opacity-10 -bottom-0 translate-y-1/2 md:translate-y-1/4 left-0 -translate-x-1/4 -z-10 blur-sm"></div>
      <div className="hidden md:block fixed top-1/3 -translate-x-56 left-3/4 w-[300px] h-[300px] bg-[--brand-purple-light] opacity-10 translate-y-12 rounded-full  -z-10 blur-sm" />
      <div className='flex z-50 flex-1 justify-center items-center w-full'>
        {children || <Outlet />}
      </div>
    </div>
  )
}

export default AuthLayout