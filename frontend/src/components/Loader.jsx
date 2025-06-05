import React from 'react'

function Loader({ className = 'size-9', borderWidth = 4, borderColor = 'var(--cyan-9)' }) {
  return (
    <div className={`rounded-full border-${borderWidth} border-l-transparent animate-spin-fast ${className}`} 
    style={{
      border: `${borderWidth}px solid ${borderColor}`, 
      borderLeftColor: 'transparent',
    }}
    />

  )
}

export default Loader