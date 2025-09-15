import { Flex } from "@radix-ui/themes";
import { BRAND_COLOR } from "../utils/constants";

const Loader = ({ size = 40, color = `var(--${BRAND_COLOR}-9)`, duration = 1.4, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', className = '', center = false }) => {
  const useColorAnimation = !color || color.startsWith('var(--'); // If no color or CSS variable, use animation

  const loaderClass = `android-loader ${useColorAnimation ? '' : 'static-color'} ${className}`;

  const LoaderComponent = (
    <div
      className={loaderClass}
      style={{
        width: size,
        height: size,
        '--loader-color': color || '#504eec',
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
        />
      </svg>
    </div>
  );

  if (center) {
    return (
      <Flex justify="center" align="center">
        {LoaderComponent}
      </Flex>
    );
  }

  return LoaderComponent;
};

export default Loader;