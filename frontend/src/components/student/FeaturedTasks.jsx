import React from 'react';
import { Box, Card, Flex, Text, Badge } from '@radix-ui/themes';
import { Star, Award, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

const FeaturedTasks = ({ tasks }) => {
  const navigate = useNavigate();

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
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'red' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'orange' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'yellow' };
    } else {
      return { text: `${diffDays} days left`, color: 'blue' };
    }
  };

  const handleTaskClick = (taskId) => {
    navigate(`/student/tasks/${taskId}`);
  };

  return (
    <Box className="overflow-x-auto pb-2">
      <Flex gap="3" className="min-w-max">
        {tasks.map((taskItem) => {
          const dueInfo = formatDueDate(taskItem.task.dueDate);
          
          return (
            <Card
              key={taskItem.task._id}
              className="min-w-[280px] max-w-[280px] cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200"
              onClick={() => handleTaskClick(taskItem.task._id)}
            >
              <Box className="p-4">
                {/* Header with Star */}
                <Flex align="center" justify="between" className="mb-3">
                  <Badge color="yellow" size="2">
                    <Star size={12} />
                    Featured
                  </Badge>
                  <ArrowRight size={16} className="text-gray-400" />
                </Flex>

                {/* Task Title */}
                <Text size="4" weight="bold" className="text-gray-900 mb-2 line-clamp-2">
                  {taskItem.task.title}
                </Text>

                {/* Category */}
                <Badge 
                  color={getCategoryColor(taskItem.task.category)} 
                  size="1" 
                  className="mb-3 capitalize"
                >
                  {taskItem.task.category}
                </Badge>

                {/* Points and Due Date */}
                <Flex align="center" justify="between" className="mb-3">
                  <Flex align="center" gap="1">
                    <Award size={16} className="text-purple-600" />
                    <Text size="3" weight="bold" className="text-purple-600">
                      {taskItem.task.pointValue}
                    </Text>
                    <Text size="2" className="text-purple-600">
                      pts
                    </Text>
                  </Flex>

                  {dueInfo && (
                    <Flex align="center" gap="1">
                      <Calendar size={14} className={`text-${dueInfo.color}-600`} />
                      <Text size="2" className={`text-${dueInfo.color}-600 font-medium`}>
                        {dueInfo.text}
                      </Text>
                    </Flex>
                  )}
                </Flex>

                {/* Description */}
                <Text size="2" className="text-gray-600 line-clamp-2">
                  {taskItem.task.description}
                </Text>

                {/* Why Featured */}
                <Box className="mt-3 p-2 bg-yellow-50 rounded-md border border-yellow-200">
                  <Text size="1" className="text-yellow-800">
                    {taskItem.task.pointValue >= 20 ? (
                      <>⭐ High value task</>
                    ) : (
                      <>⏰ Due soon</>
                    )}
                  </Text>
                </Box>
              </Box>
            </Card>
          );
        })}
      </Flex>
    </Box>
  );
};

export default FeaturedTasks; 