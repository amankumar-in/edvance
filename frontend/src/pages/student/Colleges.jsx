import { Badge, Box, Button, Card, Flex, Heading, Inset, Select, Text, TextField } from '@radix-ui/themes'
import { GraduationCap, MapPin, Search, Star } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router'
import { useAllColleges } from '../../api/college/college.queries'
import EmptyStateCard from '../../components/EmptyStateCard'
import ErrorCallout from '../../components/ErrorCallout'
import Loader from '../../components/Loader'
import PageHeader from '../../components/PageHeader'
import { useDebounce } from '../../hooks/useDebounce'
import { FALLBACK_IMAGES } from '../../utils/constants'

function Colleges() {
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState('asc')

  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const debouncedLocationFilter = useDebounce(locationFilter, 300)

  const queryParams = {
    page: currentPage,
    limit: 20,
    sortBy: sortBy,
    sortOrder: sortOrder,
    status: 'published', // Only show published colleges to students
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    ...(debouncedLocationFilter && { location: debouncedLocationFilter }),
    ...(tierFilter && { tier: tierFilter }),
  }

  const { data, isLoading, error, isError, isFetching } = useAllColleges(queryParams)
  const colleges = data?.data || []
  const { totalColleges = 0 } = data?.pagination || {}

  const CollegeCard = ({ college }) => (
    <Card className="h-full transition-shadow card_no_border hover:shadow-md" asChild>
      <Link to={`/student/colleges/${college._id}`} className="block h-full">
        <Box className="relative">
          {/* Banner Image */}
          <Inset clip="padding-box" side="top">
            {college.bannerImage ? (
              <Box className="overflow-hidden aspect-[2/1] rounded-t-md">
                <img
                  src={college.bannerImage}
                  alt={`${college.name} banner`}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGES.image
                  }}
                />
              </Box>
            ) : (
              <Box className="overflow-hidden aspect-[2/1] rounded-t-md bg-[--gray-5] flex items-center justify-center">
                <GraduationCap size={40} />
              </Box>
            )}
          </Inset>

          {/* Featured Badge */}
          {college.isFeatured && (
            <Badge
              color="gold"
              variant="solid"
              className="flex absolute top-2 right-2 gap-1 items-center"
            >
              <Star size={12} fill="currentColor" />
              Featured
            </Badge>
          )}

          {/* College Logo */}
          <Flex className="absolute left-0 -bottom-6">
            {college.logo ? (
              <img
                src={college.logo}
                alt={`${college.name} logo`}
                className="object-cover bg-white rounded-full border-2 border-white shadow-md size-14"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGES.image
                }}
              />
            ) : (
              <Box className="flex justify-center items-center w-12 h-12 bg-blue-500 rounded-full border-2 border-white">
                <GraduationCap size={24} color="white" />
              </Box>
            )}
          </Flex>
        </Box>

        <Box className="pt-8">
          {/* College Name */}
          <Heading size="4" className="mb-2 line-clamp-1">
            {college.name}
          </Heading>

          {/* Location */}
          {college.location && (
            <Flex align="center" gap="1" className="mb-2 text-gray-600">
              <MapPin size={14} />
              <Text size="2" color="gray">{college.location}</Text>
            </Flex>
          )}

          {/* Short Description */}
          {college.shortDescription && (
            <Text size="2" color="gray" className="mb-3 line-clamp-2">
              {college.shortDescription}
            </Text>
          )}

          {/* Tier Badge */}
          {college.tier && (
            <Badge
              variant="soft"
              color={
                college.tier === 'Ivy League' ? 'purple' :
                  college.tier === 'tier1' ? 'blue' :
                    college.tier === 'tier2' ? 'green' : 'gray'
              }
            >
              {college.tier === 'Ivy League' ? 'Ivy League' :
                college.tier === 'tier1' ? 'Tier 1' :
                  college.tier === 'tier2' ? 'Tier 2' : 'Tier 3'}
            </Badge>
          )}
        </Box>
      </Link>
    </Card>
  )

  return (
    <Box className='space-y-6'>
      {/* Header */}
      <PageHeader
        title="Explore Colleges"
        description="Discover top universities and colleges to shape your future"
      />

      {/* Filters */}
      <Card size={{ initial: '2', md: '3' }} className='card_no_border'>
        <Flex gap="4" align="end" wrap="wrap">
          {/* Search */}
          <Box className="flex-1 min-w-[250px]">
            <Text as="div" size="2" mb="2" weight="medium">
              Search Colleges
            </Text>
            <TextField.Root
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            >
              <TextField.Slot>
                <Search size={16} />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          {/* Location Filter */}
          <Box className="flex-1 min-w-[200px]">
            <Text as="div" size="2" mb="2" weight="medium">
              Location
            </Text>
            <TextField.Root
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full"
            >
              <TextField.Slot>
                <MapPin size={16} />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          {/* Tier Filter */}
          <Box className="min-w-[150px]">
            <Text as="div" size="2" mb="2" weight="medium">
              College Tier
            </Text>
            <Select.Root
              value={tierFilter || "all"}
              onValueChange={(value) => setTierFilter(value === "all" ? "" : value)}
            >
              <Select.Trigger placeholder="All Tiers" className="w-full" />
              <Select.Content position="popper" variant='soft'>
                <Select.Item value="all">All Tiers</Select.Item>
                <Select.Item value="Ivy League">Ivy League</Select.Item>
                <Select.Item value="tier1">Tier 1</Select.Item>
                <Select.Item value="tier2">Tier 2</Select.Item>
                <Select.Item value="tier3">Tier 3</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>

          {/* Sort By */}
          <Box className="min-w-[150px]">
            <Text as="div" size="2" mb="2" weight="medium">
              Sort By
            </Text>
            <Select.Root
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value)
                setSortOrder(value === 'name' || value === 'location' ? 'asc' : 'desc')
              }}
            >
              <Select.Trigger placeholder="Sort by" className="w-full" />
              <Select.Content position="popper" variant='soft'>
                <Select.Item value="name">Name</Select.Item>
                <Select.Item value="location">Location</Select.Item>
                <Select.Item value="tier">Tier</Select.Item>
                <Select.Item value="createdAt">Recently Added</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>
      </Card>

      {/* Results Count */}
      {!isLoading && (
        <Flex justify="between" align="center">
          <Text as='p' size="2" color="gray">
            {totalColleges} {totalColleges === 1 ? 'college' : 'colleges'} found
          </Text>
        </Flex>
      )}

      {/* College Grid */}
      {isFetching ? (
        <Flex justify="center" align="center">
          <Loader />
        </Flex>
      ) : isError ? (
        <ErrorCallout
          errorMessage={error?.response?.data?.message || 'Failed to load colleges'}
        />
      ) : colleges.length === 0 ? (
        <EmptyStateCard
          title={'No colleges found'}
          description={
            searchTerm || locationFilter || tierFilter
              ? 'Try adjusting your search criteria.'
              : 'No colleges are available at the moment.'
          }
          icon={<GraduationCap />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {colleges.map((college) => (
            <CollegeCard key={college._id} college={college} />
          ))}
        </div>
      )}

      {/* Load More */}
      {colleges.length > 0 && colleges.length < totalColleges && (
        <Flex justify="center" className="mt-8">
          <Button
            variant="outline"
            size="3"
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Load More Colleges
          </Button>
        </Flex>
      )}
    </Box>
  )
}

export default Colleges
