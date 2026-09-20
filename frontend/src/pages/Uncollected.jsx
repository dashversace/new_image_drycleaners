import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Uncollected() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('orders/?uncollected=true').then(res => setOrders(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <h3 className="font-bold text-amber-800 text-lg">Uncollected Orders (90+ Days)</h3>
        <p className="text-xs text-amber-700 mt-1">
          Policy Notice: Items are flagged for Admin/Manager attention after 90 days. Items are never automatically disposed of.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-100 border-b text-xs uppercase text-slate-600 font-bold">
              <th className="p-3">Order #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Created Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-bold text-sky-600">{order.order_number}</td>
                <td className="p-3 font-semibold">{order.customer_details?.name}</td>
                <td className="p-3">{order.customer_details?.phone}</td>
                <td className="p-3 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold">{order.status}</span></td>
                <td className="p-3 font-bold text-rose-600">${Number(order.balance_amount).toFixed(2)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-500">No uncollected orders past 90 days.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}