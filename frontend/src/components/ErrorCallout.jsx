import { Callout } from '@radix-ui/themes'
import { AlertCircle } from 'lucide-react'
import React from 'react'

function ErrorCallout({ errorMessage, className }) {
  return (
    <Callout.Root color="red" className={className} variant='surface'>
      <Callout.Icon>
        <AlertCircle size={16} />
      </Callout.Icon>
      <Callout.Text>
        {errorMessage}
      </Callout.Text>
    </Callout.Root>
  )
}

export default ErrorCallout
