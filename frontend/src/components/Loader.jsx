import React from 'react'

function Loader({ className = '' }) {
  return (
    <div className={`size-10 rounded-full border-4 border-l-transparent animate-spin-fast ${className} border-[--purple-9]`} />

  )
}

export default Loader