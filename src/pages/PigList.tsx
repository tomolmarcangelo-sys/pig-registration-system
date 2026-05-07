import { useState, useRef, useMemo } from 'react';
import { useApp, Pig, PigStatus } from '../context/AppContext';
import { differenceInDays } from 'date-fns';
import { Search, Printer, Edit, Archive, X } from 'lucide-react';
import { Certificate } from '../components/Certificate';

interface PigListProps {
  filter: 'all' | 'mine';
}

export default function PigList({ filter }: PigListProps) {
  const { pigs, currentUser, updatePig, sellPig, barangays } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [barangayFilter, setBarangayFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  
  const [editingPig, setEditingPig] = useState<Pig | null>(null);
  const [printPig, setPrintPig] = useState<Pig | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Edit Form State
  const [editForm, setEditForm] = useState<Partial<Pig>>({});

  const filteredPigs = useMemo(() => {
    let result = pigs;

    // Filter by ownership (specific requirement from props)
    if (filter === 'mine' && currentUser) {
      result = result.filter(p => p.registeredBy === currentUser.id);
    }

    // NEW: Restrict by Assigned Barangay for non-admins
    if (currentUser?.role !== 'admin' && currentUser?.assignedBarangay) {
      result = result.filter(p => p.barangay === currentUser.assignedBarangay);
    }

    // Filter by Archive Status
    result = result.filter(p => p.isArchived === showArchived);

    // Filter by Status
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Filter by Barangay (Only for Admin, or if user is somehow viewing all but has no restriction? handled above)
    if (barangayFilter !== 'all') {
      result = result.filter(p => p.barangay === barangayFilter);
    }

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.ownerName.toLowerCase().includes(lower) || 
        p.tagNumber.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [pigs, filter, currentUser, showArchived, statusFilter, barangayFilter, searchTerm]);

  const handlePrint = (pig: Pig) => {
    setPrintPig(pig);
    // Use a slight delay to allow React to render the component before printing
    setTimeout(() => {
        window.print();
        // We can't clear printPig immediately because print() is blocking in some browsers but not all events.
        // It's safer to leave it or clear it on an event, but leaving it hidden is fine.
        // To be clean, we can try to clear it after a longer delay, but typically unnecessary if hidden.
    }, 100);
  };

  const startEdit = (pig: Pig) => {
    setEditingPig(pig);
    setEditForm({
      ownerName: pig.ownerName,
      tagNumber: pig.tagNumber,
      status: pig.status,
      barangay: pig.barangay,
      street: pig.street,
      birthDate: pig.birthDate
    });
  };

  const saveEdit = () => {
    if (editingPig && editForm) {
      updatePig(editingPig.id, editForm);
      setEditingPig(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {showArchived ? 'Archived / Sold Pigs' : 'Active Pigs'}
        </h1>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            showArchived 
              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showArchived ? 'View Active Pigs' : 'View Archived Pigs'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Owner or Tag..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="border border-gray-300 rounded-md px-3 py-2"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Fattening">Fattening</option>
          <option value="Sow">Sow</option>
          <option value="Boar">Boar</option>
          <option value="Piglet">Piglet</option>
          <option value="Weaner">Weaner</option>
          <option value="Gilt">Gilt</option>
        </select>

        {/* Only Admin sees Barangay Filter */}
        {filter === 'all' && currentUser?.role === 'admin' && (
          <select
            className="border border-gray-300 rounded-md px-3 py-2"
            value={barangayFilter}
            onChange={e => setBarangayFilter(e.target.value)}
          >
            <option value="all">All Barangays</option>
            {barangays.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPigs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No pigs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPigs.map(pig => (
                  <tr key={pig.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{pig.tagNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pig.ownerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pig.barangay}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${pig.status === 'Fattening' ? 'bg-green-100 text-green-800' : 
                          pig.status === 'Sow' ? 'bg-pink-100 text-pink-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {pig.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {differenceInDays(new Date(), new Date(pig.birthDate))} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handlePrint(pig)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Print Certificate"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      
                      <button 
                        onClick={() => startEdit(pig)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      
                      {!pig.isArchived && (
                        <button 
                          onClick={() => sellPig(pig.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Sell / Archive"
                        >
                          <Archive className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Certificate for Printing */}
      <div className="hidden">
        {printPig && <Certificate ref={certificateRef} pig={printPig} />}
      </div>

      {/* Edit Modal */}
      {editingPig && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setEditingPig(null)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Edit Pig Details</h3>
                  <button onClick={() => setEditingPig(null)} className="text-gray-400 hover:text-gray-500">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={editForm.ownerName}
                      onChange={e => setEditForm({...editForm, ownerName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tag Number</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={editForm.tagNumber}
                      onChange={e => setEditForm({...editForm, tagNumber: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={editForm.status}
                        onChange={e => setEditForm({...editForm, status: e.target.value as PigStatus})}
                      >
                         <option value="Fattening">Fattening</option>
                        <option value="Sow">Sow</option>
                        <option value="Boar">Boar</option>
                        <option value="Piglet">Piglet</option>
                        <option value="Weaner">Weaner</option>
                        <option value="Gilt">Gilt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                      <input
                        type="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={editForm.birthDate}
                        onChange={e => setEditForm({...editForm, birthDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Barangay</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={editForm.barangay}
                      disabled={currentUser?.role !== 'admin'}
                      onChange={e => setEditForm({...editForm, barangay: e.target.value})}
                    >
                      {barangays.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700">Street</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={editForm.street}
                      onChange={e => setEditForm({...editForm, street: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={saveEdit}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setEditingPig(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
