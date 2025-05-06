import React from 'react';
import { Button } from '@radix-ui/themes';
import clsx from 'clsx'; // Optional: for cleaner className merging

function MyButton({
  children,
  size = '4',
  radius = 'full',
  className = '',
  ...rest
}) {
  return (
    <Button
      size={size}
      radius={radius}
      className={clsx(
        'w-full max-w-sm disabled:bg-[--gray-8] disabled:text-[--accent-8]',
        className
      )}
      {...rest}
    >
      {children}
    </Button>
  );
}

export default MyButton;
