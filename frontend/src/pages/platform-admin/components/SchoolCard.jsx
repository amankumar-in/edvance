import React, { useState } from 'react'
import { Card, Flex, Text, Badge, IconButton, Tooltip } from '@radix-ui/themes'
import { Building2, MapPin, Mail, Globe, Phone, Edit2 } from 'lucide-react'
import EditSchoolDialog from './EditSchoolDialog'

function SchoolCard({ school }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditDialogOpen(true)
  }

  return (
    <>
      <Card size="2" className="p-4 shadow-md [--card-border-width:0px] hover:shadow-lg">
        <Flex align={'start'} justify="between" gap="4" direction={{ initial: 'column', md: 'row' }}>


          {/* School Logo */}
          <div className="flex-shrink-0 mx-auto max-w-60 aspect-video">
            {school.logo ? (
              <img
                src={school.logo}
                alt={`${school.name} logo`}
                className="object-cover w-full h-full rounded-lg bg-[--gray-a5]"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex justify-center items-center w-full h-full bg-[--gray-a3] rounded-lg">
                <Building2 size={24} color='var(--gray-9)' />
              </div>
            )}
          </div>
          <Flex direction="column" gap="3" className="w-full">
            <Flex justify="between" align="start" gap="4">
              <div className='space-y-2'>
                <Flex align="start" gap="2">
                  <Building2 size={20} color='var(--blue-9)' className="mt-1 shrink-0" />
                  <Text size="4" weight="medium">{school.name}</Text>
                </Flex>

                {school.address && (
                  <Flex align="center" gap="2">
                    <MapPin size={16} color='var(--gray-9)' className='shrink-0' />
                    <Text size="2" color="gray">
                      {[school.address, school.city, school.state, school.zipCode, school.country]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </Flex>
                )}
              </div>

              {/* Edit Button */}
              <EditSchoolDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                school={school}
              >
                <Tooltip content="Edit school details">
                  <IconButton
                    size="2"
                    variant="ghost"
                    color="gray"
                    onClick={handleEdit}
                  >
                    <Edit2 size={16} />
                  </IconButton>
                </Tooltip>
              </EditSchoolDialog>
            </Flex>

            <Flex gap="4" wrap="wrap">
              {school.email && (
                <Flex align="center" gap="2">
                  <Mail size={16} color='var(--gray-9)' />
                  <Text size="2">{school.email}</Text>
                </Flex>
              )}

              {school.phone && (
                <Flex align="center" gap="2">
                  <Phone size={16} color='var(--gray-9)' />
                  <Text size="2">{school.phone}</Text>
                </Flex>
              )}

              {school.website && (
                <Flex align="center" gap="2">
                  <Globe size={16} color='var(--gray-9)' />
                  <Text size="2" asChild>
                    <a href={school.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Website
                    </a>
                  </Text>
                </Flex>
              )}
            </Flex>

            {school.administrators && school.administrators.length > 0 && (
              <div className='space-y-1'>
                <Text as='p' size="2" color="gray">Administrators:</Text>
                <Flex gap="2" wrap="wrap">
                  {school.administrators.slice(0, 3).map((admin) => (
                    <Badge key={admin._id} variant="soft" color="gray">
                      {admin.firstName} {admin.lastName}
                    </Badge>
                  ))}
                  {school.administrators.length > 3 && (
                    <Badge variant="soft" color="gray">
                      +{school.administrators.length - 3} more
                    </Badge>
                  )}
                </Flex>
              </div>
            )}
          </Flex>
        </Flex>
      </Card>

    </>
  )
}

export default SchoolCard
