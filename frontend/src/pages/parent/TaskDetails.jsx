import React from 'react'
import { TaskDetailsPageBase } from '../../components'
import { useParams } from 'react-router';
import { useGetTaskById } from '../../api/task/task.queries';
import { useAuth } from '../../Context/AuthContext';

function TaskDetails() {
  const { id } = useParams();
  
  // Fetch task data with parent role context for authorization
  const { data, isLoading, isError, error } = useGetTaskById(id, 'parent');
  const { data: task } = data ?? {};

  const { profiles } = useAuth();
  
  // Determine if current user is task creator for edit/delete permissions
  const createdByProfileId = profiles?.['parent']?._id;
  const isCreator = task?.createdBy === createdByProfileId;

  return (
    <TaskDetailsPageBase
      role='parent'
      task={task}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isCreator={isCreator}
    />
  )
}

export default TaskDetails
