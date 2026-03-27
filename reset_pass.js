import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String, default: 'admin' }
});

async function reset() {
  await mongoose.connect('mongodb://127.0.0.1:27017/bobo');
  const User = mongoose.model('User', UserSchema);
  const hashed = await bcrypt.hash('password123', 10);
  
  await User.updateOne({ email: 'admin@bobo.com' }, { password: hashed }, { upsert: true });
  console.log('✅ Admin Reset Successful. Email: admin@bobo.com | Password: password123');
  process.exit(0);
}

reset();
