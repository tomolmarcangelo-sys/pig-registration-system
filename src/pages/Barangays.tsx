import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Edit2, MapPin, Plus, Save, X, Trash2 } from 'lucide-react';

export default function Barangays() {
  const { barangays, addBarangay, updateBarangay, deleteBarangay, currentUser } = useApp();
  const [newBarangay, setNewBarangay] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (currentUser?.role !== 'admin') {
    return <div className="p-4 text-red-600">Access Denied</div>;
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBarangay.trim()) {
      addBarangay(newBarangay.trim());
      setNewBarangay('');
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      updateBarangay(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Barangay Management</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleAdd} className="flex gap-4">
          <div className="flex-1">
            <label className="sr-only">New Barangay Name</label>
            <input
              type="text"
              placeholder="Enter new Barangay name..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
              value={newBarangay}
              onChange={e => setNewBarangay(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={!newBarangay.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Barangay
          </button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {barangays.map(barangay => (
            <li key={barangay.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center flex-1">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                {editingId === barangay.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 mr-4 border-b border-indigo-500 focus:outline-none px-2 py-1"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{barangay.name}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {editingId === barangay.id ? (
                  <>
                    <button onClick={() => saveEdit(barangay.id)} className="text-green-600 hover:text-green-900">
                      <Save className="h-5 w-5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(barangay.id, barangay.name)} className="text-indigo-600 hover:text-indigo-900">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${barangay.name}?`)) {
                          deleteBarangay(barangay.id);
                        }
                      }} 
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
