import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// Models
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: String, specialization: String, qualification: String,
  experience: Number, consultationFee: Number, isActive: { type: Boolean, default: true },
  age: Number, gender: String, bloodGroup: String, phone: String,
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const hash = (pw) => bcrypt.hashSync(pw, 12);

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Seeding...');

  await User.deleteMany({});

  await User.insertMany([
    { name: 'Admin User', email: 'admin@medivision.ai', password: hash('admin123'), role: 'admin' },
    { name: 'Dr. Priya Sharma', email: 'dr.priya@medivision.ai', password: hash('doctor123'), role: 'doctor', specialization: 'Cardiology', qualification: 'MBBS, MD', experience: 10, consultationFee: 800 },
    { name: 'Dr. Rahul Mehta', email: 'dr.rahul@medivision.ai', password: hash('doctor123'), role: 'doctor', specialization: 'Neurology', qualification: 'MBBS, DM', experience: 8, consultationFee: 1000 },
    { name: 'Dr. Anjali Singh', email: 'dr.anjali@medivision.ai', password: hash('doctor123'), role: 'doctor', specialization: 'General Medicine', qualification: 'MBBS', experience: 5, consultationFee: 500 },
    { name: 'Neeraj Patient', email: 'patient@medivision.ai', password: hash('patient123'), role: 'patient', age: 28, gender: 'male', bloodGroup: 'O+', phone: '+91-9876543210' },
    { name: 'Priya Patient', email: 'priya.p@medivision.ai', password: hash('patient123'), role: 'patient', age: 35, gender: 'female', bloodGroup: 'A+' },
  ]);

  console.log('✅ Seed complete!');
  console.log('\n📋 Demo Credentials:');
  console.log('   Admin:   admin@medivision.ai   / admin123');
  console.log('   Doctor:  dr.priya@medivision.ai / doctor123');
  console.log('   Patient: patient@medivision.ai  / patient123');
  await mongoose.disconnect();
};

seed().catch(console.error);
