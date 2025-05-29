import React, { useState } from 'react';
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
  Switch,
  Separator
} from '@radix-ui/themes';
import {
  Search,
  Filter,
  Users,
  Eye,
  EyeOff,
  Settings,
  CheckCircle,
  Circle,
  Clock,
  Star,
  BookOpen,
  AlertCircle,
  ChevronDown,
  User,
  School,
  Target,
  Award
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useStudentTasks, useSetParentVisibilityControl } from '../../api/task/taskManagement.mutations';
import { useTaskCategories } from '../../api/task/taskCategory.mutations';
import { toast } from 'sonner';

const Tasks = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showVisibilityControls, setShowVisibilityControls] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    pointValue: '',
    dueDate: '',
    visibilityStatus: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock children data - in real app, this would come from user profile/API
  const children = [
    { id: '507f1f77bcf86cd799439011', name: 'Emma Johnson', grade: '5th Grade', age: 10 },
    { id: '507f1f77bcf86cd799439012', name: 'Alex Johnson', grade: '3rd Grade', age: 8 }
  ];

  // Get tasks for selected child
  const {
    data: tasksData,
    isLoading,
    error,
    refetch
  } = useStudentTasks(selectedChild?.id, {
    ...filters,
    status: activeTab === 'all' ? '' : activeTab,
    parentId: user?.id,
    page: 1,
    limit: 50
  }, {
    enabled: !!selectedChild
  });

  // Fetch categories for filtering
  const { data: categoriesData } = useTaskCategories();

  const setVisibilityMutation = useSetParentVisibilityControl();

  const tasks = tasksData?.data?.tasks || [];
  const categories = categoriesData?.data || [];

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(taskItem => {
    const task = taskItem.task;
    const searchLower = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      task.subCategory?.toLowerCase().includes(searchLower)
    );
  });

  // Get tab counts
  const getTabCounts = () => {
    const counts = {
      all: tasks.length,
      visible: tasks.filter(t => t.visibilityReason !== 'Hidden by parent').length,
      hidden: tasks.filter(t => t.visibilityReason === 'Hidden by parent').length,
      pending: tasks.filter(t => t.assignment?.status === 'pending' && t.visibilityReason !== 'Hidden by parent').length,
      completed: tasks.filter(t => t.assignment?.status === 'completed').length,
      featured: tasks.filter(t => (t.task.isFeatured || t.task.pointValue >= 20) && t.visibilityReason !== 'Hidden by parent').length
    };
    return counts;
  };

  const tabCounts = getTabCounts();

  // Get featured tasks
  const featuredTasks = tasks.filter(taskItem =>
    (taskItem.task.isFeatured ||
     taskItem.task.pointValue >= 20 ||
     (taskItem.task.dueDate && new Date(taskItem.task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000))) &&
    taskItem.visibilityReason !== 'Hidden by parent'
  ).slice(0, 3);

  // Get category color
  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    if (!category) return 'gray';
    
    switch (category.type) {
      case 'academic': return 'blue';
      case 'home': return 'green';
      case 'behavior': return 'purple';
      case 'extracurricular': return 'orange';
      case 'attendance': return 'red';
      default: return 'gray';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'yellow';
      case 'hard': return 'orange';
      case 'challenging': return 'red';
      default: return 'gray';
    }
  };

  // Get assignment strategy badge
  const getAssignmentStrategyBadge = (strategy) => {
    switch (strategy) {
      case 'specific': return { label: 'Personal', color: 'purple' };
      case 'role_based': return { label: 'Role-based', color: 'blue' };
      case 'school_based': return { label: 'School-wide', color: 'green' };
      case 'global': return { label: 'Global', color: 'orange' };
      default: return { label: 'Standard', color: 'gray' };
    }
  };

  // Format due date
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'red' };
    if (diffDays === 0) return { text: 'Due today', color: 'orange' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'yellow' };
    if (diffDays <= 7) return { text: `Due in ${diffDays} days`, color: 'blue' };
    return { text: date.toLocaleDateString(), color: 'gray' };
  };

  // Handle visibility toggle
  const handleVisibilityToggle = async (taskId, isVisible, reason) => {
    if (!selectedChild) return;

    try {
      await setVisibilityMutation.mutateAsync({
        taskId,
        parentId: user.id,
        childrenIds: [selectedChild.id],
        isVisible,
        reason
      });
      
      toast.success(
        isVisible 
          ? `Task made visible for ${selectedChild.name}` 
          : `Task hidden from ${selectedChild.name}`
      );
      
      refetch();
    } catch (error) {
      toast.error('Failed to update task visibility');
    }
  };

  // Child Selector Component
  const ChildSelector = ({ compact = false }) => {
    if (compact) {
      return (
        <Select.Root 
          value={selectedChild?.id || ''} 
          onValueChange={(value) => {
            const child = children.find(c => c.id === value);
            setSelectedChild(child);
          }}
        >
          <Select.Trigger className="min-w-[150px]">
            {selectedChild ? selectedChild.name : 'Select Child'}
          </Select.Trigger>
          <Select.Content>
            {children.map((child) => (
              <Select.Item key={child.id} value={child.id}>
                <Flex align="center" gap="2">
                  <User size={14} />
                  <Box>
                    <Text size="2" weight="medium">{child.name}</Text>
                    <Text size="1" color="gray">{child.grade}</Text>
                  </Box>
                </Flex>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map((child) => (
          <Card 
            key={child.id} 
            className={`p-4 cursor-pointer transition-all ${
              selectedChild?.id === child.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedChild(child)}
          >
            <Flex align="center" gap="3">
              <Box className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </Box>
              <Box>
                <Text size="3" weight="medium" className="text-gray-900">
                  {child.name}
                </Text>
                <Text size="2" color="gray">
                  {child.grade} • Age {child.age}
                </Text>
              </Box>
            </Flex>
          </Card>
        ))}
      </div>
    );
  };

  // Parent Task Card Component
  const ParentTaskCard = ({ taskItem }) => {
    const { task, assignment, visibilityReason } = taskItem;
    const dueInfo = formatDueDate(task.dueDate);
    const strategyBadge = getAssignmentStrategyBadge(task.assignmentStrategy);
    const category = categories.find(c => c._id === task.category);
    const isHidden = visibilityReason === 'Hidden by parent';
    const isVisible = visibilityReason !== 'Hidden by parent';

    return (
      <Card className={`p-4 transition-all ${isHidden ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'}`}>
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

          {/* Visibility Controls */}
          <Flex align="center" justify="between" className="pt-2 border-t border-gray-100">
            <Box>
              <Text size="1" color="gray">
                Visibility: {visibilityReason || 'Default'}
              </Text>
              <Text size="1" color="gray">
                Status: {assignment?.status || 'Not started'}
              </Text>
            </Box>
            
            <Flex align="center" gap="2">
              <Button
                variant="ghost"
                size="1"
                color={isVisible ? "green" : "gray"}
                onClick={() => handleVisibilityToggle(task._id, !isVisible, isVisible ? 'Hidden by parent' : 'Made visible by parent')}
                disabled={setVisibilityMutation.isPending}
              >
                {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                {isVisible ? 'Visible' : 'Hidden'}
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    );
  };

  // No child selected state
  if (!selectedChild) {
    return (
      <Box className="min-h-screen bg-gray-50">
        <Box className="p-4">
          <Heading size="6" weight="medium" className="text-gray-900 mb-6">
            Task Management
          </Heading>
          
          <Card className="p-6 mb-6">
            <Text size="4" weight="medium" className="text-gray-900 mb-4">
              Select a Child
            </Text>
            <Text size="2" color="gray" className="mb-6">
              Choose one of your children to view and manage their tasks
            </Text>
            <ChildSelector />
          </Card>
          
          <Card className="p-6 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <Text size="4" weight="medium" className="text-gray-700 mb-2">
              Manage Your Children's Tasks
            </Text>
            <Text size="2" color="gray">
              Control task visibility, monitor progress, and support your children's learning journey
            </Text>
          </Card>
        </Box>
      </Box>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <Flex direction="column" align="center" gap="3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <Text>Loading {selectedChild.name}'s tasks...</Text>
          </Flex>
        </Card>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
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
        </Card>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gray-50">
      {/* Header */}
      <Box className="bg-white border-b border-gray-200 px-4 py-6">
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between">
            <Box>
              <Heading size="6" weight="medium" className="text-gray-900">
                {selectedChild.name}'s Tasks
              </Heading>
              <Text size="3" color="gray" className="mt-1">
                {tasks.length} tasks assigned • {selectedChild.grade}
              </Text>
            </Box>
            
            <Flex gap="2">
              <Button
                variant="outline"
                size="2"
                onClick={() => setShowVisibilityControls(!showVisibilityControls)}
              >
                <Settings size={16} />
                Controls
              </Button>
              
              <ChildSelector compact />
              
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

      {/* Visibility Controls */}
      {showVisibilityControls && (
        <Box className="bg-blue-50 border-b border-blue-200 px-4 py-4">
          <Card className="p-4">
            <Text size="3" weight="medium" className="text-gray-900 mb-3">
              Visibility Controls for {selectedChild.name}
            </Text>
            <Text size="2" color="gray" className="mb-4">
              Control which tasks your child can see and work on. Hidden tasks won't appear in their task list.
            </Text>
            <Flex gap="4" wrap="wrap">
              <Button variant="outline" size="2">
                Hide All Academic Tasks
              </Button>
              <Button variant="outline" size="2">
                Show All Home Tasks
              </Button>
              <Button variant="outline" size="2">
                Hide Overdue Tasks
              </Button>
            </Flex>
          </Card>
        </Box>
      )}

      {/* Filters */}
      {showFilters && (
        <Box className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            <Box>
              <Text size="2" weight="medium" mb="2">Visibility</Text>
              <Select.Root 
                value={filters.visibilityStatus} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, visibilityStatus: value }))}
              >
                <Select.Trigger placeholder="All tasks" />
                <Select.Content>
                  <Select.Item value="">All tasks</Select.Item>
                  <Select.Item value="visible">Visible to child</Select.Item>
                  <Select.Item value="hidden">Hidden from child</Select.Item>
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
                Featured Tasks for {selectedChild.name}
              </Text>
            </Flex>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredTasks.map((taskItem) => (
                <ParentTaskCard key={taskItem.assignment?._id || taskItem.task._id} taskItem={taskItem} />
              ))}
            </div>
          </Box>
        )}

        {/* Task Tabs */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="grid grid-cols-6 w-full">
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
            <Tabs.Trigger value="visible">
              <Flex align="center" gap="1">
                <Text size="2">Visible</Text>
                {tabCounts.visible > 0 && (
                  <Badge size="1" color="green" variant="soft">
                    {tabCounts.visible}
                  </Badge>
                )}
              </Flex>
            </Tabs.Trigger>
            <Tabs.Trigger value="hidden">
              <Flex align="center" gap="1">
                <Text size="2">Hidden</Text>
                {tabCounts.hidden > 0 && (
                  <Badge size="1" color="gray" variant="soft">
                    {tabCounts.hidden}
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
                <Text size="2" color="gray">
                  {searchQuery 
                    ? "Try adjusting your search or filters"
                    : activeTab === 'all' 
                      ? `${selectedChild.name} doesn't have any tasks assigned yet`
                      : `No ${activeTab} tasks found for ${selectedChild.name}`
                  }
                </Text>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((taskItem) => (
                  <ParentTaskCard key={taskItem.assignment?._id || taskItem.task._id} taskItem={taskItem} />
                ))}
              </div>
            )}
          </Box>
        </Tabs.Root>
      </Box>
    </Box>
  );
};

export default Tasks; 