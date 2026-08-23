import { model, Schema } from 'mongoose';
import type { Task } from '../types';

const taskSchema = new Schema<Task>({
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

export default model<Task>('Task', taskSchema);