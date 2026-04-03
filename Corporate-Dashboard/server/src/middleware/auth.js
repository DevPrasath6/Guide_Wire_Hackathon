import jwt from 'jsonwebtoken';
import { Employee } from '../models/Employee.js';
import { User } from '../models/User.js';

export async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing bearer token' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    let user = null;
    let userType = decoded.userType;

    if (userType === 'worker') {
      user = await User.findById(decoded.sub);
    } else if (userType === 'employee') {
      user = await Employee.findById(decoded.sub);
    } else {
      user = await Employee.findById(decoded.sub);
      userType = 'employee';
      if (!user) {
        user = await User.findById(decoded.sub);
        userType = user ? 'worker' : null;
      }
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid user session' });
    }

    req.user = user;
    req.userType = userType;
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
}
