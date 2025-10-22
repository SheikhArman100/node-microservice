import { Schema, model } from 'mongoose';

export interface IUserCache {
  _id: string; // User ID from user-service
  name: string;
  email: string;
  // Add other user fields as needed
  lastUpdated: Date;
}

const UserCacheSchema = new Schema<IUserCache>({
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
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Add indexes for better performance
UserCacheSchema.index({ email: 1 });

export const UserCache = model<IUserCache>('UserCache', UserCacheSchema);
