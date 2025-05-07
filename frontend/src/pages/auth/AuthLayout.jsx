import React from 'react'
import { Outlet } from 'react-router'

function AuthLayout({ children }) {
  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden bg-gradient-to-br from-[#7B3F98] via-[#4A275B] to-[#2B1C4A] py-8 -z-20">
      {/* Decorative circles */}
      <div className="fixed w-[600px] h-[600px] bg-purple-400 rounded-full  opacity-30 -top-0 -translate-y-1/2 md:-translate-y-1/4 right-0 translate-x-1/4 -z-10"></div>
      <div className="fixed w-[500px] h-[500px] bg-purple-400 rounded-full  opacity-30 -bottom-0 translate-y-1/2 md:translate-y-1/4 left-0 -translate-x-1/4 -z-10"></div>
      <div className="hidden md:block fixed top-1/3 -translate-x-56 left-3/4 w-[300px] h-[300px] bg-purple-400 opacity-20 translate-y-12 rounded-full  -z-10" />
      <div className='z-50 flex items-center justify-center flex-1 w-full'>
        {children || <Outlet />}
      </div>
    </div>
  )
}

export default AuthLayout