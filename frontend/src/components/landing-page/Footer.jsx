import { Text } from '@radix-ui/themes';
import { Globe, Heart, Monitor, Moon, Sparkles, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link } from 'react-router';

const Footer = () => {
  const { theme, setTheme } = useTheme();

  return (
    <footer className="py-12 text-white bg-gray-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to='/' className="flex items-center group">
              <div className="relative">
                <img src="/images/RFE-logo-black-by-cfc.svg" alt="RFE Logo" className="w-auto h-10 filter invert transition-transform duration-300" />
                <div className="absolute -inset-2 bg-gradient-to-r rounded-lg opacity-0 blur-sm transition-opacity duration-300 from-blue-500/20 to-purple-500/20 group-hover:opacity-100"></div>
              </div>
            </Link>
            <Text as='p' className='leading-relaxed text-gray-400'>
              Revolutionizing education through innovative reward systems,
              creating a brighter future for students worldwide.
            </Text>
            <div className="flex space-x-4">
              <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-transform cursor-pointer hover:scale-110">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-transform cursor-pointer hover:scale-110">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-transform cursor-pointer hover:scale-110">
                <Sparkles className="w-4 h-4 text-white" />
              </div>

              <div className='flex border border-[--gray-9] rounded-full items-center w-max p-1'>
                <button
                  title='Light'
                  onClick={() => setTheme('light')}
                  className={`${theme === "light" && "bg-[--gray-a3]"} text-white rounded-full p-1`}
                >
                  <Sun size={18} />
                </button>
                <button
                  title='Dark'
                  onClick={() => setTheme('dark')}
                  className={`${theme === "dark" && "bg-[--gray-a3]"} text-white rounded-full p-1`}
                >
                  <Moon size={18} />
                </button>
                <button
                  title='System'
                  onClick={() => setTheme('system')}
                  className={`${theme === "system" && "bg-[--gray-a3]"} text-white rounded-full p-1`}
                >
                  <Monitor size={18} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Partners</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Coins For College</li>
              <li>SIAS International</li>
              <li>TUIT</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="transition-colors hover:text-white">Data Protection</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Terms Of Use</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Support</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Get In Touch</h3>
            <p className="text-gray-400">
              info@rewardsforeducation.com
            </p>
          </div>
        </div>

        <div className="pt-8 mt-8 text-center text-gray-400 border-t border-gray-800">
          <p>&copy; 2025 All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer