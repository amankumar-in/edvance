# Task Management Implementation Plan

## Overview
Sophisticated task management system with hierarchical access control where:
- Platform admins create tasks with various assignment strategies
- Parents can toggle visibility for their children only
- Schools can toggle visibility for their students only
- Students only see tasks if all visibility layers allow it
- Scalable for millions of users without storing arrays

## Phase 1: Database Schema Updates

### 1. TaskVisibilityControl Model
```javascript
const taskVisibilityControlSchema = {
  taskId: ObjectId,
  controllerType: String, // 'parent', 'school', 'class'
  controllerId: String,   // parent._id, school._id, class._id
  isVisible: Boolean,     // true = show to children, false = hide
  controlledStudentIds: [ObjectId], // specific students affected
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Enhanced Task Model
```javascript
const taskSchema = {
  // ... existing fields ...
  
  // NEW: Assignment strategy
  assignmentStrategy: {
    type: String,
    enum: ['specific', 'role_based', 'school_based', 'global'],
    required: true
  },
  
  // NEW: Target criteria (replaces simple assignedTo)
  targetCriteria: {
    roles: [String],           // ['student', 'parent']
    schoolIds: [String],       // specific schools
    classIds: [String],        // specific classes  
    gradeLevel: Number,        // grade filter
    specificUserIds: [String], // for small specific assignments
    excludeUserIds: [String]   // exclusions
  },
  
  // NEW: Default visibility for different controllers
  defaultVisibility: {
    forParents: Boolean,    // can parents see this task?
    forSchools: Boolean,    // can schools see this task?
    forStudents: Boolean    // directly visible to students?
  },
  
  // ... rest of existing fields ...
}
```

### 3. TaskAssignment Model
```javascript
const taskAssignmentSchema = {
  taskId: ObjectId,
  studentId: ObjectId,
  assignedBy: String,        // who assigned it
  assignedByRole: String,    // their role
  isActive: Boolean,         // is assignment active
  assignedAt: Date,
  source: String,           // 'admin', 'parent', 'school', 'teacher'
  metadata: Object          // additional context
}
```

## Phase 2: Core Controllers & Logic
- Task Assignment Logic
- Visibility Control Logic  
- Access Control Layers

## Phase 3: API Endpoints Structure
- Platform Admin Endpoints
- Parent Control Endpoints
- School Control Endpoints
- Student/Parent View Endpoints

## Phase 4: Frontend Components
- Platform Admin Interface
- Parent Dashboard
- School Dashboard
- Student Interface

## Phase 5: Key Implementation Considerations
- Scalability Solutions
- Performance Optimizations
- Security & Access Control

## Implementation Strategy
1. Update database schemas first
2. Test each model with Postman
3. Implement core logic step by step
4. Build frontend interfaces incrementally
5. Test thoroughly at each step