import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  Badge,
  Tabs,
  TextField,
  Select,
  Separator
} from '@radix-ui/themes'
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  CheckCircle, 
  Circle, 
  Calendar,
  Target,
  Award,
  BookOpen,
  Home,
  Users,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../../Context/AuthContext'
import { useStudentTasks } from '../../api/task/taskManagement.mutations'
import { useTaskCategories } from '../../api/task/taskCategory.mutations'
import MobileLayout from '../../components/layout/MobileLayout'

const Tasks = () => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    pointValue: '',
    dueDate: '',
    assignmentStrategy: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Debug: Log user info
  useEffect(() => {
    console.log('Current user:', user)
    console.log('User ID:', user?.id)
    console.log('User role:', user?.role)
  }, [user])

  // Fetch student tasks
  const { 
    data: tasksData, 
    isLoading, 
    error,
    refetch 
  } = useStudentTasks(user?.id, {
    ...filters,
    status: activeTab === 'all' ? '' : activeTab,
    page: 1,
    limit: 50
  })

  // Debug: Log API response
  useEffect(() => {
    console.log('Tasks API response:', tasksData)
    console.log('Tasks loading:', isLoading)
    console.log('Tasks error:', error)
  }, [tasksData, isLoading, error])

  // Fetch categories for filtering
  const { data: categoriesData } = useTaskCategories()

  const tasks = tasksData?.data?.tasks || []
  const categories = categoriesData?.data || []

  // Debug: Log processed data
  useEffect(() => {
    console.log('Processed tasks:', tasks)
    console.log('Categories:', categories)
  }, [tasks, categories])

  // Filter tasks based on search query and active tab
  const filteredTasks = tasks.filter(taskItem => {
    const task = taskItem.task
    const assignment = taskItem.assignment
    const searchLower = searchQuery.toLowerCase()
    
    // Search filter
    const matchesSearch = (
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      task.subCategory?.toLowerCase().includes(searchLower)
    )
    
    // Tab filter
    let matchesTab = true
    if (activeTab === 'pending') {
      matchesTab = assignment?.status === 'pending'
    } else if (activeTab === 'completed') {
      matchesTab = assignment?.status === 'completed'
    } else if (activeTab === 'overdue') {
      matchesTab = task.dueDate && new Date(task.dueDate) < new Date() && assignment?.status === 'pending'
    } else if (activeTab === 'featured') {
      matchesTab = task.isFeatured || task.pointValue >= 20
    }
    
    return matchesSearch && matchesTab
  })

  // Get tab counts
  const getTabCounts = () => {
    const counts = {
      all: tasks.length,
      pending: tasks.filter(t => t.assignment?.status === 'pending').length,
      completed: tasks.filter(t => t.assignment?.status === 'completed').length,
      overdue: tasks.filter(t => {
        if (!t.task.dueDate || t.assignment?.status !== 'pending') return false
        return new Date(t.task.dueDate) < new Date()
      }).length,
      featured: tasks.filter(t => t.task.isFeatured || t.task.pointValue >= 20).length
    }
    return counts
  }

  const tabCounts = getTabCounts()

  // Get featured tasks
  const featuredTasks = tasks.filter(taskItem => 
    taskItem.task.isFeatured || 
    taskItem.task.pointValue >= 20 ||
    (taskItem.task.dueDate && new Date(taskItem.task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000))
  ).slice(0, 3)

  // Get category color
  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c._id === categoryId)
    if (!category) return 'gray'
    
    switch (category.type) {
      case 'academic': return 'blue'
      case 'home': return 'green'
      case 'behavior': return 'purple'
      case 'extracurricular': return 'orange'
      case 'attendance': return 'red'
      default: return 'gray'
    }
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'green'
      case 'medium': return 'yellow'
      case 'hard': return 'orange'
      case 'challenging': return 'red'
      default: return 'gray'
    }
  }

  // Get assignment strategy badge
  const getAssignmentStrategyBadge = (strategy) => {
    switch (strategy) {
      case 'specific': return { label: 'Personal', color: 'purple' }
      case 'role_based': return { label: 'Role-based', color: 'blue' }
      case 'school_based': return { label: 'School-wide', color: 'green' }
      case 'global': return { label: 'Global', color: 'orange' }
      default: return { label: 'Standard', color: 'gray' }
    }
  }

  // Format due date
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    const now = new Date()
    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: 'Overdue', color: 'red' }
    if (diffDays === 0) return { text: 'Due today', color: 'orange' }
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'yellow' }
    if (diffDays <= 7) return { text: `Due in ${diffDays} days`, color: 'blue' }
    return { text: date.toLocaleDateString(), color: 'gray' }
  }

  // Task Card Component
  const TaskCard = ({ taskItem }) => {
    const { task, assignment, visibilityReason } = taskItem
    const dueInfo = formatDueDate(task.dueDate)
    const strategyBadge = getAssignmentStrategyBadge(task.assignmentStrategy)
    const category = categories.find(c => c._id === task.category)

    return (
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <Flex direction="column" gap="3">
          {/* Header */}
          <Flex align="center" justify="between">
            <Flex align="center" gap="2">
              <Box>
                {assignment?.status === 'completed' ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <Circle size={20} className="text-gray-400" />
                )}
              </Box>
              <Box>
                <Text size="3" weight="medium" className="text-gray-900">
                  {task.title}
                </Text>
                {task.subCategory && (
                  <Text size="1" color="gray">
                    {task.subCategory}
                  </Text>
                )}
              </Box>
            </Flex>
            <Flex align="center" gap="2">
              <Badge color={getCategoryColor(task.category)} variant="soft">
                {category?.name || 'Unknown'}
              </Badge>
              {task.pointValue && (
                <Badge color="gold" variant="soft">
                  {task.pointValue} pts
                </Badge>
              )}
            </Flex>
          </Flex>

          {/* Description */}
          {task.description && (
            <Text size="2" color="gray" className="line-clamp-2">
              {task.description}
            </Text>
          )}

          {/* Metadata */}
          <Flex align="center" justify="between" wrap="wrap" gap="2">
            <Flex align="center" gap="3">
              <Badge color={getDifficultyColor(task.difficulty)} variant="soft" size="1">
                {task.difficulty}
              </Badge>
              <Badge color={strategyBadge.color} variant="soft" size="1">
                {strategyBadge.label}
              </Badge>
              {task.requiresApproval && (
                <Badge color="purple" variant="soft" size="1">
                  Needs approval
                </Badge>
              )}
            </Flex>
            
            {dueInfo && (
              <Flex align="center" gap="1">
                <Clock size={12} />
                <Text size="1" color={dueInfo.color}>
                  {dueInfo.text}
                </Text>
              </Flex>
            )}
          </Flex>

          {/* Visibility reason */}
          {visibilityReason && (
            <Box>
              <Text size="1" color="gray">
                Visible: {visibilityReason}
              </Text>
            </Box>
          )}

          {/* Assignment status */}
          <Flex align="center" justify="between">
            <Text size="1" color="gray">
              Status: {assignment?.status || 'Not started'}
            </Text>
            {assignment?.completedAt && (
              <Text size="1" color="green">
                Completed {new Date(assignment.completedAt).toLocaleDateString()}
              </Text>
            )}
          </Flex>
        </Flex>
      </Card>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <MobileLayout userType="student">
        <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="p-6">
            <Flex direction="column" align="center" gap="3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <Text>Loading your tasks...</Text>
            </Flex>
          </Card>
        </Box>
      </MobileLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <MobileLayout userType="student">
        <Box className="min-h-screen bg-gray-50 p-4">
          <Card className="p-6 text-center max-w-md mx-auto mt-20">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <Text size="4" weight="medium" className="text-gray-900 mb-2">
              Failed to load tasks
            </Text>
            <Text size="2" color="gray" className="mb-4">
              {error?.message || 'Something went wrong. Please try again.'}
            </Text>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
            
            {/* Debug information */}
            <Box className="mt-4 p-3 bg-gray-100 rounded text-left">
              <Text size="1" color="gray">
                Debug Info:
              </Text>
              <Text size="1" color="gray">
                User ID: {user?.id || 'Not found'}
              </Text>
              <Text size="1" color="gray">
                Error: {error?.message || 'Unknown error'}
              </Text>
            </Box>
          </Card>
        </Box>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout userType="student">
      <Box className="min-h-screen bg-gray-50">
        {/* Header */}
        <Box className="bg-white border-b border-gray-200 px-4 py-6">
          <Flex direction="column" gap="4">
            <Flex align="center" justify="between">
              <Box>
                <Heading size="6" weight="medium" className="text-gray-900">
                  My Tasks
                </Heading>
                <Text size="3" color="gray" className="mt-1">
                  {tasks.length} tasks assigned to you
                </Text>
              </Box>
              <Flex gap="2">
                <Button
                  variant="outline"
                  size="2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={16} />
                  Filters
                </Button>
              </Flex>
            </Flex>

            {/* Search Bar */}
            <Box className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <TextField.Root
                placeholder="Search tasks by title, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
                size="3"
              />
            </Box>
          </Flex>
        </Box>

        {/* Debug Information */}
        {tasks.length === 0 && !isLoading && (
          <Box className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
            <Text size="2" color="gray">
              Debug: User ID: {user?.id} | Role: {user?.role} | API Response: {JSON.stringify(tasksData)}
            </Text>
          </Box>
        )}

        {/* Filters */}
        {showFilters && (
          <Box className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Box>
                <Text size="2" weight="medium" mb="2">Category</Text>
                <Select.Root 
                  value={filters.category} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <Select.Trigger placeholder="All categories" />
                  <Select.Content>
                    <Select.Item value="">All categories</Select.Item>
                    {categories.map((category) => (
                      <Select.Item key={category._id} value={category._id}>
                        {category.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text size="2" weight="medium" mb="2">Difficulty</Text>
                <Select.Root 
                  value={filters.difficulty} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
                >
                  <Select.Trigger placeholder="All difficulties" />
                  <Select.Content>
                    <Select.Item value="">All difficulties</Select.Item>
                    <Select.Item value="easy">Easy</Select.Item>
                    <Select.Item value="medium">Medium</Select.Item>
                    <Select.Item value="hard">Hard</Select.Item>
                    <Select.Item value="challenging">Challenging</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text size="2" weight="medium" mb="2">Points</Text>
                <Select.Root 
                  value={filters.pointValue} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, pointValue: value }))}
                >
                  <Select.Trigger placeholder="All points" />
                  <Select.Content>
                    <Select.Item value="">All points</Select.Item>
                    <Select.Item value="1-10">1-10 points</Select.Item>
                    <Select.Item value="11-20">11-20 points</Select.Item>
                    <Select.Item value="21-50">21-50 points</Select.Item>
                    <Select.Item value="50+">50+ points</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text size="2" weight="medium" mb="2">Due Date</Text>
                <Select.Root 
                  value={filters.dueDate} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dueDate: value }))}
                >
                  <Select.Trigger placeholder="All dates" />
                  <Select.Content>
                    <Select.Item value="">All dates</Select.Item>
                    <Select.Item value="today">Due today</Select.Item>
                    <Select.Item value="tomorrow">Due tomorrow</Select.Item>
                    <Select.Item value="week">Due this week</Select.Item>
                    <Select.Item value="overdue">Overdue</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            </div>
          </Box>
        )}

        {/* Content */}
        <Box className="p-4 space-y-6">
          {/* Featured Tasks */}
          {featuredTasks.length > 0 && (
            <Box>
              <Flex align="center" gap="2" className="mb-4">
                <Star size={20} className="text-yellow-500" />
                <Text size="4" weight="medium">
                  Featured Tasks
                </Text>
              </Flex>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredTasks.map((taskItem) => (
                  <TaskCard key={taskItem.assignment?._id || taskItem.task._id} taskItem={taskItem} />
                ))}
              </div>
            </Box>
          )}

          {/* Task Tabs */}
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="grid grid-cols-5 w-full">
              <Tabs.Trigger value="all">
                <Flex align="center" gap="1">
                  <Text size="2">All</Text>
                  {tabCounts.all > 0 && (
                    <Badge size="1" variant="soft">
                      {tabCounts.all}
                    </Badge>
                  )}
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger value="pending">
                <Flex align="center" gap="1">
                  <Text size="2">Pending</Text>
                  {tabCounts.pending > 0 && (
                    <Badge size="1" color="blue" variant="soft">
                      {tabCounts.pending}
                    </Badge>
                  )}
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger value="completed">
                <Flex align="center" gap="1">
                  <Text size="2">Completed</Text>
                  {tabCounts.completed > 0 && (
                    <Badge size="1" color="green" variant="soft">
                      {tabCounts.completed}
                    </Badge>
                  )}
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger value="overdue">
                <Flex align="center" gap="1">
                  <Text size="2">Overdue</Text>
                  {tabCounts.overdue > 0 && (
                    <Badge size="1" color="red" variant="soft">
                      {tabCounts.overdue}
                    </Badge>
                  )}
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger value="featured">
                <Flex align="center" gap="1">
                  <Text size="2">Featured</Text>
                  {tabCounts.featured > 0 && (
                    <Badge size="1" color="gold" variant="soft">
                      {tabCounts.featured}
                    </Badge>
                  )}
                </Flex>
              </Tabs.Trigger>
            </Tabs.List>

            {/* Task List */}
            <Box className="mt-6">
              {filteredTasks.length === 0 ? (
                <Card className="p-8 text-center">
                  <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                  <Text size="4" weight="medium" className="text-gray-700 mb-2">
                    No tasks found
                  </Text>
                  <Text size="2" color="gray" className="mb-4">
                    {searchQuery 
                      ? "Try adjusting your search or filters"
                      : activeTab === 'all' 
                        ? "You don't have any tasks assigned yet"
                        : `No ${activeTab} tasks found`
                    }
                  </Text>
                  
                  {/* Debug button */}
                  <Button variant="outline" onClick={() => {
                    console.log('Debug - Refetching tasks...')
                    refetch()
                  }}>
                    Refresh Tasks
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map((taskItem) => (
                    <TaskCard key={taskItem.assignment?._id || taskItem.task._id} taskItem={taskItem} />
                  ))}
                </div>
              )}
            </Box>
          </Tabs.Root>
        </Box>
      </Box>
    </MobileLayout>
  )
}

export default Tasks 