import React, { useState, useMemo, useCallback } from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  Select,
  Badge,
  IconButton,
  Dialog,
  Separator,
  Callout,
  Table
} from '@radix-ui/themes'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Settings,
  Palette,
  Tag
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'

// Import hooks
import {
  useTaskCategories,
  useCreateTaskCategory,
  useUpdateTaskCategory,
  useDeleteTaskCategory,
  useCreateDefaultTaskCategories,
  useMigrateTaskCategoryIcons
} from '../../api/task/taskCategory.mutations'

const Categories = () => {
  const [filters, setFilters] = useState({
    type: '',
    visibility: '',
    isSystem: '',
    search: ''
  })
  const [searchInput, setSearchInput] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchInput
      }))
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchInput])

  // Create stable filters object with only non-empty values
  const stableFilters = useMemo(() => {
    const nonEmptyFilters = {}
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        nonEmptyFilters[key] = value.trim()
      }
    })
    return nonEmptyFilters
  }, [filters])

  // React Query hooks
  const { data: categoriesData, isLoading, error } = useTaskCategories(stableFilters)
  const { mutate: createCategory, isPending: isCreating } = useCreateTaskCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateTaskCategory()
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteTaskCategory()
  const { mutate: createDefaults, isPending: isCreatingDefaults } = useCreateDefaultTaskCategories()
  const { mutate: migrateIcons, isPending: isMigratingIcons } = useMigrateTaskCategoryIcons()

  const categories = categoriesData?.data || []

  // Form for create/edit
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      type: 'custom',
      icon: '📚',
      color: '#4285F4',
      visibility: 'private',
      defaultPointValue: 10,
      subject: '',
      gradeLevel: '',
      displayOrder: 0
    }
  })

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || ''
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      type: '',
      visibility: '',
      isSystem: '',
      search: ''
    })
    setSearchInput('')
  }, [])

  const handleCreateCategory = (data) => {
    createCategory(data, {
      onSuccess: () => {
        toast.success('Category created successfully')
        setIsCreateDialogOpen(false)
        reset()
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to create category')
      }
    })
  }

  const handleEditCategory = (data) => {
    updateCategory({ id: selectedCategory._id, data }, {
      onSuccess: () => {
        toast.success('Category updated successfully')
        setIsEditDialogOpen(false)
        setSelectedCategory(null)
        reset()
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to update category')
      }
    })
  }

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(categoryId, {
        onSuccess: () => {
          toast.success('Category deleted successfully')
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'Failed to delete category')
        }
      })
    }
  }

  const handleCreateDefaults = () => {
    createDefaults(undefined, {
      onSuccess: () => {
        toast.success('Default categories created successfully')
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to create default categories')
      }
    })
  }

  const handleMigrateIcons = () => {
    migrateIcons(undefined, {
      onSuccess: () => {
        toast.success('Icons migrated successfully')
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to migrate icons')
      }
    })
  }

  const openEditDialog = (category) => {
    setSelectedCategory(category)
    reset({
      name: category.name,
      description: category.description || '',
      type: category.type,
      icon: category.icon || '',
      color: category.color || '#4285F4',
      visibility: category.visibility,
      defaultPointValue: category.defaultPointValue,
      subject: category.subject || '',
      gradeLevel: category.gradeLevel || '',
      displayOrder: category.displayOrder || 0
    })
    setIsEditDialogOpen(true)
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

  const getVisibilityColor = (visibility) => {
    const colors = {
      private: 'gray',
      family: 'blue',
      class: 'green',
      school: 'orange',
      public: 'purple'
    }
    return colors[visibility] || 'gray'
  }

  if (error) {
    return (
      <Box p="6">
        <Callout.Root color="red">
          <Callout.Icon>
            <AlertCircle />
          </Callout.Icon>
          <Callout.Text>
            Failed to load categories: {error.message}
          </Callout.Text>
        </Callout.Root>
      </Box>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Box>
        <Flex justify="between" align="center">
          <Box>
            <Heading as="h1" size="6" weight="medium">Category Management</Heading>
            <Text color="gray" size="2" className="mt-1">
              Manage task categories for organizing and classifying tasks
            </Text>
          </Box>
          <Flex gap="2">
            <Button 
              variant="outline" 
              size="2" 
              onClick={handleCreateDefaults}
              disabled={isCreatingDefaults}
            >
              <Settings size={16} />
              {isCreatingDefaults ? 'Creating...' : 'Create Defaults'}
            </Button>
            <Button 
              variant="outline" 
              size="2" 
              onClick={handleMigrateIcons}
              disabled={isMigratingIcons}
              title="Convert old string icons to emoji icons for better display"
            >
              <Palette size={16} />
              {isMigratingIcons ? 'Migrating...' : 'Migrate Icons'}
            </Button>
            <Button 
              size="2" 
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus size={16} />
              New Category
            </Button>
          </Flex>
        </Flex>
      </Box>

      <Separator size="4" />

      {/* Filters */}
      <Card>
        <Box p="4">
          <Flex justify="between" align="center" mb="4">
            <Flex align="center" gap="2">
              <Filter size={16} />
              <Text size="3" weight="medium">Filters</Text>
            </Flex>
            <Button variant="ghost" size="1" onClick={clearFilters}>
              <RotateCcw size={14} />
              Clear
            </Button>
          </Flex>

          <Flex gap="4" wrap="wrap">
            <Box style={{ minWidth: '200px' }}>
              <Text size="2" weight="medium" mb="2">Search</Text>
              <TextField.Root
                placeholder="Search categories..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              >
                <TextField.Slot>
                  <Search size={16} />
                </TextField.Slot>
              </TextField.Root>
            </Box>

            <Box style={{ minWidth: '150px' }}>
              <Text size="2" weight="medium" mb="2">Type</Text>
              <Select.Root 
                value={filters.type || undefined} 
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <Select.Trigger placeholder="All Types" />
                <Select.Content>
                  <Select.Item value="academic">Academic</Select.Item>
                  <Select.Item value="home">Home</Select.Item>
                  <Select.Item value="behavior">Behavior</Select.Item>
                  <Select.Item value="extracurricular">Extracurricular</Select.Item>
                  <Select.Item value="attendance">Attendance</Select.Item>
                  <Select.Item value="system">System</Select.Item>
                  <Select.Item value="custom">Custom</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box style={{ minWidth: '150px' }}>
              <Text size="2" weight="medium" mb="2">Visibility</Text>
              <Select.Root 
                value={filters.visibility || undefined} 
                onValueChange={(value) => handleFilterChange('visibility', value)}
              >
                <Select.Trigger placeholder="All Visibility" />
                <Select.Content>
                  <Select.Item value="private">Private</Select.Item>
                  <Select.Item value="family">Family</Select.Item>
                  <Select.Item value="class">Class</Select.Item>
                  <Select.Item value="school">School</Select.Item>
                  <Select.Item value="public">Public</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box style={{ minWidth: '150px' }}>
              <Text size="2" weight="medium" mb="2">System Categories</Text>
              <Select.Root 
                value={filters.isSystem || undefined} 
                onValueChange={(value) => handleFilterChange('isSystem', value)}
              >
                <Select.Trigger placeholder="All Categories" />
                <Select.Content>
                  <Select.Item value="true">System Only</Select.Item>
                  <Select.Item value="false">Custom Only</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>
        </Box>
      </Card>

      {/* Categories Table */}
      <Card>
        <Box p="4">
          <Flex justify="between" align="center" mb="4">
            <Text size="3" weight="medium">
              Categories ({categories.length})
            </Text>
          </Flex>

          {isLoading ? (
            <Box p="8" style={{ textAlign: 'center' }}>
              <Text color="gray">Loading categories...</Text>
            </Box>
          ) : categories.length === 0 ? (
            <Box p="8" style={{ textAlign: 'center' }}>
              <Text color="gray">No categories found</Text>
            </Box>
          ) : (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Visibility</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Points</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>System</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {categories.map((category) => (
                  <Table.Row key={category._id}>
                    <Table.Cell>
                      <Flex align="center" gap="2">
                        {category.icon && (
                          <Box 
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              backgroundColor: category.color || '#4285F4',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px'
                            }}
                          >
                            {category.icon}
                          </Box>
                        )}
                        <Box>
                          <Text size="2" weight="medium">{category.name}</Text>
                          {category.description && (
                            <Text size="1" color="gray" style={{ display: 'block' }}>
                              {category.description}
                            </Text>
                          )}
                        </Box>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={getTypeColor(category.type)} variant="soft">
                        {category.type}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={getVisibilityColor(category.visibility)} variant="soft">
                        {category.visibility}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{category.defaultPointValue}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      {category.isSystem ? (
                        <Badge color="gray" variant="soft">
                          <CheckCircle size={12} />
                          System
                        </Badge>
                      ) : (
                        <Badge color="blue" variant="soft">
                          Custom
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="1">
                        <IconButton
                          size="1"
                          variant="ghost"
                          onClick={() => openEditDialog(category)}
                          disabled={category.isSystem}
                        >
                          <Edit size={14} />
                        </IconButton>
                        <IconButton
                          size="1"
                          variant="ghost"
                          color="red"
                          onClick={() => handleDeleteCategory(category._id)}
                          disabled={category.isSystem || isDeleting}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Box>
      </Card>

      {/* Create Category Dialog */}
      <Dialog.Root open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <Dialog.Content style={{ maxWidth: '500px' }}>
          <Dialog.Title>Create New Category</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Create a new category for organizing tasks
          </Dialog.Description>

          <form onSubmit={handleSubmit(handleCreateCategory)} className="space-y-4">
            <div>
              <Text as="div" size="2" mb="2" weight="medium">Name *</Text>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <TextField.Root {...field} placeholder="Category name" />
                )}
              />
              {errors.name && (
                <Text size="1" color="red" mt="1">{errors.name.message}</Text>
              )}
            </div>

            <div>
              <Text as="div" size="2" mb="2" weight="medium">Description</Text>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField.Root {...field} placeholder="Category description" />
                )}
              />
            </div>

            <Flex gap="4">
              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Type *</Text>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: "Type is required" }}
                  render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="academic">Academic</Select.Item>
                        <Select.Item value="home">Home</Select.Item>
                        <Select.Item value="behavior">Behavior</Select.Item>
                        <Select.Item value="extracurricular">Extracurricular</Select.Item>
                        <Select.Item value="attendance">Attendance</Select.Item>
                        <Select.Item value="custom">Custom</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  )}
                />
              </div>

              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Visibility</Text>
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
            </Flex>

            <Flex gap="4">
              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Icon</Text>
                <Controller
                  name="icon"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root {...field} placeholder="📚" />
                  )}
                />
              </div>

              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Color</Text>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root {...field} type="color" />
                  )}
                />
              </div>

              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Default Points</Text>
                <Controller
                  name="defaultPointValue"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root 
                      {...field} 
                      type="number" 
                      min="0"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </Flex>

            <Flex gap="4">
              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Subject</Text>
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root {...field} placeholder="e.g., Mathematics" />
                  )}
                />
              </div>

              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Grade Level</Text>
                <Controller
                  name="gradeLevel"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root 
                      {...field} 
                      type="number" 
                      min="1" 
                      max="12"
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    />
                  )}
                />
              </div>

              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Display Order</Text>
                <Controller
                  name="displayOrder"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root 
                      {...field} 
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Category'}
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit Category Dialog */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Content style={{ maxWidth: '500px' }}>
          <Dialog.Title>Edit Category</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Update category details
          </Dialog.Description>

          <form onSubmit={handleSubmit(handleEditCategory)} className="space-y-4">
            <div>
              <Text as="div" size="2" mb="2" weight="medium">Name *</Text>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <TextField.Root {...field} placeholder="Category name" />
                )}
              />
              {errors.name && (
                <Text size="1" color="red" mt="1">{errors.name.message}</Text>
              )}
            </div>

            <div>
              <Text as="div" size="2" mb="2" weight="medium">Description</Text>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField.Root {...field} placeholder="Category description" />
                )}
              />
            </div>

            <Flex gap="4">
              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Type *</Text>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: "Type is required" }}
                  render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="academic">Academic</Select.Item>
                        <Select.Item value="home">Home</Select.Item>
                        <Select.Item value="behavior">Behavior</Select.Item>
                        <Select.Item value="extracurricular">Extracurricular</Select.Item>
                        <Select.Item value="attendance">Attendance</Select.Item>
                        <Select.Item value="custom">Custom</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  )}
                />
              </div>

              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Visibility</Text>
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
            </Flex>

            <Flex gap="4">
              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Icon</Text>
                <Controller
                  name="icon"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root {...field} placeholder="📚" />
                  )}
                />
              </div>

              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Color</Text>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root {...field} type="color" />
                  )}
                />
              </div>

              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Default Points</Text>
                <Controller
                  name="defaultPointValue"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root 
                      {...field} 
                      type="number" 
                      min="0"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </Flex>

            <Flex gap="4">
              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Subject</Text>
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root {...field} placeholder="e.g., Mathematics" />
                  )}
                />
              </div>

              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Grade Level</Text>
                <Controller
                  name="gradeLevel"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root 
                      {...field} 
                      type="number" 
                      min="1" 
                      max="12"
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    />
                  )}
                />
              </div>

              <div className="flex-1">
                <Text as="div" size="2" mb="2" weight="medium">Display Order</Text>
                <Controller
                  name="displayOrder"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root 
                      {...field} 
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Category'}
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}

export default Categories 