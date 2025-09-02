import { Badge, Button, Card, DropdownMenu, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes'
import { Edit, Eye, Globe, Mail, MapPin, MoreVertical, Phone, Star, Trash2 } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { useDeleteCollege, useToggleCollegeFeaturedStatus, useUpdateCollegeStatus } from '../../../api/college/college.mutations'
import ConfirmationDialog from '../../../components/ConfirmationDialog'
import { FALLBACK_IMAGES } from '../../../utils/constants'

const CollegeCard = ({ college }) => {
  const deleteCollegeMutation = useDeleteCollege()
  const toggleFeaturedMutation = useToggleCollegeFeaturedStatus()
  const updateStatusMutation = useUpdateCollegeStatus()
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const handleDeleteConfirm = () => {
    deleteCollegeMutation.mutate(college._id, {
      onSuccess: () => {
        toast.success('College deleted successfully')
        setShowDeleteDialog(false)
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to delete college')
      }
    })
  }

  const handleToggleFeatured = () => {
    if (toggleFeaturedMutation.isPending) return;
    toggleFeaturedMutation.mutate(college._id, {
      onSuccess: () => {
        toast.success(`College ${college.isFeatured ? 'unfeatured' : 'featured'} successfully`)
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to update featured status')
      }
    })
  }

  const handleStatusChange = (newStatus) => {
    if (updateStatusMutation.isPending) return;
    updateStatusMutation.mutate({ id: college._id, status: newStatus }, {
      onSuccess: (data) => {
        toast.success(data.message || `College status updated to ${newStatus}`)
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to update status')
      }
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      <Card size="2" className="hover:shadow-md transition-shadow shadow [--card-border-width:0px]">
        <Flex direction="column" gap="4">
          {/* Header with logo, name, and actions */}
          <Flex justify="between" align="start" gap="3">
            <Flex align="start" gap="3" className="flex-1">
              {/* Logo */}
              {college.logo ? (
                <div className="overflow-hidden flex-shrink-0 w-16 h-16 rounded-lg">
                  <img
                    src={college.logo}
                    alt={`${college.name} logo`}
                    className="object-cover w-full h-full"
                    onError={(e) => (e.target.src = FALLBACK_IMAGES.image)}
                  />
                </div>
              ) : (
                <div className="flex flex-shrink-0 justify-center items-center w-16 h-16 bg-[--gray-5] rounded-lg">
                  <Text as='p' color="gray" weight="medium">
                    {college.name?.charAt(0)?.toUpperCase() || 'C'}
                  </Text>
                </div>
              )}

              {/* College info */}
              <div className="flex-1 min-w-0">
                <Flex align="center" gap="2" mb="1">
                  <Text as='p' size="4" weight="bold">
                    {college.name}
                  </Text>
                  {college.isFeatured && (
                    <Star size={16} className="flex-shrink-0 fill-current text-[--yellow-9]" />
                  )}
                </Flex>

                {college.location && (
                  <Flex align="center" gap="1" mb="2">
                    <MapPin size={14} className="flex-shrink-0 text-gray-500" />
                    <Text size="2" color="gray" className="truncate">
                      {college.location}
                    </Text>
                  </Flex>
                )}

                {college.shortDescription && (
                  <Text size="2" color="gray" className="line-clamp-2">
                    {college.shortDescription}
                  </Text>
                )}
              </div>
            </Flex>

            {/* Actions dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton title="Actions" aria-label="Actions" variant="ghost" color="gray" size="2">
                  <MoreVertical size={16} />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content variant='soft' align="end" className='min-w-60'>
                <DropdownMenu.Item asChild>
                  <Link to={`/platform-admin/dashboard/colleges/${college._id}`}>
                    <Eye size={14} />
                    View Details
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link to={`/platform-admin/dashboard/colleges/edit/${college._id}`}>
                    <Edit size={14} />
                    Edit
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />

                {/* Featured toggle */}
                <DropdownMenu.Item
                  disabled={toggleFeaturedMutation.isPending}
                  onClick={handleToggleFeatured}
                >
                  <Star size={14} />
                  {college.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                </DropdownMenu.Item>

                <DropdownMenu.Separator />

                {/* Status toggle */}
                <DropdownMenu.Label>Status</DropdownMenu.Label>
                <DropdownMenu.RadioGroup
                  value={college.status}
                  onValueChange={(value) => handleStatusChange(value)}
                >
                  <DropdownMenu.RadioItem disabled={updateStatusMutation.isPending} value='draft'>Draft</DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem disabled={updateStatusMutation.isPending} value='published'>Published</DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>

                {/* Delete */}
                <DropdownMenu.Separator />
                <DropdownMenu.Item color="red" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 size={14} />
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>

          {/* Status and metadata */}
          <Flex justify="between" align="center" wrap="wrap" gap="3">
            <Flex align="center" gap="2" wrap="wrap">
              <Badge
                color={college.status === 'published' ? 'green' : 'gray'}
                variant="soft"
              >
                {college.status === 'published' ? 'Published' : 'Draft'}
              </Badge>

              {college.courses && college.courses.length > 0 && (
                <Badge variant="outline">
                  {college.courses.length} Course{college.courses.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </Flex>

            <Flex align="center" gap="3" wrap="wrap">
              {/* Contact info */}
              {college.website && (
                <Tooltip content="Visit Website">
                  <Button variant="ghost" size="1" asChild>
                    <a href={college.website} target="_blank" rel="noopener noreferrer">
                      <Globe size={16} />
                    </a>
                  </Button>
                </Tooltip>
              )}
              {college.contactEmail && (
                <Tooltip content="Send Email">
                  <Button variant="ghost" size="1" asChild>
                    <a href={`mailto:${college.contactEmail}`}>
                      <Mail size={16} />
                    </a>
                  </Button>
                </Tooltip>
              )}
              {college.contactPhone && (
                <Tooltip content="Call">
                  <Button variant="ghost" size="1" asChild>
                    <a href={`tel:${college.contactPhone}`}>
                      <Phone size={16} />
                    </a>
                  </Button>
                </Tooltip>
              )}

              <Text size="1" color="gray">
                {formatDate(college.createdAt)}
              </Text>
            </Flex>
          </Flex>

          {/* Courses preview */}
          {college.courses && college.courses.length > 0 && (
            <div>
              <Text size="2" weight="medium" mb="2">Courses:</Text>
              <Flex gap="1" wrap="wrap">
                {college.courses.slice(0, 3).map((course, index) => (
                  <Badge key={index} variant="outline" size="1">
                    {course}
                  </Badge>
                ))}
                {college.courses.length > 3 && (
                  <Badge variant="outline" size="1" color="gray">
                    +{college.courses.length - 3} more
                  </Badge>
                )}
              </Flex>
            </div>
          )}
        </Flex>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete College"
        description={`Are you sure you want to delete "${college.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete College"
        cancelText="Cancel"
        isLoading={deleteCollegeMutation.isPending}
        confirmColor="red"
      />
    </>
  )
}

export default CollegeCard
