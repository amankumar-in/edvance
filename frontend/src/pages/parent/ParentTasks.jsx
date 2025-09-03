import React, { useState } from 'react';
import { useGetParentTasks, useGetParentTasksInfinite } from '../../api/task/task.queries';
import { TaskPageBase } from '../../components';

function ParentTasks() {
  // Filter states - 'all' used instead of null for consistency with Select component
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');

  const { data: taskData, isLoading, isError, error, isFetching, refetch, isFetchingNextPage,
    hasNextPage, fetchNextPage
  } = useGetParentTasksInfinite({
    role: 'parent',
    status: filter === 'all' ? null : filter,
    category: category === 'all' ? null : category,
    limit: 20,
  })

  // Get infinite tasks by flat mapping pages
  const infiniteTasks = taskData?.pages?.flatMap(page => page.data) || []

  // Get total tasks count
  const totalTasks = taskData?.pages?.[0]?.pagination?.total ?? 0;

  // Get Featured Tasks
  const { data: featuredTasksData, isLoading: featuredTasksLoading, isError: featuredTasksIsError, error: featuredTasksError } = useGetParentTasks({
    role: 'parent',
    isFeatured: true,
    limit: 20,
  });

  const featuredTasks = featuredTasksData?.data ?? [];

  // Render shared TaskPageBase with parent role and visibility management props
  return (
    <TaskPageBase
      tasks={infiniteTasks}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isFetching={isFetching}
      refetch={refetch}
      role='parent'
      filter={filter}
      setFilter={setFilter}
      category={category}
      setCategory={setCategory}
      featuredTasks={featuredTasks}
      featuredTasksLoading={featuredTasksLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      totalTasks={totalTasks}
    />
  )
}

export default ParentTasks
