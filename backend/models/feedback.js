const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    status: {
      type: String,
      enum: ['new', 'resolved'],
      default: 'new'
    },
    response: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
