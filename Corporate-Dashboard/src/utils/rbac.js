export const getSessionUser = () => {
  try {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const hasPermission = (permission) => {
  const user = getSessionUser();
  if (!user) return false;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
};

export const isSuperAdmin = () => {
  const user = getSessionUser();
  return user?.role === 'superadmin';
};
