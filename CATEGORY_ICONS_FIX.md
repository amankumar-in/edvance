# Category Management Icons & Colors Fix

## Issue Description
When admins create categories and assign icons and colors in the admin panel, they don't show up properly in the table.

## Root Cause
1. **Backend default categories** were using string icons (e.g., "calculator", "book") instead of emoji icons
2. **Frontend expects emoji icons** as seen in the predefined icons array and form placeholders  
3. **Form default values** had empty string for icon, causing new categories to have no icon
4. **Table display** shows `{category.icon}` directly, so string icons appear as text instead of visual icons

## Fix Applied

### 1. Backend Changes
- **File**: `backend/task-service/src/controllers/taskCategory.controller.js`
- **Change**: Updated default system categories to use emoji icons instead of strings
  - `"calculator"` → `"🧮"`
  - `"book"` → `"📚"`
  - `"microscope"` → `"🔬"`
  - `"pen"` → `"✏️"`
  - `"home"` → `"🏠"`
  - `"droplet"` → `"🚿"`
  - `"thumbs-up"` → `"👍"`
  - `"calendar"` → `"📅"`
  - `"activity"` → `"🏃‍♂️"`
  - `"music"` → `"🎵"`

### 2. Frontend Changes
- **File**: `frontend/src/pages/platform-admin/Categories.jsx`
- **Change**: Updated form default values to include a default emoji icon (`"📚"`) instead of empty string

### 3. Migration System
- **Added**: New migration endpoint to convert existing categories with string icons to emoji icons
- **Endpoint**: `POST /tasks/categories/migrate/icons`
- **UI**: Added "Migrate Icons" button in admin panel to run the migration
- **Security**: Only platform admins can run the migration

## How to Test

### 1. Test New Category Creation
1. Go to Categories management in admin panel
2. Click "New Category"
3. Fill in name, select type, and optionally change icon/color
4. Submit form
5. Verify icon and color appear correctly in the table

### 2. Test Existing Categories Migration
1. If you have existing categories with string icons, click "Migrate Icons" button
2. Check success message
3. Verify categories now show emoji icons instead of text

### 3. Test Default Categories
1. Click "Create Defaults" button to create system categories
2. Verify all default categories show proper emoji icons and colors

## Files Modified
1. `backend/task-service/src/controllers/taskCategory.controller.js` - Updated default categories and added migration
2. `backend/task-service/src/routes/taskCategory.routes.js` - Added migration route
3. `frontend/src/pages/platform-admin/Categories.jsx` - Fixed default icon and added migration button
4. `frontend/src/api/task/taskCategory.api.js` - Added migration API function
5. `frontend/src/api/task/taskCategory.mutations.js` - Added migration mutation hook

## API Endpoints Added
- `POST /tasks/categories/migrate/icons` - Migrate string icons to emoji icons (admin only)

## Expected Results
- ✅ New categories created by admins show icons and colors properly
- ✅ Existing categories with string icons can be migrated to emoji icons
- ✅ Default system categories use proper emoji icons
- ✅ Table displays visual emoji icons instead of text strings
- ✅ Colors display correctly in both icon background and category badges 