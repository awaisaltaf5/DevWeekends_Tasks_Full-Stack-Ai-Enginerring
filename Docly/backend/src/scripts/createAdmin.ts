import mongoose from 'mongoose';
import { User } from '../models/User';
import { connectDB } from '../config/db';
import { env } from '../config/env';

/**
 * One-off script to bootstrap an admin account.
 *
 * Usage:
 *   npm run seed:admin
 *
 * Reads ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD from backend/.env.
 */
async function seedAdmin(): Promise<void> {
  const name = env.adminNameForSeed;
  const email = env.adminEmailForSeed;
  const password = env.adminPasswordForSeed;

  if (!name || !email || !password) {
    console.log('[Docly] ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required in backend/.env.');
    await mongoose.disconnect();
    return;
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    console.log(`[Docly] Admin already exists with email ${email}.`);
    await mongoose.disconnect();
    return;
  }

  // The User model hashes `password` via its pre('save') hook.
  const admin = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: 'admin',
  });

  console.log(`[Docly] Admin created: ${admin.name} <${admin.email}> (role: ${admin.role}).`);
  await mongoose.disconnect();
}

void seedAdmin();