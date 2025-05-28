import React from 'react'
import { Button, Flex, Heading } from '@radix-ui/themes'
import { Plus } from 'lucide-react'
import { Link } from 'react-router'

function Tasks() {
  return (
    <div>
      <Flex justify='between' align='center'>
        <Heading as='h1' size='6' weight='medium'>Tasks</Heading>
        <Button asChild>
          <Link to='create'>
            <Plus size={16} /> Add Task
          </Link>
        </Button>
      </Flex>
    </div>
  )
}

export default Tasks
