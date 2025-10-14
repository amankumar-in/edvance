import { Button, Card, Flex, Heading, Select, Separator, Text, TextField } from '@radix-ui/themes'
import { Building2 } from 'lucide-react'
import React, { useState } from 'react'
import { BarLoader } from 'react-spinners'
import { useAllSchools } from '../../api/school-admin/school.queries'
import EmptyStateCard from '../../components/EmptyStateCard'
import ErrorCallout from '../../components/ErrorCallout'
import Loader from '../../components/Loader'
import PageHeader from '../../components/PageHeader'
import Pagination from '../../components/Pagination'
import { useDebounce } from '../../hooks/useDebounce'
import SchoolCard from './components/SchoolCard'

function Schools() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [cityFilter, setCityFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [countryFilter, setCountryFilter] = useState('')

  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const debouncedCityFilter = useDebounce(cityFilter, 300)
  const debouncedStateFilter = useDebounce(stateFilter, 300)
  const debouncedCountryFilter = useDebounce(countryFilter, 300)

  const queryParams = {
    page: currentPage,
    limit: pageSize,
    sort: sortField,
    order: sortOrder,
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    ...(debouncedCityFilter && { city: debouncedCityFilter }),
    ...(debouncedStateFilter && { state: debouncedStateFilter }),
    ...(debouncedCountryFilter && { country: debouncedCountryFilter }),
  }

  const { data, isLoading, isFetching, isError, error } = useAllSchools(queryParams)
  const schools = data?.data || []
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
    setCityFilter('')
    setStateFilter('')
    setCountryFilter('')
    setCurrentPage(1)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <SchoolsHeader />
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
        <SchoolsHeader />
        <ErrorCallout
          errorMessage={error?.response?.data?.message || error?.message || 'Failed to load schools'}
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
        <SchoolsHeader />

        <Separator size={'4'} />

        {/* Search and Filters */}
        <Card size="2" className="p-4">
          <Flex direction="column" gap="4">
            <Flex gap="3" wrap="wrap">
              <TextField.Root
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-[200px]"
              />
              <TextField.Root
                placeholder="Filter by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="flex-1 min-w-[150px]"
              />
              <TextField.Root
                placeholder="Filter by state..."
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="flex-1 min-w-[150px]"
              />
              <TextField.Root
                placeholder="Filter by country..."
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="flex-1 min-w-[150px]"
              />
            </Flex>

            <Flex gap="3" align="center" wrap="wrap">
              <Flex gap="2" align="center" wrap="wrap">
                <Text size="2" color="gray">Sort by:</Text>
                <Select.Root value={sortField} onValueChange={setSortField}>
                  <Select.Trigger variant='classic'/>
                  <Select.Content position="popper" variant="soft">
                    <Select.Item value="name">Name</Select.Item>
                    <Select.Item value="city">City</Select.Item>
                    <Select.Item value="state">State</Select.Item>
                    <Select.Item value="country">Country</Select.Item>
                    <Select.Item value="createdAt">Created Date</Select.Item>
                  </Select.Content>
                </Select.Root>
                <Select.Root value={sortOrder} onValueChange={setSortOrder}>
                  <Select.Trigger variant='classic'/>
                  <Select.Content position="popper" variant="soft">
                    <Select.Item value="asc">Ascending</Select.Item>
                    <Select.Item value="desc">Descending</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>

              {(searchTerm || cityFilter || stateFilter || countryFilter) && (
                <Button variant="soft" color="gray" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </Flex>
          </Flex>
        </Card>

        {/* Results */}
        {schools?.length > 0 ? (
          <div className='space-y-6'>
            <div className='grid gap-4'>
              {schools.map((school) => (
                <SchoolCard key={school._id} school={school} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page || 1}
              totalPages={pagination.totalPages || 1}
              totalItems={pagination.totalDocs || 0}
              itemsPerPage={pageSize}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handlePageSizeChange}
              showItemsPerPage={true}
              showPageInfo={true}
              showFirstLast={true}
              showPrevNext={true}
              itemsPerPageOptions={[5, 10, 20, 50, 100]}
              itemLabel="schools"
            />
          </div>
        ) : (
          <EmptyStateCard
            title='No schools found'
            description={
              searchTerm || cityFilter || stateFilter || countryFilter
                ? 'No schools match your current filters. Try adjusting your search criteria.'
                : 'No schools are available in the system.'
            }
            icon={<Building2 size={24} />}
            action={
              (searchTerm || cityFilter || stateFilter || countryFilter) && (
                <Button variant="soft" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )
            }
          />
        )}
      </div>
    </>
  )
}

export default Schools

function SchoolsHeader() {
  return (
    <PageHeader
      title="Schools"
      description="Manage schools and their details"
    />
  )
}
