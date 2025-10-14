import { IconButton } from '@radix-ui/themes'
import { Download, Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { cn } from '../../utils/helperFunctions'

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants = {
    primary: 'bg-gradient-to-r from-[--blue-9] to-[--purple-9] text-white hover:from-[--blue-10] hover:to-[--purple-10] focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border-2 border-[--accent-11] text-[--accent-11] hover:bg-[--accent-a3] focus:ring-[--focus-9] focus:outline-none'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

const Header = ({ currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const navItems = [
    { id: '/', label: 'Home' },
    { id: '/rfe/students', label: 'For Students' },
    { id: '/rfe/parents', label: 'For Parents' },
    { id: '/rfe/schools', label: 'For Schools' },
    { id: '/rfe/sponsors', label: 'For Sponsors' }
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-[--gray-6] backdrop-blur-md bg-[--admin-navbar]">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link className="flex items-center space-x-3 cursor-pointer group" to='/' viewTransition>
            <div className="relative">
              <img src="/images/RFE-logo-black-by-cfc.svg" alt="RFE Logo" className={cn(
                "w-auto h-10 transition-transform duration-300",
                resolvedTheme === 'dark' && 'invert'
              )} />
              <div className="absolute -inset-2 bg-gradient-to-r rounded-lg opacity-0 blur-sm transition-opacity duration-300 from-blue-500/20 to-purple-500/20 group-hover:opacity-100"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.id} to={item.id}
                className={({ isActive }) => cn(
                  'transition-colors',
                  isActive ? 'text-[--accent-11] font-medium' : 'text-[--gray-11] hover:text-[--accent-11]'
                )}
                viewTransition
              >
                {item.label}
              </NavLink>
            ))}
            <Button size="sm">
              <Download className="mr-2 w-4 h-4" />
              Download App
            </Button>
            <Link to='/login' viewTransition>
              <Button tabIndex={-1} size='sm' className='w-fit' variant='outline'>
                Login
              </Button>
            </Link>
            <IconButton variant='ghost' color='gray' size={'3'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </IconButton>
          </nav>

          {/* Mobile menu button */}
          <IconButton
            size={'3'}
            variant='soft'
            onClick={toggleMenu}
            className="ml-auto lg:hidden"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </IconButton>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="py-4 border-t border-[--gray-6] lg:hidden">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    setIsMenuOpen(false)
                  }}
                  className={cn(
                    'text-left transition-colors',
                    currentPage === item.id
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-700 hover:text-blue-600'
                  )}
                >
                  {item.label}
                </button>
              ))}
              <Button size="sm" className="w-fit">
                <Download className="mr-2 w-4 h-4" />
                Download App
              </Button>
            </div>
          </div>
        )}
      </div>
    </header >
  )
}

export default Header