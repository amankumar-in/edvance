const mongoose = require("mongoose");

const CollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    shortDescription: { type: String },
    description: { type: String },

    logo: { type: String }, // url
    bannerImage: { type: String }, // url

    courses: [{ type: String }],
    website: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },

    tier: { type: String, enum: ["Ivy League", "tier1", "tier2", "tier3"], required: true },

    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "draft" },

    // 🌟 Optional highlight fields for frontend cards
    highlight1: { type: String },
    highlight2: { type: String },
    highlight3: { type: String },
  },
  { timestamps: true }
);

// 🔑 Indexes
CollegeSchema.index({ name: 1 });
CollegeSchema.index({ status: 1 });
CollegeSchema.index({ isFeatured: 1, status: 1 });
CollegeSchema.index({ location: 1 });
CollegeSchema.index({ tier: 1 });

module.exports = mongoose.model("College", CollegeSchema);
