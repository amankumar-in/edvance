import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Box,
  Flex,
  Text,
  Button,
  TextField,
  TextArea,
  Select,
  Switch,
  Card,
  Badge,
  Separator
} from '@radix-ui/themes';
import { X, Calendar, Award, Users, School, Globe } from 'lucide-react';

const AdminTaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories = [],
  isLoading,
  title
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    pointValue: 10,
    dueDate: '',
    assignmentStrategy: 'role_based',
    targetCriteria: {
      roles: ['student'],
      schoolIds: [],
      classIds: [],
      gradeLevel: '',
      specificStudentIds: []
    },
    defaultVisibility: {
      forParents: true,
      forSchools: true,
      forStudents: false
    },
    attachments: [],
    instructions: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        pointValue: initialData.pointValue || 10,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        assignmentStrategy: initialData.assignmentStrategy || 'role_based',
        targetCriteria: initialData.targetCriteria || {
          roles: ['student'],
          schoolIds: [],
          classIds: [],
          gradeLevel: '',
          specificStudentIds: []
        },
        defaultVisibility: initialData.defaultVisibility || {
          forParents: true,
          forSchools: true,
          forStudents: false
        },
        attachments: initialData.attachments || [],
        instructions: initialData.instructions || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        category: '',
        pointValue: 10,
        dueDate: '',
        assignmentStrategy: 'role_based',
        targetCriteria: {
          roles: ['student'],
          schoolIds: [],
          classIds: [],
          gradeLevel: '',
          specificStudentIds: []
        },
        defaultVisibility: {
          forParents: true,
          forSchools: true,
          forStudents: false
        },
        attachments: [],
        instructions: '',
        isActive: true
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-fill point value based on category
    if (field === 'category') {
      const selectedCategory = categories.find(cat => cat.name === value);
      if (selectedCategory && selectedCategory.defaultPointValue) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          pointValue: selectedCategory.defaultPointValue
        }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleTargetCriteriaChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      targetCriteria: {
        ...prev.targetCriteria,
        [field]: value
      }
    }));
  };

  const handleVisibilityChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      defaultVisibility: {
        ...prev.defaultVisibility,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.pointValue < 1 || formData.pointValue > 100) {
      newErrors.pointValue = 'Point value must be between 1 and 100';
    }

    if (formData.assignmentStrategy === 'specific' && formData.targetCriteria.specificStudentIds.length === 0) {
      newErrors.specificStudents = 'At least one student must be selected for specific assignment';
    }

    if (formData.assignmentStrategy === 'school_based' && formData.targetCriteria.schoolIds.length === 0) {
      newErrors.schools = 'At least one school must be selected for school-based assignment';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

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

  const getStrategyDescription = (strategy) => {
    switch (strategy) {
      case 'specific':
        return 'Assign to specific students only';
      case 'role_based':
        return 'Assign to all students with specific roles';
      case 'school_based':
        return 'Assign to all students in specific schools';
      case 'global':
        return 'Assign to all students in the system';
      default:
        return '';
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
        <Dialog.Title>{title}</Dialog.Title>
        
        <form onSubmit={handleSubmit}>
          <Box mt="4">
            <Flex direction="column" gap="6">
              {/* Basic Information */}
              <Card>
                <Box p="4">
                  <Text size="3" weight="medium" mb="4">
                    Basic Information
                  </Text>
                  
                  <Flex direction="column" gap="4">
                    <Box>
                      <Text size="2" weight="medium" mb="2" as="div">
                        Title *
                      </Text>
                      <TextField.Root
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter task title"
                        color={errors.title ? 'red' : undefined}
                      />
                      {errors.title && (
                        <Text size="1" color="red" mt="1">
                          {errors.title}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text size="2" weight="medium" mb="2" as="div">
                        Description *
                      </Text>
                      <TextArea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe what students need to do"
                        rows={3}
                        color={errors.description ? 'red' : undefined}
                      />
                      {errors.description && (
                        <Text size="1" color="red" mt="1">
                          {errors.description}
                        </Text>
                      )}
                    </Box>

                    <Flex gap="4">
                      <Box style={{ flex: 1 }}>
                        <Text size="2" weight="medium" mb="2" as="div">
                          Category *
                        </Text>
                        <Select.Root
                          value={formData.category}
                          onValueChange={(value) => handleInputChange('category', value)}
                        >
                          <Select.Trigger style={{ width: '100%' }} color={errors.category ? 'red' : undefined}>
                            {formData.category || 'Select category'}
                          </Select.Trigger>
                          <Select.Content>
                            {categories?.map(cat => (
                              <Select.Item key={cat._id} value={cat.name}>
                                {cat.name}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                        {errors.category && (
                          <Text size="1" color="red" mt="1">
                            {errors.category}
                          </Text>
                        )}
                      </Box>

                      <Box style={{ flex: 1 }}>
                        <Text size="2" weight="medium" mb="2" as="div">
                          Point Value *
                        </Text>
                        <TextField.Root
                          type="number"
                          min="1"
                          max="100"
                          value={formData.pointValue}
                          onChange={(e) => handleInputChange('pointValue', parseInt(e.target.value))}
                          color={errors.pointValue ? 'red' : undefined}
                        />
                        {errors.pointValue && (
                          <Text size="1" color="red" mt="1">
                            {errors.pointValue}
                          </Text>
                        )}
                      </Box>
                    </Flex>

                    <Box>
                      <Text size="2" weight="medium" mb="2" as="div">
                        Due Date (Optional)
                      </Text>
                      <TextField.Root
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Card>

              {/* Assignment Strategy */}
              <Card>
                <Box p="4">
                  <Text size="3" weight="medium" mb="4">
                    Assignment Strategy
                  </Text>
                  
                  <Flex direction="column" gap="4">
                    <Box>
                      <Text size="2" weight="medium" mb="3" as="div">
                        How should this task be assigned?
                      </Text>
                      
                      <Flex direction="column" gap="3">
                        {[
                          { value: 'specific', label: 'Specific Students' },
                          { value: 'role_based', label: 'Role Based' },
                          { value: 'school_based', label: 'School Based' },
                          { value: 'global', label: 'Global Assignment' }
                        ].map((strategy) => (
                          <Card
                            key={strategy.value}
                            style={{ 
                              cursor: 'pointer',
                              borderColor: formData.assignmentStrategy === strategy.value ? 'var(--purple-7)' : undefined,
                              backgroundColor: formData.assignmentStrategy === strategy.value ? 'var(--purple-2)' : undefined
                            }}
                            onClick={() => handleInputChange('assignmentStrategy', strategy.value)}
                          >
                            <Box p="3">
                              <Flex align="center" gap="2" mb="2">
                                {getStrategyIcon(strategy.value)}
                                <Text size="2" weight="medium">
                                  {strategy.label}
                                </Text>
                                {formData.assignmentStrategy === strategy.value && (
                                  <Badge color="purple" size="1">Selected</Badge>
                                )}
                              </Flex>
                              <Text size="1" color="gray">
                                {getStrategyDescription(strategy.value)}
                              </Text>
                            </Box>
                          </Card>
                        ))}
                      </Flex>
                    </Box>

                    {/* Strategy-specific options */}
                    {formData.assignmentStrategy === 'specific' && (
                      <Box>
                        <Text size="2" weight="medium" mb="2" as="div">
                          Select Students *
                        </Text>
                        <Card p="3" style={{ backgroundColor: 'var(--gray-2)' }}>
                          <Text size="2" color="gray" mb="2">
                            Search and select specific students to assign this task to
                          </Text>
                          <TextField.Root
                            placeholder="Search students by name or email..."
                            mb="2"
                          />
                          <Text size="1" color="gray">
                            Selected: {formData.targetCriteria.specificStudentIds.length} students
                          </Text>
                          {formData.targetCriteria.specificStudentIds.length === 0 && (
                            <Text size="1" color="red" mt="1">
                              Please select at least one student
                            </Text>
                          )}
                        </Card>
                      </Box>
                    )}

                    {formData.assignmentStrategy === 'role_based' && (
                      <Flex direction="column" gap="4">
                        <Box>
                          <Text size="2" weight="medium" mb="2" as="div">
                            Target Roles *
                          </Text>
                          <Flex direction="column" gap="2">
                            {['student', 'teacher', 'parent', 'social_worker'].map((role) => (
                              <Flex key={role} align="center" gap="2" p="2" style={{ backgroundColor: 'var(--gray-2)', borderRadius: 'var(--radius-2)' }}>
                                <input
                                  type="checkbox"
                                  checked={formData.targetCriteria.roles.includes(role)}
                                  onChange={(e) => {
                                    const roles = e.target.checked 
                                      ? [...formData.targetCriteria.roles, role]
                                      : formData.targetCriteria.roles.filter(r => r !== role);
                                    handleTargetCriteriaChange('roles', roles);
                                  }}
                                />
                                <Text size="2" style={{ textTransform: 'capitalize' }}>
                                  {role.replace('_', ' ')}
                                </Text>
                              </Flex>
                            ))}
                          </Flex>
                        </Box>

                        <Box>
                          <Text size="2" weight="medium" mb="2" as="div">
                            Grade Level (Optional)
                          </Text>
                          <Select.Root
                            value={formData.targetCriteria.gradeLevel || "all"}
                            onValueChange={(value) => handleTargetCriteriaChange('gradeLevel', value === "all" ? "" : value)}
                          >
                            <Select.Trigger style={{ width: '100%' }}>
                              {formData.targetCriteria.gradeLevel || 'All grade levels'}
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item value="all">All grade levels</Select.Item>
                              <Select.Item value="K">Kindergarten</Select.Item>
                              <Select.Item value="1">1st Grade</Select.Item>
                              <Select.Item value="2">2nd Grade</Select.Item>
                              <Select.Item value="3">3rd Grade</Select.Item>
                              <Select.Item value="4">4th Grade</Select.Item>
                              <Select.Item value="5">5th Grade</Select.Item>
                              <Select.Item value="6">6th Grade</Select.Item>
                              <Select.Item value="7">7th Grade</Select.Item>
                              <Select.Item value="8">8th Grade</Select.Item>
                              <Select.Item value="9">9th Grade</Select.Item>
                              <Select.Item value="10">10th Grade</Select.Item>
                              <Select.Item value="11">11th Grade</Select.Item>
                              <Select.Item value="12">12th Grade</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        </Box>
                      </Flex>
                    )}

                    {formData.assignmentStrategy === 'school_based' && (
                      <Box>
                        <Text size="2" weight="medium" mb="2" as="div">
                          Select Schools *
                        </Text>
                        <Card p="3" style={{ backgroundColor: 'var(--gray-2)' }}>
                          <Text size="2" color="gray" mb="2">
                            Search and select schools to assign this task to all their students
                          </Text>
                          <TextField.Root
                            placeholder="Search schools by name..."
                            mb="2"
                          />
                          <Text size="1" color="gray">
                            Selected: {formData.targetCriteria.schoolIds.length} schools
                          </Text>
                          {formData.targetCriteria.schoolIds.length === 0 && (
                            <Text size="1" color="red" mt="1">
                              Please select at least one school
                            </Text>
                          )}
                        </Card>
                      </Box>
                    )}

                    {formData.assignmentStrategy === 'global' && (
                      <Box>
                        <Card p="3" style={{ backgroundColor: 'var(--green-2)', borderColor: 'var(--green-7)' }}>
                          <Flex align="center" gap="2">
                            <Globe size={16} />
                            <Text size="2" weight="medium">
                              Global Assignment
                            </Text>
                          </Flex>
                          <Text size="1" color="gray" mt="1">
                            This task will be assigned to all students in the system automatically.
                          </Text>
                        </Card>
                      </Box>
                    )}
                  </Flex>
                </Box>
              </Card>

              {/* Default Visibility Settings */}
              <Card>
                <Box p="4">
                  <Text size="3" weight="medium" mb="4">
                    Default Visibility Settings
                  </Text>
                  
                  <Flex direction="column" gap="4">
                    <Text size="2" color="gray">
                      Control who can see and manage this task by default. Individual parents and schools can override these settings.
                    </Text>
                    
                    <Flex direction="column" gap="3">
                      <Flex align="center" justify="between" p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: 'var(--radius-2)' }}>
                        <Box>
                          <Text size="2" weight="medium">Parents can control visibility</Text>
                          <Text size="1" color="gray">
                            Allow parents to hide/show this task for their children
                          </Text>
                        </Box>
                        <Switch
                          checked={formData.defaultVisibility.forParents}
                          onCheckedChange={(checked) => handleVisibilityChange('forParents', checked)}
                        />
                      </Flex>

                      <Flex align="center" justify="between" p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: 'var(--radius-2)' }}>
                        <Box>
                          <Text size="2" weight="medium">Schools can control visibility</Text>
                          <Text size="1" color="gray">
                            Allow schools to hide/show this task for their students
                          </Text>
                        </Box>
                        <Switch
                          checked={formData.defaultVisibility.forSchools}
                          onCheckedChange={(checked) => handleVisibilityChange('forSchools', checked)}
                        />
                      </Flex>

                      <Flex align="center" justify="between" p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: 'var(--radius-2)' }}>
                        <Box>
                          <Text size="2" weight="medium">Students can see directly</Text>
                          <Text size="1" color="gray">
                            Allow students to see this task without parent/school approval
                          </Text>
                        </Box>
                        <Switch
                          checked={formData.defaultVisibility.forStudents}
                          onCheckedChange={(checked) => handleVisibilityChange('forStudents', checked)}
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>
              </Card>

              {/* Additional Settings */}
              <Card>
                <Box p="4">
                  <Text size="3" weight="medium" mb="4">
                    Additional Settings
                  </Text>
                  
                  <Flex direction="column" gap="4">
                    <Box>
                      <Text size="2" weight="medium" mb="2" as="div">
                        Instructions (Optional)
                      </Text>
                      <TextArea
                        value={formData.instructions}
                        onChange={(e) => handleInputChange('instructions', e.target.value)}
                        placeholder="Additional instructions for completing this task"
                        rows={3}
                      />
                    </Box>

                    <Flex align="center" justify="between" p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: 'var(--radius-2)' }}>
                      <Box>
                        <Text size="2" weight="medium">Active Task</Text>
                        <Text size="1" color="gray">
                          Inactive tasks won't be assigned to new students
                        </Text>
                      </Box>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                      />
                    </Flex>
                  </Flex>
                </Box>
              </Card>
            </Flex>
          </Box>

          <Separator my="6" />

          <Flex gap="3" justify="end">
            <Button type="button" variant="soft" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default AdminTaskForm; 