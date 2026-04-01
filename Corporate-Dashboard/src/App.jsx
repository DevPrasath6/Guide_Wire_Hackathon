import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'; 
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ClaimsManagement from './pages/ClaimsManagement';
import PolicyManagement from './pages/PolicyManagement';
import Analytics from './pages/Analytics';
import SupportTickets from './pages/SupportTickets';
import Login from './pages/Login';
import Settings from './pages/Settings';
import EmployeeManagement from './pages/EmployeeManagement';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <div className="text-es-teal p-8 font-syne text-xl">404 - Page Not Found</div>,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'claims', element: <ClaimsManagement /> },
          { path: 'support', element: <SupportTickets /> },
          { path: 'policies', element: <PolicyManagement /> },
          { path: 'analytics', element: <Analytics /> },
          { path: 'employees', element: <EmployeeManagement /> },
          { path: 'settings', element: <Settings /> },
        ]
      }
    ]
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;