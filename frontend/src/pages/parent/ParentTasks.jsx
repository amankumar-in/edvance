import React, { useState } from 'react'
import { useGetParentTasks } from '../../api/task/task.queries';
import { TaskPageBase } from '../../components';

function ParentTasks() {
  // Filter states - 'all' used instead of null for consistency with Select component
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');
  
  // Modal state for managing task visibility to children
  const [openVisibilityModal, setOpenVisibilityModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [visibleToChildren, setVisibleToChildren] = useState([]);

  // Convert 'all' filter values to null for API calls
  const { data, isLoading, isError, error, isFetching, refetch } = useGetParentTasks({
    role: 'parent',
    status: filter === 'all' ? null : filter,
    category: category === 'all' ? null : category,
  });
  const { data: tasks = [] } = data ?? {};

  const handleManageVisibility = (task) => {
    if (!task) return;
    setSelectedTask(task);
    setOpenVisibilityModal(true);
    // Ensure visibleToChildren is always an array
    setVisibleToChildren(Array.isArray(task.visibleToChildren) ? task.visibleToChildren : []);
  };

  // Render shared TaskPageBase with parent role and visibility management props
  return (
    <TaskPageBase
      tasks={tasks}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isFetching={isFetching}
      refetch={refetch}
      role='parent'
      openVisibilityModal={openVisibilityModal}
      setOpenVisibilityModal={setOpenVisibilityModal}
      selectedTask={selectedTask}
      visibleToChildren={visibleToChildren}
      setVisibleToChildren={setVisibleToChildren}
      handleManageVisibility={handleManageVisibility}
      filter={filter}
      setFilter={setFilter}
      category={category}
      setCategory={setCategory}
    />
  )
}

export default ParentTasks
