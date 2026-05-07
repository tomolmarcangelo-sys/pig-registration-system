import React, { useState } from 'react';
import { useApp, UserRole } from '../context/AppContext';
import { UserPlus } from 'lucide-react';

export default function Users() {
  const { users, addUser, currentUser, barangays } = useApp();
  const [newUserState, setNewUserState] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user' as UserRole,
    assignedBarangay: ''
  });

  if (currentUser?.role !== 'admin') {
    return <div className="p-4 text-red-600">Access Denied</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (newUserState.role === 'user' && !newUserState.assignedBarangay) {
      alert('Please select a barangay for the user.');
      return;
    }

    addUser({
      username: newUserState.username,
      password: newUserState.password,
      name: newUserState.name,
      role: newUserState.role,
      assignedBarangay: newUserState.role === 'user' ? newUserState.assignedBarangay : undefined
    });

    setNewUserState({
      username: '',
      password: '',
      name: '',
      role: 'user',
      assignedBarangay: ''
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">User Management</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add User Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <UserPlus className="w-5 h-5 mr-2 text-indigo-600" />
            <h2 className="text-lg font-medium text-gray-900">Add New User</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                value={newUserState.name}
                onChange={e => setNewUserState({...newUserState, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                value={newUserState.username}
                onChange={e => setNewUserState({...newUserState, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                value={newUserState.password}
                onChange={e => setNewUserState({...newUserState, password: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                  value={newUserState.role}
                  onChange={e => setNewUserState({...newUserState, role: e.target.value as UserRole})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {newUserState.role === 'user' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Barangay</label>
                  <select
                    required={newUserState.role === 'user'}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                    value={newUserState.assignedBarangay}
                    onChange={e => setNewUserState({...newUserState, assignedBarangay: e.target.value})}
                  >
                    <option value="">Select...</option>
                    {barangays.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
            >
              Create Account
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Registered Users</h2>
          </div>
          <div className="overflow-y-auto max-h-[500px]">
            <ul className="divide-y divide-gray-200">
              {users.map(user => (
                <li key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      {user.role === 'user' && user.assignedBarangay && (
                        <p className="text-xs text-gray-400 mt-1">
                          Assigned to: <span className="font-medium text-gray-600">{user.assignedBarangay}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
