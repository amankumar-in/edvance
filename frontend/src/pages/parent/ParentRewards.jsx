import React, { useState } from 'react'
import { RewardsBasePage } from '../../components'
import { useGetParentRewards } from '../../api/rewards/rewards.queries';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../Context/AuthContext';

function ParentRewards() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [sortBy, setSortBy] = useState('featured');

  const { profiles } = useAuth();
  const parentId = profiles.parent?._id;

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, error } = useGetParentRewards({
    limit: 20,
    search: debouncedSearchQuery,
    sort: 'pointsCost',
    order: sortBy === 'price-low' ? 'asc' : 'desc',
  });

  const allRewards = data?.pages?.flatMap(page => page.data.rewards) || [];

  return (
    <RewardsBasePage
      role='parent'
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
      creatorId={parentId}
    />
  )
}

export default ParentRewards
