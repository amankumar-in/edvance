import React, { useState, useEffect } from 'react';
import {
    Dialog,
    Button,
    Flex,
    Text,
    TextField,
    TextArea,
    Select,
    Box,
    Badge,
    Heading,
    Separator
} from '@radix-ui/themes';
import { X, Save, Loader2 } from 'lucide-react';

const CATEGORY_TYPES = [
    { value: 'academic', label: 'Academic' },
    { value: 'home', label: 'Home' },
    { value: 'behavior', label: 'Behavior' },
    { value: 'extracurricular', label: 'Extracurricular' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'custom', label: 'Custom' }
];

const VISIBILITY_OPTIONS = [
    { value: 'private', label: 'Private' },
    { value: 'family', label: 'Family' },
    { value: 'class', label: 'Class' },
    { value: 'school', label: 'School' },
    { value: 'public', label: 'Public' }
];

const PREDEFINED_COLORS = [
    '#4285F4', '#34A853', '#FBBC04', '#EA4335', '#9C27B0',
    '#FF9800', '#795548', '#607D8B', '#E91E63', '#00BCD4'
];

const PREDEFINED_ICONS = [
    '📚', '🏠', '⭐', '🎯', '📝', '🎨', '🏃‍♂️', '🧮', '🔬', '📖',
    '✏️', '🎵', '🏆', '📊', '💡', '🎪', '🌟', '🎭', '🏅', '📋'
];

function TaskCategoryForm({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData = null, 
    isLoading = false,
    title = "Create Task Category"
}) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '📚',
        color: '#4285F4',
        type: 'academic',
        defaultPointValue: 10,
        visibility: 'private',
        displayOrder: 0,
        subject: '',
        gradeLevel: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                icon: initialData.icon || '📚',
                color: initialData.color || '#4285F4',
                type: initialData.type || 'academic',
                defaultPointValue: initialData.defaultPointValue || 10,
                visibility: initialData.visibility || 'private',
                displayOrder: initialData.displayOrder || 0,
                subject: initialData.subject || '',
                gradeLevel: initialData.gradeLevel || ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                icon: '📚',
                color: '#4285F4',
                type: 'academic',
                defaultPointValue: 10,
                visibility: 'private',
                displayOrder: 0,
                subject: '',
                gradeLevel: ''
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        }
        
        if (!formData.type) {
            newErrors.type = 'Category type is required';
        }
        
        if (formData.defaultPointValue < 0) {
            newErrors.defaultPointValue = 'Point value must be positive';
        }

        if (formData.gradeLevel && (formData.gradeLevel < 1 || formData.gradeLevel > 12)) {
            newErrors.gradeLevel = 'Grade level must be between 1 and 12';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Clean up data before submission
        const submitData = {
            ...formData,
            defaultPointValue: Number(formData.defaultPointValue),
            displayOrder: Number(formData.displayOrder),
            gradeLevel: formData.gradeLevel ? Number(formData.gradeLevel) : undefined
        };

        // Remove empty fields
        Object.keys(submitData).forEach(key => {
            if (submitData[key] === '' || submitData[key] === undefined) {
                delete submitData[key];
            }
        });

        onSubmit(submitData);
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            icon: '📚',
            color: '#4285F4',
            type: 'academic',
            defaultPointValue: 10,
            visibility: 'private',
            displayOrder: 0,
            subject: '',
            gradeLevel: ''
        });
        setErrors({});
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleClose}>
            <Dialog.Content style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                <Dialog.Title>
                    <Flex align="center" justify="between">
                        <Heading size="5">{title}</Heading>
                        <Dialog.Close>
                            <Button variant="ghost" size="2">
                                <X size={16} />
                            </Button>
                        </Dialog.Close>
                    </Flex>
                </Dialog.Title>

                <Separator size="4" style={{ margin: '16px 0' }} />

                <form onSubmit={handleSubmit}>
                    <Flex direction="column" gap="4">
                        {/* Category Preview */}
                        <Box p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: '8px' }}>
                            <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block' }}>
                                Preview
                            </Text>
                            <Flex align="center" gap="2">
                                <Text size="4">{formData.icon}</Text>
                                <Badge 
                                    style={{ 
                                        backgroundColor: formData.color + '20',
                                        color: formData.color,
                                        border: `1px solid ${formData.color}40`
                                    }}
                                >
                                    {formData.name || 'Category Name'}
                                </Badge>
                                <Text size="2" color="gray">
                                    {formData.defaultPointValue} pts
                                </Text>
                            </Flex>
                        </Box>

                        {/* Basic Information */}
                        <Box>
                            <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block' }}>
                                Category Name *
                            </Text>
                            <TextField.Root
                                placeholder="Enter category name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                style={{ borderColor: errors.name ? 'var(--red-8)' : undefined }}
                            />
                            {errors.name && (
                                <Text size="1" color="red" style={{ marginTop: '4px', display: 'block' }}>
                                    {errors.name}
                                </Text>
                            )}
                        </Box>

                        <Box>
                            <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block' }}>
                                Description
                            </Text>
                            <TextArea
                                placeholder="Enter category description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={3}
                            />
                        </Box>

                        {/* Visual Settings */}
                        <Flex gap="4">
                            <Box style={{ flex: 1 }}>
                                <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block' }}>
                                    Icon
                                </Text>
                                <Flex gap="2" wrap="wrap">
                                    {PREDEFINED_ICONS.map((icon) => (
                                        <Button
                                            key={icon}
                                            type="button"
                                            variant={formData.icon === icon ? "solid" : "outline"}
                                            size="2"
                                            onClick={() => handleInputChange('icon', icon)}
                                        >
                                            {icon}
                                        </Button>
                                    ))}
                                </Flex>
                            </Box>

                            <Box style={{ flex: 1 }}>
                                <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block' }}>
                                    Color
                                </Text>
                                <Flex gap="2" wrap="wrap">
                                    {PREDEFINED_COLORS.map((color) => (
                                        <Button
                                            key={color}
                                            type="button"
                                            variant="outline"
                                            size="2"
                                            onClick={() => handleInputChange('color', color)}
                                            style={{
                                                backgroundColor: formData.color === color ? color : 'transparent',
                                                borderColor: color,
                                                width: '32px',
                                                height: '32px',
                                                padding: 0
                                            }}
                                        />
                                    ))}
                                </Flex>
                            </Box>
                        </Flex>

                        {/* Category Settings */}
                        <Flex gap="4">
                            <Box style={{ flex: 1 }}>
                                <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block' }}>
                                    Type *
                                </Text>
                                <Select.Root
                                    value={formData.type}
                                    onValueChange={(value) => handleInputChange('type', value)}
                                >
                                    <Select.Trigger style={{ width: '100%' }} />
                                    <Select.Content>
                                        {CATEGORY_TYPES.map((type) => (
                                            <Select.Item key={type.value} value={type.value}>
                                                {type.label}
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Root>
                                {errors.type && (
                                    <Text size="1" color="red" style={{ marginTop: '4px', display: 'block' }}>
                                        {errors.type}
                                    </Text>
                                )}
                            </Box>

                            <Box style={{ flex: 1 }}>
                                <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block' }}>
                                    Visibility
                                </Text>
                                <Select.Root
                                    value={formData.visibility}
                                    onValueChange={(value) => handleInputChange('visibility', value)}
                                >
                                    <Select.Trigger style={{ width: '100%' }} />
                                    <Select.Content>
                                        {VISIBILITY_OPTIONS.map((option) => (
                                            <Select.Item key={option.value} value={option.value}>
                                                {option.label}
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Root>
                            </Box>
                        </Flex>

                        <Flex gap="4">
                            <Box style={{ flex: 1 }}>
                                <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block' }}>
                                    Default Point Value
                                </Text>
                                <TextField.Root
                                    type="number"
                                    min="0"
                                    placeholder="10"
                                    value={formData.defaultPointValue}
                                    onChange={(e) => handleInputChange('defaultPointValue', e.target.value)}
                                    style={{ borderColor: errors.defaultPointValue ? 'var(--red-8)' : undefined }}
                                />
                                {errors.defaultPointValue && (
                                    <Text size="1" color="red" style={{ marginTop: '4px', display: 'block' }}>
                                        {errors.defaultPointValue}
                                    </Text>
                                )}
                            </Box>

                            <Box style={{ flex: 1 }}>
                                <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block' }}>
                                    Display Order
                                </Text>
                                <TextField.Root
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={formData.displayOrder}
                                    onChange={(e) => handleInputChange('displayOrder', e.target.value)}
                                />
                            </Box>
                        </Flex>

                        {/* Academic-specific fields */}
                        {formData.type === 'academic' && (
                            <Flex gap="4">
                                <Box style={{ flex: 1 }}>
                                    <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block' }}>
                                        Subject
                                    </Text>
                                    <TextField.Root
                                        placeholder="e.g., Mathematics, Science"
                                        value={formData.subject}
                                        onChange={(e) => handleInputChange('subject', e.target.value)}
                                    />
                                </Box>

                                <Box style={{ flex: 1 }}>
                                    <Text size="2" weight="medium" style={{ marginBottom: '8px', display: 'block' }}>
                                        Grade Level
                                    </Text>
                                    <TextField.Root
                                        type="number"
                                        min="1"
                                        max="12"
                                        placeholder="e.g., 8"
                                        value={formData.gradeLevel}
                                        onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                                        style={{ borderColor: errors.gradeLevel ? 'var(--red-8)' : undefined }}
                                    />
                                    {errors.gradeLevel && (
                                        <Text size="1" color="red" style={{ marginTop: '4px', display: 'block' }}>
                                            {errors.gradeLevel}
                                        </Text>
                                    )}
                                </Box>
                            </Flex>
                        )}

                        {/* Form Actions */}
                        <Flex gap="3" justify="end" style={{ marginTop: '16px' }}>
                            <Dialog.Close>
                                <Button variant="soft" color="gray">
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {initialData ? 'Update' : 'Create'} Category
                                    </>
                                )}
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default TaskCategoryForm; 