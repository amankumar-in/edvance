import React, { useState } from 'react';
import {
    Table,
    Button,
    Flex,
    Text,
    Badge,
    Box,
    TextField,
    Select,
    AlertDialog,
    Card,
    Heading,
    Separator
} from '@radix-ui/themes';
import { 
    Edit, 
    Trash2, 
    Search, 
    Filter, 
    MoreHorizontal,
    Eye,
    Copy,
    Archive
} from 'lucide-react';
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

function TaskCategoryList({ 
    categories = [], 
    isLoading = false, 
    onEdit, 
    onDelete, 
    onView,
    onDuplicate 
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [visibilityFilter, setVisibilityFilter] = useState('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Filter categories based on search and filters
    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = typeFilter === 'all' || category.type === typeFilter;
        const matchesVisibility = visibilityFilter === 'all' || category.visibility === visibilityFilter;
        
        return matchesSearch && matchesType && matchesVisibility;
    });

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (categoryToDelete) {
            onDelete(categoryToDelete._id);
            setCategoryToDelete(null);
            setDeleteDialogOpen(false);
        }
    };

    const handleDeleteCancel = () => {
        setCategoryToDelete(null);
        setDeleteDialogOpen(false);
    };

    const getTypeColor = (type) => {
        return CATEGORY_TYPE_COLORS[type] || '#607D8B';
    };

    if (isLoading) {
        return (
            <Card>
                <Box p="6">
                    <Flex align="center" justify="center" style={{ minHeight: '200px' }}>
                        <Text>Loading categories...</Text>
                    </Flex>
                </Box>
            </Card>
        );
    }

    return (
        <Card>
            <Box p="4">
                {/* Header */}
                <Flex align="center" justify="between" style={{ marginBottom: '16px' }}>
                    <Heading size="4">Task Categories</Heading>
                    <Text size="2" color="gray">
                        {filteredCategories.length} of {categories.length} categories
                    </Text>
                </Flex>

                <Separator size="4" style={{ margin: '16px 0' }} />

                {/* Filters */}
                <Flex gap="3" style={{ marginBottom: '16px' }} wrap="wrap">
                    <Box style={{ flex: 1, minWidth: '200px' }}>
                        <TextField.Root
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        >
                            <TextField.Slot>
                                <Search size={16} />
                            </TextField.Slot>
                        </TextField.Root>
                    </Box>

                    <Select.Root value={typeFilter} onValueChange={setTypeFilter}>
                        <Select.Trigger style={{ minWidth: '120px' }}>
                            <Filter size={16} />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value="all">All Types</Select.Item>
                            <Select.Item value="academic">Academic</Select.Item>
                            <Select.Item value="home">Home</Select.Item>
                            <Select.Item value="behavior">Behavior</Select.Item>
                            <Select.Item value="extracurricular">Extracurricular</Select.Item>
                            <Select.Item value="attendance">Attendance</Select.Item>
                            <Select.Item value="system">System</Select.Item>
                            <Select.Item value="custom">Custom</Select.Item>
                        </Select.Content>
                    </Select.Root>

                    <Select.Root value={visibilityFilter} onValueChange={setVisibilityFilter}>
                        <Select.Trigger style={{ minWidth: '120px' }}>
                            <Eye size={16} />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value="all">All Visibility</Select.Item>
                            <Select.Item value="private">Private</Select.Item>
                            <Select.Item value="family">Family</Select.Item>
                            <Select.Item value="class">Class</Select.Item>
                            <Select.Item value="school">School</Select.Item>
                            <Select.Item value="public">Public</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>

                {/* Categories Table */}
                {filteredCategories.length === 0 ? (
                    <Box p="6">
                        <Flex direction="column" align="center" gap="3">
                            <Text size="4" color="gray">📂</Text>
                            <Text size="3" weight="medium">No categories found</Text>
                            <Text size="2" color="gray">
                                {searchTerm || typeFilter !== 'all' || visibilityFilter !== 'all' 
                                    ? 'Try adjusting your filters' 
                                    : 'Create your first task category to get started'
                                }
                            </Text>
                        </Flex>
                    </Box>
                ) : (
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Points</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Visibility</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {filteredCategories.map((category) => (
                                <Table.Row key={category._id}>
                                    <Table.Cell>
                                        <Flex align="center" gap="3">
                                            <Text size="4">{category.icon}</Text>
                                            <Box>
                                                <Flex align="center" gap="2">
                                                    <Text size="3" weight="medium">
                                                        {category.name}
                                                    </Text>
                                                    {category.isSystem && (
                                                        <Badge size="1" color="gray">
                                                            System
                                                        </Badge>
                                                    )}
                                                </Flex>
                                                {category.description && (
                                                    <Text size="2" color="gray">
                                                        {category.description.length > 50 
                                                            ? `${category.description.substring(0, 50)}...`
                                                            : category.description
                                                        }
                                                    </Text>
                                                )}
                                                {category.subject && (
                                                    <Text size="1" color="blue">
                                                        {category.subject}
                                                        {category.gradeLevel && ` • Grade ${category.gradeLevel}`}
                                                    </Text>
                                                )}
                                            </Box>
                                        </Flex>
                                    </Table.Cell>

                                    <Table.Cell>
                                        <Badge 
                                            style={{ 
                                                backgroundColor: getTypeColor(category.type) + '20',
                                                color: getTypeColor(category.type),
                                                border: `1px solid ${getTypeColor(category.type)}40`
                                            }}
                                        >
                                            {category.type}
                                        </Badge>
                                    </Table.Cell>

                                    <Table.Cell>
                                        <Text size="2" weight="medium">
                                            {category.defaultPointValue} pts
                                        </Text>
                                    </Table.Cell>

                                    <Table.Cell>
                                        <Text size="2">
                                            {VISIBILITY_LABELS[category.visibility]}
                                        </Text>
                                    </Table.Cell>

                                    <Table.Cell>
                                        <Text size="2" color="gray">
                                            {format(new Date(category.createdAt), 'MMM dd, yyyy')}
                                        </Text>
                                    </Table.Cell>

                                    <Table.Cell>
                                        <Flex gap="1">
                                            <Button
                                                variant="ghost"
                                                size="1"
                                                onClick={() => onView && onView(category)}
                                                title="View details"
                                            >
                                                <Eye size={14} />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="1"
                                                onClick={() => onEdit(category)}
                                                disabled={category.isSystem}
                                                title={category.isSystem ? "System categories cannot be edited" : "Edit category"}
                                            >
                                                <Edit size={14} />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="1"
                                                onClick={() => onDuplicate && onDuplicate(category)}
                                                title="Duplicate category"
                                            >
                                                <Copy size={14} />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="1"
                                                color="red"
                                                onClick={() => handleDeleteClick(category)}
                                                disabled={category.isSystem}
                                                title={category.isSystem ? "System categories cannot be deleted" : "Delete category"}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </Flex>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <AlertDialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialog.Content style={{ maxWidth: '450px' }}>
                    <AlertDialog.Title>Delete Category</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
                        {categoryToDelete?.isSystem && (
                            <Text color="red" style={{ display: 'block', marginTop: '8px' }}>
                                This is a system category and cannot be deleted.
                            </Text>
                        )}
                    </AlertDialog.Description>

                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                            <Button variant="soft" color="gray" onClick={handleDeleteCancel}>
                                Cancel
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button 
                                variant="solid" 
                                color="red" 
                                onClick={handleDeleteConfirm}
                                disabled={categoryToDelete?.isSystem}
                            >
                                Delete Category
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </Card>
    );
}

export default TaskCategoryList; 