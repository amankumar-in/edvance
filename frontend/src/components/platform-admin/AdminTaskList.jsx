import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Flex, 
  Text, 
  Badge, 
  Button, 
  Table, 
  Select,
  TextField,
  DropdownMenu,
  AlertDialog
} from '@radix-ui/themes';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Copy, 
  Trash2,
  Users,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import Loader from '../Loader';
import EmptyStateCard from '../EmptyStateCard';

const AdminTaskList = ({ 
  tasks, 
  categories,
  isLoading, 
  pagination,
  filters,
  onFiltersChange,
  onEdit, 
  onDelete, 
  onView, 
  onDuplicate 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filtering
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Debounce search in real implementation
    handleFilterChange('search', query);
  };

  const handlePageChange = (newPage) => {
    onFiltersChange({
      ...filters,
      page: newPage
    });
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      try {
        await onDelete(taskToDelete._id);
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const getStrategyColor = (strategy) => {
    const colors = {
      specific: 'blue',
      role_based: 'green',
      school_based: 'orange',
      global: 'purple'
    };
    return colors[strategy] || 'gray';
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'blue',
      behavioral: 'green',
      extracurricular: 'purple',
      community: 'orange',
      personal: 'pink'
    };
    return colors[category] || 'gray';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <Box className="p-8 text-center">
          <Loader />
          <Text size="2" className="mt-4 text-gray-600">
            Loading tasks...
          </Text>
        </Box>
      </Card>
    );
  }

  return (
    <Box>
      {/* Filters and Search */}
      <Card className="mb-4">
        <Box className="p-4">
          <Flex align="center" justify="between" className="mb-4">
            <Text size="3" weight="medium">
              Task Management
            </Text>
            <Button
              variant="outline"
              size="2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
            </Button>
          </Flex>

          {/* Search */}
          <Box className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <TextField.Root
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full"
              size="3"
            />
          </Box>

          {/* Filter Controls */}
          {showFilters && (
            <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <Box>
                <Text size="2" weight="medium" className="mb-2 block">
                  Category
                </Text>
                <Select.Root
                  value={filters.category || "all"}
                  onValueChange={(value) => handleFilterChange('category', value === "all" ? "" : value)}
                >
                  <Select.Trigger className="w-full" placeholder="All categories" />
                  <Select.Content>
                    <Select.Item value="all">All categories</Select.Item>
                    {categories.map(cat => (
                      <Select.Item key={cat._id} value={cat.name}>
                        {cat.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text size="2" weight="medium" className="mb-2 block">
                  Assignment Strategy
                </Text>
                <Select.Root
                  value={filters.assignmentStrategy || "all"}
                  onValueChange={(value) => handleFilterChange('assignmentStrategy', value === "all" ? "" : value)}
                >
                  <Select.Trigger className="w-full" placeholder="All strategies" />
                  <Select.Content>
                    <Select.Item value="all">All strategies</Select.Item>
                    <Select.Item value="specific">Specific Students</Select.Item>
                    <Select.Item value="role_based">Role Based</Select.Item>
                    <Select.Item value="school_based">School Based</Select.Item>
                    <Select.Item value="global">Global</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text size="2" weight="medium" className="mb-2 block">
                  Status
                </Text>
                <Select.Root
                  value={filters.status || "all"}
                  onValueChange={(value) => handleFilterChange('status', value === "all" ? "" : value)}
                >
                  <Select.Trigger className="w-full" placeholder="All statuses" />
                  <Select.Content>
                    <Select.Item value="all">All statuses</Select.Item>
                    <Select.Item value="active">Active</Select.Item>
                    <Select.Item value="inactive">Inactive</Select.Item>
                    <Select.Item value="draft">Draft</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text size="2" weight="medium" className="mb-2 block">
                  Per Page
                </Text>
                <Select.Root
                  value={filters.limit.toString()}
                  onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
                >
                  <Select.Trigger className="w-full" />
                  <Select.Content>
                    <Select.Item value="5">5 per page</Select.Item>
                    <Select.Item value="10">10 per page</Select.Item>
                    <Select.Item value="20">20 per page</Select.Item>
                    <Select.Item value="50">50 per page</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            </Box>
          )}
        </Box>
      </Card>

      {/* Task Table */}
      {filteredTasks.length === 0 ? (
        <EmptyStateCard
          title="No tasks found"
          description="No tasks match your current filters. Try adjusting your search or filters."
          icon={<Users size={40} />}
        />
      ) : (
        <Card>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Task</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Strategy</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Points</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Due Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredTasks.map((task) => (
                <Table.Row key={task._id}>
                  <Table.Cell>
                    <Box>
                      <Text size="3" weight="medium" className="text-gray-900">
                        {task.title}
                      </Text>
                      <Text size="2" className="text-gray-600 mt-1 line-clamp-2">
                        {task.description}
                      </Text>
                    </Box>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={getCategoryColor(task.category)} size="2">
                      {task.category}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={getStrategyColor(task.assignmentStrategy)} size="2">
                      {task.assignmentStrategy.replace('_', ' ')}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex align="center" gap="1">
                      <Award size={14} className="text-purple-600" />
                      <Text size="2" weight="medium">
                        {task.pointValue}
                      </Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex align="center" gap="1">
                      <Calendar size={14} className="text-gray-500" />
                      <Text size="2">
                        {formatDate(task.dueDate)}
                      </Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2" className="text-gray-600">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <Button variant="ghost" size="1">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        <DropdownMenu.Item onClick={() => onView(task)}>
                          <Eye size={14} />
                          View Details
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => onEdit(task)}>
                          <Edit size={14} />
                          Edit Task
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => onDuplicate(task)}>
                          <Copy size={14} />
                          Duplicate
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item 
                          color="red" 
                          onClick={() => handleDeleteClick(task)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Box className="p-4 border-t border-gray-200">
              <Flex align="center" justify="between">
                <Text size="2" className="text-gray-600">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} tasks
                </Text>
                
                <Flex align="center" gap="2">
                  <Button
                    variant="outline"
                    size="2"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  
                  <Text size="2" className="px-3">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </Text>
                  
                  <Button
                    variant="outline"
                    size="2"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </Flex>
              </Flex>
            </Box>
          )}
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialog.Content>
          <AlertDialog.Title>Delete Task</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            All assignments and visibility controls for this task will also be removed.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="red" onClick={handleDeleteConfirm}>
                Delete Task
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
};

export default AdminTaskList; 