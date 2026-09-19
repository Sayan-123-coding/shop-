import { Outlet, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout flex h-screen bg-gray-50">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b font-bold text-lg">Admin CMS</div>
        <nav className="flex flex-col gap-2 p-4 flex-1">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/products">Products</Link>
          <Link to="/admin/categories">Categories</Link>
          <Link to="/admin/settings">Settings</Link>
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="text-sm text-red-500">Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-6">
          <h2 className="font-semibold text-gray-700">Management Panel</h2>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
