import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Edit2, Calendar } from 'lucide-react';

export default function Drafts() {
  const { drafts, deleteDraft } = useApp();
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      deleteDraft(id);
      setSelectedDraft(null);
    }
  };

  const pigDrafts = drafts.filter(d => d.type === 'pig');
  const messageDrafts = drafts.filter(d => d.type === 'message');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-green-800 mb-2">Saved Drafts</h1>
        <p className="text-gray-600 mb-8">Click on a draft to edit and continue working on it</p>

        {drafts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No saved drafts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="space-y-3">
                {pigDrafts.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-green-700 mb-3">Pig Registration Drafts</h2>
                    {pigDrafts.map(draft => (
                      <button
                        key={draft.id}
                        onClick={() => setSelectedDraft(draft.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedDraft === draft.id
                            ? 'bg-green-100 border-green-500'
                            : 'bg-white border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-800">{draft.data.ownerName || 'Unnamed Draft'}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={14} />
                          {new Date(draft.createdAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {messageDrafts.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-blue-700 mb-3">Message Drafts</h2>
                    {messageDrafts.map(draft => (
                      <button
                        key={draft.id}
                        onClick={() => setSelectedDraft(draft.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedDraft === draft.id
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-white border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-800">{draft.data.subject || 'Unnamed Draft'}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={14} />
                          {new Date(draft.createdAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedDraft && (
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                {drafts.find(d => d.id === selectedDraft) && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {drafts.find(d => d.id === selectedDraft)?.type === 'pig' ? 'Pig Registration' : 'Message'} Draft
                      </h2>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(drafts.find(d => d.id === selectedDraft)!.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {drafts.find(d => d.id === selectedDraft)?.type === 'pig' && (
                      <div className="space-y-3 mb-6">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Owner Name</label>
                          <p className="text-gray-600">{drafts.find(d => d.id === selectedDraft)?.data.ownerName || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Birth Date</label>
                          <p className="text-gray-600">{drafts.find(d => d.id === selectedDraft)?.data.birthDate || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Pig Tag</label>
                          <p className="text-gray-600">{drafts.find(d => d.id === selectedDraft)?.data.pigTag || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Barangay</label>
                          <p className="text-gray-600">{drafts.find(d => d.id === selectedDraft)?.data.barangay || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Street/Purok</label>
                          <p className="text-gray-600">{drafts.find(d => d.id === selectedDraft)?.data.street || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Status</label>
                          <p className="text-gray-600">{drafts.find(d => d.id === selectedDraft)?.data.status || '-'}</p>
                        </div>
                      </div>
                    )}

                    {drafts.find(d => d.id === selectedDraft)?.type === 'message' && (
                      <div className="space-y-3 mb-6">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Recipient</label>
                          <p className="text-gray-600">{drafts.find(d => d.id === selectedDraft)?.data.recipientType || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Subject</label>
                          <p className="text-gray-600">{drafts.find(d => d.id === selectedDraft)?.data.subject || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Message</label>
                          <p className="text-gray-600 whitespace-pre-wrap">{drafts.find(d => d.id === selectedDraft)?.data.content || '-'}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const draft = drafts.find(d => d.id === selectedDraft);
                          if (draft?.type === 'pig') {
                            window.location.href = `/register-pig?draft=${selectedDraft}`;
                          } else {
                            window.location.href = `/messages?draft=${selectedDraft}`;
                          }
                        }}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                        Edit Draft
                      </button>
                      <button
                        onClick={() => handleDelete(selectedDraft)}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                        Delete Draft
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
