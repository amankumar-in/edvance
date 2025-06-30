import React, { useState } from 'react'
import { TaskDetailsPageBase } from '../../components'
import { useGetStudentTaskById } from '../../api/task/task.queries';
import { useSubmitTask } from '../../api/task/task.mutations';
import { toast } from 'sonner';
import { useParams } from 'react-router';

function StudentTaskDetail() {
  const { id } = useParams();
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  
  // Fetch student-specific task data with completion status
  const { data, isLoading, isError, error } = useGetStudentTaskById(id);
  const { data: task } = data ?? {};

  // Task submission mutation with loading states
  const { mutateAsync: submitTask, isPending: isSubmitting, isError: isSubmissionError, error: submissionError } = useSubmitTask()

  // Handle task submission with comprehensive error handling
  const handleTaskSubmission = async (submissionData) => {
    const { taskId, data } = submissionData;

    try {
      await submitTask({ id: taskId, data });
      toast.success('Task submitted successfully');
      setIsSubmissionOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Something went wrong while submitting task');
    }
  };
  
  return (
    <TaskDetailsPageBase
      role='student'
      task={task}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isSubmitting={isSubmitting}
      isSubmissionError={isSubmissionError}
      submissionError={submissionError}
      handleTaskSubmission={handleTaskSubmission}
      isSubmissionOpen={isSubmissionOpen}
      setIsSubmissionOpen={setIsSubmissionOpen}
    />
  )
}

export default StudentTaskDetail
