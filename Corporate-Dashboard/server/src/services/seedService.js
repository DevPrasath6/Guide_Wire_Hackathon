import bcrypt from 'bcryptjs';
import { privateConnection } from '../config/db.js';
import { Employee } from '../models/Employee.js';
import { ROLE_PERMISSIONS } from '../config/permissions.js';

export async function migrateLegacyEmployees() {
  const legacyUsers = await privateConnection.db
    .collection('users')
    .find({ role: { $in: ['employee', 'analyst', 'support', 'admin', 'superadmin'] } })
    .toArray();

  if (!legacyUsers.length) return;

  let migratedCount = 0;
  for (const legacyUser of legacyUsers) {
    const existing = await Employee.findOne({ email: legacyUser.email });
    if (existing) continue;

    await Employee.create({
      name: legacyUser.name,
      email: legacyUser.email,
      phone: legacyUser.phone,
      passwordHash: legacyUser.passwordHash || 'legacy_missing_password_hash',
      role: legacyUser.role,
      permissions: Array.isArray(legacyUser.permissions)
        ? legacyUser.permissions
        : ROLE_PERMISSIONS[legacyUser.role] || [],
      employeeProfile: legacyUser.employeeProfile || { department: 'operations', title: 'Employee' },
      isActive: typeof legacyUser.isActive === 'boolean' ? legacyUser.isActive : true,
      createdAt: legacyUser.createdAt,
      updatedAt: legacyUser.updatedAt
    });
    migratedCount += 1;
  }

  if (migratedCount) {
    console.log(`Migrated ${migratedCount} legacy employees to private employee store`);
  }
}

export async function seedSuperAdmin() {
  const email = process.env.SUPERADMIN_EMAIL || 'admin@es.com';
  const password = process.env.SUPERADMIN_PASSWORD || 'admin';
  const existing = await Employee.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await Employee.create({
    name: 'Super Admin',
    email,
    passwordHash,
    role: 'superadmin',
    permissions: ROLE_PERMISSIONS.superadmin,
    employeeProfile: {
      department: 'security',
      title: 'Root Admin'
    }
  });

  console.log('Seeded default superadmin account');
}
