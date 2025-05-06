import { Button, Callout, Text, TextField } from '@radix-ui/themes'
import { ArrowLeft, Info } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router'

function ForgotPassword() {
  return (
    <div className="relative z-10 w-full max-w-lg space-y-6 rounded-2xl text-[--gray-1]">
      <div className="text-center">
        <Text as="p" size={'8'} weight={'bold'}>
          Forgot Password
        </Text>
        <Text as="p" size={'4'} mt={'4'}>
          Enter your email to reset your password
        </Text>
      </div>
      <div className='p-6 space-y-6 rounded-xl bg-[--gray-a6]'>
        <div className='space-y-2'>
          <label>
            <Text as="div" size="2" mb="1" weight="medium">
              Email
            </Text>
            <TextField.Root
              radius="large"
              className='h-12'
              size={'3'}
              placeholder='Email'
            />
          </label>
          <Text as='p' size={'1'} className='text-[--gray-6]'>
            Enter the email address you used to register
          </Text>
        </div>
        <div className='text-center'>
          <Button
            radius='full'
            size={'4'}
            className="w-full max-w-sm"
          >
            Send Reset Instructions
          </Button>
        </div>
        <div className='text-center'>
          <Button
            radius='full'
            size={'4'}
            variant='ghost'
            asChild
          >
            <Link to={'/login'}>
              <ArrowLeft color='var(--gray-1)' size={'20'} />
              <Text as='span' weight={'medium'} className='text-[--gray-1]'>
                Back to login
              </Text>
            </Link>
          </Button>
        </div>
        <Callout.Root variant='soft' color='purple' className='text-[--gray-1] bg-[--gray-a8]'>
          <Callout.Icon >
            <Info size={'20'} color='var(--gray-1)' />
          </Callout.Icon>
          <Callout.Text>
            You will receive an email with a link to reset your password. The link will expire after 24 hours.
          </Callout.Text>
        </Callout.Root>
      </div>
    </div>

  )
}

export default ForgotPassword