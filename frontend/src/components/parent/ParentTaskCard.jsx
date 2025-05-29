import React, { useState } from 'react';
import { Card, Flex, Box, Text, Badge, Button, Switch } from '@radix-ui/themes';
import { 
  Clock, 
  Star, 
  CheckCircle, 
  Circle, 
  Calendar,
  Award,
  Eye,
  EyeOff,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router';

const ParentTaskCard = ({ 
  task, 
  assignment, 
  visibilityReason, 
  child, 
  onVisibilityToggle, 
  isLoading 
}) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'blue';
      case 'overdue':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Circle size={16} />;
      case 'overdue':
        return <AlertTriangle size={16} />;
      default:
        return <Circle size={16} />;
    }
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

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'red', urgent: true };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'orange', urgent: true };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'yellow', urgent: true };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: 'blue', urgent: false };
    } else {
      return { text: date.toLocaleDateString(), color: 'gray', urgent: false };
    }
  };

  const dueInfo = formatDueDate(task.dueDate);
  const isOverdue = assignment.status === 'pending' && task.dueDate && new Date(task.dueDate) < new Date();
  const isCompleted = assignment.status === 'completed';
  const isVisible = visibilityReason !== 'Hidden by parent';

  const handleVisibilityChange = (checked) => {
    const reason = checked 
      ? 'Made visible by parent' 
      : 'Hidden by parent for focus/appropriateness';
    
    onVisibilityToggle(task._id, checked, reason);
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on controls
    if (e.target.closest('.visibility-controls')) return;
    navigate(`/parent/tasks/${task._id}?child=${child.id}`);
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        !isVisible ? 'border-red-200 bg-red-50 opacity-75' :
        isOverdue ? 'border-orange-200 bg-orange-50' : 
        isCompleted ? 'border-green-200 bg-green-50' : 
        'border-gray-200 hover:border-purple-200'
      }`}
    >
      <Box className="p-4">
        {/* Header */}
        <Flex align="start" justify="between" className="mb-3">
          <Box className="flex-1 min-w-0">
            <Flex align="center" gap="2" className="mb-1">
              <Badge 
                color={getCategoryColor(task.category)} 
                size="1"
                className="capitalize"
              >
                {task.category}
              </Badge>
              {task.pointValue >= 20 && (
                <Badge color="yellow" size="1">
                  <Star size={12} />
                  High Value
                </Badge>
              )}
              {!isVisible && (
                <Badge color="red" size="1">
                  <EyeOff size={12} />
                  Hidden
                </Badge>
              )}
            </Flex>
            
            <Text 
              size="4" 
              weight="medium" 
              className={`text-gray-900 line-clamp-2 cursor-pointer hover:text-purple-700 ${
                !isVisible ? 'opacity-75' : ''
              }`}
              onClick={handleCardClick}
            >
              {task.title}
            </Text>
            
            <Text size="2" className={`text-gray-600 mt-1 line-clamp-2 ${!isVisible ? 'opacity-75' : ''}`}>
              {task.description}
            </Text>
          </Box>

          {/* Visibility Control */}
          <Box className="visibility-controls ml-3">
            <Flex direction="column" align="end" gap="2">
              <Badge color={getStatusColor(assignment.status)} size="2">
                {getStatusIcon(assignment.status)}
                <Text size="1" className="ml-1 capitalize">
                  {assignment.status}
                </Text>
              </Badge>
              
              <Flex align="center" gap="2">
                <Text size="1" className="text-gray-600">
                  {isVisible ? 'Visible' : 'Hidden'}
                </Text>
                <Switch
                  checked={isVisible}
                  onCheckedChange={handleVisibilityChange}
                  disabled={isLoading}
                  size="1"
                />
              </Flex>
            </Flex>
          </Box>
        </Flex>

        {/* Task Details */}
        <Flex align="center" justify="between" className={`mb-3 ${!isVisible ? 'opacity-75' : ''}`}>
          <Flex align="center" gap="4">
            {/* Points */}
            <Flex align="center" gap="1">
              <Award size={14} className="text-purple-600" />
              <Text size="2" weight="medium" className="text-purple-600">
                {task.pointValue} pts
              </Text>
            </Flex>

            {/* Due Date */}
            {dueInfo && (
              <Flex align="center" gap="1">
                <Calendar size={14} className={`text-${dueInfo.color}-600`} />
                <Text 
                  size="2" 
                  className={`text-${dueInfo.color}-600 ${dueInfo.urgent ? 'font-medium' : ''}`}
                >
                  {dueInfo.text}
                </Text>
              </Flex>
            )}
          </Flex>

          <Button
            variant="ghost"
            size="1"
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400"
          >
            <MoreHorizontal size={16} />
          </Button>
        </Flex>

        {/* Visibility Status */}
        <Box className="mb-3">
          <Flex align="center" gap="2">
            {isVisible ? (
              <Eye size={14} className="text-green-600" />
            ) : (
              <EyeOff size={14} className="text-red-600" />
            )}
            <Text size="1" className={isVisible ? 'text-green-700' : 'text-red-700'}>
              {visibilityReason || (isVisible ? 'Visible to child' : 'Hidden from child')}
            </Text>
          </Flex>
        </Box>

        {/* Assignment Info */}
        <Flex align="center" justify="between" className={`text-xs text-gray-500 ${!isVisible ? 'opacity-75' : ''}`}>
          <Text size="1">
            Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
          </Text>
          {assignment.completedAt && (
            <Text size="1" className="text-green-600">
              Completed {new Date(assignment.completedAt).toLocaleDateString()}
            </Text>
          )}
        </Flex>

        {/* Expanded Details */}
        {showDetails && (
          <Box className="mt-3 pt-3 border-t border-gray-200">
            <Box className="space-y-2">
              <Flex align="center" justify="between">
                <Text size="1" className="text-gray-600">Assignment Source:</Text>
                <Text size="1" className="capitalize">{assignment.source}</Text>
              </Flex>
              <Flex align="center" justify="between">
                <Text size="1" className="text-gray-600">Assigned By:</Text>
                <Text size="1">{assignment.assignedBy}</Text>
              </Flex>
              {task.attachments && task.attachments.length > 0 && (
                <Flex align="center" justify="between">
                  <Text size="1" className="text-gray-600">Attachments:</Text>
                  <Text size="1">{task.attachments.length} file(s)</Text>
                </Flex>
              )}
            </Box>
          </Box>
        )}

        {/* Parent Control Info */}
        <Box className="mt-3 p-2 bg-blue-50 rounded-md">
          <Text size="1" className="text-blue-700">
            💡 You can control whether {child.name} sees this task. Hidden tasks won't appear in their task list.
          </Text>
        </Box>
      </Box>
    </Card>
  );
};

export default ParentTaskCard; 