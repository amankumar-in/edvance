/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      container: {
        center: true, // adds mx-auto by default, 
        padding: {
          DEFAULT: '1rem', // px-4 on mobile
          md: '1.5rem',    // md:px-6
          lg: '2rem',      // lg:px-8
          xl: '3rem',      // xl:px-12
        },
        screens: {
          sm: '100%',  
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        }
      },
      animation: {
        'spin-fast': 'spin 0.6s linear infinite',
        bounceCheck: 'bounceCheck 0.6s ease-out',
      },
      keyframes: {
        'spin-fast': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        bounceCheck: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      screens: {
        'xs': "520px"
      }
    },
  },
  plugins: [require('tailwind-scrollbar')],
}