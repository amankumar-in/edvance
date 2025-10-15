import React from 'react'
import { APP_NAME, YEAR } from '../../../utils/constants'
import { Link as RadixLink, Text } from '@radix-ui/themes'
import { Copyright } from 'lucide-react'
import { Link } from 'react-router'

function Footer() {
  return (
    <div className='px-4 md:px-6 py-4 border-t border-[--gray-6] flex justify-between items-center'>
      <Text as='p' color='gray' size='1' className='flex items-center gap-1'>
        <Copyright size={12} /> {YEAR} {APP_NAME}
      </Text>
      <Text size={'1'} as='div' className='flex flex-wrap gap-2 items-center' color='gray'>
        <RadixLink asChild color='blue'>
          <Link to={'#terms'}>
            Terms
          </Link>
        </RadixLink>
        <RadixLink asChild color='blue'>
          <Link to={'#privacy'}>
            Privacy
          </Link>
        </RadixLink>
        <RadixLink asChild color='blue'>
          <Link to={'#contact'}>
            Contact Us
          </Link>
        </RadixLink>
      </Text>
    </div>
  )
}

export default Footer