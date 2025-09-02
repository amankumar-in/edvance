import { Card, Flex, Separator, Text } from "@radix-ui/themes"

// This component is used to create a section in the form
const FormSection = ({ title, children }) => {
  return (
    <Card className='[--card-border-width:0px] shadow' size='3'>
      <Flex direction={'column'} gap={'3'} mb={'4'}>
        <Text as="p" size={'4'} weight="bold">
          {title}
        </Text>
        <Separator size={'4'} />
      </Flex>
      <div className='space-y-4'>
        {children}
      </div>
    </Card>
  )
}

export default FormSection