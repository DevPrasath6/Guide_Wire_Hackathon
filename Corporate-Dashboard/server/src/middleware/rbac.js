import { writeAuditLog } from '../services/auditService.js';
import { notifySuperAdmins } from '../services/notificationService.js';

export function requireRole(...roles) {
  return async (req, res, next) => {
    if (roles.includes(req.user.role)) return next();

    await writeAuditLog(req, {
      action: 'role_access_denied',
      resourceType: 'route',
      resourceId: req.originalUrl,
      status: 'denied',
      reason: `Required roles: ${roles.join(', ')}`
    });
    await notifySuperAdmins(
      'Unauthorized Access Attempt',
      `${req.user.email} attempted restricted route access`,
      { route: req.originalUrl, role: req.user.role }
    );

    return res.status(403).json({ message: 'Forbidden: role not allowed' });
  };
}

export function requirePermission(...permissions) {
  return async (req, res, next) => {
    const effectivePermissions = new Set(req.user.permissions || []);
    const allowed = permissions.every((permission) => effectivePermissions.has(permission));
    if (allowed) return next();

    await writeAuditLog(req, {
      action: 'permission_access_denied',
      resourceType: 'route',
      resourceId: req.originalUrl,
      status: 'denied',
      reason: `Missing permissions: ${permissions.filter((p) => !effectivePermissions.has(p)).join(', ')}`
    });
    await notifySuperAdmins(
      'Unauthorized Permission Attempt',
      `${req.user.email} attempted an unauthorized action`,
      { route: req.originalUrl, missingPermissions: permissions }
    );

    return res.status(403).json({ message: 'Forbidden: missing permission' });
  };
}
