import { AuditLog } from '../models/AuditLog.js';

export async function writeAuditLog(req, payload) {
  try {
    await AuditLog.create({
      actor: req.user?._id,
      actorEmail: req.user?.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      ...payload
    });
  } catch (err) {
    console.error('audit_log_write_failed', err.message);
  }
}
