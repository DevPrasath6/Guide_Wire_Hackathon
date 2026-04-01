export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  CLAIMS_READ_ALL: 'claims.read_all',
  CLAIMS_UPDATE: 'claims.update',
  POLICIES_READ_ALL: 'policies.read_all',
  POLICIES_UPDATE: 'policies.update',
  ANALYTICS_VIEW: 'analytics.view',
  TICKETS_READ_ALL: 'tickets.read_all',
  TICKETS_UPDATE: 'tickets.update',
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  GROUPS_MANAGE: 'groups.manage',
  ACCESS_POLICIES_MANAGE: 'access_policies.manage',
  AUDIT_LOGS_READ: 'audit_logs.read',
  API_DOCS_VIEW: 'api_docs.view'
};

export const ROLE_PERMISSIONS = {
  superadmin: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CLAIMS_READ_ALL,
    PERMISSIONS.CLAIMS_UPDATE,
    PERMISSIONS.POLICIES_READ_ALL,
    PERMISSIONS.POLICIES_UPDATE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.TICKETS_READ_ALL,
    PERMISSIONS.TICKETS_UPDATE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.AUDIT_LOGS_READ
  ],
  analyst: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CLAIMS_READ_ALL,
    PERMISSIONS.POLICIES_READ_ALL,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  support: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CLAIMS_READ_ALL,
    PERMISSIONS.TICKETS_READ_ALL,
    PERMISSIONS.TICKETS_UPDATE
  ],
  employee: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CLAIMS_READ_ALL,
    PERMISSIONS.POLICIES_READ_ALL
  ],
  worker: []
};

export const SENSITIVE_USER_FIELDS = ['email', 'phone', 'profile.zone', 'policy.weeklyPremium'];
