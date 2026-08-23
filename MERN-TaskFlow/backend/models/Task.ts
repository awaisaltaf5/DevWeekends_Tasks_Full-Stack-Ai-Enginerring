const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);