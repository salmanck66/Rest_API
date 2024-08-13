import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  mail: { type: String, required: true },
  phno: { type: String, required: true },
  password: { type: String, required: true },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{
    title: { type: String, required: true },
    image: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true, versionKey: false });

export const User = mongoose.model('User', UserSchema);
