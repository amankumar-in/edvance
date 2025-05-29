import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
  Badge,
  Callout,
  Select,
  TextArea,
  TextField,
  Switch,
  IconButton,
  Tabs
} from '@radix-ui/themes'
import { 
  ArrowLeft, 
  Info, 
  Plus, 
  Upload, 
  X, 
  Calendar, 
  Users, 
  School, 
  Globe, 
  Paperclip,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Settings,
  Target,
  Clock,
  Star,
  Save
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

// Import hooks
import { useTask, useUpdateTask } from '../../api/task/taskManagement.mutations'
import { useTaskCategories } from '../../api/task/taskCategory.mutations'

const EditTask = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [attachments, setAttachments] = useState([])
  const [previewMode, setPreviewMode] = useState(false)
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      subCategory: '',
      pointValue: 10,
      dueDate: '',
      
      // Assignment Strategy
      assignmentStrategy: 'role_based',
      targetCriteria: {
        roles: ['student'],
        schoolIds: [],
        classIds: [],
        gradeLevel: '',
        specificUserIds: [],
        excludeUserIds: []
      },
      
      // Visibility Controls
      defaultVisibility: {
        forParents: true,
        forSchools: true,
        forStudents: false
      },
      
      // Task Properties
      difficulty: 'medium',
      requiresApproval: true,
      approverType: 'parent',
      specificApproverId: '',
      
      // Recurring Settings
      isRecurring: false,
      recurringSchedule: {
        frequency: 'weekly',
        daysOfWeek: [],
        interval: 1,
        endDate: ''
      },
      
      // External Resource
      externalResource: {
        platform: '',
        resourceId: '',
        url: ''
      },
      
      // Additional Settings
      visibility: 'school',
      schoolId: '',
      classId: '',
      badgeId: '',
      isFeatured: false,
      metadata: {}
    }
  })

  // Watch form values
  const assignmentStrategy = watch('assignmentStrategy')
  const isRecurring = watch('isRecurring')
  const requiresApproval = watch('requiresApproval')
  const targetCriteria = watch('targetCriteria')

  // React Query hooks
  const { data: taskData, isLoading: taskLoading, error } = useTask(id)
  const { data: categoriesData } = useTaskCategories()
  const { mutate: updateTask, isPending } = useUpdateTask()

  const task = taskData?.data?.task || taskData?.data
  const categories = categoriesData?.data || []

  // Populate form with existing task data
  useEffect(() => {
    if (task && categories.length > 0) {
      const formData = {
        title: task.title || '',
        description: task.description || '',
        category: task.category?._id || task.category || '',
        subCategory: task.subCategory || '',
        pointValue: task.pointValue || 10,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        
        // Assignment Strategy
        assignmentStrategy: task.assignmentStrategy || 'role_based',
        targetCriteria: {
          roles: task.targetCriteria?.roles || ['student'],
          schoolIds: task.targetCriteria?.schoolIds || [],
          classIds: task.targetCriteria?.classIds || [],
          gradeLevel: task.targetCriteria?.gradeLevel || '',
          specificUserIds: task.targetCriteria?.specificUserIds || [],
          excludeUserIds: task.targetCriteria?.excludeUserIds || []
        },
        
        // Visibility Controls
        defaultVisibility: {
          forParents: task.defaultVisibility?.forParents ?? true,
          forSchools: task.defaultVisibility?.forSchools ?? true,
          forStudents: task.defaultVisibility?.forStudents ?? false
        },
        
        // Task Properties
        difficulty: task.difficulty || 'medium',
        requiresApproval: task.requiresApproval ?? true,
        approverType: task.approverType || 'parent',
        specificApproverId: task.specificApproverId || '',
        
        // Recurring Settings
        isRecurring: task.isRecurring || false,
        recurringSchedule: {
          frequency: task.recurringSchedule?.frequency || 'weekly',
          daysOfWeek: task.recurringSchedule?.daysOfWeek || [],
          interval: task.recurringSchedule?.interval || 1,
          endDate: task.recurringSchedule?.endDate ? new Date(task.recurringSchedule.endDate).toISOString().split('T')[0] : ''
        },
        
        // External Resource
        externalResource: {
          platform: task.externalResource?.platform || '',
          resourceId: task.externalResource?.resourceId || '',
          url: task.externalResource?.url || ''
        },
        
        // Additional Settings
        visibility: task.visibility || 'school',
        schoolId: task.schoolId || '',
        classId: task.classId || '',
        badgeId: task.badgeId || '',
        isFeatured: task.isFeatured || false,
        metadata: task.metadata || {}
      }
      
      reset(formData)
      setAttachments(task.attachments || [])
    }
  }, [task, reset, categories])

  // Fallback: populate form with task data even if categories aren't loaded yet
  useEffect(() => {
    if (task && categories.length === 0) {
      const basicFormData = {
        title: task.title || '',
        description: task.description || '',
        category: task.category?._id || task.category || '',
        subCategory: task.subCategory || '',
        pointValue: task.pointValue || 10,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignmentStrategy: task.assignmentStrategy || 'role_based',
        difficulty: task.difficulty || 'medium',
        requiresApproval: task.requiresApproval ?? true,
        approverType: task.approverType || 'parent',
        isRecurring: task.isRecurring || false,
        visibility: task.visibility || 'school',
        isFeatured: task.isFeatured || false
      }
      
      reset(basicFormData)
      setAttachments(task.attachments || [])
    }
  }, [task, categories.length, reset])

  useEffect(() => {
    if (error) {
      toast.error('Failed to load task')
      navigate('/platform-admin/dashboard/tasks')
    }
  }, [error, navigate])

  const onSubmit = async (data) => {
    // Validate required fields
    if (!data.category || data.category.trim() === '') {
      toast.error('Please select a category')
      return
    }

    // Validate assignment strategy specific requirements
    if (data.assignmentStrategy === 'specific' && data.targetCriteria.specificUserIds.length === 0) {
      toast.error('Please specify at least one user ID for specific assignment strategy')
      return
    }

    if (data.assignmentStrategy === 'school_based' && data.targetCriteria.schoolIds.length === 0) {
      toast.error('Please specify at least one school ID for school-based assignment strategy')
      return
    }

    const submitData = {
      ...data,
      attachments,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      recurringSchedule: data.isRecurring ? {
        ...data.recurringSchedule,
        endDate: data.recurringSchedule.endDate ? new Date(data.recurringSchedule.endDate).toISOString() : null
      } : undefined,
      // Clean up empty fields
      externalResource: data.externalResource.platform ? data.externalResource : undefined,
      metadata: Object.keys(data.metadata).length > 0 ? data.metadata : undefined
    }

    // Remove undefined values to avoid sending them to the backend
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === undefined) {
        delete submitData[key]
      }
    })

    updateTask({ id, data: submitData }, {
      onSuccess: (response) => {
        toast.success('Task updated successfully')
        console.log('Updated task:', response)
        navigate('/platform-admin/dashboard/tasks')
      },
      onError: (error) => {
        console.error('Update task error:', error)
        toast.error(error?.response?.data?.message || error?.message || 'Failed to update task')
      }
    })
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const newAttachments = files.map(file => ({
      type: file.type.startsWith('image/') ? 'image' : 'document',
      name: file.name,
      url: URL.createObjectURL(file),
      contentType: file.type
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const getStrategyDescription = (strategy) => {
    switch (strategy) {
      case 'specific': return 'Assign to specific users by ID'
      case 'role_based': return 'Assign to users with specific roles'
      case 'school_based': return 'Assign to all users in specific schools'
      case 'global': return 'Assign to all users globally'
      default: return ''
    }
  }

  const handleToggleRecurringDay = (day) => {
    const currentDays = watch('recurringSchedule.daysOfWeek') || []
    const newDays = currentDays.includes(day) 
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort()
    setValue('recurringSchedule.daysOfWeek', newDays)
  }

  const getDayName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[day]
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'academic': return 'blue'
      case 'home': return 'green'
      case 'behavior': return 'purple'
      case 'extracurricular': return 'orange'
      case 'attendance': return 'red'
      case 'system': return 'gray'
      case 'custom': return 'pink'
      default: return 'gray'
    }
  }

  if (taskLoading) {
    return (
      <div className="pb-8 space-y-6">
        <Box>
          <Button variant="ghost" color="gray" asChild size="2" className="mb-4">
            <Link to="/platform-admin/dashboard/tasks">
              <ArrowLeft size={16} /> Back to Tasks
            </Link>
          </Button>
          <Heading as="h1" size="6" weight="medium">Loading Task...</Heading>
        </Box>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="pb-8 space-y-6">
        <Box>
          <Button variant="ghost" color="gray" asChild size="2" className="mb-4">
            <Link to="/platform-admin/dashboard/tasks">
              <ArrowLeft size={16} /> Back to Tasks
            </Link>
          </Button>
          <Heading as="h1" size="6" weight="medium">Task Not Found</Heading>
        </Box>
      </div>
    )
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
        <Flex justify="between" align="center">
          <Box>
            <Heading as="h1" size="6" weight="medium">Edit Task</Heading>
            <Text color="gray" size="2" className="mt-1">
              Modify task: {task.title}
            </Text>
          </Box>
          <Flex gap="2">
            <Button variant="outline" asChild>
              <Link to="/platform-admin/dashboard/tasks/help">
                <Info size={16} />
                Help & Guide
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
              {previewMode ? 'Edit Mode' : 'Preview'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/platform-admin/dashboard/tasks')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
              <Save size={16} />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Flex>
        </Flex>
      </Box>

      <Separator size="4" />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs.Root defaultValue="basic">
          <Tabs.List>
            <Tabs.Trigger value="basic">Basic Information</Tabs.Trigger>
            <Tabs.Trigger value="assignment">Assignment Strategy</Tabs.Trigger>
            <Tabs.Trigger value="visibility">Visibility Controls</Tabs.Trigger>
            <Tabs.Trigger value="advanced">Advanced Settings</Tabs.Trigger>
          </Tabs.List>

          {/* Basic Information Tab */}
          <Tabs.Content value="basic" className="space-y-4">
            <Card>
              <Box p="6">
                <Heading size="4" mb="4">Task Details</Heading>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box className="md:col-span-2">
                    <Text size="2" weight="medium" mb="2">Title *</Text>
                    <TextField.Root
                      {...register('title', { required: 'Title is required' })}
                      placeholder="Enter task title"
                    />
                    {errors.title && (
                      <Text size="1" color="red" mt="1">{errors.title.message}</Text>
                    )}
                  </Box>

                  <Box className="md:col-span-2">
                    <Text size="2" weight="medium" mb="2">Description</Text>
                    <TextArea
                      {...register('description')}
                      placeholder="Describe what needs to be done..."
                      rows={3}
                    />
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" mb="2">Category *</Text>
                    <Controller
                      name="category"
                      control={control}
                      rules={{ required: 'Category is required' }}
                      render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange}>
                          <Select.Trigger placeholder="Select category" />
                          <Select.Content>
                            {categories.map((category) => (
                              <Select.Item key={category._id} value={category._id}>
                                <Flex align="center" gap="2">
                                  <Badge color={getTypeColor(category.type)} variant="soft">
                                    {category.name}
                                  </Badge>
                                  <Text size="1" color="gray">
                                    {category.description}
                                  </Text>
                                </Flex>
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                    {errors.category && (
                      <Text size="1" color="red" mt="1">{errors.category.message}</Text>
                    )}
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" mb="2">Sub Category</Text>
                    <TextField.Root
                      {...register('subCategory')}
                      placeholder="e.g., Math, Reading, Chores"
                    />
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" mb="2">Point Value *</Text>
                    <TextField.Root
                      {...register('pointValue', { 
                        required: 'Point value is required',
                        min: { value: 0, message: 'Points must be positive' }
                      })}
                      type="number"
                      min="0"
                      placeholder="10"
                    />
                    {errors.pointValue && (
                      <Text size="1" color="red" mt="1">{errors.pointValue.message}</Text>
                    )}
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" mb="2">Due Date</Text>
                    <TextField.Root
                      {...register('dueDate')}
                      type="date"
                    />
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" mb="2">Difficulty</Text>
                    <Controller
                      name="difficulty"
                      control={control}
                      render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange}>
                          <Select.Trigger />
                          <Select.Content>
                            <Select.Item value="easy">Easy</Select.Item>
                            <Select.Item value="medium">Medium</Select.Item>
                            <Select.Item value="hard">Hard</Select.Item>
                            <Select.Item value="challenging">Challenging</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" mb="2">Visibility</Text>
                    <Controller
                      name="visibility"
                      control={control}
                      render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange}>
                          <Select.Trigger />
                          <Select.Content>
                            <Select.Item value="private">Private</Select.Item>
                            <Select.Item value="family">Family</Select.Item>
                            <Select.Item value="class">Class</Select.Item>
                            <Select.Item value="school">School</Select.Item>
                            <Select.Item value="public">Public</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                  </Box>
                </div>
              </Box>
            </Card>

            {/* Attachments */}
            <Card>
              <Box p="6">
                <Heading size="4" mb="4">Attachments</Heading>
                
                <Box mb="4">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <Button variant="outline" asChild>
                    <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                      <Upload size={16} />
                      Upload Files
                    </label>
                  </Button>
                </Box>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                      <Flex key={index} align="center" justify="between" p="2" className="border rounded">
                        <Flex align="center" gap="2">
                          <Paperclip size={14} />
                          <Text size="2">{attachment.name}</Text>
                          <Badge variant="soft" color="gray">{attachment.type}</Badge>
                        </Flex>
                        <IconButton size="1" variant="ghost" color="red" onClick={() => removeAttachment(index)}>
                          <X size={14} />
                        </IconButton>
                      </Flex>
                    ))}
                  </div>
                )}
              </Box>
            </Card>
          </Tabs.Content>

          {/* Assignment Strategy Tab */}
          <Tabs.Content value="assignment" className="space-y-4">
            <Card>
              <Box p="6">
                <Heading size="4" mb="4">Assignment Strategy</Heading>
                
                <Box mb="4">
                  <Text size="2" weight="medium" mb="2">Strategy Type</Text>
                  <Controller
                    name="assignmentStrategy"
                    control={control}
                    render={({ field }) => (
                      <Select.Root value={field.value} onValueChange={field.onChange}>
                        <Select.Trigger />
                        <Select.Content>
                          <Select.Item value="specific">
                            <Flex align="center" gap="2">
                              <Users size={14} />
                              <Box>
                                <Text size="2" weight="medium">Specific Users</Text>
                                <Text size="1" color="gray">Assign to specific users by ID</Text>
                              </Box>
                            </Flex>
                          </Select.Item>
                          <Select.Item value="role_based">
                            <Flex align="center" gap="2">
                              <Users size={14} />
                              <Box>
                                <Text size="2" weight="medium">Role Based</Text>
                                <Text size="1" color="gray">Assign to users with specific roles</Text>
                              </Box>
                            </Flex>
                          </Select.Item>
                          <Select.Item value="school_based">
                            <Flex align="center" gap="2">
                              <School size={14} />
                              <Box>
                                <Text size="2" weight="medium">School Based</Text>
                                <Text size="1" color="gray">Assign to all users in specific schools</Text>
                              </Box>
                            </Flex>
                          </Select.Item>
                          <Select.Item value="global">
                            <Flex align="center" gap="2">
                              <Globe size={14} />
                              <Box>
                                <Text size="2" weight="medium">Global</Text>
                                <Text size="1" color="gray">Assign to all users globally</Text>
                              </Box>
                            </Flex>
                          </Select.Item>
                        </Select.Content>
                      </Select.Root>
                    )}
                  />
                </Box>

                <Callout.Root>
                  <Callout.Icon>
                    <Info />
                  </Callout.Icon>
                  <Callout.Text>
                    {getStrategyDescription(assignmentStrategy)}
                  </Callout.Text>
                </Callout.Root>

                {/* Target Criteria based on strategy */}
                <Box mt="4">
                  <Text size="2" weight="medium" mb="2">Target Criteria</Text>
                  
                  {assignmentStrategy === 'specific' && (
                    <Box>
                      <Text size="2" mb="2">Specific User IDs (comma-separated)</Text>
                      <TextArea
                        placeholder="Enter user IDs separated by commas"
                        value={targetCriteria.specificUserIds?.join(', ') || ''}
                        onChange={(e) => {
                          const ids = e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                          setValue('targetCriteria.specificUserIds', ids)
                        }}
                      />
                    </Box>
                  )}

                  {assignmentStrategy === 'role_based' && (
                    <Box>
                      <Text size="2" mb="2">Target Roles</Text>
                      <Flex gap="2" wrap="wrap">
                        {['student', 'parent', 'teacher', 'school_admin'].map(role => (
                          <Button
                            key={role}
                            variant={targetCriteria.roles?.includes(role) ? 'solid' : 'outline'}
                            size="1"
                            onClick={() => {
                              const currentRoles = targetCriteria.roles || []
                              const newRoles = currentRoles.includes(role)
                                ? currentRoles.filter(r => r !== role)
                                : [...currentRoles, role]
                              setValue('targetCriteria.roles', newRoles)
                            }}
                          >
                            {role}
                          </Button>
                        ))}
                      </Flex>
                    </Box>
                  )}

                  {assignmentStrategy === 'school_based' && (
                    <Box>
                      <Text size="2" mb="2">School IDs (comma-separated)</Text>
                      <TextArea
                        placeholder="Enter school IDs separated by commas"
                        value={targetCriteria.schoolIds?.join(', ') || ''}
                        onChange={(e) => {
                          const ids = e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                          setValue('targetCriteria.schoolIds', ids)
                        }}
                      />
                    </Box>
                  )}

                  <Box mt="3">
                    <Text size="2" mb="2">Grade Level (optional)</Text>
                    <TextField.Root
                      {...register('targetCriteria.gradeLevel')}
                      type="number"
                      placeholder="e.g., 5"
                      min="1"
                      max="12"
                    />
                  </Box>
                </Box>
              </Box>
            </Card>
          </Tabs.Content>

          {/* Visibility Controls Tab */}
          <Tabs.Content value="visibility" className="space-y-4">
            <Card>
              <Box p="6">
                <Heading size="4" mb="4">Default Visibility Settings</Heading>
                <Text size="2" color="gray" mb="4">
                  Control who can see and manage this task by default
                </Text>

                <div className="space-y-4">
                  <Flex align="center" justify="between">
                    <Box>
                      <Text size="2" weight="medium">Visible to Parents</Text>
                      <Text size="1" color="gray">Parents can see and control this task for their children</Text>
                    </Box>
                    <Controller
                      name="defaultVisibility.forParents"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </Flex>

                  <Flex align="center" justify="between">
                    <Box>
                      <Text size="2" weight="medium">Visible to Schools</Text>
                      <Text size="1" color="gray">Schools can see and control this task for their students</Text>
                    </Box>
                    <Controller
                      name="defaultVisibility.forSchools"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </Flex>

                  <Flex align="center" justify="between">
                    <Box>
                      <Text size="2" weight="medium">Directly Visible to Students</Text>
                      <Text size="1" color="gray">Students can see this task without parent/school control</Text>
                    </Box>
                    <Controller
                      name="defaultVisibility.forStudents"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </Flex>
                </div>

                <Callout.Root mt="4">
                  <Callout.Icon>
                    <AlertCircle />
                  </Callout.Icon>
                  <Callout.Text>
                    These are default settings. Individual visibility controls can be set later for specific parents, schools, or classes.
                  </Callout.Text>
                </Callout.Root>
              </Box>
            </Card>
          </Tabs.Content>

          {/* Advanced Settings Tab */}
          <Tabs.Content value="advanced" className="space-y-4">
            {/* Approval Settings */}
            <Card>
              <Box p="6">
                <Heading size="4" mb="4">Approval Settings</Heading>
                
                <Flex align="center" justify="between" mb="4">
                  <Box>
                    <Text size="2" weight="medium">Requires Approval</Text>
                    <Text size="1" color="gray">Task completion needs to be approved</Text>
                  </Box>
                  <Controller
                    name="requiresApproval"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </Flex>

                {requiresApproval && (
                  <Box>
                    <Text size="2" weight="medium" mb="2">Approver Type</Text>
                    <Controller
                      name="approverType"
                      control={control}
                      render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange}>
                          <Select.Trigger />
                          <Select.Content>
                            <Select.Item value="parent">Parent</Select.Item>
                            <Select.Item value="teacher">Teacher</Select.Item>
                            <Select.Item value="school_admin">School Admin</Select.Item>
                            <Select.Item value="system">System (Auto-approve)</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                  </Box>
                )}
              </Box>
            </Card>

            {/* Recurring Settings */}
            <Card>
              <Box p="6">
                <Heading size="4" mb="4">Recurring Settings</Heading>
                
                <Flex align="center" justify="between" mb="4">
                  <Box>
                    <Text size="2" weight="medium">Recurring Task</Text>
                    <Text size="1" color="gray">Task repeats on a schedule</Text>
                  </Box>
                  <Controller
                    name="isRecurring"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </Flex>

                {isRecurring && (
                  <div className="space-y-4">
                    <Box>
                      <Text size="2" weight="medium" mb="2">Frequency</Text>
                      <Controller
                        name="recurringSchedule.frequency"
                        control={control}
                        render={({ field }) => (
                          <Select.Root value={field.value} onValueChange={field.onChange}>
                            <Select.Trigger />
                            <Select.Content>
                              <Select.Item value="daily">Daily</Select.Item>
                              <Select.Item value="weekly">Weekly</Select.Item>
                              <Select.Item value="monthly">Monthly</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        )}
                      />
                    </Box>

                    {watch('recurringSchedule.frequency') === 'weekly' && (
                      <Box>
                        <Text size="2" weight="medium" mb="2">Days of Week</Text>
                        <Flex gap="2" wrap="wrap">
                          {[0, 1, 2, 3, 4, 5, 6].map(day => (
                            <Button
                              key={day}
                              variant={watch('recurringSchedule.daysOfWeek')?.includes(day) ? 'solid' : 'outline'}
                              size="1"
                              onClick={() => handleToggleRecurringDay(day)}
                            >
                              {getDayName(day).slice(0, 3)}
                            </Button>
                          ))}
                        </Flex>
                      </Box>
                    )}

                    <Box>
                      <Text size="2" weight="medium" mb="2">Interval</Text>
                      <TextField.Root
                        {...register('recurringSchedule.interval')}
                        type="number"
                        min="1"
                        placeholder="1"
                      />
                      <Text size="1" color="gray" mt="1">
                        Every {watch('recurringSchedule.interval') || 1} {watch('recurringSchedule.frequency')?.slice(0, -2) || 'week'}(s)
                      </Text>
                    </Box>

                    <Box>
                      <Text size="2" weight="medium" mb="2">End Date (optional)</Text>
                      <TextField.Root
                        {...register('recurringSchedule.endDate')}
                        type="date"
                      />
                    </Box>
                  </div>
                )}
              </Box>
            </Card>

            {/* External Resource */}
            <Card>
              <Box p="6">
                <Heading size="4" mb="4">External Resource</Heading>
                <Text size="2" color="gray" mb="4">
                  Link to external platforms or resources
                </Text>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box>
                    <Text size="2" weight="medium" mb="2">Platform</Text>
                    <TextField.Root
                      {...register('externalResource.platform')}
                      placeholder="e.g., Khan Academy, Google Classroom"
                    />
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" mb="2">Resource ID</Text>
                    <TextField.Root
                      {...register('externalResource.resourceId')}
                      placeholder="External resource identifier"
                    />
                  </Box>

                  <Box className="md:col-span-2">
                    <Text size="2" weight="medium" mb="2">URL</Text>
                    <TextField.Root
                      {...register('externalResource.url')}
                      type="url"
                      placeholder="https://..."
                    />
                  </Box>
                </div>
              </Box>
            </Card>

            {/* Additional Settings */}
            <Card>
              <Box p="6">
                <Heading size="4" mb="4">Additional Settings</Heading>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box>
                    <Text size="2" weight="medium" mb="2">School ID</Text>
                    <TextField.Root
                      {...register('schoolId')}
                      placeholder="Associated school ID"
                    />
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" mb="2">Class ID</Text>
                    <TextField.Root
                      {...register('classId')}
                      placeholder="Associated class ID"
                    />
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" mb="2">Badge ID</Text>
                    <TextField.Root
                      {...register('badgeId')}
                      placeholder="Associated badge/achievement ID"
                    />
                  </Box>

                  <Box>
                    <Flex align="center" justify="between">
                      <Box>
                        <Text size="2" weight="medium">Featured Task</Text>
                        <Text size="1" color="gray">Highlight this task</Text>
                      </Box>
                      <Controller
                        name="isFeatured"
                        control={control}
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                      />
                    </Flex>
                  </Box>
                </div>
              </Box>
            </Card>
          </Tabs.Content>
        </Tabs.Root>
      </form>
    </div>
  )
}

export default EditTask 