import { Text } from '@radix-ui/themes';
import { CircleAlert } from 'lucide-react';

export const FormFieldErrorMessage = ({ errors, field, size = "1", iconSize = 12 }) => {
  // This function is used to get the error message for a nested field
  const getNestedError = (errors, fieldPath) => {
    const keys = fieldPath.split('.');
    let current = errors;
    
    for (const key of keys) {
      if (current && current[key]) {
        current = current[key];
      } else {
        return null;
      }
    }
    
    return current;
  };

  const error = getNestedError(errors, field);
  
  if (!error || !error.message) return null;
  
  return (
    <Text
      as="p"
      size={size}
      color="red"
      className='flex gap-1 items-center mt-1'
    >
      <CircleAlert size={iconSize} /> {error.message}
    </Text>
  )
}
