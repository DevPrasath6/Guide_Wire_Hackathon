import { Notification } from '../models/Notification.js';
import { Employee } from '../models/Employee.js';

export async function notifyUser(userId, title, message, type = 'info', meta = {}) {
  return Notification.create({ user: userId, title, message, type, meta });
}

export async function notifySuperAdmins(title, message, meta = {}) {
  const admins = await Employee.find({ role: 'superadmin', isActive: true }).select('_id');
  if (!admins.length) return;
  await Notification.insertMany(
    admins.map((admin) => ({
      user: admin._id,
      title,
      message,
      type: 'security',
      meta
    }))
  );
}
