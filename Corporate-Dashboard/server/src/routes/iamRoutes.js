import express from 'express';
import bcrypt from 'bcryptjs';
import { Employee } from '../models/Employee.js';
import { UserGroup } from '../models/UserGroup.js';
import { AccessPolicy } from '../models/AccessPolicy.js';
import { AuditLog } from '../models/AuditLog.js';
import { authRequired } from '../middleware/auth.js';
import { requirePermission, requireRole } from '../middleware/rbac.js';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../config/permissions.js';
import { writeAuditLog } from '../services/auditService.js';

const router = express.Router();

router.use(authRequired);

router.get('/users', requirePermission(PERMISSIONS.USERS_READ), async (_req, res) => {
  const users = await Employee.find()
    .select('name email role permissions employeeProfile isActive createdAt')
    .sort({ createdAt: -1 });
  return res.json(users);
});

router.post('/users', requireRole('superadmin'), requirePermission(PERMISSIONS.USERS_CREATE), async (req, res) => {
  const { name, email, password, role = 'employee', permissions, department, title } = req.body;
  const exists = await Employee.findOne({ email });
  if (exists) return res.status(409).json({ message: 'User already exists' });

  const passwordHash = await bcrypt.hash(password || 'Employee@123', 10);
  const finalPermissions = Array.isArray(permissions) && permissions.length ? permissions : ROLE_PERMISSIONS[role] || [];

  const user = await Employee.create({
    name,
    email,
    passwordHash,
    role,
    permissions: finalPermissions,
    employeeProfile: { department: department || 'operations', title: title || 'Employee' }
  });

  await writeAuditLog(req, {
    action: 'employee_created',
    resourceType: 'employee',
    resourceId: user._id.toString(),
    targetUser: user._id,
    changes: { name, email, role, permissions: finalPermissions }
  });

  return res.status(201).json(user);
});

router.patch('/users/:id', requireRole('superadmin'), requirePermission(PERMISSIONS.USERS_UPDATE), async (req, res) => {
  const update = {};
  if (req.body.name) update.name = req.body.name;
  if (req.body.email) update.email = String(req.body.email).trim().toLowerCase();
  if (req.body.phone) update.phone = req.body.phone;
  if (req.body.role) update.role = req.body.role;
  if (req.body.permissions) update.permissions = req.body.permissions;
  if (typeof req.body.isActive === 'boolean') update.isActive = req.body.isActive;
  if (req.body.department || req.body.title) {
    update.employeeProfile = {
      department: req.body.department || 'operations',
      title: req.body.title || 'Employee'
    };
  }

  if (req.body.password) {
    update.passwordHash = await bcrypt.hash(req.body.password, 10);
  }

  const user = await Employee.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (Array.isArray(req.body.groupIds)) {
    const nextGroupIds = req.body.groupIds;
    await UserGroup.updateMany({ members: user._id }, { $pull: { members: user._id } });
    if (nextGroupIds.length) {
      await UserGroup.updateMany({ _id: { $in: nextGroupIds } }, { $addToSet: { members: user._id } });
    }
    user.groups = nextGroupIds;
    await user.save();
  }

  await writeAuditLog(req, {
    action: 'employee_updated',
    resourceType: 'employee',
    resourceId: user._id.toString(),
    targetUser: user._id,
    changes: update
  });

  return res.json(user);
});

router.get('/groups', requirePermission(PERMISSIONS.USERS_READ), async (_req, res) => {
  const groups = await UserGroup.find().populate('members', 'name email role');
  return res.json(groups);
});

router.post('/groups', requireRole('superadmin'), requirePermission(PERMISSIONS.GROUPS_MANAGE), async (req, res) => {
  const group = await UserGroup.create(req.body);
  await writeAuditLog(req, {
    action: 'user_group_created',
    resourceType: 'user_group',
    resourceId: group._id.toString(),
    changes: req.body
  });
  return res.status(201).json(group);
});

router.patch('/groups/:id', requireRole('superadmin'), requirePermission(PERMISSIONS.GROUPS_MANAGE), async (req, res) => {
  const update = {};
  if (req.body.name) update.name = req.body.name;
  if (req.body.description !== undefined) update.description = req.body.description;
  if (Array.isArray(req.body.permissions)) update.permissions = req.body.permissions;
  if (Array.isArray(req.body.memberIds)) update.members = req.body.memberIds;

  const group = await UserGroup.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
  if (!group) return res.status(404).json({ message: 'Group not found' });

  if (Array.isArray(req.body.memberIds)) {
    await Employee.updateMany({ groups: group._id }, { $pull: { groups: group._id } });
    if (req.body.memberIds.length) {
      await Employee.updateMany({ _id: { $in: req.body.memberIds } }, { $addToSet: { groups: group._id } });
    }
  }

  await writeAuditLog(req, {
    action: 'user_group_updated',
    resourceType: 'user_group',
    resourceId: group._id.toString(),
    changes: update
  });

  return res.json(group);
});

router.delete('/groups/:id', requireRole('superadmin'), requirePermission(PERMISSIONS.GROUPS_MANAGE), async (req, res) => {
  const group = await UserGroup.findByIdAndDelete(req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  await Employee.updateMany({ groups: group._id }, { $pull: { groups: group._id } });

  await writeAuditLog(req, {
    action: 'user_group_deleted',
    resourceType: 'user_group',
    resourceId: req.params.id,
    changes: { name: group.name }
  });

  return res.json({ success: true });
});

router.get('/policies', requirePermission(PERMISSIONS.USERS_READ), async (_req, res) => {
  const policies = await AccessPolicy.find().sort({ createdAt: -1 });
  return res.json(policies);
});

router.post('/policies', requireRole('superadmin'), requirePermission(PERMISSIONS.ACCESS_POLICIES_MANAGE), async (req, res) => {
  const policy = await AccessPolicy.create(req.body);
  await writeAuditLog(req, {
    action: 'access_policy_created',
    resourceType: 'access_policy',
    resourceId: policy._id.toString(),
    changes: req.body
  });
  return res.status(201).json(policy);
});

router.patch('/policies/:id', requireRole('superadmin'), requirePermission(PERMISSIONS.ACCESS_POLICIES_MANAGE), async (req, res) => {
  const update = {};
  if (req.body.name) update.name = req.body.name;
  if (req.body.description !== undefined) update.description = req.body.description;
  if (Array.isArray(req.body.permissions)) update.permissions = req.body.permissions;
  if (Array.isArray(req.body.statements)) update.statements = req.body.statements;

  const policy = await AccessPolicy.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
  if (!policy) return res.status(404).json({ message: 'Policy not found' });

  await writeAuditLog(req, {
    action: 'access_policy_updated',
    resourceType: 'access_policy',
    resourceId: policy._id.toString(),
    changes: update
  });

  return res.json(policy);
});

router.delete('/policies/:id', requireRole('superadmin'), requirePermission(PERMISSIONS.ACCESS_POLICIES_MANAGE), async (req, res) => {
  const policy = await AccessPolicy.findByIdAndDelete(req.params.id);
  if (!policy) return res.status(404).json({ message: 'Policy not found' });

  await writeAuditLog(req, {
    action: 'access_policy_deleted',
    resourceType: 'access_policy',
    resourceId: req.params.id,
    changes: { name: policy.name }
  });

  return res.json({ success: true });
});

router.get('/audit-logs', requirePermission(PERMISSIONS.AUDIT_LOGS_READ), async (req, res) => {
  const limit = Number(req.query.limit || 200);
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).populate('actor', 'name email role');
  return res.json(logs);
});

router.get('/unauthorized-attempts', requirePermission(PERMISSIONS.AUDIT_LOGS_READ), async (_req, res) => {
  const logs = await AuditLog.find({ status: 'denied' }).sort({ createdAt: -1 }).limit(100);
  return res.json(logs);
});

export default router;
