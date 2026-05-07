import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { FileText, Edit3, Archive, Plus } from 'lucide-react';

export default function History() {
  const { history, pigs, users, currentUser } = useApp();

  const displayedHistory = useMemo(() => {
    let result = history;

    // Non-admin users only see history for pigs in their barangay
    if (currentUser?.role !== 'admin' && currentUser?.assignedBarangay) {
      const barangayPigIds = pigs
        .filter(p => p.barangay === currentUser.assignedBarangay)
        .map(p => p.id);
      result = result.filter(h => barangayPigIds.includes(h.pigId));
    }

    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [history, currentUser, pigs]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="w-5 h-5 text-green-600" />;
      case 'updated':
        return <Edit3 className="w-5 h-5 text-blue-600" />;
      case 'archived':
      case 'sold':
        return <Archive className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'updated':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'archived':
      case 'sold':
        return 'bg-red-50 border-l-4 border-red-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  const getChangedByName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown User';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Activity History</h1>

      <div className="space-y-3">
        {displayedHistory.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
            No activity history found.
          </div>
        ) : (
          displayedHistory.map(entry => {
            const pig = pigs.find(p => p.id === entry.pigId);
            return (
              <div key={entry.id} className={`p-4 rounded-lg shadow-sm border ${getActionColor(entry.action)}`}>
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 capitalize">{entry.action}</span>
                        {pig && (
                          <span className="text-sm text-gray-600">
                            Pig: <strong>{pig.tagNumber}</strong> ({pig.ownerName})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm:ss')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{entry.details}</p>
                    <p className="text-xs text-gray-500">
                      Changed by: <strong>{getChangedByName(entry.changedBy)}</strong>
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
