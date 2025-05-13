import React from 'react'

function Loader({ className = '', borderWidth = 4, borderColor = 'var(--purple-9)' }) {
  return (
    <div className={`size-10 rounded-full border-${borderWidth} border-l-transparent animate-spin-fast ${className}`} 
    style={{
      border: `${borderWidth}px solid ${borderColor}`, 
      borderLeftColor: 'transparent',
    }}
    />

  )
}

export default Loader