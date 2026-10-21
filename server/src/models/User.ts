import mongoose from 'mongoose';

console.log("✅ User model file is executing!");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model('User', userSchema);

export default User;