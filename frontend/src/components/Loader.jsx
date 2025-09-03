const Loader = ({ size = 40, color = 'var(--cyan-9)', duration = 1.4, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', className = '' }) => {
  return (
    <div
      className={`android-loader ${className}`}
      style={{
        width: size,
        height: size,
        '--loader-color': color,
        '--duration': `${duration}s`,
        '--easing': easing
      }}
    >
      <svg viewBox="0 0 50 50" className="w-full h-full">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="var(--loader-color)"
          strokeWidth="4"
          className="android-loader-path"
          strokeLinecap="round"
          strokeLinejoin="round" 
        />
      </svg>
    </div>
  );
};

export default Loader;