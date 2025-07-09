import { Flex, Heading, IconButton, Text, Tooltip } from '@radix-ui/themes'
import { ChevronLeft } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router'

function PageHeader({ title, description, className, children, actions, backButton = false, backLink = -1 }) {
  return (
    <div className={className}>

      <Flex align="center" justify="between" gap="3" wrap="wrap">
        <Flex align={description ? 'start' : 'center'} gap="4">
          {backButton && (
            <Tooltip content="Go back">
              <IconButton
                variant="surface"
                color="gray"
                highContrast
                asChild
              >
                <Link to={backLink}>
                  <ChevronLeft size={16} />
                </Link>
              </IconButton>
            </Tooltip>
          )}
          <div>
            <Heading size="6" weight="bold">
              {title}
            </Heading>
            {description && <Text as='p' size="2" color="gray" mt='1'>
              {description}
            </Text>}
          </div>
        </Flex>
        {(children || actions) && (
          <div>
            {actions || children}
          </div>
        )}
      </Flex>
    </div>
  )
}

export default PageHeader
