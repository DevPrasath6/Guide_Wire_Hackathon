import React, { useCallback, useMemo, useState } from 'react';
import { Users, Shield, FileKey2, History, UserPlus, PlusCircle, AlertTriangle, Save, Trash2, Edit3 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import {
  deleteAccessPolicy,
  deleteUserGroup,
  createAccessPolicy,
  createEmployee,
  createUserGroup,
  getAccessPolicies,
  getAuditLogs,
  getEmployees,
  getUserGroups,
  updateAccessPolicy,
  updateEmployee,
  updateUserGroup
} from '../services/api';
import { isSuperAdmin } from '../utils/rbac';
import useLiveRefresh from '../hooks/useLiveRefresh';

const defaultUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'employee',
  department: 'operations',
  title: 'Employee'
};

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [groups, setGroups] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [logs, setLogs] = useState([]);
  const [userForm, setUserForm] = useState(defaultUserForm);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [policyDescription, setPolicyDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState(null);

  const canManage = isSuperAdmin();

  const deniedLogs = useMemo(() => logs.filter((log) => log.status === 'denied'), [logs]);

  const refreshAll = useCallback(async () => {
    const [usersRes, groupsRes, policiesRes, logsRes] = await Promise.all([
      getEmployees(),
      getUserGroups(),
      getAccessPolicies(),
      getAuditLogs()
    ]);
    setEmployees(usersRes);
    setGroups(groupsRes);
    setPolicies(policiesRes);
    setLogs(logsRes);
  }, []);

  useLiveRefresh(
    async () => {
      try {
        await refreshAll();
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load IAM data');
      } finally {
        setLoading(false);
      }
    },
    {
      intervalMs: 15000,
      topics: ['heartbeat', 'iam', 'claims']
    }
  );

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    try {
      await createEmployee(userForm);
      setUserForm(defaultUserForm);
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleCreateGroup = async () => {
    if (!canManage || !groupName.trim()) return;
    try {
      await createUserGroup({ name: groupName, description: groupDescription || 'Managed in dashboard', permissions: [] });
      setGroupName('');
      setGroupDescription('');
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    }
  };

  const handleCreatePolicy = async () => {
    if (!canManage || !policyName.trim()) return;
    try {
      await createAccessPolicy({
        name: policyName,
        description: policyDescription || 'Custom dashboard policy',
        permissions: []
      });
      setPolicyName('');
      setPolicyDescription('');
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create access policy');
    }
  };

  const startEditEmployee = (employee) => {
    setEditingEmployeeId(employee._id);
    setEditingEmployee({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      isActive: employee.isActive,
      department: employee.employeeProfile?.department || 'operations',
      title: employee.employeeProfile?.title || 'Employee',
      permissionsText: (employee.permissions || []).join(', '),
      groupIds: employee.groups || []
    });
  };

  const saveEmployee = async () => {
    if (!editingEmployeeId || !editingEmployee) return;
    try {
      await updateEmployee(editingEmployeeId, {
        ...editingEmployee,
        permissions: editingEmployee.permissionsText
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean)
      });
      setEditingEmployeeId(null);
      setEditingEmployee(null);
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee');
    }
  };

  const startEditGroup = (group) => {
    setEditingGroupId(group._id);
    setEditingGroup({
      name: group.name,
      description: group.description || '',
      permissionsText: (group.permissions || []).join(', '),
      memberIds: (group.members || []).map((m) => m._id || m)
    });
  };

  const saveGroup = async () => {
    if (!editingGroupId || !editingGroup) return;
    try {
      await updateUserGroup(editingGroupId, {
        name: editingGroup.name,
        description: editingGroup.description,
        permissions: editingGroup.permissionsText.split(',').map((p) => p.trim()).filter(Boolean),
        memberIds: editingGroup.memberIds
      });
      setEditingGroupId(null);
      setEditingGroup(null);
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update group');
    }
  };

  const removeGroup = async (id) => {
    try {
      await deleteUserGroup(id);
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const startEditPolicy = (policy) => {
    setEditingPolicyId(policy._id);
    setEditingPolicy({
      name: policy.name,
      description: policy.description || '',
      permissionsText: (policy.permissions || []).join(', ')
    });
  };

  const savePolicy = async () => {
    if (!editingPolicyId || !editingPolicy) return;
    try {
      await updateAccessPolicy(editingPolicyId, {
        name: editingPolicy.name,
        description: editingPolicy.description,
        permissions: editingPolicy.permissionsText.split(',').map((p) => p.trim()).filter(Boolean)
      });
      setEditingPolicyId(null);
      setEditingPolicy(null);
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update policy');
    }
  };

  const removePolicy = async (id) => {
    try {
      await deleteAccessPolicy(id);
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete policy');
    }
  };

  if (loading) {
    return <div className="text-es-text-secondary">Loading employee management...</div>;
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-syne font-bold mb-2">Employee Management</h1>
        <p className="text-es-text-secondary">IAM controls for users, groups, policies, and CloudTrail-like audit visibility.</p>
      </div>

      {!canManage && (
        <GlassCard className="p-4 border border-es-amber/30 bg-es-amber/10" glowColor="none">
          <div className="flex items-center gap-2 text-es-amber text-sm">
            <AlertTriangle size={16} />
            Read-only mode. Only super-admin can create users, groups, and policies.
          </div>
        </GlassCard>
      )}

      {error && <div className="text-es-red text-sm">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GlassCard className="p-5" glowColor="none">
          <div className="flex items-center gap-2 mb-4 font-syne font-semibold"><Users size={16} /> Users</div>
          {canManage && (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4" onSubmit={handleCreateUser}>
              <input className="bg-[#1A2234] rounded px-3 py-2 text-sm" placeholder="Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
              <input className="bg-[#1A2234] rounded px-3 py-2 text-sm" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              <input className="bg-[#1A2234] rounded px-3 py-2 text-sm" placeholder="Password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
              <select className="bg-[#1A2234] rounded px-3 py-2 text-sm" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="employee">employee</option>
                <option value="support">support</option>
                <option value="analyst">analyst</option>
                <option value="admin">admin</option>
              </select>
              <button className="md:col-span-2 bg-es-teal text-[#0A0F1C] font-semibold rounded px-3 py-2 text-sm flex items-center justify-center gap-2" type="submit">
                <UserPlus size={15} /> Create Employee
              </button>
            </form>
          )}
          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
            {employees.map((emp) => (
              <div key={emp._id} className="bg-[#ffffff05] border border-[#ffffff15] rounded p-3 flex items-center justify-between">
                {editingEmployeeId === emp._id ? (
                  <div className="w-full space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input className="bg-[#1A2234] rounded px-2 py-1 text-xs" value={editingEmployee.name} onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })} />
                      <input className="bg-[#1A2234] rounded px-2 py-1 text-xs" value={editingEmployee.email} onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })} />
                      <input className="bg-[#1A2234] rounded px-2 py-1 text-xs" value={editingEmployee.department} onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })} />
                      <input className="bg-[#1A2234] rounded px-2 py-1 text-xs" value={editingEmployee.title} onChange={(e) => setEditingEmployee({ ...editingEmployee, title: e.target.value })} />
                      <select className="bg-[#1A2234] rounded px-2 py-1 text-xs" value={editingEmployee.role} onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}>
                        {['employee', 'support', 'analyst', 'admin', 'superadmin'].map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select className="bg-[#1A2234] rounded px-2 py-1 text-xs" value={editingEmployee.isActive ? 'active' : 'inactive'} onChange={(e) => setEditingEmployee({ ...editingEmployee, isActive: e.target.value === 'active' })}>
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                    </div>
                    <input className="bg-[#1A2234] rounded px-2 py-1 text-xs w-full" value={editingEmployee.permissionsText} onChange={(e) => setEditingEmployee({ ...editingEmployee, permissionsText: e.target.value })} placeholder="permissions comma separated" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setEditingEmployeeId(null); setEditingEmployee(null); }} className="text-xs px-2 py-1 rounded border border-[#ffffff30]">Cancel</button>
                      <button onClick={saveEmployee} className="text-xs px-2 py-1 rounded border border-es-teal/40 text-es-teal flex items-center gap-1"><Save size={12} /> Save</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="font-medium text-sm">{emp.name}</div>
                      <div className="text-xs text-es-text-muted">{emp.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-xs px-2 py-1 rounded border ${emp.isActive ? 'border-es-teal/30 text-es-teal' : 'border-es-red/40 text-es-red'}`}>{emp.role}</div>
                      {canManage && <button onClick={() => startEditEmployee(emp)} className="text-es-text-secondary hover:text-white"><Edit3 size={14} /></button>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5" glowColor="none">
          <div className="flex items-center gap-2 mb-4 font-syne font-semibold"><Shield size={16} /> Groups & Policies</div>

          <div className="mb-4 space-y-2">
            <div className="text-xs text-es-text-muted uppercase tracking-wider">User Groups</div>
            <div className="flex gap-2">
              <input className="bg-[#1A2234] rounded px-3 py-2 text-sm flex-1" placeholder="Group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
              <input className="bg-[#1A2234] rounded px-3 py-2 text-sm flex-1" placeholder="Description" value={groupDescription} onChange={(e) => setGroupDescription(e.target.value)} />
              <button disabled={!canManage} onClick={handleCreateGroup} className="bg-es-blue px-3 py-2 rounded text-sm font-semibold text-[#0A0F1C] disabled:opacity-40"><PlusCircle size={14} /></button>
            </div>
            <div className="space-y-1">
              {groups.map((group) => (
                <div key={group._id} className="text-sm text-es-text-secondary border border-[#ffffff10] rounded p-2">
                  {editingGroupId === group._id ? (
                    <div className="space-y-2">
                      <input className="bg-[#1A2234] rounded px-2 py-1 text-xs w-full" value={editingGroup.name} onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })} />
                      <input className="bg-[#1A2234] rounded px-2 py-1 text-xs w-full" value={editingGroup.description} onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })} placeholder="description" />
                      <input className="bg-[#1A2234] rounded px-2 py-1 text-xs w-full" value={editingGroup.permissionsText} onChange={(e) => setEditingGroup({ ...editingGroup, permissionsText: e.target.value })} placeholder="permissions comma separated" />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setEditingGroupId(null); setEditingGroup(null); }} className="text-xs px-2 py-1 rounded border border-[#ffffff30]">Cancel</button>
                        <button onClick={saveGroup} className="text-xs px-2 py-1 rounded border border-es-teal/40 text-es-teal">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div>{group.name}</div>
                        <div className="text-xs text-es-text-muted">{group.description || 'No description'} • {(group.members || []).length} members</div>
                      </div>
                      {canManage && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEditGroup(group)} className="text-es-text-secondary hover:text-white"><Edit3 size={14} /></button>
                          <button onClick={() => removeGroup(group._id)} className="text-es-red hover:text-red-300"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-es-text-muted uppercase tracking-wider">Access Policies</div>
            <div className="flex gap-2">
              <input className="bg-[#1A2234] rounded px-3 py-2 text-sm flex-1" placeholder="Policy name" value={policyName} onChange={(e) => setPolicyName(e.target.value)} />
              <input className="bg-[#1A2234] rounded px-3 py-2 text-sm flex-1" placeholder="Description" value={policyDescription} onChange={(e) => setPolicyDescription(e.target.value)} />
              <button disabled={!canManage} onClick={handleCreatePolicy} className="bg-es-teal px-3 py-2 rounded text-sm font-semibold text-[#0A0F1C] disabled:opacity-40"><FileKey2 size={14} /></button>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
              {policies.map((policy) => (
                <div key={policy._id} className="text-sm text-es-text-secondary border border-[#ffffff10] rounded p-2">
                  {editingPolicyId === policy._id ? (
                    <div className="space-y-2">
                      <input className="bg-[#1A2234] rounded px-2 py-1 text-xs w-full" value={editingPolicy.name} onChange={(e) => setEditingPolicy({ ...editingPolicy, name: e.target.value })} />
                      <input className="bg-[#1A2234] rounded px-2 py-1 text-xs w-full" value={editingPolicy.description} onChange={(e) => setEditingPolicy({ ...editingPolicy, description: e.target.value })} placeholder="description" />
                      <input className="bg-[#1A2234] rounded px-2 py-1 text-xs w-full" value={editingPolicy.permissionsText} onChange={(e) => setEditingPolicy({ ...editingPolicy, permissionsText: e.target.value })} placeholder="permissions comma separated" />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setEditingPolicyId(null); setEditingPolicy(null); }} className="text-xs px-2 py-1 rounded border border-[#ffffff30]">Cancel</button>
                        <button onClick={savePolicy} className="text-xs px-2 py-1 rounded border border-es-teal/40 text-es-teal">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div>{policy.name}</div>
                        <div className="text-xs text-es-text-muted">{policy.description || 'No description'}</div>
                      </div>
                      {canManage && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEditPolicy(policy)} className="text-es-text-secondary hover:text-white"><Edit3 size={14} /></button>
                          <button onClick={() => removePolicy(policy._id)} className="text-es-red hover:text-red-300"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5" glowColor="none">
        <div className="flex items-center gap-2 mb-4 font-syne font-semibold"><History size={16} /> Audit Trail</div>
        <div className="text-xs text-es-text-muted mb-3">Unauthorized attempts in last logs: {deniedLogs.length}</div>
        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
          {logs.map((log) => (
            <div key={log._id} className="bg-[#ffffff05] border border-[#ffffff10] rounded p-3 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{log.action}</div>
                <div className="text-xs text-es-text-muted">{log.actorEmail || log.actor?.email || 'system'} • {new Date(log.createdAt).toLocaleString()}</div>
              </div>
              <div className={`text-xs px-2 py-1 rounded border ${log.status === 'denied' ? 'text-es-red border-es-red/40' : 'text-es-teal border-es-teal/40'}`}>
                {log.status}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default EmployeeManagement;
