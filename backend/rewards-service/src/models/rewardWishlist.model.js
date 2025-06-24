const mongoose = require('mongoose');

/**
 * Simple Reward Wishlist Model
 * Allows students to save rewards to their wishlist
 */
const rewardWishlistSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  rewardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Unique constraint - student can only wishlist a reward once
rewardWishlistSchema.index({ studentId: 1, rewardId: 1 }, { unique: true });

module.exports = mongoose.model('RewardWishlist', rewardWishlistSchema); 