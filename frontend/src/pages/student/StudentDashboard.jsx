import React from 'react';
import { Text, Card, Flex, Box, Progress, Badge, Button } from '@radix-ui/themes';
import { useAuth } from '../../Context/AuthContext';
import { Container } from '../../components';
import { useStudentTasks } from '../../api/task/taskManagement.mutations';
import { Link } from 'react-router';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Award, 
  ArrowRight,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';
import TaskCard from '../../components/student/TaskCard';
import Loader from '../../components/Loader';
import MobileLayout from '../../components/layout/MobileLayout';

function StudentDashboard() {
  const { user } = useAuth();
  
  // Get student tasks for dashboard overview
  const { 
    data: tasksData, 
    isLoading: tasksLoading,
    error: tasksError
  } = useStudentTasks(user?.id, {
    page: 1,
    limit: 10
  });

  const tasks = tasksData?.data?.tasks || [];
  
  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.assignment.status === 'pending').length,
    completed: tasks.filter(t => t.assignment.status === 'completed').length,
    overdue: tasks.filter(t => {
      const dueDate = new Date(t.task.dueDate);
      return dueDate < new Date() && t.assignment.status === 'pending';
    }).length,
    dueToday: tasks.filter(t => {
      if (!t.task.dueDate) return false;
      const dueDate = new Date(t.task.dueDate);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString() && t.assignment.status === 'pending';
    }).length
  };

  // Calculate total points earned
  const totalPoints = tasks
    .filter(t => t.assignment.status === 'completed')
    .reduce((sum, t) => sum + t.task.pointValue, 0);

  // Get recent tasks (pending, sorted by due date)
  const recentTasks = tasks
    .filter(t => t.assignment.status === 'pending')
    .sort((a, b) => {
      if (!a.task.dueDate) return 1;
      if (!b.task.dueDate) return -1;
      return new Date(a.task.dueDate) - new Date(b.task.dueDate);
    })
    .slice(0, 3);

  // Calculate completion rate
  const completionRate = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100) 
    : 0;

  // Show error state if there's an API error
  if (tasksError) {
    console.error('Tasks API Error:', tasksError);
  }

  return (
    <MobileLayout userType="student">
      <Container>
        <Box className="max-w-6xl mx-auto py-8 space-y-8">
          {/* Welcome Header */}
          <Box>
            <Text as="h1" size="8" weight="bold" color="indigo">
              Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
            </Text>
            <Text as="p" size="4" color="gray" className="mt-2">
              Here's your learning progress and upcoming tasks.
            </Text>
          </Box>

          {/* Quick Stats */}
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} wrap="wrap">
            <Card size="3" style={{ flex: 1, minWidth: '200px' }}>
              <Flex align="center" gap="3">
                <Box className="p-2 rounded-full bg-purple-100">
                  <Award className="text-purple-600" size={20} />
                </Box>
                <Box>
                  <Text as="div" size="5" weight="bold" color="purple">
                    {totalPoints}
                  </Text>
                  <Text as="div" size="2" color="gray">Points Earned</Text>
                </Box>
              </Flex>
            </Card>

            <Card size="3" style={{ flex: 1, minWidth: '200px' }}>
              <Flex align="center" gap="3">
                <Box className="p-2 rounded-full bg-orange-100">
                  <Clock className="text-orange-600" size={20} />
                </Box>
                <Box>
                  <Text as="div" size="5" weight="bold" color="orange">
                    {taskStats.dueToday}
                  </Text>
                  <Text as="div" size="2" color="gray">Due Today</Text>
                </Box>
              </Flex>
            </Card>

            <Card size="3" style={{ flex: 1, minWidth: '200px' }}>
              <Flex align="center" gap="3">
                <Box className="p-2 rounded-full bg-green-100">
                  <CheckCircle className="text-green-600" size={20} />
                </Box>
                <Box>
                  <Text as="div" size="5" weight="bold" color="green">
                    {taskStats.completed}
                  </Text>
                  <Text as="div" size="2" color="gray">Completed</Text>
                </Box>
              </Flex>
            </Card>

            <Card size="3" style={{ flex: 1, minWidth: '200px' }}>
              <Flex align="center" gap="3">
                <Box className="p-2 rounded-full bg-blue-100">
                  <Target className="text-blue-600" size={20} />
                </Box>
                <Box>
                  <Text as="div" size="5" weight="bold" color="blue">
                    {taskStats.pending}
                  </Text>
                  <Text as="div" size="2" color="gray">Pending</Text>
                </Box>
              </Flex>
            </Card>
          </Flex>

          {/* Progress Overview */}
          <Card size="4">
            <Flex align="center" justify="between" className="mb-4">
              <Flex align="center" gap="2">
                <TrendingUp size={20} className="text-green-600" />
                <Text size="4" weight="bold">Progress Overview</Text>
              </Flex>
              <Badge color="green" size="2">
                {completionRate}% Complete
              </Badge>
            </Flex>
            <Progress value={completionRate} max={100} color="green" size="3" className="mb-3" />
            <Flex justify="between" className="text-sm text-gray-600">
              <Text size="2">
                {taskStats.completed} of {taskStats.total} tasks completed
              </Text>
              {taskStats.overdue > 0 && (
                <Flex align="center" gap="1">
                  <AlertTriangle size={14} className="text-red-500" />
                  <Text size="2" color="red">
                    {taskStats.overdue} overdue
                  </Text>
                </Flex>
              )}
            </Flex>
          </Card>

          {/* Recent Tasks Section */}
          <Box>
            <Flex align="center" justify="between" className="mb-4">
              <Text size="5" weight="bold">
                Upcoming Tasks
              </Text>
              <Button asChild variant="outline" size="2">
                <Link to="/student/tasks">
                  View All Tasks
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            </Flex>

            {tasksLoading ? (
              <Card className="p-8 text-center">
                <Loader />
                <Text size="2" className="mt-4 text-gray-600">
                  Loading tasks...
                </Text>
              </Card>
            ) : recentTasks.length > 0 ? (
              <Box className="space-y-3">
                {recentTasks.map((taskItem) => (
                  <TaskCard
                    key={taskItem.task._id}
                    task={taskItem.task}
                    assignment={taskItem.assignment}
                    compact={true}
                  />
                ))}
              </Box>
            ) : (
              <Card className="p-8 text-center">
                <Calendar size={40} className="mx-auto text-gray-400 mb-3" />
                <Text size="3" weight="medium" className="text-gray-600">
                  No upcoming tasks
                </Text>
                <Text size="2" className="text-gray-500 mt-1">
                  You're all caught up! Check back later for new assignments.
                </Text>
              </Card>
            )}
          </Box>

          {/* Quick Actions */}
          <Card size="4">
            <Text size="4" weight="bold" className="mb-4">
              Quick Actions
            </Text>
            <Flex gap="3" wrap="wrap">
              <Button asChild size="3">
                <Link to="/student/tasks">
                  <Target size={16} />
                  View All Tasks
                </Link>
              </Button>
              <Button asChild variant="outline" size="3">
                <Link to="/student/rewards">
                  <Award size={16} />
                  Browse Rewards
                </Link>
              </Button>
              <Button asChild variant="outline" size="3">
                <Link to="/student/settings">
                  <Calendar size={16} />
                  Settings
                </Link>
              </Button>
            </Flex>
          </Card>
        </Box>
      </Container>
    </MobileLayout>
  );
}

export default StudentDashboard;
