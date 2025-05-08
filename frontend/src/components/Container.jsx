import React from 'react'

function Container({children}) {
  return (
    <div className='w-full min-h-[calc(100vh-64px)] py-8 px-4 mx-auto max-w-screen-[1440px] md:px-6 lg:px-8 xl:px-12'>
      {children}
    </div>
  )
}{}

export default Container
