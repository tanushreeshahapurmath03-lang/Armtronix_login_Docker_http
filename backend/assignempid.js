const mongoose = require('mongoose');
const User = require('./models/User');
const Counter = require('./models/Counter');

// Update this with your actual MongoDB URI
const MONGO_URI = 'mongodb://192.168.1.220:27017/Notifications';

async function connectDB() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('✅ Connected to MongoDB');
}

async function getNextEmpId() {
  const counter = await Counter.findOneAndUpdate(
    { name: 'empId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${counter.seq}`;
}

async function assignEmpIds() {
  const users = await User.find({ empId: { $exists: false } });

  for (let user of users) {
    const empId = await getNextEmpId();
    user.empId = empId;
    await user.save();
    console.log(`Assigned empId ${empId} to ${user.name}`);
  }

  console.log('✅ All users updated successfully');
}

async function run() {
  try {
    await connectDB();
    await assignEmpIds();
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
    mongoose.disconnect();
  }
}

run();
