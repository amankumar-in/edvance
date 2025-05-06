import { Button, Callout, Text, TextField } from "@radix-ui/themes";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router";

export default function ResetPassword() {
  return (
    <div className="relative z-10 w-full max-w-lg space-y-6 rounded-2xl text-[--gray-1]">
      <div className="text-center">
        <Text as="p" size={'8'} weight={'bold'}>
          Reset Password
        </Text>
        <Text as="p" size={'4'} mt={'4'}>
          Create a new password for your account
        </Text>
      </div>
      <div className='p-6 space-y-6 rounded-xl bg-[--gray-a6]'>
        <div className="space-y-4">
          <div className='space-y-2'>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                New Password
              </Text>
              <TextField.Root
                radius="large"
                className='h-12'
                size={'3'}
                placeholder="New Password"
              />
            </label>
            <Text as='p' size={'1'} className='text-[--gray-6]'>
              Must be at least 8 characters
            </Text>
          </div>
          <div>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                Confirm Password
              </Text>
              <TextField.Root
                radius="large"
                className='h-12'
                size={'3'}
                placeholder="Confirm Password"
              />
            </label>
          </div>
        </div>
        <div className='text-center'>
          <Button
            radius='full'
            size={'4'}
            className="w-full max-w-sm"
          >
            Reset Password
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
            <Shield size={'20'} color='var(--gray-1)' />
          </Callout.Icon>
          <Callout.Text>
            For better security, create a strong password with a mix of letters, numbers, and special characters.
          </Callout.Text>
        </Callout.Root>
      </div>
    </div>
  );
}
