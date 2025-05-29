import React, { useState, useEffect } from 'react';
import { Search, Users, Eye, EyeOff, Settings, Calendar, Trophy, Clock, AlertCircle, CheckCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../Context/AuthContext';
import { 
  getAvailableTasksForParent, 
  getTasksForParentChildren, 
  setParentTaskVisibility,
  getParentVisibilityControls,
  getTaskCategories 
} from '../../api/task/taskHomepage.api';

/**
 * Parent Task Homepage Component
 * Built with plain HTML/CSS to avoid UI library dependency issues
 */
const ParentTaskHomepage = () => {
  const { user } = useAuth();
  
  // IMMEDIATE EARLY RETURN - Don't do anything if user isn't a parent
  if (!user?._id) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-3 text-gray-500">Loading user data...</h2>
      </div>
    );
  }

  if (!user?.roles?.includes('parent')) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-4 font-bold text-red-500 mb-4">Access Denied</h2>
        <p className="text-2 text-gray-500 mb-4">
          You need parent role to access this page.
        </p>
        <p className="text-1 text-gray-400">
          Current roles: {JSON.stringify(user.roles)} | User ID: {user._id}
        </p>
      </div>
    );
  }
  
  // State management
  const [availableTasks, setAvailableTasks] = useState([]);
  const [childrenTasks, setChildrenTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [visibilityControls, setVisibilityControls] = useState([]);
  const [children, setChildren] = useState([]); // Real children data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedTab, setSelectedTab] = useState('available');
  
  // Tab configuration
  const tabs = [
    { value: 'available', label: 'Available Tasks', icon: Trophy },
    { value: 'children', label: 'Children\'s Tasks', icon: Users },
    { value: 'controls', label: 'Visibility Controls', icon: Settings },
    { value: 'visible', label: 'Visible Tasks', icon: Eye },
    { value: 'hidden', label: 'Hidden Tasks', icon: EyeOff }
  ];

  // Assignment strategy badges
  const getStrategyBadge = (strategy) => {
    const strategies = {
      'specific': { color: 'bg-blue-100 text-blue-800', label: 'Personal' },
      'role_based': { color: 'bg-green-100 text-green-800', label: 'Role-based' },
      'school_based': { color: 'bg-orange-100 text-orange-800', label: 'School-wide' },
      'global': { color: 'bg-purple-100 text-purple-800', label: 'Global' }
    };
    
    const config = strategies[strategy] || { color: 'bg-gray-100 text-gray-800', label: strategy };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Difficulty badges
  const getDifficultyBadge = (difficulty) => {
    const difficulties = {
      'easy': { color: 'bg-green-100 text-green-800', label: 'Easy' },
      'medium': { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      'hard': { color: 'bg-orange-100 text-orange-800', label: 'Hard' },
      'challenging': { color: 'bg-red-100 text-red-800', label: 'Challenging' }
    };
    
    const config = difficulties[difficulty] || { color: 'bg-gray-100 text-gray-800', label: difficulty };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Load task categories
  const loadCategories = async () => {
    try {
      const response = await getTaskCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    if (user?._id) {
      loadInitialData();
    }
  }, [user?._id]); // Only reload when user changes

  // Separate effect for tab/filter changes - only reload tab-specific data
  useEffect(() => {
    if (user?._id && children.length > 0) {
      loadTabData();
    }
  }, [selectedCategory, selectedChild, selectedTab]); // Only reload tab data when filters change

  // Initial data load - load children and categories once
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading initial data for parent:', user._id);

      if (!user?._id) {
        throw new Error('User ID not found.');
      }

      if (!user?.roles?.includes('parent')) {
        throw new Error('User is not a parent.');
      }

      // Load essential data once
      await loadCategories();
      const childrenData = await loadChildrenAndReturnData();
      
      // Load initial tab data if children exist
      if (childrenData && childrenData.length > 0) {
        await loadTabData();
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Load only tab-specific data (called when filters change)
  const loadTabData = async () => {
    try {
      console.log('🔄 Loading tab data for:', selectedTab);
      
      if (children.length === 0) {
        console.log('⚠️ No children found, skipping tab data loading');
        return;
      }

      switch (selectedTab) {
        case 'available':
          await loadAvailableTasks();
          break;
        case 'children':
          await loadChildrenTasks();
          break;
        case 'controls':
        case 'visible':
        case 'hidden':
          await loadVisibilityControls();
          break;
      }
      
    } catch (error) {
      console.error('❌ Error loading tab data:', error);
      toast.error('Failed to load tab data');
    }
  };

  // Modified function that returns children data directly
  const loadChildrenAndReturnData = async () => {
    try {
      if (!user?._id) return [];

      console.log('📡 Loading children for parent:', user._id);
      
      // OPTIMIZATION: Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 5000)
      );
      
      // First get parent record by user ID
      const parentResponsePromise = fetch(`http://localhost:3002/api/parents/by-user/${user._id}`);
      const parentResponse = await Promise.race([parentResponsePromise, timeoutPromise]);
      const parentData = await parentResponse.json();
      
      if (!parentData.success) {
        console.log('No parent record found for user');
        setChildren([]);
        return [];
      }

      // Get children data
      const childrenResponsePromise = fetch(`http://localhost:3002/api/parents/${parentData.data._id}/children`);
      const childrenResponse = await Promise.race([childrenResponsePromise, timeoutPromise]);
      const childrenData = await childrenResponse.json();
      
      const childrenArray = childrenData.success ? (childrenData.data || []) : [];
      setChildren(childrenArray);
      console.log('📊 Parent has', childrenArray.length, 'linked children');
      return childrenArray; // Return data directly
      
    } catch (error) {
      if (error.message === 'API timeout') {
        console.warn('⏰ API call timed out - using empty children array');
        setChildren([]);
        return [];
      } else {
        console.error('Error loading children:', error);
        setChildren([]);
        return [];
      }
    }
  };

  // Load available tasks for parent
  const loadAvailableTasks = async () => {
    try {
      if (!user?._id) return;

      const options = {};
      if (selectedCategory) options.category = selectedCategory;

      console.log('📡 Loading available tasks for parent:', user._id);
      const response = await getAvailableTasksForParent(user._id, options);
      
      if (response.success) {
        setAvailableTasks(response.data.tasks || []);
      }
    } catch (error) {
      console.error('Error loading available tasks:', error);
      toast.error('Failed to load available tasks');
    }
  };

  // Load children's tasks
  const loadChildrenTasks = async () => {
    try {
      if (!user?._id) return;

      const options = {};
      if (selectedChild) options.childId = selectedChild;
      if (selectedCategory) options.category = selectedCategory;

      console.log('📡 Loading children tasks for parent:', user._id);
      const response = await getTasksForParentChildren(user._id, options);
      
      if (response.success) {
        setChildrenTasks(response.data.children || []);
      }
    } catch (error) {
      console.error('Error loading children tasks:', error);
      toast.error('Failed to load children tasks');
    }
  };

  // Load visibility controls
  const loadVisibilityControls = async () => {
    try {
      if (!user?._id) return;

      console.log('📡 Loading visibility controls for parent:', user._id);
      const response = await getParentVisibilityControls(user._id);
      
      if (response.success) {
        setVisibilityControls(response.data.controls || []);
      }
    } catch (error) {
      console.error('Error loading visibility controls:', error);
      toast.error('Failed to load visibility controls');
    }
  };

  // Handle visibility toggle
  const handleVisibilityToggle = async (taskId, isVisible, reason = '') => {
    try {
      const childIds = selectedChild ? [selectedChild] : children.map(c => c._id);
      
      await setParentTaskVisibility(taskId, user._id, childIds, isVisible, reason);
      
      toast.success(`Task ${isVisible ? 'shown' : 'hidden'} for ${childIds.length} child(ren)`);
      
      // Reload data
      loadTabData();
      
    } catch (error) {
      console.error('Error setting visibility:', error);
      toast.error('Failed to update visibility');
    }
  };

  // Render task card for available tasks
  const AvailableTaskCard = ({ task }) => {
    const isControlled = visibilityControls.some(control => 
      control.taskId === task._id
    );
    
    return (
      <div className="p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-3 font-bold">{task.title}</h3>
              {task.assignmentStrategy && (
                <div className="mt-1">
                  {getStrategyBadge(task.assignmentStrategy)}
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {task.difficulty && getDifficultyBadge(task.difficulty)}
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {task.pointValue} pts
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-2 text-gray-500">
              {task.description}
            </p>
          )}

          {/* Controls */}
          <div className="flex gap-2 items-center justify-between">
            <p className="text-1 text-gray-500">
              {task.subCategory && `📚 ${task.subCategory}`}
            </p>
            
            <div className="flex gap-2">
              <button
                className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                onClick={() => handleVisibilityToggle(task._id, true)}
                disabled={isControlled}
              >
                <Eye size={12} />
                Show
              </button>
              <button
                className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                onClick={() => handleVisibilityToggle(task._id, false)}
                disabled={isControlled}
              >
                <EyeOff size={12} />
                Hide
              </button>
            </div>
          </div>
          
          {isControlled && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Already Controlled
            </span>
          )}
        </div>
      </div>
    );
  };

  // Render child task card
  const ChildTaskCard = ({ child, taskData }) => {
    const task = taskData.task || taskData;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending';
    
    return (
      <div className="p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-3">
          {/* Child Header */}
          <div>
            <h2 className="text-2 font-bold text-blue-500">
              {child.name} (Grade {child.grade})
            </h2>
          </div>
          
          {/* Task Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-3 font-bold">{task.title}</h3>
              {task.assignmentStrategy && (
                <div className="mt-1">
                  {getStrategyBadge(task.assignmentStrategy)}
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {task.difficulty && getDifficultyBadge(task.difficulty)}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {task.pointValue} pts
              </span>
            </div>
          </div>

          {/* Status and metadata */}
          <div className="flex gap-4 items-center flex-wrap">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.status === 'completed' ? 'bg-green-100 text-green-800' :
              task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {task.status}
            </span>
            
            {task.dueDate && (
              <p className="text-1 text-gray-500">
                📅 Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}
            
            {isOverdue && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertCircle size={12} />
                Overdue
              </span>
            )}
          </div>

          {/* Visibility controls */}
          <div className="flex gap-2 justify-end">
            <button
              className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
              onClick={() => handleVisibilityToggle(task._id, false, 'Parent decision')}
            >
              <EyeOff size={12} />
              Hide from {child.name}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render visibility control card
  const VisibilityControlCard = ({ control }) => {
    return (
      <div className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-3 font-bold">
                {control.taskId?.title || 'Task'}
              </h3>
              <p className="text-2 text-gray-500">
                Control Type: {control.controllerType}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${control.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {control.isVisible ? 'Visible' : 'Hidden'}
            </span>
          </div>
          
          <p className="text-2 text-gray-500">
            Affects {control.controlledStudentIds?.length || 0} child(ren)
          </p>
          
          {control.reason && (
            <p className="text-1 text-gray-500">
              Reason: {control.reason}
            </p>
          )}
          
          <p className="text-1 text-gray-500">
            Changed: {new Date(control.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  };

  // Filter and render content based on current tab
  const renderContent = () => {
    if (error) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-3 text-red-500 mb-2">Error Loading Data</h2>
          <p className="text-2 text-gray-500 mb-4">{error}</p>
          <button onClick={loadTabData}>Try Again</button>
        </div>
      );
    }

    // OPTIMIZATION: Show UI immediately with skeleton instead of blocking loading
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="text-center p-4">
            <p className="text-sm text-gray-500">Loading parent data...</p>
          </div>
          
          {/* Show skeleton grid immediately */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Show no children message if parent has no linked children
    if (children.length === 0) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-4 font-bold text-gray-500 mb-4">No Linked Children</h2>
          <p className="text-2 text-gray-500 mb-4">
            You don't have any children linked to your account yet. 
            Task management features will be available once you link children to your account.
          </p>
          <p className="text-1 text-gray-400">
            To link children, go to your profile settings or ask your children to send you a link request.
          </p>
        </div>
      );
    }

    switch (selectedTab) {
      case 'available':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTasks
              .filter(task => !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(task => (
                <AvailableTaskCard key={task._id} task={task} />
              ))}
          </div>
        );

      case 'children':
        return (
          <div className="space-y-6">
            {childrenTasks.map(childData => (
              <div key={childData.child._id}>
                <h3 className="text-4 font-bold mb-3">
                  {childData.child.name}'s Tasks ({childData.tasks?.length || 0})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(childData.tasks || [])
                    .filter(taskData => !searchTerm || taskData.task.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((taskData, index) => (
                      <ChildTaskCard 
                        key={taskData.task._id || index} 
                        child={childData.child} 
                        taskData={taskData} 
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'controls':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibilityControls
              .filter(control => !searchTerm || control.taskId?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(control => (
                <VisibilityControlCard key={control._id} control={control} />
              ))}
          </div>
        );

      case 'visible':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibilityControls
              .filter(control => control.isVisible)
              .filter(control => !searchTerm || control.taskId?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(control => (
                <VisibilityControlCard key={control._id} control={control} />
              ))}
          </div>
        );

      case 'hidden':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibilityControls
              .filter(control => !control.isVisible)
              .filter(control => !searchTerm || control.taskId?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(control => (
                <VisibilityControlCard key={control._id} control={control} />
              ))}
          </div>
        );

      default:
        return <p>Select a tab to view content</p>;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-6 font-bold">Task Management</h1>
          <p className="text-3 text-gray-500">
            Control which tasks your children can see and track their progress
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Search */}
          <div className="min-w-[250px]">
            <div className="flex items-center">
              <span className="p-2">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-gray-300 rounded-r-md"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="p-2 border border-gray-300 rounded">
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Child Filter (for children's tasks) */}
          {selectedTab === 'children' && (
            <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} className="p-2 border border-gray-300 rounded">
              <option value="">All Children</option>
              {children.map(child => (
                <option key={child._id} value={child._id}>
                  {child.name}
                </option>
              ))}
            </select>
          )}

          {/* Refresh Button */}
          <button 
            className="px-4 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            onClick={loadTabData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Task Tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            let count = 0;
            
            switch (tab.value) {
              case 'available':
                count = availableTasks.length;
                break;
              case 'children':
                count = childrenTasks.reduce((sum, child) => sum + (child.tasks?.length || 0), 0);
                break;
              case 'controls':
                count = visibilityControls.length;
                break;
              case 'visible':
                count = visibilityControls.filter(c => c.isVisible).length;
                break;
              case 'hidden':
                count = visibilityControls.filter(c => !c.isVisible).length;
                break;
            }
            
            return (
              <button
                key={tab.value}
                className="flex items-center gap-2"
                onClick={() => setSelectedTab(tab.value)}
              >
                <Icon size={16} />
                {tab.label}
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default ParentTaskHomepage; 