// Dev/test helper: promote a user to the 'admin' role (used to verify the
// `admin` authorization middleware). Uses the real User model + Atlas URI.
// Usage: node tests/promote-admin.js <email>
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const email = process.argv[2];
if (!email) {
  console.log(JSON.stringify({ error: 'usage: node tests/promote-admin.js <email>' }));
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOneAndUpdate(
    { email },
    { role: 'admin' },
    { returnDocument: 'after' }
  );
  if (!user) {
    console.log(JSON.stringify({ promoted: null, found: false }));
  } else {
    console.log(JSON.stringify({ promoted: user.email, role: user.role }));
  }
  await mongoose.disconnect();
})().catch((err) => {
  console.log(JSON.stringify({ error: err.message }));
  process.exit(1);
});
