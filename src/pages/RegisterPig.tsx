import React, { useState, useEffect } from 'react';
import { useApp, PigStatus } from '../context/AppContext';
import { differenceInDays } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Download, Trash2 } from 'lucide-react';

export default function RegisterPig() {
  const { addPig, barangays, currentUser, drafts, saveDraft, deleteDraft } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showDrafts, setShowDrafts] = useState(false);

  const [formData, setFormData] = useState({
    ownerName: '',
    birthDate: '',
    tagNumber: '',
    barangay: '',
    street: '',
    status: 'Fattening' as PigStatus,
  });

  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    // Load draft from URL parameter
    const draftId = searchParams.get('draft');
    if (draftId) {
      const draft = drafts.find(d => d.id === draftId);
      if (draft) {
        loadDraft(draft.data);
      }
    }
    // Set user's barangay if not admin
    if (currentUser?.role !== 'admin' && currentUser?.assignedBarangay) {
      setFormData(prev => ({ ...prev, barangay: currentUser.assignedBarangay! }));
    }
  }, [currentUser, searchParams, drafts]);

  useEffect(() => {
    if (formData.birthDate) {
      const days = differenceInDays(new Date(), new Date(formData.birthDate));
      setAge(days > 0 ? days : 0);
    } else {
      setAge(null);
    }
  }, [formData.birthDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    addPig({
      ownerName: formData.ownerName,
      birthDate: formData.birthDate,
      tagNumber: formData.tagNumber,
      barangay: formData.barangay,
      street: formData.street,
      status: formData.status,
      registeredBy: currentUser.id,
    });

    const pigDraft = drafts.find(d => d.type === 'pig');
    if (pigDraft) deleteDraft(pigDraft.id);

    navigate('/pigs');
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    saveDraft('pig', formData);
    alert('Draft saved successfully! You can continue editing later.');
  };

  const loadDraft = (draftData: any) => {
    setFormData({
      ownerName: draftData.ownerName || '',
      birthDate: draftData.birthDate || '',
      tagNumber: draftData.tagNumber || '',
      barangay: draftData.barangay || '',
      street: draftData.street || '',
      status: draftData.status || 'Fattening',
    });
    setShowDrafts(false);
  };

  const pigDraft = drafts.find(d => d.type === 'pig');

  return (
    <div className="max-w-2xl mx-auto">
      {pigDraft && !showDrafts && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start justify-between">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900">You have a saved draft</h3>
              <p className="text-sm text-blue-700 mt-1">Continue editing your unsaved pig registration form.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDrafts(true)}
            className="text-blue-600 hover:text-blue-900 font-medium text-sm ml-4"
          >
            View Draft
          </button>
        </div>
      )}

      {showDrafts && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Saved Drafts</h3>
          {pigDraft ? (
            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{pigDraft.data.ownerName || 'Unnamed Draft'}</p>
                    <p className="text-sm text-gray-600 mt-1">Tag: {pigDraft.data.tagNumber || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-2">Barangay: {pigDraft.data.barangay || 'Not selected'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => loadDraft(pigDraft.data)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Load Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this draft?')) {
                          deleteDraft(pigDraft.id);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No drafts found.</p>
          )}
          <button
            type="button"
            onClick={() => setShowDrafts(false)}
            className="mt-4 text-gray-600 hover:text-gray-900 font-medium"
          >
            Back to Form
          </button>
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Register New Pig</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Owner Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                value={formData.ownerName}
                onChange={e => setFormData({...formData, ownerName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pig Tag Number</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                  value={formData.tagNumber}
                  onChange={e => setFormData({...formData, tagNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as PigStatus})}
                >
                  <option value="Fattening">Fattening</option>
                  <option value="Sow">Sow</option>
                  <option value="Boar">Boar</option>
                  <option value="Piglet">Piglet</option>
                  <option value="Weaner">Weaner</option>
                  <option value="Gilt">Gilt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                  value={formData.birthDate}
                  onChange={e => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age (Days)</label>
                <input
                  type="text"
                  disabled
                  className="mt-1 block w-full bg-gray-100 rounded-md border-gray-300 shadow-sm border p-2 text-gray-500"
                  value={age !== null ? `${age} days` : 'Select birth date'}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Municipality</label>
                  <input
                    type="text"
                    disabled
                    value="Hinunangan"
                    className="mt-1 block w-full bg-gray-100 rounded-md border-gray-300 shadow-sm border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Province</label>
                  <input
                    type="text"
                    disabled
                    value="Southern Leyte"
                    className="mt-1 block w-full bg-gray-100 rounded-md border-gray-300 shadow-sm border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Barangay</label>
                  <select
                    required
                    disabled={currentUser?.role !== 'admin'}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 ${currentUser?.role !== 'admin' ? 'bg-gray-100' : ''}`}
                    value={formData.barangay}
                    onChange={e => setFormData({...formData, barangay: e.target.value})}
                  >
                    <option value="">Select Barangay</option>
                    {barangays.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Street / Purok</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                    value={formData.street}
                    onChange={e => setFormData({...formData, street: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Register Pig
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
