// Dynamically builds a list of profiles or actions for a user based on their roles and existing profiles.
export const buildSelectionList = (user, profiles) => {
  // Ensure roles is an array, defaulting to empty if not provided
  const roles = user.roles || [];
  const list = []; // Initialize the list to be returned
  // Debug log for user object (consider removing in production)
  console.log(user)

  // Iterate over each role the user has
  for (const role of roles) {
    // Convert role from snake_case to kebab-case for route paths
    const hyphenatedRole = role.replace(/_/g, "-");

    // Handle roles that directly map to a dashboard (e.g., admin roles)
    if (["school_admin", "platform_admin"].includes(role)) {
      list.push({
        label: `${formatLabel(role)} Dashboard`, // Formatted label for display
        value: role, // Original role value
        needsProfile: false, // Indicates no separate profile creation is needed
        route: `/${hyphenatedRole}/dashboard` // Route to the respective dashboard
      });
      
    }

    // Handle roles that may require profile creation or lead to a dashboard
    if (["teacher", "parent", "student", "social_worker"].includes(role)) {
      // Check if a profile already exists for the current role
      const profileExists = profiles?.[role] !== null;
      list.push({
        // Dynamically set label based on profile existence
        label: profileExists
          ? `${formatLabel(role)} Dashboard`
          : `Create ${formatLabel(role)} Profile`,
        value: role,
        needsProfile: !profileExists, // True if profile creation is needed
        // Dynamically set route based on profile existence
        route: profileExists
          ? `/${hyphenatedRole}/dashboard`
          : `/${hyphenatedRole}/create-profile`,
      });
    }
  }

  return list; // Return the constructed list of actions/profiles
};

// Formats a snake_case role string into a capitalized, space-separated label (e.g., "school_admin" -> "School Admin")
const formatLabel = (role) => {
  return role
    .split("_") // Split the role string by underscores
    .map(word => word[0].toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" "); // Join the words with spaces
};