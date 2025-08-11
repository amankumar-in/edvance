import React, { useState } from 'react'
import RewardsBasePage from '../../components/RewardsBasePage'
import { useGetStudentRewards } from '../../api/rewards/rewards.queries';
import { useDebounce } from '../../hooks/useDebounce';

function StudentRewards() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [sortBy, setSortBy] = useState('price-low');
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [filter, setFilter] = useState({})

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, error } = useGetStudentRewards({
    limit: 20,
    search: debouncedSearchQuery,
    sort: 'pointsCost',
    order: sortBy === 'price-low' ? 'asc' : 'desc',
    wishlistOnly: showWishlistOnly,
    ...filter,
  });

  const { data: featuredRewardsData } = useGetStudentRewards({ isFeatured: true, limit: 20 });

  // Safely extract rewards from paginated response structure
  const allRewards = data?.pages?.flatMap(page => page.data.rewards) || [];

  const featuredRewards = featuredRewardsData?.pages?.flatMap(page => page.data.rewards) || [];

  return (
    <RewardsBasePage
      role='student'
      allRewards={allRewards}
      isLoading={isLoading}
      isError={isError}
      error={error}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isFetching={isFetching}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      sortBy={sortBy}
      setSortBy={setSortBy}
      showWishlistOnly={showWishlistOnly}
      setShowWishlistOnly={setShowWishlistOnly}
      filter={filter}
      setFilter={setFilter}
      featuredRewards={featuredRewards}
    />
  )
}

export default StudentRewards





