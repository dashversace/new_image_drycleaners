import React, { useState } from 'react';
import api from '../api/axios';

export default function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);

  const fetchReport = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get(`reports/?start_date=${startDate}&end_date=${endDate}`);
      setReportData(res.data);
    } catch (err) {
      alert('Failed to generate report.');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800">Sales & Financial Reports</h3>

      <form onSubmit={fetchReport} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Start Date</label>
          <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">End Date</label>
          <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-2 rounded text-sm shadow">Generate Report</button>
      </form>

      {reportData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
              <p className="text-xs font-bold uppercase text-slate-500">Total Sales</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">${Number(reportData.total_sales).toFixed(2)}</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
              <p className="text-xs font-bold uppercase text-slate-500">Total Orders</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{reportData.total_orders_count}</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
              <p className="text-xs font-bold uppercase text-slate-500">Total Outstanding Balance</p>
              <p className="text-2xl font-black text-rose-600 mt-1">${Number(reportData.total_balance).toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4">Orders in Range ({reportData.orders?.length || 0})</h4>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase text-slate-600">
                  <th className="p-2">Order #</th>
                  <th className="p-2">Customer</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {reportData.orders?.map(o => (
                  <tr key={o.id} className="border-b">
                    <td className="p-2 font-bold text-sky-600">{o.order_number}</td>
                    <td className="p-2">{o.customer_details?.name}</td>
                    <td className="p-2">{o.status}</td>
                    <td className="p-2">${Number(o.total_amount).toFixed(2)}</td>
                    <td className="p-2 text-rose-600">${Number(o.balance_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4">Payments Collected ({reportData.payments?.length || 0})</h4>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase text-slate-600">
                  <th className="p-2">Date</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Method</th>
                  <th className="p-2">Reference</th>
                </tr>
              </thead>
              <tbody>
                {reportData.payments?.map(p => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2 text-xs">{new Date(p.created_at).toLocaleString()}</td>
                    <td className="p-2 font-bold text-emerald-600">${Number(p.amount).toFixed(2)}</td>
                    <td className="p-2">{p.payment_method}</td>
                    <td className="p-2">{p.reference_number || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}