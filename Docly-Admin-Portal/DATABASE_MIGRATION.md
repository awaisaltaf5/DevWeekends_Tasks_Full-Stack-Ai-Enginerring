# Database Migration Guide - Docly Admin Portal

## Overview

The Admin Portal requires two additional fields on the `DoctorProfile` model to store admin feedback and verification timestamps. If your existing database does not have these fields, they should be added.

## Required Schema Changes

### Fields to Add to DoctorProfile

```typescript
verificationMessage?: string;      // Admin feedback/reason
verificationUpdatedAt?: Date;      // Timestamp of last verification update
```

## Implementation

### Option 1: Schema Update Only (Recommended)

If your application is still in development and doesn't have production data, simply update the schema:

**File:** `backend/src/models/DoctorProfile.ts`

Add these fields to the schema definition:

```typescript
verificationMessage: {
  type: String,
  default: '',
  maxlength: [2000, 'Message is too long'],
},
verificationUpdatedAt: {
  type: Date,
  default: null,
},
```

**Example placement in schema:**

```typescript
const doctorProfileSchema = new Schema<IDoctorProfile, DoctorProfileModel, {}>(
  {
    // ... existing fields ...
    
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    
    // ADD THESE NEW FIELDS:
    verificationMessage: {
      type: String,
      default: '',
      maxlength: [2000, 'Verification message is too long'],
    },
    verificationUpdatedAt: {
      type: Date,
      default: null,
    },
    
    // ... rest of fields ...
  },
  { timestamps: true },
);
```

Also update the TypeScript interface:

**File:** `backend/src/models/DoctorProfile.ts`

```typescript
export interface IDoctorProfile {
  // ... existing fields ...
  verificationStatus: VerificationStatus;
  verificationMessage?: string;        // ADD THIS
  verificationUpdatedAt?: Date;        // ADD THIS
  // ... rest of fields ...
}
```

### Option 2: Database Migration (Production)

If you have production data and need to update the existing database without losing data, create a migration script.

**File:** `backend/src/scripts/migrate-doctor-profiles.ts`

```typescript
import mongoose from 'mongoose';
import { DoctorProfile } from '../models';
import { env } from '../config/env';

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.mongodbUri, {
      maxPoolSize: 10,
    });

    console.log('Starting migration: Add verificationMessage and verificationUpdatedAt to DoctorProfile...');

    // Update all existing doctor profiles
    const result = await DoctorProfile.updateMany(
      {},
      {
        $set: {
          verificationMessage: '',
          verificationUpdatedAt: new Date(),
        },
      }
    );

    console.log(`Migration complete. Updated ${result.modifiedCount} documents.`);
    console.log(`Matched ${result.matchedCount} documents total.`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

**To run the migration:**

1. Add script to `package.json`:
   ```json
   {
     "scripts": {
       "migrate:doctor-profiles": "tsx src/scripts/migrate-doctor-profiles.ts"
     }
   }
   ```

2. Run the migration:
   ```bash
   npm run migrate:doctor-profiles
   ```

3. Verify in MongoDB Atlas or MongoDB Compass that fields were added

## Verifying the Migration

### Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to your MongoDB Atlas cluster
3. Navigate to `docly > doctorprofiles` collection
4. View documents and verify:
   - `verificationMessage` field exists (empty string for existing records)
   - `verificationUpdatedAt` field exists (set to current date for migrated records)

### Using MongoDB CLI

```bash
# Connect to MongoDB Atlas
mongosh "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/"

# Select database
use docly

# Check if field exists
db.doctorprofiles.findOne({}, { verificationMessage: 1, verificationUpdatedAt: 1 })

# Count documents with the field
db.doctorprofiles.countDocuments({ verificationMessage: { $exists: true } })
```

### Verify via Application

After migration, test the Admin Portal:

1. Start backend: `npm run dev`
2. Start Admin Portal: `npm run dev` (in Docly-Admin-Portal folder)
3. Login as admin
4. Go to Doctor Management
5. Click on a doctor profile
6. If "Reject" or "Request Changes" actions work without errors, migration was successful

## Rollback (If Needed)

If the migration fails or you need to rollback:

```bash
# Using MongoDB CLI
mongosh "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/"

use docly

# Remove the new fields
db.doctorprofiles.updateMany(
  {},
  { $unset: { verificationMessage: "", verificationUpdatedAt: "" } }
)
```

## Schema Update Checklist

- [ ] Update TypeScript interface `IDoctorProfile` in `backend/src/models/DoctorProfile.ts`
- [ ] Update Mongoose schema definition in `backend/src/models/DoctorProfile.ts`
- [ ] Run `npm run build` to compile TypeScript
- [ ] Test backend changes with `npm run dev`
- [ ] Run migration if on production data
- [ ] Verify fields exist in database
- [ ] Restart backend
- [ ] Test Admin Portal doctor verification features
- [ ] Verify no errors in console logs

## Timeline

This migration should be completed **before** deploying the Admin Portal to production:

1. **Development:** Immediately update schema files
2. **Testing:** Verify schema and migration script work
3. **Staging:** Run migration on staging database if available
4. **Production:** Run migration before deploying Admin Portal

## Notes

- These are optional fields and won't break existing functionality
- Existing doctor profiles will have empty `verificationMessage` after migration
- `verificationUpdatedAt` helps track when verification decisions were made
- Both fields are used only by the Admin Portal

## Support

If you encounter issues during migration:

1. Check MongoDB connection string in `.env`
2. Verify you have write permissions on the database
3. Check backend logs for detailed error messages
4. Review MongoDB Atlas audit logs for operations

---

**Last Updated:** 2026-08-29
