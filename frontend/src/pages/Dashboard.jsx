import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('dashboard-stats/')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 text-slate-600 font-medium">Loading dashboard statistics...</div>;
  if (!stats) return <div className="p-6 text-rose-600 font-medium">Failed to load dashboard data. Please check backend connection.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Dashboard Overview</h3>
        <Link to="/orders/new" className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded text-sm font-bold shadow">
          + New Order
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Today's Orders</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats.todays_orders}</p>
          <p className="text-xs text-slate-400 mt-1">Total orders: {stats.total_orders}</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Today's Sales</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">${Number(stats.todays_sales).toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">Total revenue: ${Number(stats.total_sales).toFixed(2)}</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Outstanding Balances</p>
          <p className="text-2xl font-black text-rose-600 mt-1">${Number(stats.total_outstanding).toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">Pending customer dues</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Uncollected (90+ Days)</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.uncollected_count}</p>
          <Link to="/uncollected" className="text-xs text-sky-600 hover:underline font-bold mt-1 block">View flag list &rarr;</Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h4 className="font-bold text-slate-800 mb-4">Orders by Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.status_counts?.map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded border border-slate-200">
              <p className="text-xs font-bold uppercase text-slate-500">{item.status}</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}