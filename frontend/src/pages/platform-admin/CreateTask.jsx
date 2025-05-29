import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Select,
  Separator,
  Text,
  TextArea,
  TextField,
  Switch,
  Badge,
  Dialog,
  IconButton,
  Tabs,
  Strong
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
  Star
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

// Import hooks
import { useCreateTask } from '../../api/task/taskManagement.mutations'
import { useTaskCategories } from '../../api/task/taskCategory.mutations'

const CreateTask = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
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
  const selectedCategory = watch('category')
  const targetCriteria = watch('targetCriteria')
  const defaultVisibility = watch('defaultVisibility')

  // React Query hooks
  const { data: categoriesData } = useTaskCategories()
  const { mutate: createTask, isPending } = useCreateTask()

  const categories = categoriesData?.data || []

  // Handle duplicate task data from URL params
  useEffect(() => {
    const duplicateData = searchParams.get('duplicate')
    if (duplicateData) {
      try {
        const parsedData = JSON.parse(duplicateData)
        reset(parsedData)
        toast.info('Task data loaded for duplication')
      } catch (error) {
        console.error('Failed to parse duplicate data:', error)
        toast.error('Failed to load duplicate task data')
      }
    }
  }, [searchParams, reset])

  // Auto-fill point value when category changes
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat._id === selectedCategory)
      if (category && category.defaultPointValue) {
        setValue('pointValue', category.defaultPointValue)
      }
    }
  }, [selectedCategory, categories, setValue])

  const onSubmit = async (data) => {
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

    createTask(submitData, {
      onSuccess: (response) => {
        toast.success('Task created successfully')
        console.log('Created task:', response)
        navigate('/platform-admin/dashboard/tasks')
      },
      onError: (error) => {
        console.error('Create task error:', error)
        toast.error(error?.response?.data?.message || error?.message || 'Failed to create task')
      }
    })
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const newAttachments = files.map(file => ({
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 'document',
      name: file.name,
      url: URL.createObjectURL(file), // In real app, upload to server first
      contentType: file.type,
      file // Keep file for actual upload
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const getStrategyIcon = (strategy) => {
    switch (strategy) {
      case 'specific': return <Target size={16} />
      case 'role_based': return <Users size={16} />
      case 'school_based': return <School size={16} />
      case 'global': return <Globe size={16} />
      default: return <Users size={16} />
    }
  }

  const getStrategyDescription = (strategy) => {
    switch (strategy) {
      case 'specific': return 'Assign to specific users by their IDs'
      case 'role_based': return 'Assign to users based on their roles (students, parents, etc.)'
      case 'school_based': return 'Assign to all users in specific schools or classes'
      case 'global': return 'Assign to all users globally (use with caution)'
      default: return ''
    }
  }

  const handleAddTargetCriteria = (field, value) => {
    if (!value.trim()) return
    
    const currentValues = targetCriteria[field] || []
    if (!currentValues.includes(value.trim())) {
      setValue(`targetCriteria.${field}`, [...currentValues, value.trim()])
    }
  }

  const handleRemoveTargetCriteria = (field, index) => {
    const currentValues = targetCriteria[field] || []
    setValue(`targetCriteria.${field}`, currentValues.filter((_, i) => i !== index))
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
    const colors = {
      academic: 'blue',
      home: 'green',
      behavior: 'orange',
      extracurricular: 'purple',
      attendance: 'yellow',
      system: 'gray',
      custom: 'indigo'
    }
    return colors[type] || 'gray'
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
            <Heading as="h1" size="6" weight="medium">Create New Task</Heading>
            <Text color="gray" size="2" className="mt-1">
              Set up a new task with assignment and visibility controls
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
            <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
              <CheckCircle size={16} />
              {isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </Flex>
        </Flex>
      </Box>

      <Separator size="4" />

      {/* Help Callout */}
      <Callout.Root>
        <Callout.Icon>
          <Info />
        </Callout.Icon>
        <Callout.Text>
          <Strong>New to task management?</Strong> Check out our comprehensive{' '}
          <Link to="/platform-admin/dashboard/tasks/help" style={{ textDecoration: 'underline' }}>
            Help & Guide
          </Link>{' '}
          with interactive playground to understand assignment strategies, visibility controls, and advanced features.
        </Callout.Text>
      </Callout.Root>

      {previewMode ? (
        /* Preview Mode */
        <Card>
          <Box p="6">
            <Heading size="4" mb="4">Task Preview</Heading>
            <div className="space-y-4">
              <Box>
                <Text size="2" weight="medium" color="gray">Title</Text>
                <Text size="4" weight="medium">{watch('title') || 'Untitled Task'}</Text>
              </Box>
              
              <Box>
                <Text size="2" weight="medium" color="gray">Description</Text>
                <Text size="2">{watch('description') || 'No description provided'}</Text>
              </Box>
              
              <Flex gap="4" wrap="wrap">
                <Box>
                  <Text size="2" weight="medium" color="gray">Category</Text>
                  {(() => {
                    const selectedCategoryId = watch('category')
                    const selectedCategoryObj = categories.find(cat => cat._id === selectedCategoryId)
                    return (
                      <Badge variant="soft" color={getTypeColor(selectedCategoryObj?.type)}>
                        {selectedCategoryObj?.name || 'No category selected'}
                      </Badge>
                    )
                  })()}
                </Box>
                <Box>
                  <Text size="2" weight="medium" color="gray">Points</Text>
                  <Badge variant="soft" color="green">{watch('pointValue')}</Badge>
                </Box>
                <Box>
                  <Text size="2" weight="medium" color="gray">Difficulty</Text>
                  <Badge variant="soft" color="orange">{watch('difficulty')}</Badge>
                </Box>
              </Flex>
              
              <Box>
                <Text size="2" weight="medium" color="gray">Assignment Strategy</Text>
                <Flex align="center" gap="2">
                  {getStrategyIcon(watch('assignmentStrategy'))}
                  <Text size="2">{watch('assignmentStrategy')}</Text>
                </Flex>
              </Box>
              
              <Box>
                <Text size="2" weight="medium" color="gray">Visibility Settings</Text>
                <Flex gap="2">
                  <Badge variant={defaultVisibility.forStudents ? 'solid' : 'soft'} color="blue">
                    Students: {defaultVisibility.forStudents ? 'Visible' : 'Hidden'}
                  </Badge>
                  <Badge variant={defaultVisibility.forParents ? 'solid' : 'soft'} color="green">
                    Parents: {defaultVisibility.forParents ? 'Can Control' : 'No Control'}
                  </Badge>
                  <Badge variant={defaultVisibility.forSchools ? 'solid' : 'soft'} color="purple">
                    Schools: {defaultVisibility.forSchools ? 'Can Control' : 'No Control'}
                  </Badge>
                </Flex>
              </Box>
            </div>
          </Box>
        </Card>
      ) : (
        /* Edit Mode */
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
                <Box p="4">
                  <Heading size="4" mb="4">Task Details</Heading>
                  
                  <div className="space-y-4">
                    <Flex gap="4" className="flex-col md:flex-row">
                      <div className="flex-1">
                        <Text as="div" size="2" mb="2" weight="medium">Task Title *</Text>
                        <TextField.Root 
                          placeholder="Enter a clear, descriptive task title" 
                          {...register('title', { required: "Task title is required" })} 
                        />
                        {errors.title && (
                          <Text size="1" color="red" mt="1">{errors.title.message}</Text>
                        )}
                      </div>

                      <div className="w-full md:w-48">
                        <Text as="div" size="2" mb="2" weight="medium">Point Value *</Text>
                        <TextField.Root 
                          type="number" 
                          min="1" 
                          max="1000"
                          placeholder="10"
                          {...register('pointValue', { 
                            required: "Point value is required",
                            min: { value: 1, message: "Minimum 1 point" },
                            max: { value: 1000, message: "Maximum 1000 points" }
                          })} 
                        />
                        {errors.pointValue && (
                          <Text size="1" color="red" mt="1">{errors.pointValue.message}</Text>
                        )}
                      </div>
                    </Flex>

                    <div>
                      <Text as="div" size="2" mb="2" weight="medium">Description</Text>
                      <TextArea 
                        placeholder="Provide detailed instructions and expectations for this task..."
                        rows={4}
                        {...register('description')} 
                      />
                    </div>

                    <Flex gap="4" className="flex-col md:flex-row">
                      <div className="flex-1">
                        <Text as="div" size="2" mb="2" weight="medium">Category *</Text>
                        <Controller
                          name="category"
                          control={control}
                          rules={{ required: "Category is required" }}
                          render={({ field }) => (
                            <Select.Root value={field.value} onValueChange={field.onChange}>
                              <Select.Trigger placeholder="Select category" />
                              <Select.Content>
                                {categories.map((category) => (
                                  <Select.Item key={category._id} value={category._id}>
                                    <Flex align="center" gap="2">
                                      {category.icon && (
                                        <span style={{ fontSize: '14px' }}>{category.icon}</span>
                                      )}
                                      <span>{category.name}</span>
                                      <Badge variant="soft" size="1" color={getTypeColor(category.type)}>
                                        {category.type}
                                      </Badge>
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
                      </div>

                      <div className="flex-1">
                        <Text as="div" size="2" mb="2" weight="medium">Sub-Category</Text>
                        <TextField.Root 
                          placeholder="e.g., Math, Reading, Chores"
                          {...register('subCategory')} 
                        />
                      </div>

                      <div className="flex-1">
                        <Text as="div" size="2" mb="2" weight="medium">Difficulty</Text>
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
                      </div>
                    </Flex>

                    <Flex gap="4" className="flex-col md:flex-row">
                      <div className="flex-1">
                        <Text as="div" size="2" mb="2" weight="medium">Due Date</Text>
                        <TextField.Root 
                          type="datetime-local"
                          {...register('dueDate')} 
                        />
                      </div>

                      <div className="flex-1">
                        <Text as="div" size="2" mb="2" weight="medium">School ID</Text>
                        <TextField.Root 
                          placeholder="Optional: Specific school ID"
                          {...register('schoolId')} 
                        />
                      </div>

                      <div className="flex-1">
                        <Text as="div" size="2" mb="2" weight="medium">Class ID</Text>
                        <TextField.Root 
                          placeholder="Optional: Specific class ID"
                          {...register('classId')} 
                        />
                      </div>
                    </Flex>
                  </div>
                </Box>
              </Card>

              {/* Attachments */}
              <Card>
                <Box p="4">
                  <Heading size="4" mb="4">Attachments</Heading>
                  
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        id="file-upload"
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        <Upload size={16} />
                        Upload Files
                      </Button>
                    </div>

                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((attachment, index) => (
                          <Flex key={index} justify="between" align="center" className="p-2 border rounded">
                            <Flex align="center" gap="2">
                              <Paperclip size={14} />
                              <Text size="2">{attachment.name}</Text>
                              <Badge variant="soft" size="1">{attachment.type}</Badge>
                            </Flex>
                            <IconButton 
                              size="1" 
                              variant="ghost" 
                              color="red"
                              onClick={() => removeAttachment(index)}
                            >
                              <X size={14} />
                            </IconButton>
                          </Flex>
                        ))}
                      </div>
                    )}
                  </div>
                </Box>
              </Card>
            </Tabs.Content>

            {/* Assignment Strategy Tab */}
            <Tabs.Content value="assignment" className="space-y-4">
              <Card>
                <Box p="4">
                  <Heading size="4" mb="4">Assignment Strategy</Heading>
                  
                  <div className="space-y-4">
                    <div>
                      <Text as="div" size="2" mb="3" weight="medium">How should this task be assigned?</Text>
                      <Controller
                        name="assignmentStrategy"
                        control={control}
                        render={({ field }) => (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              { value: 'specific', label: 'Specific Users', icon: <Target size={16} /> },
                              { value: 'role_based', label: 'Role Based', icon: <Users size={16} /> },
                              { value: 'school_based', label: 'School Based', icon: <School size={16} /> },
                              { value: 'global', label: 'Global', icon: <Globe size={16} /> }
                            ].map((strategy) => (
                              <Card 
                                key={strategy.value}
                                className={`cursor-pointer transition-all ${
                                  field.value === strategy.value 
                                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                                    : 'hover:bg-gray-50'
                                }`}
                                onClick={() => field.onChange(strategy.value)}
                              >
                                <Box p="3">
                                  <Flex align="center" gap="2" mb="2">
                                    {strategy.icon}
                                    <Text size="2" weight="medium">{strategy.label}</Text>
                                  </Flex>
                                  <Text size="1" color="gray">
                                    {getStrategyDescription(strategy.value)}
                                  </Text>
                                </Box>
                              </Card>
                            ))}
                          </div>
                        )}
                      />
                    </div>

                    {/* Target Criteria based on selected strategy */}
                    {assignmentStrategy === 'role_based' && (
                      <div>
                        <Text as="div" size="2" mb="2" weight="medium">Target Roles</Text>
                        <Controller
                          name="targetCriteria.roles"
                          control={control}
                          render={({ field }) => (
                            <div className="space-y-2">
                              {['student', 'parent', 'teacher', 'school_admin'].map((role) => (
                                <label key={role} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={field.value.includes(role)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        field.onChange([...field.value, role])
                                      } else {
                                        field.onChange(field.value.filter(r => r !== role))
                                      }
                                    }}
                                  />
                                  <Text size="2" style={{ textTransform: 'capitalize' }}>
                                    {role.replace('_', ' ')}
                                  </Text>
                                </label>
                              ))}
                            </div>
                          )}
                        />
                      </div>
                    )}

                    {assignmentStrategy === 'specific' && (
                      <div>
                        <Text as="div" size="2" mb="2" weight="medium">Specific User IDs</Text>
                        <div className="space-y-2">
                          <TextField.Root
                            placeholder="Enter user ID and press Enter"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddTargetCriteria('specificUserIds', e.target.value)
                                e.target.value = ''
                              }
                            }}
                          />
                          <div className="flex flex-wrap gap-2">
                            {(targetCriteria.specificUserIds || []).map((userId, index) => (
                              <Badge key={index} variant="soft">
                                {userId}
                                <IconButton 
                                  size="1" 
                                  variant="ghost" 
                                  onClick={() => handleRemoveTargetCriteria('specificUserIds', index)}
                                >
                                  <X size={12} />
                                </IconButton>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {assignmentStrategy === 'school_based' && (
                      <div className="space-y-4">
                        <div>
                          <Text as="div" size="2" mb="2" weight="medium">School IDs</Text>
                          <div className="space-y-2">
                            <TextField.Root
                              placeholder="Enter school ID and press Enter"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleAddTargetCriteria('schoolIds', e.target.value)
                                  e.target.value = ''
                                }
                              }}
                            />
                            <div className="flex flex-wrap gap-2">
                              {(targetCriteria.schoolIds || []).map((schoolId, index) => (
                                <Badge key={index} variant="soft">
                                  {schoolId}
                                  <IconButton 
                                    size="1" 
                                    variant="ghost" 
                                    onClick={() => handleRemoveTargetCriteria('schoolIds', index)}
                                  >
                                    <X size={12} />
                                  </IconButton>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <Text as="div" size="2" mb="2" weight="medium">Class IDs (Optional)</Text>
                          <div className="space-y-2">
                            <TextField.Root
                              placeholder="Enter class ID and press Enter"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleAddTargetCriteria('classIds', e.target.value)
                                  e.target.value = ''
                                }
                              }}
                            />
                            <div className="flex flex-wrap gap-2">
                              {(targetCriteria.classIds || []).map((classId, index) => (
                                <Badge key={index} variant="soft">
                                  {classId}
                                  <IconButton 
                                    size="1" 
                                    variant="ghost" 
                                    onClick={() => handleRemoveTargetCriteria('classIds', index)}
                                  >
                                    <X size={12} />
                                  </IconButton>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <Text as="div" size="2" mb="2" weight="medium">Grade Level (Optional)</Text>
                          <TextField.Root
                            type="number"
                            min="1"
                            max="12"
                            placeholder="e.g., 5 for 5th grade"
                            {...register('targetCriteria.gradeLevel')}
                          />
                        </div>
                      </div>
                    )}

                    {/* Exclusions (available for all strategies) */}
                    <div>
                      <Text as="div" size="2" mb="2" weight="medium">Exclude User IDs (Optional)</Text>
                      <div className="space-y-2">
                        <TextField.Root
                          placeholder="Enter user ID to exclude and press Enter"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddTargetCriteria('excludeUserIds', e.target.value)
                              e.target.value = ''
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2">
                          {(targetCriteria.excludeUserIds || []).map((userId, index) => (
                            <Badge key={index} variant="soft" color="red">
                              {userId}
                              <IconButton 
                                size="1" 
                                variant="ghost" 
                                onClick={() => handleRemoveTargetCriteria('excludeUserIds', index)}
                              >
                                <X size={12} />
                              </IconButton>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Box>
              </Card>
            </Tabs.Content>

            {/* Visibility Controls Tab */}
            <Tabs.Content value="visibility" className="space-y-4">
              <Card>
                <Box p="4">
                  <Heading size="4" mb="4">Default Visibility Settings</Heading>
                  
                  <Callout.Root mb="4">
                    <Callout.Icon>
                      <Info />
                    </Callout.Icon>
                    <Callout.Text>
                      These settings control the default visibility behavior. Parents and schools can override these settings for their children/students.
                    </Callout.Text>
                  </Callout.Root>

                  <div className="space-y-4">
                    <div>
                      <Flex align="center" gap="3" mb="2">
                        <Controller
                          name="defaultVisibility.forStudents"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <div>
                          <Text size="2" weight="medium">Direct Student Visibility</Text>
                          <Text size="1" color="gray" className="block">
                            Students can see this task directly without parent/school approval
                          </Text>
                        </div>
                      </Flex>
                    </div>

                    <div>
                      <Flex align="center" gap="3" mb="2">
                        <Controller
                          name="defaultVisibility.forParents"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <div>
                          <Text size="2" weight="medium">Parent Control</Text>
                          <Text size="1" color="gray" className="block">
                            Parents can control whether their children see this task
                          </Text>
                        </div>
                      </Flex>
                    </div>

                    <div>
                      <Flex align="center" gap="3" mb="2">
                        <Controller
                          name="defaultVisibility.forSchools"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <div>
                          <Text size="2" weight="medium">School Control</Text>
                          <Text size="1" color="gray" className="block">
                            Schools can control whether their students see this task
                          </Text>
                        </div>
                      </Flex>
                    </div>
                  </div>

                  {!defaultVisibility.forStudents && !defaultVisibility.forParents && !defaultVisibility.forSchools && (
                    <Callout.Root color="red" mt="4">
                      <Callout.Icon>
                        <AlertCircle />
                      </Callout.Icon>
                      <Callout.Text>
                        Warning: This task will not be visible to anyone with current settings. Enable at least one visibility option.
                      </Callout.Text>
                    </Callout.Root>
                  )}
                </Box>
              </Card>
            </Tabs.Content>

            {/* Advanced Settings Tab */}
            <Tabs.Content value="advanced" className="space-y-4">
              {/* Approval Settings */}
              <Card>
                <Box p="4">
                  <Heading size="4" mb="4">Approval Settings</Heading>
                  
                  <div className="space-y-4">
                    <div>
                      <Flex align="center" gap="3" mb="3">
                        <Controller
                          name="requiresApproval"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Text size="2" weight="medium">Requires Approval</Text>
                      </Flex>
                    </div>

                    {requiresApproval && (
                      <Flex gap="4" className="flex-col md:flex-row">
                        <div className="flex-1">
                          <Text as="div" size="2" mb="2" weight="medium">Approver Type</Text>
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
                                  <Select.Item value="social_worker">Social Worker</Select.Item>
                                  <Select.Item value="platform_admin">Platform Admin</Select.Item>
                                  <Select.Item value="system">System</Select.Item>
                                  <Select.Item value="none">None</Select.Item>
                                </Select.Content>
                              </Select.Root>
                            )}
                          />
                        </div>

                        <div className="flex-1">
                          <Text as="div" size="2" mb="2" weight="medium">Specific Approver ID (Optional)</Text>
                          <TextField.Root
                            placeholder="Specific user ID who should approve"
                            {...register('specificApproverId')}
                          />
                        </div>
                      </Flex>
                    )}
                  </div>
                </Box>
              </Card>

              {/* Recurring Settings */}
              <Card>
                <Box p="4">
                  <Heading size="4" mb="4">Recurring Settings</Heading>
                  
                  <div className="space-y-4">
                    <div>
                      <Flex align="center" gap="3" mb="3">
                        <Controller
                          name="isRecurring"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Text size="2" weight="medium">Recurring Task</Text>
                      </Flex>
                    </div>

                    {isRecurring && (
                      <div className="space-y-4">
                        <Flex gap="4" className="flex-col md:flex-row">
                          <div className="flex-1">
                            <Text as="div" size="2" mb="2" weight="medium">Frequency</Text>
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
                          </div>

                          <div className="flex-1">
                            <Text as="div" size="2" mb="2" weight="medium">Interval</Text>
                            <TextField.Root
                              type="number"
                              min="1"
                              placeholder="1"
                              {...register('recurringSchedule.interval')}
                            />
                          </div>

                          <div className="flex-1">
                            <Text as="div" size="2" mb="2" weight="medium">End Date</Text>
                            <TextField.Root
                              type="date"
                              {...register('recurringSchedule.endDate')}
                            />
                          </div>
                        </Flex>

                        {watch('recurringSchedule.frequency') === 'weekly' && (
                          <div>
                            <Text as="div" size="2" mb="2" weight="medium">Days of Week</Text>
                            <div className="flex flex-wrap gap-2">
                              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                                <Button
                                  key={day}
                                  type="button"
                                  variant={watch('recurringSchedule.daysOfWeek')?.includes(day) ? 'solid' : 'outline'}
                                  size="1"
                                  onClick={() => handleToggleRecurringDay(day)}
                                >
                                  {getDayName(day).slice(0, 3)}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Box>
              </Card>

              {/* External Resource */}
              <Card>
                <Box p="4">
                  <Heading size="4" mb="4">External Resource (Optional)</Heading>
                  
                  <div className="space-y-4">
                    <Flex gap="4" className="flex-col md:flex-row">
                      <div className="flex-1">
                        <Text as="div" size="2" mb="2" weight="medium">Platform</Text>
                        <TextField.Root
                          placeholder="e.g., Khan Academy, Google Classroom"
                          {...register('externalResource.platform')}
                        />
                      </div>

                      <div className="flex-1">
                        <Text as="div" size="2" mb="2" weight="medium">Resource ID</Text>
                        <TextField.Root
                          placeholder="External resource identifier"
                          {...register('externalResource.resourceId')}
                        />
                      </div>
                    </Flex>

                    <div>
                      <Text as="div" size="2" mb="2" weight="medium">URL</Text>
                      <TextField.Root
                        type="url"
                        placeholder="https://example.com/resource"
                        {...register('externalResource.url')}
                      />
                    </div>
                  </div>
                </Box>
              </Card>

              {/* Additional Settings */}
              <Card>
                <Box p="4">
                  <Heading size="4" mb="4">Additional Settings</Heading>
                  
                  <div className="space-y-4">
                    <Flex gap="4" className="flex-col md:flex-row">
                      <div className="flex-1">
                        <Text as="div" size="2" mb="2" weight="medium">Visibility Scope</Text>
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
                      </div>

                      <div className="flex-1">
                        <Text as="div" size="2" mb="2" weight="medium">Badge ID (Optional)</Text>
                        <TextField.Root
                          placeholder="Associated badge ID"
                          {...register('badgeId')}
                        />
                      </div>
                    </Flex>

                    <div>
                      <Flex align="center" gap="3">
                        <Controller
                          name="isFeatured"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <div>
                          <Text size="2" weight="medium">Featured Task</Text>
                          <Text size="1" color="gray" className="block">
                            Mark this task as featured or specially highlighted
                          </Text>
                        </div>
                      </Flex>
                    </div>
                  </div>
                </Box>
              </Card>
            </Tabs.Content>
          </Tabs.Root>

          {/* Submit Button */}
          <Card>
            <Box p="4">
              <Flex justify="end" gap="3">
                <Button variant="outline" type="button" onClick={() => navigate('/platform-admin/dashboard/tasks')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </Flex>
            </Box>
          </Card>
        </form>
      )}
    </div>
  )
}

export default CreateTask 