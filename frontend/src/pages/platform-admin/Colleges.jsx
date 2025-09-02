import { Button, Card, Flex, Select, Separator, Text, TextField } from '@radix-ui/themes'
import { GraduationCap, Plus } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router'
import { BarLoader } from 'react-spinners'
import { useAllColleges } from '../../api/college/college.queries'
import EmptyStateCard from '../../components/EmptyStateCard'
import ErrorCallout from '../../components/ErrorCallout'
import Loader from '../../components/Loader'
import PageHeader from '../../components/PageHeader'
import Pagination from '../../components/Pagination'
import { useDebounce } from '../../hooks/useDebounce'
import CollegeCard from './components/CollegeCard'

function Colleges() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [featuredFilter, setFeaturedFilter] = useState('')
  const [tierFilter, setTierFilter] = useState('')

  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const debouncedLocationFilter = useDebounce(locationFilter, 300)

  const queryParams = {
    page: currentPage,
    limit: pageSize,
    sortBy: sortField,
    sortOrder: sortOrder,
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    ...(statusFilter && { status: statusFilter }),
    ...(debouncedLocationFilter && { location: debouncedLocationFilter }),
    ...(featuredFilter && { isFeatured: featuredFilter }),
    ...(tierFilter && { tier: tierFilter }),
  }

  const { data, isLoading, isFetching, isError, error } = useAllColleges(queryParams)
  const colleges = data?.data || []
  const pagination = data?.pagination || {}

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize, newCurrentPage) => {
    setPageSize(parseInt(newPageSize))
    setCurrentPage(newCurrentPage || 1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setLocationFilter('')
    setFeaturedFilter('')
    setTierFilter('')
    setCurrentPage(1)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <CollegesHeader />
        <Flex justify="center" align="center">
          <Loader />
        </Flex>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className='space-y-6'>
        <CollegesHeader />
        <ErrorCallout
          errorMessage={error?.response?.data?.message || error?.message || 'Failed to load colleges'}
        />
      </div>
    )
  }

  return (
    <>
      {isFetching && (
        <div className='flex fixed top-0 right-0 left-0 z-50'>
          <BarLoader
            color='#00a2c7'
            width={'100%'}
            height={'4px'}
          />
        </div>
      )}
      <div className='space-y-6'>
        <CollegesHeader />

        <Separator size={'4'} />

        {/* Search and Filters */}
        <Card size="2">
          <Flex direction="column" gap="4">
            <Flex gap="3" wrap="wrap">
              <TextField.Root
                placeholder="Search colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-[200px]"
              />
              <TextField.Root
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="flex-1 min-w-[150px]"
              />
              <Select.Root value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                <Select.Trigger placeholder="Status" className="min-w-[120px]" variant='classic' />
                <Select.Content position="popper" variant="soft">
                  <Select.Item value="all">All Status</Select.Item>
                  <Select.Item value="draft">Draft</Select.Item>
                  <Select.Item value="published">Published</Select.Item>
                </Select.Content>
              </Select.Root>
              <Select.Root value={featuredFilter || "all"} onValueChange={(value) => setFeaturedFilter(value === "all" ? "" : value)}>
                <Select.Trigger placeholder="Featured" className="min-w-[120px]" variant='classic' />
                <Select.Content position="popper" variant="soft">
                  <Select.Item value="all">All</Select.Item>
                  <Select.Item value="true">Featured</Select.Item>
                  <Select.Item value="false">Not Featured</Select.Item>
                </Select.Content>
              </Select.Root>
              <Select.Root value={tierFilter || "all"} onValueChange={(value) => setTierFilter(value === "all" ? "" : value)}>
                <Select.Trigger placeholder="Tier" className="min-w-[120px]" variant='classic' />
                <Select.Content position="popper" variant="soft">
                  <Select.Item value="all">All Tiers</Select.Item>
                  <Select.Item value="Ivy League">Ivy League</Select.Item>
                  <Select.Item value="tier1">Tier 1</Select.Item>
                  <Select.Item value="tier2">Tier 2</Select.Item>
                  <Select.Item value="tier3">Tier 3</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            <Flex gap="3" align="center" wrap="wrap">
              <Flex gap="2" align="center" wrap="wrap">
                <Text size="2" color="gray">Sort by:</Text>
                <Select.Root value={sortField} onValueChange={setSortField}>
                  <Select.Trigger variant='classic' />
                  <Select.Content position="popper" variant="soft">
                    <Select.Item value="name">Name</Select.Item>
                    <Select.Item value="location">Location</Select.Item>
                    <Select.Item value="tier">Tier</Select.Item>
                    <Select.Item value="status">Status</Select.Item>
                    <Select.Item value="isFeatured">Featured</Select.Item>
                    <Select.Item value="createdAt">Created Date</Select.Item>
                    <Select.Item value="updatedAt">Updated Date</Select.Item>
                  </Select.Content>
                </Select.Root>
                <Select.Root value={sortOrder} onValueChange={setSortOrder}>
                  <Select.Trigger variant='classic' />
                  <Select.Content position="popper" variant="soft">
                    <Select.Item value="asc">Ascending</Select.Item>
                    <Select.Item value="desc">Descending</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>

              {(searchTerm || statusFilter || locationFilter || featuredFilter || tierFilter) && (
                <Button variant="soft" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </Flex>
          </Flex>
        </Card>

        {/* Results */}
        {colleges?.length > 0 ? (
          <div className='space-y-6'>
            <div className='grid gap-4'>
              {colleges.map((college) => (
                <CollegeCard key={college._id} college={college} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage || 1}
              totalPages={pagination.totalPages || 1}
              totalItems={pagination.totalColleges || 0}
              itemsPerPage={pageSize}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handlePageSizeChange}
              showItemsPerPage={true}
              showPageInfo={true}
              showFirstLast={true}
              showPrevNext={true}
              itemsPerPageOptions={[5, 10, 25, 50]}
              itemLabel="colleges"
            />
          </div>
        ) : (
          <EmptyStateCard
            title='No colleges found'
            description={
              debouncedSearchTerm || debouncedLocationFilter || statusFilter || featuredFilter || tierFilter
                ? 'No colleges match your current filters. Try adjusting your search criteria.'
                : 'No colleges are available in the system.'
            }
            icon={<GraduationCap size={24} />}
            action={
              <Flex gap="2" align="center" wrap="wrap">
                {(debouncedSearchTerm || statusFilter || debouncedLocationFilter || featuredFilter || tierFilter) && (
                  <Button variant="soft" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
                <Button asChild>
                  <Link to="/platform-admin/dashboard/colleges/create">
                    <Plus size={16} />
                    Add College
                  </Link>
                </Button>
              </Flex>
            }
          />
        )}
      </div>
    </>
  )
}

export default Colleges

function CollegesHeader() {
  return (
    <PageHeader
      title="Colleges"
      description="Manage colleges and their information"
    >
      <Button asChild>
        <Link to="/platform-admin/dashboard/colleges/create">
          <Plus size={16} />
          Add College
        </Link>
      </Button>
    </PageHeader>
  )
}
