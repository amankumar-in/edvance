import React from 'react'
import { EmptyStateCard } from '../../../components'
import { Plus, School } from 'lucide-react'
import { Button } from '@radix-ui/themes'
import { Link } from 'react-router'

function NoSchoolProfileCard({ children, description='Create a school profile' }) {
  return (
    <div className='space-y-6'>
      {children}
      <EmptyStateCard
        icon={<School />}
        title="No School Found"
        description={description}
        action={(
          <Button asChild className='shadow-md'>
            <Link to={'/school-admin/school/create'}>
              <Plus size={16} /> Create School
            </Link>
          </Button>
        )}
      />
    </div>
  )
}

export default NoSchoolProfileCard
