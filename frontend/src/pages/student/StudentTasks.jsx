import React, { useState } from 'react'
import { useGetStudentTasks } from '../../api/task/task.queries'
import { TaskPageBase } from '../../components'

function StudentTasks() {
  // Filter states - 'all' used instead of null for consistency with Select component
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');
  
  // Convert 'all' filter values to null for API calls
  const { data, isLoading, isError, error, isFetching, refetch } = useGetStudentTasks({
    role: 'student',
    status: filter === 'all' ? null : filter,
    category: category === 'all' ? null : category,
  })
  const { data: tasks = [] } = data ?? {}

  // Render shared TaskPageBase with student role - no visibility modal props needed
  return (
    <div>
      <TaskPageBase 
        tasks={tasks}
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
      />
    </div>
  )
}

export default StudentTasks
