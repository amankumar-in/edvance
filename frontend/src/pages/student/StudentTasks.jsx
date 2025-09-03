import React, { useState } from 'react';
import { useGetStudentTasks, useGetStudentTasksInfinite } from '../../api/task/task.queries';
import { TaskPageBase } from '../../components';

function StudentTasks() {
  // Filter states - 'all' used instead of null for consistency with Select component
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');

  const { data: taskData, isLoading, isError, error, isFetching, refetch, isFetchingNextPage,
    hasNextPage, fetchNextPage
  } = useGetStudentTasksInfinite({
    role: 'student',
    status: filter === 'all' ? null : filter,
    category: category === 'all' ? null : category,
    limit: 20,
  })

  // Get infinite tasks by flat mapping pages
  const infiniteTasks = taskData?.pages?.flatMap(page => page.data) || []

  // Get total tasks count
  const totalTasks = taskData?.pages?.[0]?.pagination?.total ?? 0;

  // Get Featured Tasks
  const { data: featuredTasksData, isLoading: featuredTasksLoading, isError: featuredTasksIsError, error: featuredTasksError } = useGetStudentTasks({
    role: 'student',
    isFeatured: true,
    limit: 20,
  });

  const featuredTasks = featuredTasksData?.data ?? [];

  // Render shared TaskPageBase with student role - no visibility modal props needed
  return (
    <div>
      <TaskPageBase
        tasks={infiniteTasks}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isFetching={isFetching}
        refetch={refetch}
        role='student'
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
    </div>
  )
}

export default StudentTasks
