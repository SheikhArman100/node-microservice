import { Schema, model } from 'mongoose';

export interface IUser {
  _id: string; 
  name: string;
  email: string;
  role: string;
  lastUpdated: Date;
}

const UserSchema = new Schema<IUser>({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Add indexes for better performance
UserSchema.index({ email: 1 });

export const User = model<IUser>('User', UserSchema);
