import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../Context/AuthContext';
import { getStudentTasks, getTaskCategories } from '../../api/task/taskHomepage.api';
import MobileLayout from '../../components/layout/MobileLayout';

/**
 * New Student Task Homepage Component
 * Built from scratch using correct backend endpoints
 */
const TaskHomepage = () => {
  const { user } = useAuth();
  
  // IMMEDIATE DEBUG - This should show right away
  console.log('🚀 TaskHomepage component mounted');
  console.log('👤 User from AuthContext:', user);
  
  // State management
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Debug information
  const [debugInfo, setDebugInfo] = useState(null);

  // Tab configuration
  const tabs = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'featured', label: 'Featured' }
  ];

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

  // Load student tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug user information
      const userDebug = {
        userId: user?._id,
        userIdExists: !!user?._id,
        roles: user?.roles,
        fullUser: user
      };
      setDebugInfo(userDebug);
      
      console.log('🔍 User Debug Info:', userDebug);

      if (!user?._id) {
        throw new Error('User ID not found. User object may not be properly loaded.');
      }

      // Prepare API options
      const options = {};
      if (selectedCategory) options.category = selectedCategory;
      if (selectedTab !== 'all') options.status = selectedTab;

      console.log('📡 Calling getStudentTasks with:', {
        studentId: user._id,
        options
      });

      const response = await getStudentTasks(user._id, options);
      
      console.log('📥 API Response:', response);

      if (response.success) {
        setTasks(response.data.tasks || []);
        setError(null);
        toast.success(`Loaded ${response.data.tasks?.length || 0} tasks`);
      } else {
        throw new Error(response.message || 'Failed to load tasks');
      }
      
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      setError(error.message);
      setTasks([]);
      toast.error('Failed to load tasks: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on search and current tab
  const filteredTasks = tasks.filter(taskData => {
    const task = taskData.task || taskData;
    
    // Search filter
    if (searchTerm) {
      const searchableText = `${task.title} ${task.description} ${task.subCategory}`.toLowerCase();
      if (!searchableText.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    
    // Tab filter
    if (selectedTab === 'featured') {
      return task.isFeatured || task.pointValue >= 20;
    }
    
    if (selectedTab === 'overdue') {
      return task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending';
    }
    
    if (selectedTab !== 'all') {
      return task.status === selectedTab;
    }
    
    return true;
  });

  // Load data on component mount and when filters change
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect triggered - selectedCategory:', selectedCategory, 'selectedTab:', selectedTab);
    console.log('👤 User in useEffect:', user);
    console.log('🆔 User ID exists?', !!user?._id);
    
    if (user?._id) {
      console.log('✅ User ID found, calling loadTasks');
      loadTasks();
    } else {
      console.log('❌ No user ID, skipping loadTasks');
      setLoading(false); // Stop loading if no user
    }
  }, [user?._id, selectedCategory, selectedTab]);

  // Get tab counts
  const getTabCounts = (tabValue) => {
    if (tabValue === 'all') return tasks.length;
    if (tabValue === 'featured') return tasks.filter(t => (t.task || t).isFeatured || (t.task || t).pointValue >= 20).length;
    if (tabValue === 'overdue') return tasks.filter(t => {
      const task = t.task || t;
      return task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending';
    }).length;
    return tasks.filter(t => (t.task || t).status === tabValue).length;
  };

  // Render task card
  const TaskCard = ({ taskData }) => {
    const task = taskData.task || taskData;
    const visibilityReason = taskData.visibilityReason;
    
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending';
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            {task.assignmentStrategy && (
              <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                task.assignmentStrategy === 'specific' ? 'bg-blue-100 text-blue-800' :
                task.assignmentStrategy === 'role_based' ? 'bg-green-100 text-green-800' :
                task.assignmentStrategy === 'school_based' ? 'bg-orange-100 text-orange-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {task.assignmentStrategy === 'specific' ? 'Personal' :
                 task.assignmentStrategy === 'role_based' ? 'Role-based' :
                 task.assignmentStrategy === 'school_based' ? 'School-wide' :
                 'Global'}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {task.difficulty && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                task.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                task.difficulty === 'hard' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {task.difficulty}
              </span>
            )}
            <span className={`px-2 py-1 text-sm rounded-full font-medium ${
              task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {task.pointValue} pts
            </span>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
        )}

        {/* Metadata */}
        <div className="flex gap-4 items-center flex-wrap mb-3 text-xs text-gray-500">
          {task.subCategory && (
            <span>📚 {task.subCategory}</span>
          )}
          {task.dueDate && (
            <span className={isOverdue ? 'text-red-600' : ''}>
              📅 Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {visibilityReason && (
            <span className="text-green-600">👁️ {visibilityReason}</span>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 text-xs rounded-full ${
            task.status === 'completed' ? 'bg-green-100 text-green-800' :
            task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            task.status === 'overdue' ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {task.status}
          </span>
          
          {isOverdue && (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
              ⚠️ Overdue
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <MobileLayout>
      <div className="p-6">
        {/* IMMEDIATE DEBUG INFO - Shows always */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-bold text-sm mb-2">🔍 IMMEDIATE DEBUG:</h3>
          <div className="text-xs font-mono space-y-1">
            <div>Component mounted: ✅</div>
            <div>User exists: {user ? '✅ YES' : '❌ NO'}</div>
            <div>User ID: {user?._id || 'undefined'}</div>
            <div>User roles: {JSON.stringify(user?.roles) || 'undefined'}</div>
            <div>Loading state: {loading ? 'TRUE' : 'FALSE'}</div>
            <div>Error: {error || 'none'}</div>
            <div>Tasks count: {tasks.length}</div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tasks</h1>
          <p className="text-gray-600">Manage your assignments and track your progress</p>
          
          {/* Debug Information */}
          {debugInfo && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-sm mb-2">Debug Information:</h3>
              <p className="text-xs font-mono text-gray-700">
                User ID: {debugInfo.userId || 'undefined'} | 
                Roles: {JSON.stringify(debugInfo.roles)} | 
                ID Exists: {debugInfo.userIdExists ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex gap-4 items-center flex-wrap">
            {/* Search */}
            <div className="min-w-[250px]">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={loadTasks}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Task Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => {
                const count = getTabCounts(tab.value);
                const isActive = selectedTab === tab.value;
                
                return (
                  <button
                    key={tab.value}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTab(tab.value)}
                  >
                    <div className="flex items-center gap-2">
                      {tab.label}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-white border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Tasks</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              onClick={loadTasks}
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No tasks found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory || selectedTab !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No tasks have been assigned to you yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((taskData, index) => (
              <TaskCard key={taskData.task?._id || taskData._id || index} taskData={taskData} />
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && !error && tasks.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </span>
              <span className="text-sm text-gray-500">
                Total Points Available: {tasks.reduce((sum, taskData) => sum + (taskData.task?.pointValue || taskData.pointValue || 0), 0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default TaskHomepage; 