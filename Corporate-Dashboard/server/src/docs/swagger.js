export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Earnings Shield API',
    version: '1.0.0',
    description: 'Corporate + worker APIs with RBAC and audit trails'
  },
  servers: [{ url: 'http://localhost:5001/api' }],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Login for workers/employees/superadmins',
        responses: { 200: { description: 'Logged in successfully' } }
      }
    },
    '/dashboard/summary': {
      get: {
        summary: 'Dashboard KPI summary',
        responses: { 200: { description: 'KPI response' } }
      }
    },
    '/iam/audit-logs': {
      get: {
        summary: 'Super-admin audit logs',
        responses: { 200: { description: 'Audit log response' } }
      }
    }
  }
};
