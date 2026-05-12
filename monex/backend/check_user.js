import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://127.0.0.1:27017/monex')
  .then(async () => {
    const user = await User.findOne({ email: 'ragul78914@gmail.com' });
    if (user) {
      console.log('User found:', user);
    } else {
      console.log('User not found in database');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
