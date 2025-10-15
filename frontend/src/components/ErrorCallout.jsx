import { Button, Callout } from '@radix-ui/themes'
import { AlertCircle, RefreshCw } from 'lucide-react'
import React from 'react'

function ErrorCallout({ errorMessage, className, onRetry = false, isRetrying = false }) {
  return (
    <Callout.Root color="red" className={className} variant='surface'>
      <Callout.Icon>
        <AlertCircle size={18} />
      </Callout.Icon>
      <Callout.Text>
        {errorMessage}
      </Callout.Text>
      {onRetry && (
        <Button
          className='w-max font-medium'
          onClick={onRetry}
          radius='full'
          disabled={isRetrying}
        >
          <RefreshCw size={16} className={`${isRetrying ? 'animate-spin' : ''}`} /> {isRetrying ? 'Retrying...' : 'Try Again'}
        </Button>
      )}
    </Callout.Root>
  )
}

export default ErrorCallout
