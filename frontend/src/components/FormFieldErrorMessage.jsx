import { Text } from '@radix-ui/themes'
import { Info } from 'lucide-react'

export const FormFieldErrorMessage = ({ errors, field }) => {
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
      size={"2"}
      color="red"
      className='flex gap-1 items-center mt-1'
    >
      <Info size={14} /> {error.message}
    </Text>
  )
}
