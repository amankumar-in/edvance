import React from 'react';
import { Box, Card, Flex, Text, Button, Select, Badge } from '@radix-ui/themes';
import { X, Filter, RotateCcw } from 'lucide-react';

const TaskFilters = ({ filters, onFiltersChange, onClose }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: '',
      status: '',
      dueDate: '',
      pointValue: ''
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="mx-4 mb-4 border border-gray-200">
      <Box className="p-4">
        {/* Header */}
        <Flex align="center" justify="between" className="mb-4">
          <Flex align="center" gap="2">
            <Filter size={16} className="text-gray-600" />
            <Text size="3" weight="medium">
              Filters
            </Text>
            {activeFilterCount > 0 && (
              <Badge color="purple" size="1">
                {activeFilterCount}
              </Badge>
            )}
          </Flex>
          
          <Flex align="center" gap="2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="1"
                onClick={clearFilters}
                className="text-gray-500"
              >
                <RotateCcw size={14} />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="1"
              onClick={onClose}
              className="text-gray-500"
            >
              <X size={16} />
            </Button>
          </Flex>
        </Flex>

        {/* Filter Options */}
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category Filter */}
          <Box>
            <Text size="2" weight="medium" className="mb-2 block text-gray-700">
              Category
            </Text>
            <Select.Root
              value={filters.category || undefined}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder="All categories" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="academic">Academic</Select.Item>
                <Select.Item value="behavioral">Behavioral</Select.Item>
                <Select.Item value="extracurricular">Extracurricular</Select.Item>
                <Select.Item value="community">Community</Select.Item>
                <Select.Item value="personal">Personal</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>

          {/* Due Date Filter */}
          <Box>
            <Text size="2" weight="medium" className="mb-2 block text-gray-700">
              Due Date
            </Text>
            <Select.Root
              value={filters.dueDate || undefined}
              onValueChange={(value) => handleFilterChange('dueDate', value)}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Any time" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="today">Due today</Select.Item>
                <Select.Item value="tomorrow">Due tomorrow</Select.Item>
                <Select.Item value="this_week">This week</Select.Item>
                <Select.Item value="next_week">Next week</Select.Item>
                <Select.Item value="overdue">Overdue</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>

          {/* Point Value Filter */}
          <Box>
            <Text size="2" weight="medium" className="mb-2 block text-gray-700">
              Point Value
            </Text>
            <Select.Root
              value={filters.pointValue || undefined}
              onValueChange={(value) => handleFilterChange('pointValue', value)}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Any points" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="1-5">1-5 points</Select.Item>
                <Select.Item value="6-10">6-10 points</Select.Item>
                <Select.Item value="11-20">11-20 points</Select.Item>
                <Select.Item value="21+">21+ points</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>

          {/* Status Filter (if needed for additional filtering) */}
          <Box>
            <Text size="2" weight="medium" className="mb-2 block text-gray-700">
              Priority
            </Text>
            <Select.Root
              value={filters.priority || undefined}
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Any priority" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="high">High priority</Select.Item>
                <Select.Item value="medium">Medium priority</Select.Item>
                <Select.Item value="low">Low priority</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
        </Box>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <Box className="mt-4 pt-4 border-t border-gray-200">
            <Text size="2" weight="medium" className="mb-2 text-gray-700">
              Active Filters:
            </Text>
            <Flex gap="2" wrap="wrap">
              {filters.category && (
                <Badge color="blue" size="1">
                  Category: {filters.category}
                  <Button
                    variant="ghost"
                    size="1"
                    className="ml-1 p-0 h-auto"
                    onClick={() => handleFilterChange('category', '')}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              )}
              {filters.dueDate && (
                <Badge color="orange" size="1">
                  Due: {filters.dueDate.replace('_', ' ')}
                  <Button
                    variant="ghost"
                    size="1"
                    className="ml-1 p-0 h-auto"
                    onClick={() => handleFilterChange('dueDate', '')}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              )}
              {filters.pointValue && (
                <Badge color="purple" size="1">
                  Points: {filters.pointValue}
                  <Button
                    variant="ghost"
                    size="1"
                    className="ml-1 p-0 h-auto"
                    onClick={() => handleFilterChange('pointValue', '')}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              )}
              {filters.priority && (
                <Badge color="green" size="1">
                  Priority: {filters.priority}
                  <Button
                    variant="ghost"
                    size="1"
                    className="ml-1 p-0 h-auto"
                    onClick={() => handleFilterChange('priority', '')}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              )}
            </Flex>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default TaskFilters; 