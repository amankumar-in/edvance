import React from 'react';
import {
    Dialog,
    Button,
    Flex,
    Text,
    Badge,
    Box,
    Heading,
    Separator,
    Card
} from '@radix-ui/themes';
import { X, Edit, Copy, Calendar, User, Eye, Settings } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_TYPE_COLORS = {
    academic: '#4285F4',
    home: '#34A853',
    behavior: '#FBBC04',
    extracurricular: '#9C27B0',
    attendance: '#FF9800',
    system: '#607D8B',
    custom: '#E91E63'
};

const VISIBILITY_LABELS = {
    private: 'Private',
    family: 'Family',
    class: 'Class',
    school: 'School',
    public: 'Public'
};

const CREATOR_ROLE_LABELS = {
    parent: 'Parent',
    teacher: 'Teacher',
    school_admin: 'School Admin',
    social_worker: 'Social Worker',
    platform_admin: 'Platform Admin',
    system: 'System'
};

function TaskCategoryDetails({ 
    isOpen, 
    onClose, 
    category, 
    onEdit, 
    onDuplicate 
}) {
    if (!category) return null;

    const getTypeColor = (type) => {
        return CATEGORY_TYPE_COLORS[type] || '#607D8B';
    };

    const handleEdit = () => {
        onEdit(category);
        onClose();
    };

    const handleDuplicate = () => {
        onDuplicate(category);
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Content style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                <Dialog.Title>
                    <Flex align="center" justify="between">
                        <Heading size="5">Category Details</Heading>
                        <Dialog.Close>
                            <Button variant="ghost" size="2">
                                <X size={16} />
                            </Button>
                        </Dialog.Close>
                    </Flex>
                </Dialog.Title>

                <Separator size="4" style={{ margin: '16px 0' }} />

                <Flex direction="column" gap="4">
                    {/* Category Header */}
                    <Card>
                        <Box p="4">
                            <Flex align="center" gap="4">
                                <Text size="6">{category.icon}</Text>
                                <Box style={{ flex: 1 }}>
                                    <Flex align="center" gap="2" style={{ marginBottom: '8px' }}>
                                        <Heading size="4">{category.name}</Heading>
                                        {category.isSystem && (
                                            <Badge size="2" color="gray">
                                                System Category
                                            </Badge>
                                        )}
                                    </Flex>
                                    {category.description && (
                                        <Text size="3" color="gray">
                                            {category.description}
                                        </Text>
                                    )}
                                </Box>
                            </Flex>
                        </Box>
                    </Card>

                    {/* Category Properties */}
                    <Card>
                        <Box p="4">
                            <Heading size="3" style={{ marginBottom: '16px' }}>
                                Properties
                            </Heading>
                            
                            <Flex direction="column" gap="3">
                                <Flex align="center" justify="between">
                                    <Text size="2" color="gray">Type</Text>
                                    <Badge 
                                        style={{ 
                                            backgroundColor: getTypeColor(category.type) + '20',
                                            color: getTypeColor(category.type),
                                            border: `1px solid ${getTypeColor(category.type)}40`
                                        }}
                                    >
                                        {category.type}
                                    </Badge>
                                </Flex>

                                <Flex align="center" justify="between">
                                    <Text size="2" color="gray">Default Point Value</Text>
                                    <Text size="2" weight="medium">
                                        {category.defaultPointValue} points
                                    </Text>
                                </Flex>

                                <Flex align="center" justify="between">
                                    <Text size="2" color="gray">Visibility</Text>
                                    <Flex align="center" gap="1">
                                        <Eye size={14} />
                                        <Text size="2">
                                            {VISIBILITY_LABELS[category.visibility]}
                                        </Text>
                                    </Flex>
                                </Flex>

                                <Flex align="center" justify="between">
                                    <Text size="2" color="gray">Display Order</Text>
                                    <Text size="2">{category.displayOrder}</Text>
                                </Flex>

                                <Flex align="center" justify="between">
                                    <Text size="2" color="gray">Color</Text>
                                    <Flex align="center" gap="2">
                                        <Box
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                backgroundColor: category.color,
                                                borderRadius: '4px',
                                                border: '1px solid var(--gray-6)'
                                            }}
                                        />
                                        <Text size="2" style={{ fontFamily: 'monospace' }}>
                                            {category.color}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Box>
                    </Card>

                    {/* Academic Details */}
                    {category.type === 'academic' && (category.subject || category.gradeLevel) && (
                        <Card>
                            <Box p="4">
                                <Heading size="3" style={{ marginBottom: '16px' }}>
                                    Academic Details
                                </Heading>
                                
                                <Flex direction="column" gap="3">
                                    {category.subject && (
                                        <Flex align="center" justify="between">
                                            <Text size="2" color="gray">Subject</Text>
                                            <Text size="2" weight="medium">
                                                {category.subject}
                                            </Text>
                                        </Flex>
                                    )}

                                    {category.gradeLevel && (
                                        <Flex align="center" justify="between">
                                            <Text size="2" color="gray">Grade Level</Text>
                                            <Text size="2" weight="medium">
                                                Grade {category.gradeLevel}
                                            </Text>
                                        </Flex>
                                    )}
                                </Flex>
                            </Box>
                        </Card>
                    )}

                    {/* Creation Info */}
                    <Card>
                        <Box p="4">
                            <Heading size="3" style={{ marginBottom: '16px' }}>
                                Creation Information
                            </Heading>
                            
                            <Flex direction="column" gap="3">
                                <Flex align="center" justify="between">
                                    <Text size="2" color="gray">Created By</Text>
                                    <Flex align="center" gap="1">
                                        <User size={14} />
                                        <Text size="2">
                                            {CREATOR_ROLE_LABELS[category.creatorRole] || category.creatorRole}
                                        </Text>
                                    </Flex>
                                </Flex>

                                <Flex align="center" justify="between">
                                    <Text size="2" color="gray">Created Date</Text>
                                    <Flex align="center" gap="1">
                                        <Calendar size={14} />
                                        <Text size="2">
                                            {format(new Date(category.createdAt), 'MMM dd, yyyy HH:mm')}
                                        </Text>
                                    </Flex>
                                </Flex>

                                <Flex align="center" justify="between">
                                    <Text size="2" color="gray">Last Updated</Text>
                                    <Flex align="center" gap="1">
                                        <Calendar size={14} />
                                        <Text size="2">
                                            {format(new Date(category.updatedAt), 'MMM dd, yyyy HH:mm')}
                                        </Text>
                                    </Flex>
                                </Flex>

                                {category.schoolId && (
                                    <Flex align="center" justify="between">
                                        <Text size="2" color="gray">School ID</Text>
                                        <Text size="2" style={{ fontFamily: 'monospace' }}>
                                            {category.schoolId}
                                        </Text>
                                    </Flex>
                                )}
                            </Flex>
                        </Box>
                    </Card>

                    {/* Additional Metadata */}
                    {category.metadata && Object.keys(category.metadata).length > 0 && (
                        <Card>
                            <Box p="4">
                                <Heading size="3" style={{ marginBottom: '16px' }}>
                                    Additional Information
                                </Heading>
                                
                                <Flex direction="column" gap="3">
                                    {Object.entries(category.metadata).map(([key, value]) => (
                                        <Flex key={key} align="center" justify="between">
                                            <Text size="2" color="gray" style={{ textTransform: 'capitalize' }}>
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </Text>
                                            <Text size="2">
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </Text>
                                        </Flex>
                                    ))}
                                </Flex>
                            </Box>
                        </Card>
                    )}

                    {/* Actions */}
                    <Flex gap="3" justify="end" style={{ marginTop: '16px' }}>
                        <Button variant="soft" onClick={handleDuplicate}>
                            <Copy size={16} />
                            Duplicate
                        </Button>
                        
                        <Button 
                            onClick={handleEdit}
                            disabled={category.isSystem}
                        >
                            <Edit size={16} />
                            {category.isSystem ? 'Cannot Edit System Category' : 'Edit Category'}
                        </Button>
                    </Flex>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}

export default TaskCategoryDetails; 