import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock } from 'lucide-react';

export default function Profile() {
  const { currentUser, updateUser } = useApp();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    password: currentUser?.password || '',
  });
  const [message, setMessage] = useState('');

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, formData);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex items-center space-x-4 mb-6">
                 <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                    {currentUser.username[0].toUpperCase()}
                 </div>
                 <div>
                     <h2 className="text-xl font-medium">{currentUser.name}</h2>
                     <p className="text-gray-500">@{currentUser.username}</p>
                     {currentUser.assignedBarangay && (
                         <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                             {currentUser.assignedBarangay}
                         </span>
                     )}
                     <span className="ml-2 inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                         {currentUser.role}
                     </span>
                 </div>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Full Name
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                New Password
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <p className="mt-1 text-sm text-gray-500">Enter your current password to keep it unchanged.</p>
          </div>

          {message && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
              {message}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
