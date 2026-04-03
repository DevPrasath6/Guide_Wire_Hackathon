import jwt from 'jsonwebtoken';

export function signToken(user, userType = 'employee') {
  return jwt.sign(
    {
      sub: user._id.toString(),
      userType,
      role: user.role,
      permissions: user.permissions || []
    },
    process.env.JWT_SECRET || 'dev_secret_change_me',
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
  );
}
