const NotificationTemplate = require("../models/notificationTemplate.model");

// Get all notification templates
exports.getAllTemplates = async (req, res) => {
  try {
    const { type, category, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;

    // Get templates with pagination
    const [templates, totalCount] = await Promise.all([
      NotificationTemplate.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      NotificationTemplate.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        templates,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting templates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get notification templates",
      error: error.message,
    });
  }
};

// Get template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const template = await NotificationTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Notification template not found",
      });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error getting template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get notification template",
      error: error.message,
    });
  }
};

// Create new notification template
exports.createTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      category,
      subject,
      body,
      variables,
      channels,
      isActive,
    } = req.body;

    // Validate required fields
    if (!name || !type || !category || !body) {
      return res.status(400).json({
        success: false,
        message: "Name, type, category, and body are required",
      });
    }

    // Check for duplicate template name
    const existingTemplate = await NotificationTemplate.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        message: "Template with this name already exists",
      });
    }

    // Create new template
    const template = new NotificationTemplate({
      name,
      description,
      type,
      category,
      subject,
      body,
      variables: variables || [],
      channels: channels || ["inapp"],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id,
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: "Notification template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create notification template",
      error: error.message,
    });
  }
};

// Update notification template
exports.updateTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      category,
      subject,
      body,
      variables,
      channels,
      isActive,
    } = req.body;

    // Find template
    const template = await NotificationTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Notification template not found",
      });
    }

    // Check for duplicate name if name is being changed
    if (name && name !== template.name) {
      const existingTemplate = await NotificationTemplate.findOne({ name });
      if (existingTemplate) {
        return res.status(400).json({
          success: false,
          message: "Template with this name already exists",
        });
      }
    }

    // Update fields
    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (type) template.type = type;
    if (category) template.category = category;
    if (subject !== undefined) template.subject = subject;
    if (body) template.body = body;
    if (variables) template.variables = variables;
    if (channels) template.channels = channels;
    if (isActive !== undefined) template.isActive = isActive;

    template.updatedBy = req.user.id;
    template.updatedAt = Date.now();

    await template.save();

    res.status(200).json({
      success: true,
      message: "Notification template updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification template",
      error: error.message,
    });
  }
};

// Delete notification template (soft delete)
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await NotificationTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Notification template not found",
      });
    }

    // Soft delete by marking as inactive
    template.isActive = false;
    template.updatedBy = req.user.id;
    template.updatedAt = Date.now();

    await template.save();

    res.status(200).json({
      success: true,
      message: "Notification template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification template",
      error: error.message,
    });
  }
};
