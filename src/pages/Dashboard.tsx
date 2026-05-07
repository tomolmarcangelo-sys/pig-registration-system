import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { pigs, currentUser } = useApp();

  const myPigs = useMemo(() => {
    // Admin sees all
    if (currentUser?.role === 'admin') return pigs;
    
    // User sees only pigs in their assigned barangay
    if (currentUser?.assignedBarangay) {
        return pigs.filter(p => p.barangay === currentUser.assignedBarangay);
    }

    // Fallback: If no assigned barangay, maybe see their own registered pigs? 
    // Or see nothing? Requirement says "only the barangay assign can view record where the baragay they assign"
    return pigs.filter(p => p.registeredBy === currentUser?.id);
  }, [pigs, currentUser]);

  const activePigs = myPigs.filter(p => !p.isArchived);
  const archivedPigs = myPigs.filter(p => p.isArchived);

  // Stats for Charts
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    activePigs.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [activePigs]);

  const barangayData = useMemo(() => {
    const counts: Record<string, number> = {};
    activePigs.forEach(p => {
      counts[p.barangay] = (counts[p.barangay] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10
  }, [activePigs]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6384'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {currentUser?.role === 'admin' ? 'Admin Dashboard' : `Dashboard - ${currentUser?.assignedBarangay || 'My Records'}`}
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Active Pigs</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{activePigs.length}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Archived/Sold Pigs</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{archivedPigs.length}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Fattening</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {activePigs.filter(p => p.status === 'Fattening').length}
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Sows</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {activePigs.filter(p => p.status === 'Sow').length}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Pigs by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string | number; percent?: number }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Only show top barangays chart if there's enough diversity to matter, or if admin. 
            For a specific barangay user, this will just show 1 bar, which is fine. */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Active Pigs Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barangayData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
