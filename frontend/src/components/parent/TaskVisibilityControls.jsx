import React, { useState } from 'react';
import { Box, Card, Flex, Text, Button, Checkbox, Badge, TextArea } from '@radix-ui/themes';
import { X, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';

const TaskVisibilityControls = ({ tasks, selectedChild, onBulkVisibilityChange, onClose }) => {
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTaskSelection = (taskId, checked) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTasks(new Set(tasks.map(t => t.task._id)));
    } else {
      setSelectedTasks(new Set());
    }
  };

  const handleBulkAction = async (isVisible) => {
    if (selectedTasks.size === 0) return;

    setIsLoading(true);
    try {
      const finalReason = reason || (isVisible ? 'Made visible by parent' : 'Hidden by parent');
      await onBulkVisibilityChange(Array.from(selectedTasks), isVisible, finalReason);
      setSelectedTasks(new Set());
      setReason('');
    } finally {
      setIsLoading(false);
    }
  };

  const visibleTasks = tasks.filter(t => t.visibilityReason !== 'Hidden by parent');
  const hiddenTasks = tasks.filter(t => t.visibilityReason === 'Hidden by parent');
  const selectedCount = selectedTasks.size;
  const allSelected = selectedCount === tasks.length && tasks.length > 0;
  const someSelected = selectedCount > 0 && selectedCount < tasks.length;

  return (
    <Card className="mx-4 mb-4 border border-purple-200 bg-purple-50">
      <Box className="p-4">
        {/* Header */}
        <Flex align="center" justify="between" className="mb-4">
          <Box>
            <Text size="3" weight="medium" className="text-purple-900">
              Bulk Visibility Controls
            </Text>
            <Text size="2" className="text-purple-700 mt-1">
              Manage multiple tasks for {selectedChild.name}
            </Text>
          </Box>
          
          <Button
            variant="ghost"
            size="1"
            onClick={onClose}
            className="text-purple-600"
          >
            <X size={16} />
          </Button>
        </Flex>

        {/* Statistics */}
        <Flex gap="4" className="mb-4">
          <Box>
            <Text size="2" weight="bold" className="text-green-700">
              {visibleTasks.length}
            </Text>
            <Text size="1" className="text-green-600 ml-1">Visible</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold" className="text-red-700">
              {hiddenTasks.length}
            </Text>
            <Text size="1" className="text-red-600 ml-1">Hidden</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold" className="text-purple-700">
              {selectedCount}
            </Text>
            <Text size="1" className="text-purple-600 ml-1">Selected</Text>
          </Box>
        </Flex>

        {/* Select All */}
        <Flex align="center" gap="2" className="mb-4 p-2 bg-white rounded border">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            indeterminate={someSelected}
          />
          <Text size="2" weight="medium">
            {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All Tasks'}
          </Text>
          {selectedCount > 0 && (
            <Badge color="purple" size="1">
              {selectedCount} selected
            </Badge>
          )}
        </Flex>

        {/* Task List */}
        <Box className="max-h-60 overflow-y-auto mb-4 space-y-2">
          {tasks.map((taskItem) => {
            const isVisible = taskItem.visibilityReason !== 'Hidden by parent';
            const isSelected = selectedTasks.has(taskItem.task._id);
            
            return (
              <Box
                key={taskItem.task._id}
                className={`p-3 bg-white rounded border transition-all ${
                  isSelected ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <Flex align="center" gap="3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleTaskSelection(taskItem.task._id, checked)}
                  />
                  
                  <Box className="flex-1 min-w-0">
                    <Flex align="center" gap="2" className="mb-1">
                      <Text size="2" weight="medium" className="truncate">
                        {taskItem.task.title}
                      </Text>
                      <Badge 
                        color={isVisible ? 'green' : 'red'} 
                        size="1"
                      >
                        {isVisible ? (
                          <>
                            <Eye size={10} />
                            Visible
                          </>
                        ) : (
                          <>
                            <EyeOff size={10} />
                            Hidden
                          </>
                        )}
                      </Badge>
                    </Flex>
                    <Text size="1" className="text-gray-600 truncate">
                      {taskItem.task.category} • {taskItem.task.pointValue} pts
                    </Text>
                  </Box>
                </Flex>
              </Box>
            );
          })}
        </Box>

        {/* Reason Input */}
        <Box className="mb-4">
          <Text size="2" weight="medium" className="mb-2 text-purple-900">
            Reason (Optional)
          </Text>
          <TextArea
            placeholder="Why are you changing visibility for these tasks?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full"
          />
        </Box>

        {/* Action Buttons */}
        <Flex gap="2" justify="end">
          <Button
            variant="outline"
            size="2"
            onClick={() => handleBulkAction(true)}
            disabled={selectedCount === 0 || isLoading}
          >
            <Eye size={16} />
            Make Visible ({selectedCount})
          </Button>
          
          <Button
            variant="outline"
            size="2"
            onClick={() => handleBulkAction(false)}
            disabled={selectedCount === 0 || isLoading}
            color="red"
          >
            <EyeOff size={16} />
            Hide ({selectedCount})
          </Button>
        </Flex>

        {/* Help Text */}
        <Box className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <Text size="1" className="text-blue-700">
            💡 <strong>Tip:</strong> Hidden tasks won't appear in {selectedChild.name}'s task list. 
            You can always make them visible again later. Use this to help your child focus on 
            age-appropriate or priority tasks.
          </Text>
        </Box>
      </Box>
    </Card>
  );
};

export default TaskVisibilityControls; 