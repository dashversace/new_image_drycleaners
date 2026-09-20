import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('profile/').then(res => {
      setProfile(res.data);
      localStorage.setItem('user_role', res.data.role);
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const role = profile?.role || localStorage.getItem('user_role');
  const isActive = (path) => location.pathname === path ? 'bg-sky-700 text-white font-semibold' : 'text-sky-100 hover:bg-sky-800';

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="font-black text-xl tracking-wide text-sky-400">NEW IMAGE</h1>
          <p className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Dry Cleaners (Pvt) Ltd</p>
          <p className="text-[11px] text-slate-500 mt-1">59 Second Street, Mutare</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-sm">
          <Link to="/" className={`block px-4 py-2.5 rounded transition ${isActive('/')}`}>Dashboard</Link>
          <Link to="/orders" className={`block px-4 py-2.5 rounded transition ${isActive('/orders')}`}>Orders</Link>
          <Link to="/payments" className={`block px-4 py-2.5 rounded transition ${isActive('/payments')}`}>Payments</Link>
          <Link to="/uncollected" className={`block px-4 py-2.5 rounded transition ${isActive('/uncollected')}`}>Uncollected Orders</Link>
          
          <div className="pt-4 pb-1 px-4 text-[11px] uppercase tracking-wider text-slate-500 font-bold">Administration</div>
          <Link to="/services" className={`block px-4 py-2.5 rounded transition ${isActive('/services')}`}>Services & Prices</Link>
          <Link to="/reports" className={`block px-4 py-2.5 rounded transition ${isActive('/reports')}`}>Reports</Link>
          <Link to="/users" className={`block px-4 py-2.5 rounded transition ${isActive('/users')}`}>User Management</Link>
          <Link to="/audit-logs" className={`block px-4 py-2.5 rounded transition ${isActive('/audit-logs')}`}>Audit Logs</Link>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-sm">{profile?.first_name ? `${profile.first_name} ${profile.last_name}` : profile?.username || 'User'}</p>
              <span className="inline-block px-2 py-0.5 text-[10px] bg-sky-900 text-sky-200 rounded font-bold uppercase">{role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full mt-2 bg-rose-600 hover:bg-rose-700 text-white py-1.5 px-3 rounded text-xs font-semibold transition">
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">Dry Cleaning Management System</h2>
          <div className="text-xs text-slate-500 font-medium">59 Second Street, Mutare</div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}