// src/scripts/migrateRewardCategories.js
const mongoose = require("mongoose");
const Reward = require("../models/reward.model");
const RewardCategory = require("../models/rewardCategory.model");
require("dotenv").config();

// Get database URL based on environment
const MONGO_URI =
  process.env.NODE_ENV === "production"
    ? process.env.PRODUCTION_MONGO_URI
    : process.env.MONGO_URI;

async function migrateRewardCategories() {
  try {
    console.log("Starting reward category migration...");

    // Connect to database
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database");

    // Step 1: Create default categories if they don't exist
    console.log("Creating default categories...");
    const defaultCategories = [
      // Family categories with subcategories
      {
        name: "Family Rewards",
        description: "Rewards given by parents and guardians",
        icon: "home",
        color: "#4285F4",
        type: "family",
        isSystem: true,
        visibility: "public",
        displayOrder: 10,
        createdBy: "migration",
        creatorRole: "system",
      },
      {
        name: "Family Privileges",
        description: "Privileges earned at home",
        icon: "star",
        color: "#4285F4",
        type: "family",
        subcategoryType: "privilege",
        isSystem: true,
        visibility: "public",
        displayOrder: 11,
        minPointValue: 10,
        maxPointValue: 100,
        createdBy: "migration",
        creatorRole: "system",
      },
      {
        name: "Family Items",
        description: "Physical items from family",
        icon: "gift",
        color: "#34A853",
        type: "family",
        subcategoryType: "item",
        isSystem: true,
        visibility: "public",
        displayOrder: 12,
        minPointValue: 50,
        maxPointValue: 500,
        createdBy: "migration",
        creatorRole: "system",
      },
      {
        name: "Family Experiences",
        description: "Special experiences with family",
        icon: "heart",
        color: "#EA4335",
        type: "family",
        subcategoryType: "experience",
        isSystem: true,
        visibility: "public",
        displayOrder: 13,
        minPointValue: 100,
        maxPointValue: 1000,
        createdBy: "migration",
        creatorRole: "system",
      },
      {
        name: "Family Digital Rewards",
        description: "Digital rewards from family",
        icon: "monitor",
        color: "#3498DB",
        type: "family",
        subcategoryType: "digital",
        isSystem: true,
        visibility: "public",
        displayOrder: 14,
        minPointValue: 20,
        maxPointValue: 200,
        createdBy: "migration",
        creatorRole: "system",
      },
      // School categories
      {
        name: "School Rewards",
        description: "Rewards available from school",
        icon: "school",
        color: "#FBBC05",
        type: "school",
        isSystem: true,
        visibility: "public",
        displayOrder: 20,
        createdBy: "migration",
        creatorRole: "system",
      },
      {
        name: "School Privileges",
        description: "Special privileges at school",
        icon: "medal",
        color: "#FBBC05",
        type: "school",
        subcategoryType: "privilege",
        isSystem: true,
        visibility: "public",
        displayOrder: 21,
        minPointValue: 10,
        maxPointValue: 100,
        createdBy: "migration",
        creatorRole: "system",
      },
      {
        name: "School Store Items",
        description: "Items from the school store",
        icon: "shopping-cart",
        color: "#34A853",
        type: "school",
        subcategoryType: "item",
        isSystem: true,
        visibility: "public",
        displayOrder: 22,
        minPointValue: 20,
        maxPointValue: 200,
        createdBy: "migration",
        creatorRole: "system",
      },
      {
        name: "School Experiences",
        description: "Special experiences at school",
        icon: "school",
        color: "#EA4335",
        type: "school",
        subcategoryType: "experience",
        isSystem: true,
        visibility: "public",
        displayOrder: 23,
        minPointValue: 50,
        maxPointValue: 500,
        createdBy: "migration",
        creatorRole: "system",
      },
      {
        name: "School Digital Rewards",
        description: "Digital rewards from school",
        icon: "monitor",
        color: "#3498DB",
        type: "school",
        subcategoryType: "digital",
        isSystem: true,
        visibility: "public",
        displayOrder: 24,
        minPointValue: 30,
        maxPointValue: 300,
        createdBy: "migration",
        creatorRole: "system",
      },
      // Sponsor categories
      {
        name: "Sponsor Rewards",
        description: "Rewards from external sponsors",
        icon: "gift",
        color: "#9B59B6",
        type: "sponsor",
        isSystem: true,
        visibility: "public",
        displayOrder: 30,
        createdBy: "migration",
        creatorRole: "system",
      },
      {
        name: "Sponsor Privileges",
        description: "Special privileges from sponsors",
        icon: "star",
        color: "#9B59B6",
        type: "sponsor",
        subcategoryType: "privilege",
        isSystem: true,
        visibility: "public",
        displayOrder: 31,
        minPointValue: 50,
        maxPointValue: 500,
        createdBy: "migration",
        creatorRole: "system",
      },
      {
        name: "Sponsor Items",
        description: "Physical items from sponsors",
        icon: "gift",
        color: "#34A853",
        type: "sponsor",
        subcategoryType: "item",
        isSystem: true,
        visibility: "public",
        displayOrder: 32,
        minPointValue: 100,
        maxPointValue: 1000,
        createdBy: "migration",
        creatorRole: "system",
      },
      {
        name: "Sponsor Experiences",
        description: "Special experiences from sponsors",
        icon: "heart",
        color: "#EA4335",
        type: "sponsor",
        subcategoryType: "experience",
        isSystem: true,
        visibility: "public",
        displayOrder: 33,
        minPointValue: 200,
        maxPointValue: 2000,
        createdBy: "migration",
        creatorRole: "system",
      },
      {
        name: "Digital Rewards",
        description: "Digital items and content",
        icon: "monitor",
        color: "#3498DB",
        type: "sponsor",
        subcategoryType: "digital",
        isSystem: true,
        visibility: "public",
        displayOrder: 34,
        minPointValue: 50,
        maxPointValue: 500,
        createdBy: "migration",
        creatorRole: "system",
      },
    ];

    const categoryMap = {};
    let created = 0;
    let skipped = 0;

    for (const categoryData of defaultCategories) {
      const existingCategory = await RewardCategory.findOne({
        name: categoryData.name,
        isSystem: true,
        isDeleted: false,
      });

      if (!existingCategory) {
        const category = new RewardCategory(categoryData);
        await category.save();
        categoryMap[`${categoryData.type}-${categoryData.subcategoryType}`] =
          category._id;
        created++;
      } else {
        categoryMap[`${categoryData.type}-${categoryData.subcategoryType}`] =
          existingCategory._id;
        skipped++;
      }
    }

    console.log(`Categories: ${created} created, ${skipped} already existed`);

    // Step 2: Update all existing rewards to reference the new categories
    console.log("Updating existing rewards...");

    const rewards = await Reward.find({
      categoryId: { $exists: false },
      isDeleted: false,
    });

    console.log(`Found ${rewards.length} rewards to update`);

    let updated = 0;
    let failed = 0;

    for (const reward of rewards) {
      try {
        const categoryKey = `${reward.category}-${reward.subcategory}`;
        const categoryId = categoryMap[categoryKey];

        if (categoryId) {
          reward.categoryId = categoryId;
          reward.categoryName = reward.category;
          reward.subcategoryName = reward.subcategory;
          await reward.save();
          updated++;
        } else {
          console.warn(`No matching category found for ${categoryKey}`);
          failed++;
        }
      } catch (error) {
        console.error(`Failed to update reward ${reward._id}:`, error.message);
        failed++;
      }
    }

    console.log(`Rewards: ${updated} updated, ${failed} failed`);

    // Step 3: Create indexes if needed
    console.log("Ensuring indexes...");
    await RewardCategory.createIndexes();
    await Reward.createIndexes();

    console.log("Migration completed successfully!");
    console.log(`Summary:
    - Categories: ${created} created, ${skipped} already existed
    - Rewards: ${updated} updated, ${failed} failed`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run migration
migrateRewardCategories();
