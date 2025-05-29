import React from 'react';
import { Card, Flex, Box, Text, Badge, Button, Progress } from '@radix-ui/themes';
import { 
  Clock, 
  Star, 
  CheckCircle, 
  Circle, 
  Calendar,
  Award,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router';

const TaskCard = ({ task, assignment, visibilityReason, compact = false }) => {
  const navigate = useNavigate();

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

  const handleCardClick = () => {
    navigate(`/student/tasks/${task._id}`);
  };

  // Compact view for dashboard
  if (compact) {
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
          isOverdue ? 'border-red-200 bg-red-50' : 
          isCompleted ? 'border-green-200 bg-green-50' : 
          'border-gray-200 hover:border-purple-200'
        }`}
        onClick={handleCardClick}
        size="2"
      >
        <Flex align="center" justify="between" className="p-3">
          <Box className="flex-1 min-w-0">
            <Flex align="center" gap="2" className="mb-1">
              <Badge 
                color={getCategoryColor(task.category)} 
                size="1"
                className="capitalize"
              >
                {task.category}
              </Badge>
              <Badge color={getStatusColor(assignment.status)} size="1">
                {getStatusIcon(assignment.status)}
              </Badge>
            </Flex>
            
            <Text size="3" weight="medium" className="text-gray-900 line-clamp-1">
              {task.title}
            </Text>
            
            <Flex align="center" gap="3" className="mt-1">
              <Flex align="center" gap="1">
                <Award size={12} className="text-purple-600" />
                <Text size="1" className="text-purple-600">
                  {task.pointValue}
                </Text>
              </Flex>
              
              {dueInfo && (
                <Flex align="center" gap="1">
                  <Calendar size={12} className={`text-${dueInfo.color}-600`} />
                  <Text size="1" className={`text-${dueInfo.color}-600`}>
                    {dueInfo.text}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Box>

          <ArrowRight size={14} className="text-gray-400" />
        </Flex>
      </Card>
    );
  }

  // Full view for tasks page
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isOverdue ? 'border-red-200 bg-red-50' : 
        isCompleted ? 'border-green-200 bg-green-50' : 
        'border-gray-200 hover:border-purple-200'
      }`}
      onClick={handleCardClick}
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
                  Featured
                </Badge>
              )}
            </Flex>
            
            <Text size="4" weight="medium" className="text-gray-900 line-clamp-2">
              {task.title}
            </Text>
            
            <Text size="2" className="text-gray-600 mt-1 line-clamp-2">
              {task.description}
            </Text>
          </Box>

          <Flex direction="column" align="end" gap="1" className="ml-3">
            <Badge color={getStatusColor(assignment.status)} size="2">
              {getStatusIcon(assignment.status)}
              <Text size="1" className="ml-1 capitalize">
                {assignment.status}
              </Text>
            </Badge>
          </Flex>
        </Flex>

        {/* Task Details */}
        <Flex align="center" justify="between" className="mb-3">
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

          <ArrowRight size={16} className="text-gray-400" />
        </Flex>

        {/* Progress Bar (for partially completed tasks) */}
        {assignment.progress && assignment.progress > 0 && assignment.status !== 'completed' && (
          <Box className="mb-3">
            <Flex align="center" justify="between" className="mb-1">
              <Text size="1" className="text-gray-600">Progress</Text>
              <Text size="1" className="text-gray-600">{assignment.progress}%</Text>
            </Flex>
            <Progress value={assignment.progress} max={100} color="blue" size="1" />
          </Box>
        )}

        {/* Assignment Info */}
        <Flex align="center" justify="between" className="text-xs text-gray-500">
          <Text size="1">
            Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
          </Text>
          {assignment.completedAt && (
            <Text size="1" className="text-green-600">
              Completed {new Date(assignment.completedAt).toLocaleDateString()}
            </Text>
          )}
        </Flex>

        {/* Visibility Reason (if applicable) */}
        {visibilityReason && visibilityReason !== 'Direct visibility enabled' && (
          <Box className="mt-2 p-2 bg-blue-50 rounded-md">
            <Text size="1" className="text-blue-700">
              ℹ️ {visibilityReason}
            </Text>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default TaskCard; 