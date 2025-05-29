const mongoose = require('mongoose');
const Task = require('../models/task.model');
const TaskCategory = require('../models/taskCategory.model');

/**
 * Migration script to convert string category values to ObjectId references
 * This script should be run after updating the Task model to use category references
 */
async function migrateCategoryReferences() {
  try {
    console.log('Starting category reference migration...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/univance-task-service');
    console.log('Connected to MongoDB');

    // Get all tasks with string categories
    const tasksWithStringCategories = await Task.find({
      category: { $type: 'string' }
    });

    console.log(`Found ${tasksWithStringCategories.length} tasks with string categories`);

    let migrated = 0;
    let errors = 0;

    for (const task of tasksWithStringCategories) {
      try {
        // Find matching category by type
        const categoryDoc = await TaskCategory.findOne({
          type: task.category,
          isSystem: true
        });

        if (categoryDoc) {
          // Update task to use ObjectId reference
          await Task.findByIdAndUpdate(task._id, {
            category: categoryDoc._id,
            categoryType: categoryDoc.type
          });
          migrated++;
          console.log(`Migrated task ${task._id}: ${task.category} -> ${categoryDoc.name} (${categoryDoc._id})`);
        } else {
          console.warn(`No matching category found for task ${task._id} with category "${task.category}"`);
          errors++;
        }
      } catch (error) {
        console.error(`Error migrating task ${task._id}:`, error.message);
        errors++;
      }
    }

    console.log(`Migration completed: ${migrated} migrated, ${errors} errors`);

    // Verify migration
    const remainingStringCategories = await Task.countDocuments({
      category: { $type: 'string' }
    });

    console.log(`Remaining tasks with string categories: ${remainingStringCategories}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateCategoryReferences();
}

module.exports = migrateCategoryReferences; 