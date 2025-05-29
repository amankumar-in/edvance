import React, { useState } from 'react';
import {
  Dialog,
  Box,
  Flex,
  Text,
  Button,
  Badge,
  Card,
  Tabs,
  Table,
  Separator
} from '@radix-ui/themes';
import {
  Edit,
  Copy,
  Users,
  Eye,
  EyeOff,
  Calendar,
  Award,
  School,
  Globe,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const AdminTaskDetails = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onDuplicate
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!task) return null;

  const getStrategyIcon = (strategy) => {
    switch (strategy) {
      case 'specific':
        return <Users size={16} />;
      case 'role_based':
        return <Users size={16} />;
      case 'school_based':
        return <School size={16} />;
      case 'global':
        return <Globe size={16} />;
      default:
        return <Users size={16} />;
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mock data for assignments and visibility controls
  const mockAssignments = [
    {
      _id: '1',
      studentId: 'student1',
      studentName: 'John Doe',
      schoolName: 'Lincoln Elementary',
      assignedAt: new Date().toISOString(),
      isActive: true,
      source: 'role_based'
    },
    {
      _id: '2',
      studentId: 'student2',
      studentName: 'Jane Smith',
      schoolName: 'Lincoln Elementary',
      assignedAt: new Date().toISOString(),
      isActive: true,
      source: 'role_based'
    }
  ];

  const mockVisibilityControls = [
    {
      _id: '1',
      controllerType: 'parent',
      controllerId: 'parent1',
      controllerName: 'Mary Doe',
      isVisible: false,
      controlledStudentIds: ['student1'],
      reason: 'Child needs to focus on homework first',
      changedAt: new Date().toISOString()
    }
  ];

  const mockAnalytics = {
    totalAssignments: 25,
    activeAssignments: 23,
    completedTasks: 8,
    pendingTasks: 15,
    overdueTasks: 2,
    visibilityControls: {
      parentHidden: 3,
      schoolHidden: 1,
      totalVisible: 21
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
        <Dialog.Title>Task Details</Dialog.Title>
        
        <Box className="mt-4">
          {/* Header with actions */}
          <Flex align="center" justify="between" className="mb-6">
            <Box>
              <Text size="5" weight="bold" className="text-gray-900">
                {task.title}
              </Text>
              <Flex align="center" gap="2" className="mt-2">
                <Badge color={getCategoryColor(task.category)} size="2">
                  {task.category}
                </Badge>
                <Badge color={getStrategyColor(task.assignmentStrategy)} size="2">
                  <Flex align="center" gap="1">
                    {getStrategyIcon(task.assignmentStrategy)}
                    {task.assignmentStrategy.replace('_', ' ')}
                  </Flex>
                </Badge>
                <Badge color={task.isActive ? 'green' : 'gray'} size="2">
                  {task.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </Flex>
            </Box>
            
            <Flex gap="2">
              <Button variant="outline" size="2" onClick={() => onDuplicate(task)}>
                <Copy size={16} />
                Duplicate
              </Button>
              <Button size="2" onClick={() => onEdit(task)}>
                <Edit size={16} />
                Edit Task
              </Button>
            </Flex>
          </Flex>

          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="assignments">Assignments</Tabs.Trigger>
              <Tabs.Trigger value="visibility">Visibility Controls</Tabs.Trigger>
              <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
            </Tabs.List>

            <Box className="mt-4">
              <Tabs.Content value="overview">
                <Box className="space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <Box className="p-4">
                      <Text size="3" weight="medium" className="mb-4">
                        Basic Information
                      </Text>
                      
                      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Box>
                          <Text size="2" weight="medium" className="text-gray-600">
                            Description
                          </Text>
                          <Text size="2" className="mt-1">
                            {task.description}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text size="2" weight="medium" className="text-gray-600">
                            Point Value
                          </Text>
                          <Flex align="center" gap="1" className="mt-1">
                            <Award size={16} className="text-purple-600" />
                            <Text size="2" weight="medium">
                              {task.pointValue} points
                            </Text>
                          </Flex>
                        </Box>
                        
                        <Box>
                          <Text size="2" weight="medium" className="text-gray-600">
                            Due Date
                          </Text>
                          <Flex align="center" gap="1" className="mt-1">
                            <Calendar size={16} className="text-gray-500" />
                            <Text size="2">
                              {formatDate(task.dueDate)}
                            </Text>
                          </Flex>
                        </Box>
                        
                        <Box>
                          <Text size="2" weight="medium" className="text-gray-600">
                            Created
                          </Text>
                          <Text size="2" className="mt-1">
                            {formatDateTime(task.createdAt)}
                          </Text>
                        </Box>
                      </Box>
                      
                      {task.instructions && (
                        <Box className="mt-4">
                          <Text size="2" weight="medium" className="text-gray-600">
                            Instructions
                          </Text>
                          <Text size="2" className="mt-1">
                            {task.instructions}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </Card>

                  {/* Assignment Strategy Details */}
                  <Card>
                    <Box className="p-4">
                      <Text size="3" weight="medium" className="mb-4">
                        Assignment Strategy
                      </Text>
                      
                      <Box className="space-y-3">
                        <Flex align="center" gap="2">
                          {getStrategyIcon(task.assignmentStrategy)}
                          <Text size="2" weight="medium">
                            {task.assignmentStrategy.replace('_', ' ').toUpperCase()}
                          </Text>
                        </Flex>
                        
                        {task.targetCriteria && (
                          <Box className="pl-6">
                            {task.targetCriteria.gradeLevel && (
                              <Text size="2" className="text-gray-600">
                                Grade Level: {task.targetCriteria.gradeLevel}
                              </Text>
                            )}
                            {task.targetCriteria.roles && task.targetCriteria.roles.length > 0 && (
                              <Text size="2" className="text-gray-600">
                                Roles: {task.targetCriteria.roles.join(', ')}
                              </Text>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Card>

                  {/* Default Visibility Settings */}
                  <Card>
                    <Box className="p-4">
                      <Text size="3" weight="medium" className="mb-4">
                        Default Visibility Settings
                      </Text>
                      
                      <Box className="space-y-3">
                        <Flex align="center" justify="between" className="p-3 bg-gray-50 rounded">
                          <Text size="2">Parents can control visibility</Text>
                          {task.defaultVisibility?.forParents ? (
                            <Badge color="green" size="1">Enabled</Badge>
                          ) : (
                            <Badge color="gray" size="1">Disabled</Badge>
                          )}
                        </Flex>
                        
                        <Flex align="center" justify="between" className="p-3 bg-gray-50 rounded">
                          <Text size="2">Schools can control visibility</Text>
                          {task.defaultVisibility?.forSchools ? (
                            <Badge color="green" size="1">Enabled</Badge>
                          ) : (
                            <Badge color="gray" size="1">Disabled</Badge>
                          )}
                        </Flex>
                        
                        <Flex align="center" justify="between" className="p-3 bg-gray-50 rounded">
                          <Text size="2">Students can see directly</Text>
                          {task.defaultVisibility?.forStudents ? (
                            <Badge color="green" size="1">Enabled</Badge>
                          ) : (
                            <Badge color="gray" size="1">Disabled</Badge>
                          )}
                        </Flex>
                      </Box>
                    </Box>
                  </Card>
                </Box>
              </Tabs.Content>

              <Tabs.Content value="assignments">
                <Card>
                  <Box className="p-4">
                    <Flex align="center" justify="between" className="mb-4">
                      <Text size="3" weight="medium">
                        Task Assignments ({mockAssignments.length})
                      </Text>
                      <Button size="2">
                        <Users size={16} />
                        Manage Assignments
                      </Button>
                    </Flex>
                    
                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>School</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Assigned</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Source</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {mockAssignments.map((assignment) => (
                          <Table.Row key={assignment._id}>
                            <Table.Cell>
                              <Text size="2" weight="medium">
                                {assignment.studentName}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text size="2">
                                {assignment.schoolName}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text size="2">
                                {formatDateTime(assignment.assignedAt)}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge color={assignment.isActive ? 'green' : 'gray'} size="1">
                                {assignment.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge color="blue" size="1">
                                {assignment.source.replace('_', ' ')}
                              </Badge>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                </Card>
              </Tabs.Content>

              <Tabs.Content value="visibility">
                <Card>
                  <Box className="p-4">
                    <Flex align="center" justify="between" className="mb-4">
                      <Text size="3" weight="medium">
                        Visibility Controls ({mockVisibilityControls.length})
                      </Text>
                      <Button size="2">
                        <Eye size={16} />
                        Manage Visibility
                      </Button>
                    </Flex>
                    
                    {mockVisibilityControls.length > 0 ? (
                      <Table.Root>
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeaderCell>Controller</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Visibility</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Students Affected</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Reason</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Changed</Table.ColumnHeaderCell>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {mockVisibilityControls.map((control) => (
                            <Table.Row key={control._id}>
                              <Table.Cell>
                                <Text size="2" weight="medium">
                                  {control.controllerName}
                                </Text>
                              </Table.Cell>
                              <Table.Cell>
                                <Badge color="blue" size="1">
                                  {control.controllerType}
                                </Badge>
                              </Table.Cell>
                              <Table.Cell>
                                <Flex align="center" gap="1">
                                  {control.isVisible ? (
                                    <Eye size={14} className="text-green-600" />
                                  ) : (
                                    <EyeOff size={14} className="text-red-600" />
                                  )}
                                  <Badge color={control.isVisible ? 'green' : 'red'} size="1">
                                    {control.isVisible ? 'Visible' : 'Hidden'}
                                  </Badge>
                                </Flex>
                              </Table.Cell>
                              <Table.Cell>
                                <Text size="2">
                                  {control.controlledStudentIds.length} student(s)
                                </Text>
                              </Table.Cell>
                              <Table.Cell>
                                <Text size="2" className="max-w-xs truncate">
                                  {control.reason}
                                </Text>
                              </Table.Cell>
                              <Table.Cell>
                                <Text size="2">
                                  {formatDateTime(control.changedAt)}
                                </Text>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table.Root>
                    ) : (
                      <Box className="text-center py-8">
                        <Eye size={40} className="mx-auto text-gray-400 mb-3" />
                        <Text size="3" weight="medium" className="text-gray-600">
                          No visibility controls set
                        </Text>
                        <Text size="2" className="text-gray-500 mt-1">
                          All students can see this task based on default settings
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Tabs.Content>

              <Tabs.Content value="analytics">
                <Box className="space-y-6">
                  {/* Assignment Analytics */}
                  <Card>
                    <Box className="p-4">
                      <Text size="3" weight="medium" className="mb-4">
                        Assignment Analytics
                      </Text>
                      
                      <Box className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Box className="text-center p-3 bg-blue-50 rounded">
                          <Text size="4" weight="bold" className="text-blue-700">
                            {mockAnalytics.totalAssignments}
                          </Text>
                          <Text size="2" className="text-blue-600">
                            Total Assignments
                          </Text>
                        </Box>
                        
                        <Box className="text-center p-3 bg-green-50 rounded">
                          <Text size="4" weight="bold" className="text-green-700">
                            {mockAnalytics.activeAssignments}
                          </Text>
                          <Text size="2" className="text-green-600">
                            Active Assignments
                          </Text>
                        </Box>
                        
                        <Box className="text-center p-3 bg-purple-50 rounded">
                          <Text size="4" weight="bold" className="text-purple-700">
                            {mockAnalytics.completedTasks}
                          </Text>
                          <Text size="2" className="text-purple-600">
                            Completed
                          </Text>
                        </Box>
                        
                        <Box className="text-center p-3 bg-orange-50 rounded">
                          <Text size="4" weight="bold" className="text-orange-700">
                            {mockAnalytics.pendingTasks}
                          </Text>
                          <Text size="2" className="text-orange-600">
                            Pending
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                  </Card>

                  {/* Visibility Analytics */}
                  <Card>
                    <Box className="p-4">
                      <Text size="3" weight="medium" className="mb-4">
                        Visibility Analytics
                      </Text>
                      
                      <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Box className="text-center p-3 bg-red-50 rounded">
                          <Text size="4" weight="bold" className="text-red-700">
                            {mockAnalytics.visibilityControls.parentHidden}
                          </Text>
                          <Text size="2" className="text-red-600">
                            Hidden by Parents
                          </Text>
                        </Box>
                        
                        <Box className="text-center p-3 bg-yellow-50 rounded">
                          <Text size="4" weight="bold" className="text-yellow-700">
                            {mockAnalytics.visibilityControls.schoolHidden}
                          </Text>
                          <Text size="2" className="text-yellow-600">
                            Hidden by Schools
                          </Text>
                        </Box>
                        
                        <Box className="text-center p-3 bg-green-50 rounded">
                          <Text size="4" weight="bold" className="text-green-700">
                            {mockAnalytics.visibilityControls.totalVisible}
                          </Text>
                          <Text size="2" className="text-green-600">
                            Currently Visible
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                </Box>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Box>

        <Separator className="my-6" />

        <Flex gap="3" justify="end">
          <Button variant="soft" color="gray" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(task)}>
            <Edit size={16} />
            Edit Task
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default AdminTaskDetails; 