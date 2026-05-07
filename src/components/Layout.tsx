import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  PiggyBank, 
  ClipboardList, 
  Users, 
  MapPin, 
  LogOut, 
  Menu, 
  X,
  UserCircle,
  History,
  MessageSquare,
  Save
} from 'lucide-react';

export default function Layout() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center px-4 py-3 text-sm font-medium transition-colors mb-1 rounded-r-full mr-4 ${
          isActive 
            ? 'bg-indigo-800 text-white border-l-4 border-indigo-400' 
            : 'text-indigo-100 hover:bg-indigo-800 hover:text-white border-l-4 border-transparent'
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-indigo-900 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-indigo-950 text-white font-bold text-xl shadow-md">
          <div className="flex items-center space-x-2">
            <PiggyBank className="w-6 h-6 text-pink-400" />
            <span>Pig Registry</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-300 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1">
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/register-pig" icon={PiggyBank} label="Register Pig" />
            
            {currentUser.role === 'admin' ? (
                <>
                <NavItem to="/pigs" icon={ClipboardList} label="All Pigs" />
                <NavItem to="/users" icon={Users} label="User Management" />
                <NavItem to="/barangays" icon={MapPin} label="Barangays" />
                </>
            ) : (
                <NavItem to="/my-pigs" icon={ClipboardList} label="My Pigs" />
            )}
            
            <div className="pt-4 mt-4 border-t border-indigo-800">
                <NavItem to="/messages" icon={MessageSquare} label="Messages" />
                <NavItem to="/history" icon={History} label="Activity History" />
                <NavItem to="/drafts" icon={Save} label="Saved Drafts" />
                <NavItem to="/profile" icon={UserCircle} label="My Profile" />
            </div>
            </nav>
        </div>

        <div className="p-4 bg-indigo-950">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center mr-3 text-white font-bold border-2 border-indigo-500">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-indigo-300 truncate capitalize">{currentUser.role}</p>
              {currentUser.assignedBarangay && (
                  <p className="text-xs text-green-400 truncate">{currentUser.assignedBarangay}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 lg:hidden flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-lg font-semibold text-gray-900">Pig Registry</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <Outlet />
            </div>
        </main>
      </div>
    </div>
  );
}
