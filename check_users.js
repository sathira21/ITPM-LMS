const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const User = require('./backend/models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    console.log('--- User Status Report ---');
    console.log('Total users:', users.length);
    
    const byRole = {};
    const byStatus = { active: 0, inactive: 0, approved: 0, pending: 0 };
    
    users.forEach(u => {
      byRole[u.role] = (byRole[u.role] || 0) + 1;
      if (u.isActive) byStatus.active++; else byStatus.inactive++;
      if (u.isApproved) byStatus.approved++; else byStatus.pending++;
      
      console.log(`- ${u.name} (${u.email}) - Role: ${u.role}, Active: ${u.isActive}, Approved: ${u.isApproved}`);
    });
    
    console.log('\nBy Role:', byRole);
    console.log('By Status:', byStatus);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
