import React, { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Select,
  Separator,
  Text,
  Badge,
  Switch,
  Tabs,
  Callout,
  Code,
  Strong,
  Em
} from '@radix-ui/themes'
import { 
  ArrowLeft, 
  Info, 
  Users, 
  School, 
  Globe, 
  Eye,
  EyeOff,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  BookOpen,
  Lightbulb
} from 'lucide-react'
import { Link } from 'react-router'

const TaskHelp = () => {
  // Playground state
  const [playgroundSettings, setPlaygroundSettings] = useState({
    assignmentStrategy: 'role_based',
    targetRoles: ['student'],
    schoolIds: ['school1', 'school2'],
    specificUserIds: ['user1', 'user2', 'user3'],
    visibility: 'school',
    defaultVisibility: {
      forParents: true,
      forSchools: true,
      forStudents: false
    },
    requiresApproval: true,
    approverType: 'parent',
    isRecurring: false,
    frequency: 'weekly'
  })

  const updatePlaygroundSetting = (key, value) => {
    setPlaygroundSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateNestedSetting = (parentKey, childKey, value) => {
    setPlaygroundSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }))
  }

  const getAssignmentExplanation = () => {
    const { assignmentStrategy, targetRoles, schoolIds, specificUserIds } = playgroundSettings
    
    switch (assignmentStrategy) {
      case 'specific':
        return `This task will be assigned to ${specificUserIds.length} specific users: ${specificUserIds.join(', ')}`
      case 'role_based':
        return `This task will be assigned to all users with roles: ${targetRoles.join(', ')}`
      case 'school_based':
        return `This task will be assigned to all users in schools: ${schoolIds.join(', ')}`
      case 'global':
        return 'This task will be assigned to ALL users in the system'
      default:
        return 'Select an assignment strategy to see how it works'
    }
  }

  const getVisibilityExplanation = () => {
    const { defaultVisibility, visibility } = playgroundSettings
    
    let explanation = `Base visibility level: ${visibility}. `
    
    if (defaultVisibility.forParents) {
      explanation += 'Parents can see and control this task for their children. '
    }
    if (defaultVisibility.forSchools) {
      explanation += 'Schools can see and control this task for their students. '
    }
    if (defaultVisibility.forStudents) {
      explanation += 'Students can see this task directly without parent/school control. '
    }
    
    return explanation
  }

  const getApprovalExplanation = () => {
    const { requiresApproval, approverType } = playgroundSettings
    
    if (!requiresApproval) {
      return 'Task completion will be automatically approved (no manual approval needed)'
    }
    
    return `Task completion requires approval from: ${approverType}`
  }

  const getRecurringExplanation = () => {
    const { isRecurring, frequency } = playgroundSettings
    
    if (!isRecurring) {
      return 'This is a one-time task'
    }
    
    return `This task repeats ${frequency}`
  }

  return (
    <div className="pb-8 space-y-6">
      {/* Header */}
      <Box>
        <Button variant="ghost" color="gray" asChild size="2" className="mb-4">
          <Link to="/platform-admin/dashboard/tasks">
            <ArrowLeft size={16} /> Back to Tasks
          </Link>
        </Button>
        <Flex align="center" gap="3" mb="2">
          <BookOpen size={24} />
          <Heading as="h1" size="6" weight="medium">Task Management Help</Heading>
        </Flex>
        <Text color="gray" size="2">
          Learn how to create and manage tasks effectively with our comprehensive guide and interactive playground
        </Text>
      </Box>

      <Separator size="4" />

      <Tabs.Root defaultValue="overview">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="assignment">Assignment Strategies</Tabs.Trigger>
          <Tabs.Trigger value="visibility">Visibility Controls</Tabs.Trigger>
          <Tabs.Trigger value="advanced">Advanced Features</Tabs.Trigger>
          <Tabs.Trigger value="playground">Interactive Playground</Tabs.Trigger>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview" className="space-y-4">
          <Card>
            <Box p="6">
              <Heading size="4" mb="4">What are Tasks?</Heading>
              <Text size="3" mb="4">
                Tasks are activities or assignments that can be given to students, managed by parents, 
                teachers, or school administrators. The system provides sophisticated control over who 
                can see tasks, who can assign them, and how they're completed.
              </Text>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="2">
                      <Target size={16} />
                      <Strong>Assignment Strategies</Strong>
                    </Flex>
                    <Text size="2" color="gray">
                      Control who receives the task - specific users, roles, schools, or everyone
                    </Text>
                  </Box>
                </Card>
                
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="2">
                      <Eye size={16} />
                      <Strong>Visibility Controls</Strong>
                    </Flex>
                    <Text size="2" color="gray">
                      Manage who can see and control tasks for students
                    </Text>
                  </Box>
                </Card>
                
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="2">
                      <CheckCircle size={16} />
                      <Strong>Approval Workflows</Strong>
                    </Flex>
                    <Text size="2" color="gray">
                      Set up approval processes for task completion
                    </Text>
                  </Box>
                </Card>
                
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="2">
                      <Clock size={16} />
                      <Strong>Recurring Tasks</Strong>
                    </Flex>
                    <Text size="2" color="gray">
                      Create tasks that repeat on a schedule
                    </Text>
                  </Box>
                </Card>
              </div>
            </Box>
          </Card>

          <Card>
            <Box p="6">
              <Heading size="4" mb="4">Task Lifecycle</Heading>
              <div className="space-y-3">
                <Flex align="center" gap="3">
                  <Badge color="blue">1</Badge>
                  <Text><Strong>Creation:</Strong> Task is created with assignment strategy and visibility settings</Text>
                </Flex>
                <Flex align="center" gap="3">
                  <Badge color="orange">2</Badge>
                  <Text><Strong>Assignment:</Strong> Task is automatically assigned based on the strategy</Text>
                </Flex>
                <Flex align="center" gap="3">
                  <Badge color="purple">3</Badge>
                  <Text><Strong>Visibility:</Strong> Visibility controls determine who can see and manage the task</Text>
                </Flex>
                <Flex align="center" gap="3">
                  <Badge color="green">4</Badge>
                  <Text><Strong>Completion:</Strong> Student completes the task</Text>
                </Flex>
                <Flex align="center" gap="3">
                  <Badge color="gray">5</Badge>
                  <Text><Strong>Approval:</Strong> If required, designated approver reviews and approves</Text>
                </Flex>
              </div>
            </Box>
          </Card>
        </Tabs.Content>

        {/* Assignment Strategies Tab */}
        <Tabs.Content value="assignment" className="space-y-4">
          <Card>
            <Box p="6">
              <Heading size="4" mb="4">Assignment Strategies Explained</Heading>
              <Text size="3" mb="4">
                Assignment strategies determine who receives the task when it's created. Choose the strategy 
                that best fits your needs.
              </Text>
              
              <div className="space-y-4">
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="3">
                      <Users size={16} />
                      <Strong>Specific Users</Strong>
                      <Badge color="blue">Targeted</Badge>
                    </Flex>
                    <Text size="2" mb="2">
                      Assign the task to specific users by their ID. Perfect for individual assignments 
                      or when you know exactly who should receive the task.
                    </Text>
                    <Code>Example: user123, user456, user789</Code>
                  </Box>
                </Card>
                
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="3">
                      <Users size={16} />
                      <Strong>Role-Based</Strong>
                      <Badge color="green">Flexible</Badge>
                    </Flex>
                    <Text size="2" mb="2">
                      Assign to all users with specific roles. Great for assignments that should go to 
                      all students, or all teachers, etc.
                    </Text>
                    <Code>Example: All students, All teachers</Code>
                  </Box>
                </Card>
                
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="3">
                      <School size={16} />
                      <Strong>School-Based</Strong>
                      <Badge color="purple">Institutional</Badge>
                    </Flex>
                    <Text size="2" mb="2">
                      Assign to all users within specific schools. Ideal for school-wide initiatives 
                      or assignments.
                    </Text>
                    <Code>Example: Lincoln Elementary, Washington High</Code>
                  </Box>
                </Card>
                
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="3">
                      <Globe size={16} />
                      <Strong>Global</Strong>
                      <Badge color="red">System-wide</Badge>
                    </Flex>
                    <Text size="2" mb="2">
                      Assign to ALL users in the system. Use carefully - this affects everyone!
                    </Text>
                    <Code>Example: System maintenance tasks, universal announcements</Code>
                  </Box>
                </Card>
              </div>
            </Box>
          </Card>

          <Callout.Root>
            <Callout.Icon>
              <Lightbulb />
            </Callout.Icon>
            <Callout.Text>
              <Strong>Pro Tip:</Strong> You can combine assignment strategies with visibility controls 
              to create sophisticated task distribution patterns. For example, assign globally but 
              only make visible to specific schools.
            </Callout.Text>
          </Callout.Root>
        </Tabs.Content>

        {/* Visibility Controls Tab */}
        <Tabs.Content value="visibility" className="space-y-4">
          <Card>
            <Box p="6">
              <Heading size="4" mb="4">Understanding Visibility Controls</Heading>
              <Text size="3" mb="4">
                Visibility controls determine who can see and manage tasks for students. This creates 
                a powerful permission system that respects family and school boundaries.
              </Text>
              
              <div className="space-y-4">
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="3">
                      <Eye size={16} />
                      <Strong>Base Visibility Levels</Strong>
                    </Flex>
                    <div className="space-y-2">
                      <Flex align="center" gap="2">
                        <Badge color="red">Private</Badge>
                        <Text size="2">Only the creator can see this task</Text>
                      </Flex>
                      <Flex align="center" gap="2">
                        <Badge color="orange">Family</Badge>
                        <Text size="2">Visible to family members only</Text>
                      </Flex>
                      <Flex align="center" gap="2">
                        <Badge color="blue">Class</Badge>
                        <Text size="2">Visible to class members and teachers</Text>
                      </Flex>
                      <Flex align="center" gap="2">
                        <Badge color="green">School</Badge>
                        <Text size="2">Visible to entire school community</Text>
                      </Flex>
                      <Flex align="center" gap="2">
                        <Badge color="purple">Public</Badge>
                        <Text size="2">Visible to everyone in the system</Text>
                      </Flex>
                    </div>
                  </Box>
                </Card>
                
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="3">
                      <Users size={16} />
                      <Strong>Default Visibility Settings</Strong>
                    </Flex>
                    <div className="space-y-3">
                      <Box>
                        <Strong>Visible to Parents</Strong>
                        <Text size="2" color="gray" display="block">
                          When enabled, parents can see and control this task for their children. 
                          They can hide it, modify it, or override school settings.
                        </Text>
                      </Box>
                      <Box>
                        <Strong>Visible to Schools</Strong>
                        <Text size="2" color="gray" display="block">
                          When enabled, schools can see and control this task for their students. 
                          Teachers and administrators can manage task visibility.
                        </Text>
                      </Box>
                      <Box>
                        <Strong>Directly Visible to Students</Strong>
                        <Text size="2" color="gray" display="block">
                          When enabled, students can see this task directly without needing 
                          parent or school approval. Use carefully!
                        </Text>
                      </Box>
                    </div>
                  </Box>
                </Card>
              </div>
            </Box>
          </Card>

          <Card>
            <Box p="6">
              <Heading size="4" mb="4">Visibility Scenarios</Heading>
              <div className="space-y-3">
                <Card variant="surface">
                  <Box p="3">
                    <Strong>Scenario 1: Homework Assignment</Strong>
                    <Text size="2" color="gray" display="block">
                      ✅ Visible to Parents, ✅ Visible to Schools, ❌ Direct Student Visibility
                      <br />
                      <Em>Parents and teachers can see and manage, students see it through them</Em>
                    </Text>
                  </Box>
                </Card>
                
                <Card variant="surface">
                  <Box p="3">
                    <Strong>Scenario 2: Fun Activity</Strong>
                    <Text size="2" color="gray" display="block">
                      ✅ Visible to Parents, ❌ Visible to Schools, ✅ Direct Student Visibility
                      <br />
                      <Em>Family activity that schools don't need to manage</Em>
                    </Text>
                  </Box>
                </Card>
                
                <Card variant="surface">
                  <Box p="3">
                    <Strong>Scenario 3: School Project</Strong>
                    <Text size="2" color="gray" display="block">
                      ❌ Visible to Parents, ✅ Visible to Schools, ❌ Direct Student Visibility
                      <br />
                      <Em>School-only task that parents don't need to see</Em>
                    </Text>
                  </Box>
                </Card>
              </div>
            </Box>
          </Card>
        </Tabs.Content>

        {/* Advanced Features Tab */}
        <Tabs.Content value="advanced" className="space-y-4">
          <Card>
            <Box p="6">
              <Heading size="4" mb="4">Advanced Task Features</Heading>
              
              <div className="space-y-4">
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="3">
                      <CheckCircle size={16} />
                      <Strong>Approval Workflows</Strong>
                    </Flex>
                    <Text size="2" mb="3">
                      Control who needs to approve task completion. This ensures quality and oversight.
                    </Text>
                    <div className="space-y-2">
                      <Flex align="center" gap="2">
                        <Badge color="blue">Parent</Badge>
                        <Text size="2">Parent must approve completion</Text>
                      </Flex>
                      <Flex align="center" gap="2">
                        <Badge color="green">Teacher</Badge>
                        <Text size="2">Teacher must approve completion</Text>
                      </Flex>
                      <Flex align="center" gap="2">
                        <Badge color="purple">School Admin</Badge>
                        <Text size="2">School administrator must approve</Text>
                      </Flex>
                      <Flex align="center" gap="2">
                        <Badge color="gray">System</Badge>
                        <Text size="2">Automatic approval (no manual review)</Text>
                      </Flex>
                    </div>
                  </Box>
                </Card>
                
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="3">
                      <Clock size={16} />
                      <Strong>Recurring Tasks</Strong>
                    </Flex>
                    <Text size="2" mb="3">
                      Create tasks that automatically repeat on a schedule. Perfect for daily chores, 
                      weekly assignments, or monthly activities.
                    </Text>
                    <div className="space-y-2">
                      <Text size="2"><Strong>Daily:</Strong> Task repeats every day</Text>
                      <Text size="2"><Strong>Weekly:</Strong> Task repeats on specific days of the week</Text>
                      <Text size="2"><Strong>Monthly:</Strong> Task repeats monthly</Text>
                    </div>
                  </Box>
                </Card>
                
                <Card variant="surface">
                  <Box p="4">
                    <Flex align="center" gap="2" mb="3">
                      <Target size={16} />
                      <Strong>Point Values & Difficulty</Strong>
                    </Flex>
                    <Text size="2" mb="3">
                      Assign point values and difficulty levels to create a gamified experience 
                      and help users understand task complexity.
                    </Text>
                    <div className="space-y-2">
                      <Text size="2"><Strong>Easy:</Strong> Simple tasks, low point values</Text>
                      <Text size="2"><Strong>Medium:</Strong> Standard tasks, moderate points</Text>
                      <Text size="2"><Strong>Hard:</Strong> Complex tasks, higher points</Text>
                      <Text size="2"><Strong>Challenging:</Strong> Very difficult, maximum points</Text>
                    </div>
                  </Box>
                </Card>
              </div>
            </Box>
          </Card>
        </Tabs.Content>

        {/* Interactive Playground Tab */}
        <Tabs.Content value="playground" className="space-y-4">
          <Card>
            <Box p="6">
              <Flex align="center" gap="2" mb="4">
                <PlayCircle size={20} />
                <Heading size="4">Interactive Playground</Heading>
              </Flex>
              <Text size="3" mb="4">
                Experiment with different settings to see how they affect task behavior. 
                Change the values below and see the real-time explanation.
              </Text>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Controls */}
                <div className="space-y-4">
                  <Card variant="surface">
                    <Box p="4">
                      <Strong>Assignment Strategy</Strong>
                      <Select.Root 
                        value={playgroundSettings.assignmentStrategy} 
                        onValueChange={(value) => updatePlaygroundSetting('assignmentStrategy', value)}
                      >
                        <Select.Trigger className="mt-2" />
                        <Select.Content>
                          <Select.Item value="specific">Specific Users</Select.Item>
                          <Select.Item value="role_based">Role-Based</Select.Item>
                          <Select.Item value="school_based">School-Based</Select.Item>
                          <Select.Item value="global">Global</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Card>
                  
                  <Card variant="surface">
                    <Box p="4">
                      <Strong>Base Visibility</Strong>
                      <Select.Root 
                        value={playgroundSettings.visibility} 
                        onValueChange={(value) => updatePlaygroundSetting('visibility', value)}
                      >
                        <Select.Trigger className="mt-2" />
                        <Select.Content>
                          <Select.Item value="private">Private</Select.Item>
                          <Select.Item value="family">Family</Select.Item>
                          <Select.Item value="class">Class</Select.Item>
                          <Select.Item value="school">School</Select.Item>
                          <Select.Item value="public">Public</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Card>
                  
                  <Card variant="surface">
                    <Box p="4">
                      <Strong>Default Visibility Controls</Strong>
                      <div className="space-y-3 mt-2">
                        <Flex align="center" justify="between">
                          <Text size="2">Visible to Parents</Text>
                          <Switch 
                            checked={playgroundSettings.defaultVisibility.forParents}
                            onCheckedChange={(checked) => updateNestedSetting('defaultVisibility', 'forParents', checked)}
                          />
                        </Flex>
                        <Flex align="center" justify="between">
                          <Text size="2">Visible to Schools</Text>
                          <Switch 
                            checked={playgroundSettings.defaultVisibility.forSchools}
                            onCheckedChange={(checked) => updateNestedSetting('defaultVisibility', 'forSchools', checked)}
                          />
                        </Flex>
                        <Flex align="center" justify="between">
                          <Text size="2">Direct Student Visibility</Text>
                          <Switch 
                            checked={playgroundSettings.defaultVisibility.forStudents}
                            onCheckedChange={(checked) => updateNestedSetting('defaultVisibility', 'forStudents', checked)}
                          />
                        </Flex>
                      </div>
                    </Box>
                  </Card>
                  
                  <Card variant="surface">
                    <Box p="4">
                      <Strong>Approval Settings</Strong>
                      <div className="space-y-3 mt-2">
                        <Flex align="center" justify="between">
                          <Text size="2">Requires Approval</Text>
                          <Switch 
                            checked={playgroundSettings.requiresApproval}
                            onCheckedChange={(checked) => updatePlaygroundSetting('requiresApproval', checked)}
                          />
                        </Flex>
                        {playgroundSettings.requiresApproval && (
                          <Select.Root 
                            value={playgroundSettings.approverType} 
                            onValueChange={(value) => updatePlaygroundSetting('approverType', value)}
                          >
                            <Select.Trigger />
                            <Select.Content>
                              <Select.Item value="parent">Parent</Select.Item>
                              <Select.Item value="teacher">Teacher</Select.Item>
                              <Select.Item value="school_admin">School Admin</Select.Item>
                              <Select.Item value="system">System (Auto)</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        )}
                      </div>
                    </Box>
                  </Card>
                  
                  <Card variant="surface">
                    <Box p="4">
                      <Strong>Recurring Settings</Strong>
                      <div className="space-y-3 mt-2">
                        <Flex align="center" justify="between">
                          <Text size="2">Is Recurring</Text>
                          <Switch 
                            checked={playgroundSettings.isRecurring}
                            onCheckedChange={(checked) => updatePlaygroundSetting('isRecurring', checked)}
                          />
                        </Flex>
                        {playgroundSettings.isRecurring && (
                          <Select.Root 
                            value={playgroundSettings.frequency} 
                            onValueChange={(value) => updatePlaygroundSetting('frequency', value)}
                          >
                            <Select.Trigger />
                            <Select.Content>
                              <Select.Item value="daily">Daily</Select.Item>
                              <Select.Item value="weekly">Weekly</Select.Item>
                              <Select.Item value="monthly">Monthly</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        )}
                      </div>
                    </Box>
                  </Card>
                </div>
                
                {/* Live Explanation */}
                <div className="space-y-4">
                  <Card>
                    <Box p="4">
                      <Flex align="center" gap="2" mb="3">
                        <Info size={16} />
                        <Strong>Live Explanation</Strong>
                      </Flex>
                      
                      <div className="space-y-3">
                        <Box>
                          <Badge color="blue" mb="2">Assignment</Badge>
                          <Text size="2" display="block">
                            {getAssignmentExplanation()}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Badge color="purple" mb="2">Visibility</Badge>
                          <Text size="2" display="block">
                            {getVisibilityExplanation()}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Badge color="green" mb="2">Approval</Badge>
                          <Text size="2" display="block">
                            {getApprovalExplanation()}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Badge color="orange" mb="2">Recurring</Badge>
                          <Text size="2" display="block">
                            {getRecurringExplanation()}
                          </Text>
                        </Box>
                      </div>
                    </Box>
                  </Card>
                  
                  <Callout.Root>
                    <Callout.Icon>
                      <Lightbulb />
                    </Callout.Icon>
                    <Callout.Text>
                      Try different combinations to see how they work together. 
                      The settings you choose here can be applied when creating real tasks!
                    </Callout.Text>
                  </Callout.Root>
                </div>
              </div>
            </Box>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

export default TaskHelp 