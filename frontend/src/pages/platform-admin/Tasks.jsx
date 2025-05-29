import React, { useState, useMemo } from 'react'
import { 
  Button, 
  Flex, 
  Heading, 
  Tabs, 
  Box, 
  Card, 
  Text, 
  Badge, 
  TextField, 
  Select, 
  Table,
  Dialog,
  Separator,
  IconButton,
  Callout,
  Switch,
  TextArea
} from '@radix-ui/themes'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Users, 
  School, 
  Globe, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Download,
  Upload,
  Settings,
  Info
} from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { format } from 'date-fns'

// Import hooks
import {
  useTasks,
  useDeleteTask,
  useAssignTask,
  useSetTaskVisibility,
  useBulkAssignTasks,
  useAssignmentAnalytics,
  useVisibilityAnalytics
} from '../../api/task/taskManagement.mutations'

function Tasks() {
  // State management
  const [activeTab, setActiveTab] = useState('tasks')
  const [selectedTasks, setSelectedTasks] = useState([])
  const [taskFilters, setTaskFilters] = useState({
    status: '',
    category: '',
    assignmentStrategy: '',
    createdBy: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: ''
  })

  // Modal states
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [visibilityModalOpen, setVisibilityModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  // Assignment modal state
  const [assignmentData, setAssignmentData] = useState({
    studentIds: [],
    schoolId: '',
    classId: ''
  })

  // Visibility modal state
  const [visibilityData, setVisibilityData] = useState({
    controllerType: 'parent',
    controllerId: '',
    studentIds: [],
    isVisible: true,
    reason: ''
  })

  // React Query hooks
  const stableTaskFilters = useMemo(() => {
    const nonEmptyFilters = {}
    Object.entries(taskFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        nonEmptyFilters[key] = value
      }
    })
    return nonEmptyFilters
  }, [taskFilters])

  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useTasks(stableTaskFilters)
  const deleteTaskMutation = useDeleteTask()
  const assignTaskMutation = useAssignTask()
  const setVisibilityMutation = useSetTaskVisibility()
  const bulkAssignMutation = useBulkAssignTasks()

  // Stable date parameters for analytics
  const analyticsDateParams = useMemo(() => ({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dateTo: new Date().toISOString()
  }), [])

  // Analytics hooks
  const { data: assignmentAnalytics } = useAssignmentAnalytics(analyticsDateParams)
  const { data: visibilityAnalytics } = useVisibilityAnalytics(analyticsDateParams)

  const tasks = tasksData?.data?.tasks || []
  const tasksPagination = tasksData?.data?.pagination || {}

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setTaskFilters(prev => ({
      ...prev,
      [key]: value || '', // Ensure empty string for cleared filters
      page: 1 // Reset to first page when filtering
    }))
  }

  const handleSearch = (searchTerm) => {
    setTaskFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }))
  }

  const handlePageChange = (page) => {
    setTaskFilters(prev => ({ ...prev, page }))
  }

  const clearFilters = () => {
    setTaskFilters({
      status: '',
      category: '',
      assignmentStrategy: '',
      createdBy: '',
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: ''
    })
  }

  // Task actions
  const handleViewTask = (task) => {
    setSelectedTask(task)
    setTaskDetailsOpen(true)
  }

  const handleEditTask = (task) => {
    window.location.href = `/platform-admin/dashboard/tasks/edit/${task._id}`
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await deleteTaskMutation.mutateAsync(taskId)
      toast.success('Task deleted successfully')
      refetchTasks()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete task')
    }
  }

  const handleDuplicateTask = (task) => {
    const duplicateData = {
      ...task,
      title: `${task.title} (Copy)`,
      status: 'pending'
    }
    delete duplicateData._id
    delete duplicateData.createdAt
    delete duplicateData.updatedAt
    
    // Navigate to create page with pre-filled data
    const params = new URLSearchParams({ duplicate: JSON.stringify(duplicateData) })
    window.location.href = `/platform-admin/dashboard/tasks/create?${params.toString()}`
  }

  // Assignment actions
  const handleAssignTask = (task) => {
    setSelectedTask(task)
    setAssignmentModalOpen(true)
  }

  const handleSubmitAssignment = async () => {
    if (!selectedTask || assignmentData.studentIds.length === 0) {
      toast.error('Please select at least one student')
      return
    }

    try {
      await assignTaskMutation.mutateAsync({
        taskId: selectedTask._id,
        data: assignmentData
      })
      toast.success('Task assigned successfully')
      setAssignmentModalOpen(false)
      setAssignmentData({ studentIds: [], schoolId: '', classId: '' })
      refetchTasks()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to assign task')
    }
  }

  // Visibility actions
  const handleSetVisibility = (task) => {
    setSelectedTask(task)
    setVisibilityModalOpen(true)
  }

  const handleSubmitVisibility = async () => {
    if (!selectedTask) return

    try {
      await setVisibilityMutation.mutateAsync({
        taskId: selectedTask._id,
        data: visibilityData
      })
      toast.success('Visibility control set successfully')
      setVisibilityModalOpen(false)
      setVisibilityData({
        controllerType: 'parent',
        controllerId: '',
        studentIds: [],
        isVisible: true,
        reason: ''
      })
      refetchTasks()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to set visibility')
    }
  }

  // Bulk actions
  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleSelectAllTasks = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(tasks.map(task => task._id))
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) return

    try {
      await Promise.all(selectedTasks.map(taskId => deleteTaskMutation.mutateAsync(taskId)))
      toast.success(`${selectedTasks.length} tasks deleted successfully`)
      setSelectedTasks([])
      refetchTasks()
    } catch {
      toast.error('Failed to delete some tasks')
    }
  }

  const handleBulkAssign = async (studentIds, schoolId, classId) => {
    try {
      await bulkAssignMutation.mutateAsync({
        taskIds: selectedTasks,
        studentIds,
        schoolId,
        classId
      })
      toast.success(`${selectedTasks.length} tasks assigned successfully`)
      setSelectedTasks([])
      refetchTasks()
    } catch {
      toast.error('Failed to assign tasks')
    }
  }

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange'
      case 'completed': return 'green'
      case 'approved': return 'blue'
      case 'rejected': return 'red'
      case 'expired': return 'gray'
      default: return 'gray'
    }
  }

  const getStrategyIcon = (strategy) => {
    switch (strategy) {
      case 'specific': return <Users size={14} />
      case 'role_based': return <Users size={14} />
      case 'school_based': return <School size={14} />
      case 'global': return <Globe size={14} />
      default: return <Users size={14} />
    }
  }

  const getStrategyLabel = (strategy) => {
    switch (strategy) {
      case 'specific': return 'Specific Users'
      case 'role_based': return 'Role Based'
      case 'school_based': return 'School Based'
      case 'global': return 'Global'
      default: return strategy
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Flex justify="between" align="center">
        <Box>
          <Heading as="h1" size="6" weight="medium">Task Management</Heading>
          <Text color="gray" size="2" className="mt-1">
            Create, assign, and manage tasks for students
          </Text>
        </Box>
        <Flex gap="2">
          <Button variant="outline" asChild>
            <Link to="/platform-admin/dashboard/tasks/help">
              <Info size={16} />
              Help & Guide
            </Link>
          </Button>
          <Button variant="outline" size="2">
            <Download size={16} />
            Export
          </Button>
        <Button asChild>
            <Link to="/platform-admin/dashboard/tasks/create">
              <Plus size={16} />
              Create Task
          </Link>
        </Button>
        </Flex>
      </Flex>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="tasks">Tasks</Tabs.Trigger>
          <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
          <Tabs.Trigger value="bulk-actions">Bulk Actions</Tabs.Trigger>
        </Tabs.List>

        {/* Tasks Tab */}
        <Tabs.Content value="tasks" className="space-y-4">
          {/* Filters */}
          <Card>
              <Box p="4">
              <Flex gap="3" wrap="wrap" align="end">
                <Box style={{ minWidth: '200px' }}>
                  <Text size="2" weight="medium" mb="2">Search</Text>
                  <TextField.Root
                    placeholder="Search tasks..."
                    value={taskFilters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                  >
                    <TextField.Slot>
                      <Search size={16} />
                    </TextField.Slot>
                  </TextField.Root>
                </Box>

                <Box style={{ minWidth: '150px' }}>
                  <Text size="2" weight="medium" mb="2">Status</Text>
                  <Flex gap="1">
                    <Select.Root 
                      value={taskFilters.status || undefined} 
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <Select.Trigger placeholder="All Statuses" />
                      <Select.Content>
                        <Select.Item value="pending">Pending</Select.Item>
                        <Select.Item value="completed">Completed</Select.Item>
                        <Select.Item value="approved">Approved</Select.Item>
                        <Select.Item value="rejected">Rejected</Select.Item>
                        <Select.Item value="expired">Expired</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    {taskFilters.status && (
                      <Button variant="ghost" size="1" onClick={() => handleFilterChange('status', '')}>
                        <X size={12} />
                      </Button>
                    )}
                  </Flex>
                </Box>

                <Box style={{ minWidth: '150px' }}>
                  <Text size="2" weight="medium" mb="2">Category</Text>
                  <Flex gap="1">
                    <Select.Root 
                      value={taskFilters.category || undefined} 
                      onValueChange={(value) => handleFilterChange('category', value)}
                    >
                      <Select.Trigger placeholder="All Categories" />
                      <Select.Content>
                        <Select.Item value="academic">Academic</Select.Item>
                        <Select.Item value="home">Home</Select.Item>
                        <Select.Item value="behavior">Behavior</Select.Item>
                        <Select.Item value="extracurricular">Extracurricular</Select.Item>
                        <Select.Item value="attendance">Attendance</Select.Item>
                        <Select.Item value="system">System</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    {taskFilters.category && (
                      <Button variant="ghost" size="1" onClick={() => handleFilterChange('category', '')}>
                        <X size={12} />
                      </Button>
                    )}
                  </Flex>
                </Box>

                <Box style={{ minWidth: '150px' }}>
                  <Text size="2" weight="medium" mb="2">Assignment Strategy</Text>
                  <Flex gap="1">
                    <Select.Root 
                      value={taskFilters.assignmentStrategy || undefined} 
                      onValueChange={(value) => handleFilterChange('assignmentStrategy', value)}
                    >
                      <Select.Trigger placeholder="All Strategies" />
                      <Select.Content>
                        <Select.Item value="specific">Specific Users</Select.Item>
                        <Select.Item value="role_based">Role Based</Select.Item>
                        <Select.Item value="school_based">School Based</Select.Item>
                        <Select.Item value="global">Global</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    {taskFilters.assignmentStrategy && (
                      <Button variant="ghost" size="1" onClick={() => handleFilterChange('assignmentStrategy', '')}>
                        <X size={12} />
                      </Button>
                    )}
                  </Flex>
                </Box>

                <Button variant="outline" size="2" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Flex>
            </Box>
          </Card>

          {/* Bulk Actions Bar */}
          {selectedTasks.length > 0 && (
            <Card>
              <Box p="3">
                <Flex justify="between" align="center">
                  <Text size="2" weight="medium">
                    {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
                  </Text>
                  <Flex gap="2">
                    <Button variant="outline" size="1" onClick={() => handleBulkAssign([], '', '')}>
                      <Users size={14} />
                      Bulk Assign
                    </Button>
                    <Button variant="outline" size="1" color="red" onClick={handleBulkDelete}>
                      <Trash2 size={14} />
                      Delete Selected
                    </Button>
                    <Button variant="ghost" size="1" onClick={() => setSelectedTasks([])}>
                      <X size={14} />
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            </Card>
          )}

          {/* Tasks Table */}
          <Card>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === tasks.length && tasks.length > 0}
                      onChange={handleSelectAllTasks}
                    />
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Task</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Strategy</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Points</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Assignments</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Due Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {tasksLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan={10}>
                      <Flex justify="center" p="4">
                        <Text>Loading tasks...</Text>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ) : tasks.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={10}>
                      <Flex justify="center" p="4">
                        <Text color="gray">No tasks found</Text>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  tasks.map((task) => (
                    <Table.Row key={task._id}>
                      <Table.Cell>
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task._id)}
                          onChange={() => handleSelectTask(task._id)}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Box>
                          <Text size="2" weight="medium">{task.title}</Text>
                          {task.description && (
                            <Text size="1" color="gray" className="block mt-1">
                              {task.description.substring(0, 60)}
                              {task.description.length > 60 ? '...' : ''}
                            </Text>
                          )}
                        </Box>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="soft" color="blue">
                          {task.categoryInfo?.name || task.category?.name || task.category}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex align="center" gap="1">
                          {getStrategyIcon(task.assignmentStrategy)}
                          <Text size="1">{getStrategyLabel(task.assignmentStrategy)}</Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2" weight="medium">{task.pointValue}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{task.assignmentCount || 0}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        {task.dueDate ? (
                          <Text size="1">{format(new Date(task.dueDate), 'MMM dd, yyyy')}</Text>
                        ) : (
                          <Text size="1" color="gray">No due date</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="1">{format(new Date(task.createdAt), 'MMM dd, yyyy')}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="1">
                          <IconButton size="1" variant="ghost" onClick={() => handleViewTask(task)}>
                            <Eye size={14} />
                          </IconButton>
                          <IconButton size="1" variant="ghost" onClick={() => handleEditTask(task)}>
                            <Edit size={14} />
                          </IconButton>
                          <IconButton size="1" variant="ghost" onClick={() => handleAssignTask(task)}>
                            <Users size={14} />
                          </IconButton>
                          <IconButton size="1" variant="ghost" onClick={() => handleSetVisibility(task)}>
                            <Settings size={14} />
                          </IconButton>
                          <IconButton size="1" variant="ghost" onClick={() => handleDuplicateTask(task)}>
                            <Copy size={14} />
                          </IconButton>
                          <IconButton 
                            size="1" 
                            variant="ghost" 
                            color="red" 
                            onClick={() => handleDeleteTask(task._id)}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>

            {/* Pagination */}
            {tasksPagination.totalPages > 1 && (
              <Box p="3" className="border-t">
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">
                    Showing {((tasksPagination.currentPage - 1) * taskFilters.limit) + 1} to{' '}
                    {Math.min(tasksPagination.currentPage * taskFilters.limit, tasksPagination.totalCount)} of{' '}
                    {tasksPagination.totalCount} tasks
                  </Text>
                  <Flex gap="2">
                    <Button 
                      variant="outline" 
                      size="1" 
                      disabled={!tasksPagination.hasPrev}
                      onClick={() => handlePageChange(tasksPagination.currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="1" 
                      disabled={!tasksPagination.hasNext}
                      onClick={() => handlePageChange(tasksPagination.currentPage + 1)}
                    >
                      Next
                    </Button>
                  </Flex>
                </Flex>
                  </Box>
            )}
          </Card>
        </Tabs.Content>

        {/* Analytics Tab */}
        <Tabs.Content value="analytics" className="space-y-4">
          <Flex gap="4" wrap="wrap">
            {/* Assignment Analytics */}
            <Card style={{ flex: '1', minWidth: '300px' }}>
              <Box p="4">
                <Flex align="center" gap="2" mb="3">
                  <TrendingUp size={16} />
                  <Heading size="4">Assignment Analytics</Heading>
                </Flex>
                {assignmentAnalytics?.data ? (
                  <div className="space-y-3">
                    {assignmentAnalytics.data.slice(0, 5).map((item, index) => (
                      <Flex key={index} justify="between" align="center">
                        <Text size="2">{item._id}</Text>
                        <Badge>{item.totalAssignments}</Badge>
                      </Flex>
                    ))}
                  </div>
                ) : (
                  <Text color="gray">No analytics data available</Text>
                )}
              </Box>
            </Card>

            {/* Visibility Analytics */}
            <Card style={{ flex: '1', minWidth: '300px' }}>
              <Box p="4">
                <Flex align="center" gap="2" mb="3">
                  <Eye size={16} />
                  <Heading size="4">Visibility Controls</Heading>
                </Flex>
                {visibilityAnalytics?.data ? (
                  <div className="space-y-3">
                    {visibilityAnalytics.data.slice(0, 5).map((item, index) => (
                      <Flex key={index} justify="between" align="center">
                        <Text size="2">
                          {item._id.controllerType} - {item._id.isVisible ? 'Visible' : 'Hidden'}
                        </Text>
                        <Badge>{item.count}</Badge>
                      </Flex>
                    ))}
                  </div>
                ) : (
                  <Text color="gray">No visibility data available</Text>
                )}
              </Box>
            </Card>
          </Flex>
        </Tabs.Content>

        {/* Bulk Actions Tab */}
        <Tabs.Content value="bulk-actions" className="space-y-4">
          <Card>
            <Box p="4">
              <Heading size="4" mb="4">Bulk Operations</Heading>
              <Text color="gray" mb="4">
                Perform actions on multiple tasks at once. Select tasks from the Tasks tab first.
              </Text>
              
              {selectedTasks.length === 0 ? (
                <Callout.Root>
                  <Callout.Icon>
                    <AlertCircle />
                  </Callout.Icon>
                  <Callout.Text>
                    No tasks selected. Go to the Tasks tab and select tasks to perform bulk operations.
                  </Callout.Text>
                </Callout.Root>
              ) : (
                <div className="space-y-4">
                  <Text size="2" weight="medium">
                    {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
                  </Text>
                  
                  <Flex gap="3" wrap="wrap">
                    <Button onClick={() => handleBulkAssign([], '', '')}>
                      <Users size={16} />
                      Bulk Assign
                    </Button>
                    <Button variant="outline" color="red" onClick={handleBulkDelete}>
                      <Trash2 size={16} />
                      Delete Selected
                    </Button>
                  </Flex>
                </div>
              )}
            </Box>
          </Card>
        </Tabs.Content>
      </Tabs.Root>

      {/* Task Details Modal */}
      <Dialog.Root open={taskDetailsOpen} onOpenChange={setTaskDetailsOpen}>
        <Dialog.Content style={{ maxWidth: '600px' }}>
          <Dialog.Title>Task Details</Dialog.Title>
          {selectedTask && (
            <div className="space-y-4">
              <Box>
                <Text size="2" weight="medium" color="gray">Title</Text>
                <Text size="3">{selectedTask.title}</Text>
              </Box>
              
                  <Box>
                <Text size="2" weight="medium" color="gray">Description</Text>
                <Text size="2">{selectedTask.description || 'No description'}</Text>
                  </Box>
                  
              <Flex gap="4">
                <Box>
                  <Text size="2" weight="medium" color="gray">Category</Text>
                  <Badge variant="soft" color="blue">
                    {selectedTask.categoryInfo?.name || selectedTask.category?.name || selectedTask.category}
                  </Badge>
                </Box>
                <Box>
                  <Text size="2" weight="medium" color="gray">Status</Text>
                  <Badge color={getStatusColor(selectedTask.status)}>{selectedTask.status}</Badge>
                </Box>
                <Box>
                  <Text size="2" weight="medium" color="gray">Points</Text>
                  <Text size="2">{selectedTask.pointValue}</Text>
                    </Box>
              </Flex>
              
              <Box>
                <Text size="2" weight="medium" color="gray">Assignment Strategy</Text>
                <Flex align="center" gap="2">
                  {getStrategyIcon(selectedTask.assignmentStrategy)}
                  <Text size="2">{getStrategyLabel(selectedTask.assignmentStrategy)}</Text>
                </Flex>
              </Box>
              
              {selectedTask.dueDate && (
                <Box>
                  <Text size="2" weight="medium" color="gray">Due Date</Text>
                  <Text size="2">{format(new Date(selectedTask.dueDate), 'PPP')}</Text>
                </Box>
              )}
              
              <Box>
                <Text size="2" weight="medium" color="gray">Created</Text>
                <Text size="2">{format(new Date(selectedTask.createdAt), 'PPP')}</Text>
              </Box>
            </div>
          )}
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">Close</Button>
            </Dialog.Close>
            {selectedTask && (
              <Button onClick={() => handleEditTask(selectedTask)}>
                <Edit size={16} />
                Edit Task
              </Button>
            )}
            </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Assignment Modal */}
      <Dialog.Root open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
        <Dialog.Content style={{ maxWidth: '500px' }}>
          <Dialog.Title>Assign Task</Dialog.Title>
          <div className="space-y-4">
            <Text size="2" color="gray">
              Assign "{selectedTask?.title}" to students
            </Text>
            
            <Box>
              <Text size="2" weight="medium" mb="2">Student IDs (comma-separated)</Text>
              <TextArea
                placeholder="Enter student IDs separated by commas"
                value={assignmentData.studentIds.join(', ')}
                onChange={(e) => setAssignmentData(prev => ({
                  ...prev,
                  studentIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                }))}
              />
            </Box>
            
            <Box>
              <Text size="2" weight="medium" mb="2">School ID (optional)</Text>
              <TextField.Root
                placeholder="School ID"
                value={assignmentData.schoolId}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, schoolId: e.target.value }))}
              />
            </Box>
            
            <Box>
              <Text size="2" weight="medium" mb="2">Class ID (optional)</Text>
              <TextField.Root
                placeholder="Class ID"
                value={assignmentData.classId}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, classId: e.target.value }))}
              />
            </Box>
          </div>
          
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleSubmitAssignment} disabled={assignmentData.studentIds.length === 0}>
              Assign Task
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Visibility Control Modal */}
      <Dialog.Root open={visibilityModalOpen} onOpenChange={setVisibilityModalOpen}>
        <Dialog.Content style={{ maxWidth: '500px' }}>
          <Dialog.Title>Set Visibility Control</Dialog.Title>
          <div className="space-y-4">
                  <Text size="2" color="gray">
              Control who can see "{selectedTask?.title}"
                  </Text>
            
            <Box>
              <Text size="2" weight="medium" mb="2">Controller Type</Text>
              <Select.Root 
                value={visibilityData.controllerType} 
                onValueChange={(value) => setVisibilityData(prev => ({ ...prev, controllerType: value }))}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="parent">Parent</Select.Item>
                  <Select.Item value="school">School</Select.Item>
                  <Select.Item value="class">Class</Select.Item>
                </Select.Content>
              </Select.Root>
              </Box>
            
            <Box>
              <Text size="2" weight="medium" mb="2">Controller ID</Text>
              <TextField.Root
                placeholder="Enter parent/school/class ID"
                value={visibilityData.controllerId}
                onChange={(e) => setVisibilityData(prev => ({ ...prev, controllerId: e.target.value }))}
              />
        </Box>
            
            <Box>
              <Text size="2" weight="medium" mb="2">Student IDs (comma-separated)</Text>
              <TextArea
                placeholder="Enter student IDs separated by commas"
                value={visibilityData.studentIds.join(', ')}
                onChange={(e) => setVisibilityData(prev => ({
                  ...prev,
                  studentIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                }))}
              />
            </Box>
            
            <Flex align="center" gap="2">
              <Switch
                checked={visibilityData.isVisible}
                onCheckedChange={(checked) => setVisibilityData(prev => ({ ...prev, isVisible: checked }))}
              />
              <Text size="2">Task is visible</Text>
            </Flex>
            
            <Box>
              <Text size="2" weight="medium" mb="2">Reason (optional)</Text>
              <TextArea
                placeholder="Reason for visibility change"
                value={visibilityData.reason}
                onChange={(e) => setVisibilityData(prev => ({ ...prev, reason: e.target.value }))}
              />
            </Box>
          </div>
          
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleSubmitVisibility}>
              Set Visibility
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}

export default Tasks
