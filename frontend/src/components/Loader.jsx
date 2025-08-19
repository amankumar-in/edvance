// Loader.jsx
import React from 'react';

const Loader = ({
  size = 36,
  color = 'var(--cyan-9)',
  className = ''
}) => {
  return (
    <div
      className={`android-loader ${className}`}
      style={{
        width: size,
        height: size,
        '--loader-color': color
      }}
    >
      <svg viewBox="22 22 44 44" className="w-full h-full">
        <circle
          cx="44"
          cy="44"
          r="20"            // 20.0 keeps the circle inside the box
          fill="none"
          stroke="var(--loader-color)"
          strokeWidth="4"   // new thickness
          className="android-loader-path"
        />
      </svg>

    </div>
  );
};

export default Loader;
